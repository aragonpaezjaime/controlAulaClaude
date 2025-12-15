/**
 * Script OPTIMIZADO para poblar snapshots históricos
 *
 * Genera snapshots diarios para los últimos 90 días de forma eficiente
 * procesando por DÍA en vez de por alumno (mucho más rápido)
 *
 * Uso: node scripts/poblarSnapshotsHistoricos.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Alumno = require('../src/models/Alumno');
const Grupo = require('../src/models/Grupo');
const Ajuste = require('../src/models/Ajuste');
const ProgresoSnapshot = require('../src/models/ProgresoSnapshot');

const DIAS_HISTORICOS = 90;

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

async function conectarDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    log('✅ Conectado a MongoDB', 'verde');
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'rojo');
    process.exit(1);
  }
}

// OPTIMIZADO: Calcular estados de TODOS los alumnos en una fecha
async function calcularEstadosEnFecha(alumnos, fecha) {
  const alumnoIds = alumnos.map(a => a._id);

  // Obtener TODOS los ajustes hasta esa fecha en UNA query
  const ajustes = await Ajuste.find({
    alumno: { $in: alumnoIds },
    fecha: { $lte: fecha }
  }).sort({ fecha: 1, createdAt: 1 }).lean();

  // Agrupar ajustes por alumno
  const ajustesPorAlumno = {};
  alumnoIds.forEach(id => {
    ajustesPorAlumno[id.toString()] = [];
  });

  ajustes.forEach(ajuste => {
    const key = ajuste.alumno.toString();
    if (ajustesPorAlumno[key]) {
      ajustesPorAlumno[key].push(ajuste);
    }
  });

  // Calcular XP/HP acumulativo para cada alumno
  const estados = {};

  alumnos.forEach(alumno => {
    const key = alumno._id.toString();
    let xp = 0;
    let hp = 100;

    ajustesPorAlumno[key].forEach(ajuste => {
      if (ajuste.tipo === 'xp') {
        xp += ajuste.cantidad;
      } else if (ajuste.tipo === 'hp') {
        hp += ajuste.cantidad;
      }
    });

    xp = Math.max(0, xp);
    hp = Math.max(0, Math.min(100, hp));

    estados[key] = { xp, hp };
  });

  return estados;
}

// OPTIMIZADO: Calcular ranking de TODOS los grupos en una fecha
async function calcularRankingsPorGrupo(alumnos, estados) {
  const alumnosPorGrupo = {};

  // Agrupar alumnos por grupo
  alumnos.forEach(alumno => {
    const grupoId = alumno.grupo._id ? alumno.grupo._id.toString() : alumno.grupo.toString();
    if (!alumnosPorGrupo[grupoId]) {
      alumnosPorGrupo[grupoId] = [];
    }
    alumnosPorGrupo[grupoId].push(alumno);
  });

  const rankings = {};

  // Calcular ranking para cada grupo
  Object.entries(alumnosPorGrupo).forEach(([grupoId, alumnosGrupo]) => {
    // Obtener XP de cada alumno
    const alumnosConXP = alumnosGrupo.map(alumno => ({
      alumnoId: alumno._id.toString(),
      xp: estados[alumno._id.toString()].xp,
      hp: estados[alumno._id.toString()].hp
    }));

    // Ordenar por XP descendente
    alumnosConXP.sort((a, b) => b.xp - a.xp);

    // Crear mapa de posiciones
    const posiciones = {};
    alumnosConXP.forEach((alumno, index) => {
      posiciones[alumno.alumnoId] = index + 1;
    });

    // Calcular promedios
    const sumaXP = alumnosConXP.reduce((sum, a) => sum + a.xp, 0);
    const sumaHP = alumnosConXP.reduce((sum, a) => sum + a.hp, 0);

    rankings[grupoId] = {
      posiciones,
      promedioXP: Math.round(sumaXP / alumnosConXP.length),
      promedioHP: Math.round(sumaHP / alumnosConXP.length)
    };
  });

  return rankings;
}

async function poblarSnapshots() {
  try {
    await conectarDB();

    log('\n🚀 POBLANDO SNAPSHOTS HISTÓRICOS (OPTIMIZADO)', 'azul');
    log(`📅 Periodo: Últimos ${DIAS_HISTORICOS} días\n`, 'azul');

    const fechaFin = new Date();
    fechaFin.setHours(0, 0, 0, 0);

    const fechaInicio = new Date(fechaFin);
    fechaInicio.setDate(fechaInicio.getDate() - DIAS_HISTORICOS);

    log(`📆 Desde: ${fechaInicio.toLocaleDateString()}`, 'amarillo');
    log(`📆 Hasta: ${fechaFin.toLocaleDateString()}\n`, 'amarillo');

    // Limpiar snapshots existentes
    log('🗑️  Limpiando snapshots existentes...', 'amarillo');
    await ProgresoSnapshot.deleteMany({});
    log('   ✓ Limpiado\n', 'verde');

    // Obtener TODOS los alumnos activos con populate de grupo
    const alumnos = await Alumno.find({ activo: true }).populate('grupo').lean();
    log(`👥 Total alumnos: ${alumnos.length}\n`, 'verde');

    if (alumnos.length === 0) {
      log('⚠️  No hay alumnos. Abortando.', 'amarillo');
      await mongoose.connection.close();
      return;
    }

    // PROCESAR POR DÍA (mucho más eficiente)
    const fechaActual = new Date(fechaInicio);
    let totalSnapshots = 0;
    let diaIndex = 0;

    while (fechaActual <= fechaFin) {
      diaIndex++;
      const fechaStr = fechaActual.toLocaleDateString();

      log(`📅 Día ${diaIndex}/${DIAS_HISTORICOS + 1} - ${fechaStr}`, 'cyan');

      // Calcular estados de TODOS los alumnos en esta fecha (1 query)
      const estados = await calcularEstadosEnFecha(alumnos, fechaActual);

      // Calcular rankings de TODOS los grupos (1 vez por grupo)
      const rankings = await calcularRankingsPorGrupo(alumnos, estados);

      // Crear snapshots para todos los alumnos de este día
      const snapshotsDia = alumnos.map(alumno => {
        const alumnoId = alumno._id.toString();
        const grupoId = alumno.grupo._id ? alumno.grupo._id.toString() : alumno.grupo.toString();
        const estado = estados[alumnoId];
        const ranking = rankings[grupoId];

        return {
          alumno: alumno._id,
          grupo: alumno.grupo._id || alumno.grupo,
          fecha: new Date(fechaActual),
          xp: estado.xp,
          hp: estado.hp,
          posicionRanking: ranking.posiciones[alumnoId] || null,
          promedioGrupoXP: ranking.promedioXP,
          promedioGrupoHP: ranking.promedioHP
        };
      });

      // Guardar todos los snapshots del día
      try {
        await ProgresoSnapshot.insertMany(snapshotsDia, { ordered: false });
        totalSnapshots += snapshotsDia.length;
        log(`   ✓ ${snapshotsDia.length} snapshots guardados\n`, 'verde');
      } catch (error) {
        log(`   ⚠️  Error al guardar: ${error.message}\n`, 'amarillo');
      }

      // Avanzar al siguiente día
      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    // Resumen
    log('✨ COMPLETADO', 'verde');
    log('═══════════════════════════════════════', 'verde');
    log(`📸 Total snapshots: ${totalSnapshots}`, 'azul');
    log(`📅 Días procesados: ${diaIndex}`, 'azul');
    log(`💾 Base de datos actualizada\n`, 'verde');

    await mongoose.connection.close();
    log('👋 Desconectado\n', 'verde');

  } catch (error) {
    log(`\n❌ ERROR: ${error.message}`, 'rojo');
    console.error(error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

if (require.main === module) {
  poblarSnapshots();
}

module.exports = { poblarSnapshots };
