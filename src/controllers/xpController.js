const Alumno = require('../models/Alumno');
const Ajuste = require('../models/Ajuste');

// ============================================
// AJUSTAR XP DE UN ALUMNO (MANUAL)
// ============================================
const ajustarXP = async (req, res) => {
  try {
    const { alumnoId } = req.params;
    const { cantidad, motivo, observaciones } = req.body;

    // Validar cantidad
    if (!cantidad || cantidad === 0) {
      return res.status(400).json({
        success: false,
        mensaje: 'La cantidad debe ser diferente de 0'
      });
    }

    // Buscar alumno
    const alumno = await Alumno.findById(alumnoId);
    if (!alumno) {
      return res.status(404).json({
        success: false,
        mensaje: 'Alumno no encontrado'
      });
    }

    // Guardar valor anterior
    const valorAnterior = alumno.xp;

    // Actualizar XP (no permitir valores negativos)
    const nuevoXP = Math.max(0, alumno.xp + cantidad);
    alumno.xp = nuevoXP;
    await alumno.save();

    // Registrar ajuste en historial
    const ajuste = await Ajuste.create({
      alumno: alumnoId,
      tipo: 'xp',
      cantidad,
      motivo,
      observaciones,
      comentarioAlumno: observaciones, // Las observaciones se muestran al alumno
      visibleParaAlumno: true,
      valorAnterior,
      valorDespues: nuevoXP
    });

    res.status(200).json({
      success: true,
      mensaje: `XP ${cantidad > 0 ? 'otorgado' : 'descontado'} exitosamente`,
      data: {
        alumno: alumno.nombre + ' ' + alumno.apellidos,
        xpAnterior: valorAnterior,
        xpActual: nuevoXP,
        cambio: cantidad,
        nivel: Math.floor(nuevoXP / 100) + 1
      }
    });

  } catch (error) {
    console.error('Error al ajustar XP:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al ajustar el XP',
      error: error.message
    });
  }
};

// ============================================
// AJUSTAR HP DE UN ALUMNO (MANUAL)
// ============================================
const ajustarHP = async (req, res) => {
  try {
    const { alumnoId } = req.params;
    const { cantidad, motivo, observaciones } = req.body;

    // Validar cantidad
    if (!cantidad || cantidad === 0) {
      return res.status(400).json({
        success: false,
        mensaje: 'La cantidad debe ser diferente de 0'
      });
    }

    // Buscar alumno
    const alumno = await Alumno.findById(alumnoId);
    if (!alumno) {
      return res.status(404).json({
        success: false,
        mensaje: 'Alumno no encontrado'
      });
    }

    // Guardar valor anterior
    const valorAnterior = alumno.salud;

    // Actualizar HP (limitar entre 0 y 100)
    const nuevoHP = Math.max(0, Math.min(100, alumno.salud + cantidad));
    alumno.salud = nuevoHP;
    await alumno.save();

    // Registrar ajuste en historial
    const ajuste = await Ajuste.create({
      alumno: alumnoId,
      tipo: 'hp',
      cantidad,
      motivo,
      observaciones,
      comentarioAlumno: observaciones, // Las observaciones se muestran al alumno
      visibleParaAlumno: true,
      valorAnterior,
      valorDespues: nuevoHP
    });

    res.status(200).json({
      success: true,
      mensaje: `HP ${cantidad > 0 ? 'otorgado' : 'descontado'} exitosamente`,
      data: {
        alumno: alumno.nombre + ' ' + alumno.apellidos,
        hpAnterior: valorAnterior,
        hpActual: nuevoHP,
        cambio: cantidad
      }
    });

  } catch (error) {
    console.error('Error al ajustar HP:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al ajustar el HP',
      error: error.message
    });
  }
};

// ============================================
// OBTENER HISTORIAL DE AJUSTES DE UN ALUMNO
// ============================================
const obtenerHistorialAjustes = async (req, res) => {
  try {
    const { alumnoId } = req.params;
    const { limite = 50 } = req.query;

    const historial = await Ajuste.obtenerHistorialAlumno(alumnoId, parseInt(limite));

    const estadisticas = await Ajuste.obtenerEstadisticasAlumno(alumnoId);

    res.status(200).json({
      success: true,
      cantidad: historial.length,
      estadisticas,
      data: historial
    });

  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener el historial de ajustes',
      error: error.message
    });
  }
};

