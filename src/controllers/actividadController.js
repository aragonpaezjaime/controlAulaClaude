const Actividad = require('../models/Actividad');
const Alumno = require('../models/Alumno');
const { EventoActividad } = require('../models/Evento');

/**
 * Controlador para gestión de actividades y calificaciones
 * Implementa la regla de tres para calcular XP basado en calificaciones
 */

// ============================================
// CREAR UNA NUEVA ACTIVIDAD
// ============================================
const crearActividad = async (req, res) => {
  try {
    const { titulo, descripcion, grupo, puntosMaximos, fecha } = req.body;

    // Validar que los puntos máximos sean válidos
    if (puntosMaximos < 1 || puntosMaximos > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Los puntos máximos deben estar entre 1 y 10,000'
      });
    }

    // Crear la actividad
    const nuevaActividad = new Actividad({
      titulo,
      descripcion,
      grupo,
      puntosMaximos,
      fecha: fecha || Date.now()
    });

    await nuevaActividad.save();

    // Poblar el grupo para la respuesta
    await nuevaActividad.populate('grupo', 'grado grupo nivel');

    res.status(201).json({
      success: true,
      message: 'Actividad creada exitosamente',
      data: nuevaActividad
    });
  } catch (error) {
    console.error('Error al crear actividad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear la actividad',
      error: error.message
    });
  }
};

// ============================================
// OBTENER ACTIVIDADES DE UN GRUPO
// ============================================
const obtenerActividadesPorGrupo = async (req, res) => {
  try {
    const { grupoId } = req.params;
    const { soloActivas } = req.query;

    const actividades = await Actividad.obtenerPorGrupo(
      grupoId,
      soloActivas === 'true'
    );

    res.json({
      success: true,
      total: actividades.length,
      data: actividades
    });
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener actividades',
      error: error.message
    });
  }
};

// ============================================
// OBTENER UNA ACTIVIDAD CON ESTADÍSTICAS
// ============================================
const obtenerActividadConEstadisticas = async (req, res) => {
  try {
    const { actividadId } = req.params;

    const actividad = await Actividad.obtenerConEstadisticas(actividadId);

    if (!actividad) {
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada'
      });
    }

    res.json({
      success: true,
      data: actividad
    });
  } catch (error) {
    console.error('Error al obtener actividad con estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener la actividad',
      error: error.message
    });
  }
};

// ============================================
// CALCULAR XP BASADO EN CALIFICACIÓN
// Implementa: XP = (Calificación / 10) * Puntos_Máximos
// ============================================
const calcularXP = (calificacion, puntosMaximos) => {
  // Permite calificaciones mayores a 10 (puntos extra)
  const xp = (calificacion / 10) * puntosMaximos;
  return Math.round(xp); // Redondear al entero más cercano
};

