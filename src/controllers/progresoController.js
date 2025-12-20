const ProgresoSnapshot = require('../models/ProgresoSnapshot');
const Alumno = require('../models/Alumno');

/**
 * Controlador de Progreso
 * Maneja los endpoints para obtener gráficas de progreso de XP/HP
 * y estadísticas de los estudiantes a lo largo del tiempo
 */

// ============================================
// OBTENER PROGRESO DE XP (Para gráfica)
// ============================================
exports.obtenerProgresoXP = async (req, res) => {
  try {
    const { claveZipGrade } = req.params;
    const dias = parseInt(req.query.dias) || 90; // Por defecto 90 días (3 meses)

    // Buscar alumno por clave
    const alumno = await Alumno.findOne({ claveZipGrade }).lean();

    if (!alumno) {
      return res.status(404).json({
        success: false,
        mensaje: 'Alumno no encontrado'
      });
    }

    // Obtener snapshots del periodo
    const snapshots = await ProgresoSnapshot.obtenerProgreso(alumno._id, dias);

    // Formatear datos para la gráfica
    const datosGrafica = snapshots.map(snapshot => ({
      fecha: snapshot.fecha.toISOString().split('T')[0], // YYYY-MM-DD
      xp: snapshot.xp
    }));

    // Agregar dato actual (HOY) si no existe snapshot de hoy
    const hoy = new Date().toISOString().split('T')[0];
    const ultimoSnapshot = snapshots.length > 0 ? snapshots[snapshots.length - 1].fecha.toISOString().split('T')[0] : null;

    if (ultimoSnapshot !== hoy) {
      datosGrafica.push({
        fecha: hoy,
        xp: alumno.xp
      });
    }

    res.json({
      success: true,
      data: datosGrafica,
      meta: {
        alumno: alumno.nombreCompleto,
        totalDias: datosGrafica.length,
        xpInicial: snapshots.length > 0 ? snapshots[0].xp : alumno.xp,
        xpActual: alumno.xp, // Siempre el valor actual
        diferencia: snapshots.length > 0 ? alumno.xp - snapshots[0].xp : 0
      }
    });

  } catch (error) {
    console.error('Error al obtener progreso de XP:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener el progreso de XP',
      error: error.message
    });
  }
};

// ============================================
// OBTENER PROGRESO DE HP (Para gráfica)
// ============================================
exports.obtenerProgresoHP = async (req, res) => {
  try {
    const { claveZipGrade } = req.params;
    const dias = parseInt(req.query.dias) || 90;

    // Buscar alumno por clave
    const alumno = await Alumno.findOne({ claveZipGrade }).lean();

    if (!alumno) {
      return res.status(404).json({
        success: false,
        mensaje: 'Alumno no encontrado'
      });
    }

    // Obtener snapshots del periodo
    const snapshots = await ProgresoSnapshot.obtenerProgreso(alumno._id, dias);

    // Formatear datos para la gráfica
    const datosGrafica = snapshots.map(snapshot => ({
      fecha: snapshot.fecha.toISOString().split('T')[0],
      hp: snapshot.hp
    }));

    // Agregar dato actual (HOY) si no existe snapshot de hoy
    const hoy = new Date().toISOString().split('T')[0];
    const ultimoSnapshot = snapshots.length > 0 ? snapshots[snapshots.length - 1].fecha.toISOString().split('T')[0] : null;

    if (ultimoSnapshot !== hoy) {
      datosGrafica.push({
        fecha: hoy,
        hp: alumno.salud
      });
    }

    res.json({
      success: true,
      data: datosGrafica,
      meta: {
        alumno: alumno.nombreCompleto,
        totalDias: datosGrafica.length,
        hpInicial: snapshots.length > 0 ? snapshots[0].hp : alumno.salud,
        hpActual: alumno.salud, // Siempre el valor actual
        hpPromedio: snapshots.length > 0
          ? Math.round(snapshots.reduce((sum, s) => sum + s.hp, 0) / snapshots.length)
          : alumno.salud
      }
    });

  } catch (error) {
    console.error('Error al obtener progreso de HP:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener el progreso de HP',
      error: error.message
    });
  }
};