// ============================================
// OBTENER RANKING DEL GRUPO POR XP
// ============================================
const obtenerRankingGrupo = async (req, res) => {
  try {
    const { grupoId } = req.params;
    const { limite = 50 } = req.query;

    // Obtener alumnos del grupo ordenados por XP
    const ranking = await Alumno.find({ grupo: grupoId, activo: true })
      .select('nombre apellidos xp salud')
      .sort({ xp: -1 })
      .limit(parseInt(limite));

    // Formatear datos del ranking (sin niveles)
    const rankingFormateado = ranking.map((alumno, index) => ({
      posicion: index + 1,
      alumnoId: alumno._id,
      nombreCompleto: `${alumno.nombre} ${alumno.apellidos}`,
      xp: alumno.xp,
      hp: alumno.salud
    }));

    // Calcular estadísticas del grupo
    const totalAlumnos = ranking.length;
    const xpPromedio = totalAlumnos > 0
      ? Math.round(ranking.reduce((sum, a) => sum + a.xp, 0) / totalAlumnos)
      : 0;
    const hpPromedio = totalAlumnos > 0
      ? Math.round(ranking.reduce((sum, a) => sum + a.salud, 0) / totalAlumnos)
      : 0;

    res.status(200).json({
      success: true,
      estadisticas: {
        totalAlumnos,
        xpPromedio,
        hpPromedio
      },
      data: rankingFormateado
    });

  } catch (error) {
    console.error('Error al obtener ranking:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener el ranking del grupo',
      error: error.message
    });
  }
};

// ============================================
// AJUSTE GRUPAL DE XP (PARA BONOS)
// ============================================
const ajustarXPGrupal = async (req, res) => {
  try {
    const { grupoId } = req.params;
    const { cantidad, motivo, observaciones, alumnosIds } = req.body;

    // Validar cantidad
    if (!cantidad || cantidad === 0) {
      return res.status(400).json({
        success: false,
        mensaje: 'La cantidad debe ser diferente de 0'
      });
    }

    // Obtener alumnos (todos o específicos)
    let alumnos;
    if (alumnosIds && alumnosIds.length > 0) {
      alumnos = await Alumno.find({ _id: { $in: alumnosIds }, activo: true });
    } else {
      alumnos = await Alumno.find({ grupo: grupoId, activo: true });
    }

    if (alumnos.length === 0) {
      return res.status(404).json({
        success: false,
        mensaje: 'No se encontraron alumnos para ajustar'
      });
    }

    // Ajustar XP de cada alumno
    const ajustes = [];
    for (const alumno of alumnos) {
      const valorAnterior = alumno.xp;
      const nuevoXP = Math.max(0, alumno.xp + cantidad);
      alumno.xp = nuevoXP;
      await alumno.save();

      // Registrar ajuste
      const comentario = observaciones || `Ajuste grupal: ${motivo}`;
      const ajuste = await Ajuste.create({
        alumno: alumno._id,
        tipo: 'xp',
        cantidad,
        motivo,
        observaciones: comentario,
        comentarioAlumno: comentario, // Las observaciones se muestran al alumno
        visibleParaAlumno: true,
        valorAnterior,
        valorDespues: nuevoXP
      });

      ajustes.push({
        alumno: alumno.nombre + ' ' + alumno.apellidos,
        xpAnterior: valorAnterior,
        xpNuevo: nuevoXP
      });
    }

    res.status(200).json({
      success: true,
      mensaje: `XP ${cantidad > 0 ? 'otorgado' : 'descontado'} a ${alumnos.length} alumnos`,
      data: {
        alumnosAfectados: alumnos.length,
        cantidadPorAlumno: cantidad,
        ajustes
      }
    });

  } catch (error) {
    console.error('Error al ajustar XP grupal:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al ajustar el XP grupal',
      error: error.message
    });
  }
};

// ============================================
// EXPORTAR CONTROLADORES
// ============================================

module.exports = {
  ajustarXP,
  ajustarHP,
  obtenerHistorialAjustes,
  obtenerRankingGrupo,
  ajustarXPGrupal
};