// ============================================
// CALIFICAR ACTIVIDAD (BATCH PROCESSING)
// ============================================
const calificarActividad = async (req, res) => {
  try {
    const { actividadId } = req.params;
    const { calificaciones } = req.body;

    /*
    Formato esperado de calificaciones:
    [
      {
        alumnoId: "ObjectId",
        calificacion: 8,  // Nota del 0 al 10 (o más para puntos extra)
        feedback: "Excelente trabajo" // Opcional
      },
      ...
    ]
    */

    // Validar que se envíen calificaciones
    if (!calificaciones || !Array.isArray(calificaciones) || calificaciones.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Debe enviar un array de calificaciones'
      });
    }

    // Obtener la actividad
    const actividad = await Actividad.findById(actividadId);
    if (!actividad) {
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada'
      });
    }

    // Verificar que la actividad esté activa
    if (!actividad.activa) {
      return res.status(400).json({
        success: false,
        message: 'No se puede calificar una actividad inactiva'
      });
    }

    const resultados = {
      exitosos: [],
      errores: []
    };

    // Procesar cada calificación
    for (const calificacionData of calificaciones) {
      try {
        const { alumnoId, calificacion, feedback } = calificacionData;

        // Validar calificación
        if (typeof calificacion !== 'number' || calificacion < 0 || calificacion > 15) {
          resultados.errores.push({
            alumnoId,
            error: 'Calificación inválida (debe estar entre 0 y 15)'
          });
          continue;
        }

        // Obtener el alumno
        const alumno = await Alumno.findById(alumnoId);
        if (!alumno) {
          resultados.errores.push({
            alumnoId,
            error: 'Alumno no encontrado'
          });
          continue;
        }

        // Calcular XP ganado usando la regla de tres
        const xpGanado = calcularXP(calificacion, actividad.puntosMaximos);

        // Verificar si ya existe una calificación para este alumno y actividad
        const calificacionExistente = await EventoActividad.findOne({
          alumno: alumnoId,
          actividad: actividadId
        });

        if (calificacionExistente) {
          // Actualizar calificación existente
          const xpAnterior = calificacionExistente.xpGanado;
          const diferenciaXP = xpGanado - xpAnterior;

          calificacionExistente.calificacion = calificacion;
          calificacionExistente.xpGanado = xpGanado;
          calificacionExistente.feedback = feedback || calificacionExistente.feedback;
          calificacionExistente.fecha = Date.now(); // Actualizar fecha de modificación

          await calificacionExistente.save();

          // Actualizar XP del alumno (solo la diferencia)
          alumno.xp += diferenciaXP;
          await alumno.save();

          resultados.exitosos.push({
            alumnoId,
            nombreCompleto: alumno.nombreCompleto,
            calificacion,
            xpGanado,
            accion: 'actualizado',
            diferenciaXP
          });
        } else {
          // Crear nuevo evento de calificación
          const eventoCalificacion = new EventoActividad({
            alumno: alumnoId,
            actividad: actividadId,
            calificacion,
            xpGanado,
            feedback: feedback || '',
            fecha: Date.now()
          });

          await eventoCalificacion.save();

          // Actualizar XP del alumno
          alumno.xp += xpGanado;
          await alumno.save();

          resultados.exitosos.push({
            alumnoId,
            nombreCompleto: alumno.nombreCompleto,
            calificacion,
            xpGanado,
            accion: 'creado'
          });
        }
      } catch (error) {
        resultados.errores.push({
          alumnoId: calificacionData.alumnoId,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Calificaciones procesadas: ${resultados.exitosos.length} exitosas, ${resultados.errores.length} con errores`,
      data: {
        actividad: {
          id: actividad._id,
          titulo: actividad.titulo,
          puntosMaximos: actividad.puntosMaximos
        },
        resultados
      }
    });
  } catch (error) {
    console.error('Error al calificar actividad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar las calificaciones',
      error: error.message
    });
  }
};

// ============================================
// OBTENER CALIFICACIONES DE UN ALUMNO
// ============================================
const obtenerCalificacionesAlumno = async (req, res) => {
  try {
    const { alumnoId } = req.params;

    const calificaciones = await EventoActividad.find({ alumno: alumnoId })
      .populate('actividad', 'titulo puntosMaximos fecha')
      .sort({ fecha: -1 });

    res.json({
      success: true,
      total: calificaciones.length,
      data: calificaciones
    });
  } catch (error) {
    console.error('Error al obtener calificaciones del alumno:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener las calificaciones',
      error: error.message
    });
  }
};

// ============================================
// DESACTIVAR UNA ACTIVIDAD
// ============================================
const desactivarActividad = async (req, res) => {
  try {
    const { actividadId } = req.params;

    const actividad = await Actividad.findByIdAndUpdate(
      actividadId,
      { activa: false },
      { new: true }
    );

    if (!actividad) {
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Actividad desactivada exitosamente',
      data: actividad
    });
  } catch (error) {
    console.error('Error al desactivar actividad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al desactivar la actividad',
      error: error.message
    });
  }
};

module.exports = {
  crearActividad,
  obtenerActividadesPorGrupo,
  obtenerActividadConEstadisticas,
  calificarActividad,
  obtenerCalificacionesAlumno,
  desactivarActividad,
  calcularXP // Exportar para uso en otros módulos si es necesario
};
