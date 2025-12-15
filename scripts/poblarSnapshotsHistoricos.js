/**
 * Script para poblar snapshots históricos
 *
 * Este script genera snapshots diarios para los últimos 90 días
 * basándose en el historial de ajustes de XP/HP de cada alumno.
 *
 * Uso:
 *   node scripts/poblarSnapshotsHistoricos.js
 *
 * IMPORTANTE: Solo ejecutar una vez al inicio del sistema de gráficas
 * Después usar guardarSnapshotsDiarios.js para mantenimiento diario
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Alumno = require('../src/models/Alumno');
const Ajuste = require('../src/models/Ajuste');
const ProgresoSnapshot = require('../src/models/ProgresoSnapshot');

// Configuración
const DIAS_HISTORICOS = 90; // 3 meses
const BATCH_SIZE = 50; // Procesar alumnos en lotes

// Colores para consola
const colores = {
  reset: '\x1b[0m',
  verde: '\x1b[32m',
  amarillo: '\x1b[33m',
  azul: '\x1b[34m',
  rojo: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(mensaje, color = 'reset') {
  console.log(`${colores[color]}${mensaje}${colores.reset}`);
}

// Conectar a MongoDB
async function conectarDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    log('✅ Conectado a MongoDB', 'verde');
  } catch (error) {
    log(`❌ Error al conectar a MongoDB: ${error.message}`, 'rojo');
    process.exit(1);
  }
}

// Calcular XP/HP en una fecha específica basándose en ajustes
async function calcularEstadoEnFecha(alumno, fecha) {
  // Obtener todos los ajustes HASTA esa fecha
  const ajustesHastaFecha = await Ajuste.find({
    alumno: alumno._id,
    fecha: { $lte: fecha }
  }).sort({ fecha: 1 }).lean();

  // Reconstruir XP y HP acumulativo
  let xpAcumulado = 0;
  let hpAcumulado = 100; // Todos inician con 100 HP

  for (const ajuste of ajustesHastaFecha) {
    if (ajuste.tipo === 'xp') {
      xpAcumulado += ajuste.cantidad;
    } else if (ajuste.tipo === 'hp') {
      hpAcumulado += ajuste.cantidad;
    }
  }

  // Asegurar límites
  xpAcumulado = Math.max(0, xpAcumulado);
  hpAcumulado = Math.max(0, Math.min(100, hpAcumulado));

  return {
    xp: xpAcumulado,
    hp: hpAcumulado
  };
}

// Calcular posición en ranking para una fecha
async function calcularRanking(grupoId, fecha) {
  // Obtener todos los alumnos del grupo
  const alumnosGrupo = await Alumno.find({ grupo: grupoId, activo: true }).lean();

  // Calcular XP de cada alumno en esa fecha
  const alumnosConXP = [];

  for (const alumno of alumnosGrupo) {
    const estado = await calcularEstadoEnFecha(alumno, fecha);
    alumnosConXP.push({
      alumnoId: alumno._id,
      xp: estado.xp,
      hp: estado.hp
    });
  }

  // Ordenar por XP descendente
  alumnosConXP.sort((a, b) => b.xp - a.xp);

  // Crear mapa de posiciones
  const posiciones = {};
  alumnosConXP.forEach((alumno, index) => {
    posiciones[alumno.alumnoId.toString()] = index + 1;
  });

  // Calcular promedios
  const promedioXP = alumnosConXP.reduce((sum, a) => sum + a.xp, 0) / alumnosConXP.length;
  const promedioHP = alumnosConXP.reduce((sum, a) => sum + a.hp, 0) / alumnosConXP.length;

  return {
    posiciones,
    promedioXP: Math.round(promedioXP),
    promedioHP: Math.round(promedioHP)
  };
}

// Generar snapshots para un alumno
async function generarSnapshotsAlumno(alumno, fechaInicio, fechaFin) {
  const snapshots = [];
  const fechaActual = new Date(fechaInicio);

  log(`  📸 Generando snapshots para: ${alumno.nombreCompleto}`, 'cyan');

  while (fechaActual <= fechaFin) {
    // Calcular estado del alumno en esta fecha
    const estado = await calcularEstadoEnFecha(alumno, fechaActual);

    // Calcular ranking del grupo en esta fecha
    const ranking = await calcularRanking(alumno.grupo, fechaActual);

    // Crear snapshot
    const snapshot = {
      alumno: alumno._id,
      grupo: alumno.grupo,
      fecha: new Date(fechaActual),
      xp: estado.xp,
      hp: estado.hp,
      posicionRanking: ranking.posiciones[alumno._id.toString()] || null,
      promedioGrupoXP: ranking.promedioXP,
      promedioGrupoHP: ranking.promedioHP
    };

    snapshots.push(snapshot);

    // Avanzar al siguiente día
    fechaActual.setDate(fechaActual.getDate() + 1);
  }

  return snapshots;
}

// Función principal
async function poblarSnapshots() {
  try {
    await conectarDB();

    log('\n🚀 INICIANDO POBLACIÓN DE SNAPSHOTS HISTÓRICOS', 'azul');
    log(`📅 Periodo: Últimos ${DIAS_HISTORICOS} días\n`, 'azul');

    // Calcular fechas
    const fechaFin = new Date();
    fechaFin.setHours(0, 0, 0, 0);

    const fechaInicio = new Date(fechaFin);
    fechaInicio.setDate(fechaInicio.getDate() - DIAS_HISTORICOS);

    log(`📆 Desde: ${fechaInicio.toLocaleDateString()}`, 'amarillo');
    log(`📆 Hasta: ${fechaFin.toLocaleDateString()}\n`, 'amarillo');

    // Limpiar snapshots existentes (opcional)
    log('🗑️  Limpiando snapshots existentes...', 'amarillo');
    const snapshotsEliminados = await ProgresoSnapshot.deleteMany({});
    log(`   Eliminados: ${snapshotsEliminados.deletedCount} snapshots\n`, 'verde');

    // Obtener todos los alumnos activos
    const alumnos = await Alumno.find({ activo: true }).lean();
    log(`👥 Total de alumnos activos: ${alumnos.length}\n`, 'verde');

    if (alumnos.length === 0) {
      log('⚠️  No hay alumnos activos. Abortando.', 'amarillo');
      await mongoose.connection.close();
      return;
    }

    // Procesar alumnos en lotes
    let totalSnapshots = 0;
    let alumnosProcesados = 0;

    for (let i = 0; i < alumnos.length; i += BATCH_SIZE) {
      const lote = alumnos.slice(i, i + BATCH_SIZE);
      log(`📦 Procesando lote ${Math.floor(i / BATCH_SIZE) + 1} (${lote.length} alumnos)...`, 'cyan');

      for (const alumno of lote) {
        try {
          // Generar snapshots para este alumno
          const snapshots = await generarSnapshotsAlumno(alumno, fechaInicio, fechaFin);

          // Guardar en la base de datos
          if (snapshots.length > 0) {
            await ProgresoSnapshot.insertMany(snapshots, { ordered: false });
            totalSnapshots += snapshots.length;
            alumnosProcesados++;
            log(`     ✓ ${alumno.nombreCompleto}: ${snapshots.length} snapshots`, 'verde');
          }
        } catch (error) {
          // Ignorar errores de duplicados (por si ya existen)
          if (error.code === 11000) {
            log(`     ⚠️ ${alumno.nombreCompleto}: Snapshots ya existen (omitiendo)`, 'amarillo');
          } else {
            log(`     ❌ Error en ${alumno.nombreCompleto}: ${error.message}`, 'rojo');
          }
        }
      }

      log(''); // Línea en blanco entre lotes
    }

    // Resumen final
    log('\n✨ PROCESO COMPLETADO', 'verde');
    log('═══════════════════════════════════════', 'verde');
    log(`👥 Alumnos procesados: ${alumnosProcesados}/${alumnos.length}`, 'azul');
    log(`📸 Total snapshots creados: ${totalSnapshots}`, 'azul');
    log(`📅 Días por alumno: ${DIAS_HISTORICOS + 1}`, 'azul');
    log(`💾 Base de datos actualizada correctamente\n`, 'verde');

    // Cerrar conexión
    await mongoose.connection.close();
    log('👋 Desconectado de MongoDB\n', 'verde');

  } catch (error) {
    log(`\n❌ ERROR FATAL: ${error.message}`, 'rojo');
    console.error(error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Ejecutar script
if (require.main === module) {
  poblarSnapshots();
}

module.exports = { poblarSnapshots };
