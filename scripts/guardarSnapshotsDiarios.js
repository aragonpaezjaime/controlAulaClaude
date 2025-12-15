/**
 * Script para guardar snapshots diarios
 *
 * Este script toma el estado actual de todos los alumnos activos
 * y guarda un snapshot con su XP, HP, posición en ranking y promedios del grupo.
 *
 * Uso:
 *   node scripts/guardarSnapshotsDiarios.js
 *
 * Frecuencia recomendada: Ejecutar cada noche (manual o automático con cron)
 * Ideal: 23:59 hrs para capturar el estado final del día
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Alumno = require('../src/models/Alumno');
const Grupo = require('../src/models/Grupo');
const ProgresoSnapshot = require('../src/models/ProgresoSnapshot');

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

// Calcular ranking de un grupo
async function calcularRankingGrupo(grupoId) {
  // Obtener todos los alumnos activos del grupo
  const alumnos = await Alumno.find({ grupo: grupoId, activo: true }).lean();

  if (alumnos.length === 0) {
    return {
      posiciones: {},
      promedioXP: 0,
      promedioHP: 0,
      totalAlumnos: 0
    };
  }

  // Ordenar por XP descendente
  alumnos.sort((a, b) => b.xp - a.xp);

  // Crear mapa de posiciones
  const posiciones = {};
  alumnos.forEach((alumno, index) => {
    posiciones[alumno._id.toString()] = index + 1;
  });

  // Calcular promedios
  const sumaXP = alumnos.reduce((sum, a) => sum + (a.xp || 0), 0);
  const sumaHP = alumnos.reduce((sum, a) => sum + (a.salud || 0), 0);

  return {
    posiciones,
    promedioXP: Math.round(sumaXP / alumnos.length),
    promedioHP: Math.round(sumaHP / alumnos.length),
    totalAlumnos: alumnos.length
  };
}

// Guardar snapshot para una fecha específica (opcional)
async function guardarSnapshotsDia(fechaCustom = null) {
  try {
    await conectarDB();

    // Fecha del snapshot (hoy a las 00:00 o fecha custom)
    const fechaSnapshot = fechaCustom ? new Date(fechaCustom) : new Date();
    fechaSnapshot.setHours(0, 0, 0, 0);

    log('\n📸 GUARDANDO SNAPSHOTS DIARIOS', 'azul');
    log(`📅 Fecha: ${fechaSnapshot.toLocaleDateString()}\n`, 'azul');

    // Obtener todos los alumnos activos
    const alumnos = await Alumno.find({ activo: true }).populate('grupo').lean();
    log(`👥 Total de alumnos activos: ${alumnos.length}`, 'verde');

    if (alumnos.length === 0) {
      log('⚠️  No hay alumnos activos. Abortando.', 'amarillo');
      await mongoose.connection.close();
      return;
    }

    // Agrupar alumnos por grupo para calcular rankings
    const alumnosPorGrupo = {};
    alumnos.forEach(alumno => {
      const grupoId = alumno.grupo._id.toString();
      if (!alumnosPorGrupo[grupoId]) {
        alumnosPorGrupo[grupoId] = [];
      }
      alumnosPorGrupo[grupoId].push(alumno);
    });

    log(`📚 Total de grupos: ${Object.keys(alumnosPorGrupo).length}\n`, 'verde');

    // Calcular rankings por grupo
    const rankingsPorGrupo = {};
    for (const grupoId in alumnosPorGrupo) {
      const ranking = await calcularRankingGrupo(grupoId);
      rankingsPorGrupo[grupoId] = ranking;
      log(`  📊 Grupo ${alumnosPorGrupo[grupoId][0].grupo.grado}°${alumnosPorGrupo[grupoId][0].grupo.grupo}: ${ranking.totalAlumnos} alumnos`, 'cyan');
    }

    log(''); // Línea en blanco

    // Crear snapshots para todos los alumnos
    const snapshots = [];
    let creados = 0;
    let actualizados = 0;
    let errores = 0;

    for (const alumno of alumnos) {
      const grupoId = alumno.grupo._id.toString();
      const ranking = rankingsPorGrupo[grupoId];

      const snapshot = {
        alumno: alumno._id,
        grupo: alumno.grupo._id,
        fecha: fechaSnapshot,
        xp: alumno.xp || 0,
        hp: alumno.salud || 0,
        posicionRanking: ranking.posiciones[alumno._id.toString()] || null,
        promedioGrupoXP: ranking.promedioXP,
        promedioGrupoHP: ranking.promedioHP
      };

      snapshots.push(snapshot);
    }

    // Guardar en base de datos (usar updateOne con upsert para evitar duplicados)
    log('💾 Guardando en base de datos...', 'amarillo');

    for (const snapshot of snapshots) {
      try {
        const resultado = await ProgresoSnapshot.updateOne(
          { alumno: snapshot.alumno, fecha: snapshot.fecha },
          { $set: snapshot },
          { upsert: true }
        );

        if (resultado.upsertedCount > 0) {
          creados++;
        } else if (resultado.modifiedCount > 0) {
          actualizados++;
        }
      } catch (error) {
        errores++;
        log(`   ❌ Error al guardar snapshot: ${error.message}`, 'rojo');
      }
    }

    // Resumen final
    log('\n✨ PROCESO COMPLETADO', 'verde');
    log('═══════════════════════════════════════', 'verde');
    log(`📸 Snapshots creados: ${creados}`, 'azul');
    log(`🔄 Snapshots actualizados: ${actualizados}`, 'azul');
    log(`❌ Errores: ${errores}`, errores > 0 ? 'rojo' : 'azul');
    log(`📅 Fecha del snapshot: ${fechaSnapshot.toLocaleDateString()}`, 'azul');
    log(`💾 Base de datos actualizada correctamente\n`, 'verde');

    // Cerrar conexión
    await mongoose.connection.close();
    log('👋 Desconectado de MongoDB\n', 'verde');

    return {
      creados,
      actualizados,
      errores,
      total: snapshots.length
    };

  } catch (error) {
    log(`\n❌ ERROR FATAL: ${error.message}`, 'rojo');
    console.error(error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Ejecutar script
if (require.main === module) {
  // Verificar si se pasó una fecha por argumentos
  const fechaArg = process.argv[2]; // node script.js 2025-12-14
  const fechaCustom = fechaArg ? new Date(fechaArg) : null;

  if (fechaCustom && isNaN(fechaCustom.getTime())) {
    log('❌ Fecha inválida. Formato esperado: YYYY-MM-DD', 'rojo');
    log('Ejemplo: node scripts/guardarSnapshotsDiarios.js 2025-12-14', 'amarillo');
    process.exit(1);
  }

  guardarSnapshotsDia(fechaCustom);
}

module.exports = { guardarSnapshotsDia };