// ============================================
// OBTENER ESTADÍSTICAS DEL TRIMESTRE
// ============================================
exports.obtenerEstadisticas = async (req, res) => {
  try {
    const { claveZipGrade } = req.params;
    const dias = parseInt(req.query.dias) || 90;

    // Buscar alumno por clave
    const alumno = await Alumno.findOne({ claveZipGrade }).lean();

    if (!alumno) {
      return res.status(404).json({
        success: false,
        mensaje: 'Alumno no encontrado'
      });
    }

    // Calcular estadísticas usando el método del modelo
    const estadisticas = await ProgresoSnapshot.calcularEstadisticas(alumno._id, dias);

    res.json({
      success: true,
      data: estadisticas,
      meta: {
        alumno: alumno.nombreCompleto,
        periodo: `${dias} días`
      }
    });

  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener las estadísticas',
      error: error.message
    });
  }
};

// ============================================
// OBTENER PROGRESO COMPLETO (XP + HP + Stats)
// Endpoint todo-en-uno para optimizar requests
// ============================================
exports.obtenerProgresoCompleto = async (req, res) => {
  try {
    const { claveZipGrade } = req.params;
    const dias = parseInt(req.query.dias) || 90;

    // Buscar alumno por clave
    const alumno = await Alumno.findOne({ claveZipGrade }).lean();

    if (!alumno) {
      return res.status(404).json({
        success: false,
        mensaje: 'Alumno no encontrado'
      });
    }

    // Obtener snapshots del periodo
    const snapshots = await ProgresoSnapshot.obtenerProgreso(alumno._id, dias);

    // Calcular estadísticas
    const estadisticas = await ProgresoSnapshot.calcularEstadisticas(alumno._id, dias);

    // Formatear datos
    const datosXP = snapshots.map(s => ({
      fecha: s.fecha.toISOString().split('T')[0],
      xp: s.xp
    }));

    const datosHP = snapshots.map(s => ({
      fecha: s.fecha.toISOString().split('T')[0],
      hp: s.hp
    }));

    // Agregar dato actual (HOY) si no existe snapshot de hoy
    const hoy = new Date().toISOString().split('T')[0];
    const ultimoSnapshot = snapshots.length > 0 ? snapshots[snapshots.length - 1].fecha.toISOString().split('T')[0] : null;

    if (ultimoSnapshot !== hoy) {
      // Agregar punto actual para que la gráfica llegue hasta HOY
      datosXP.push({
        fecha: hoy,
        xp: alumno.xp
      });

      datosHP.push({
        fecha: hoy,
        hp: alumno.salud
      });
    }

    res.json({
      success: true,
      data: {
        xp: datosXP,
        hp: datosHP,
        estadisticas,
        alumno: {
          nombre: alumno.nombreCompleto,
          xpActual: alumno.xp,
          hpActual: alumno.salud
        }
      },
      meta: {
        totalDias: snapshots.length,
        periodo: `${dias} días`
      }
    });

  } catch (error) {
    console.error('Error al obtener progreso completo:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener el progreso completo',
      error: error.message
    });
  }
};

// ============================================
// OBTENER PROGRESO PROMEDIO DE UN GRUPO (Para profesor)
// ============================================
exports.obtenerProgresoGrupo = async (req, res) => {
  try {
    const { grupoId } = req.params;
    const dias = parseInt(req.query.dias) || 90;

    // Calcular fecha de inicio
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - dias);
    fechaInicio.setHours(0, 0, 0, 0);

    // Obtener todos los snapshots del grupo en el periodo
    const snapshots = await ProgresoSnapshot.find({
      grupo: grupoId,
      fecha: { $gte: fechaInicio }
    })
    .sort({ fecha: 1 })
    .lean();

    // Agrupar por fecha y calcular promedios
    const snapshotsPorFecha = {};

    snapshots.forEach(snapshot => {
      const fechaKey = snapshot.fecha.toISOString().split('T')[0];

      if (!snapshotsPorFecha[fechaKey]) {
        snapshotsPorFecha[fechaKey] = {
          xpTotal: 0,
          hpTotal: 0,
          count: 0
        };
      }

      snapshotsPorFecha[fechaKey].xpTotal += snapshot.xp;
      snapshotsPorFecha[fechaKey].hpTotal += snapshot.hp;
      snapshotsPorFecha[fechaKey].count++;
    });

    // Formatear datos para gráfica
    const datosGrafica = Object.entries(snapshotsPorFecha).map(([fecha, datos]) => ({
      fecha,
      xpPromedio: Math.round(datos.xpTotal / datos.count),
      hpPromedio: Math.round(datos.hpTotal / datos.count),
      totalAlumnos: datos.count
    }));

    res.json({
      success: true,
      data: datosGrafica,
      meta: {
        totalDias: datosGrafica.length,
        periodo: `${dias} días`
      }
    });

  } catch (error) {
    console.error('Error al obtener progreso del grupo:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener el progreso del grupo',
      error: error.message
    });
  }
};
