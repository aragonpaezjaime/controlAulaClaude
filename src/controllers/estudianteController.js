const Alumno = require('../models/Alumno');
const Grupo = require('../models/Grupo');
const Insignia = require('../models/Insignia');
const Ajuste = require('../models/Ajuste');

// ============================================
// AUTENTICACIÓN Y PERFIL DEL ESTUDIANTE
// ============================================

/**
 * Login de estudiante con clave de zipGrade
 * POST /api/estudiante/login
 * Body: { claveZipGrade: string }
 */
exports.login = async (req, res) => {
  try {
    const { claveZipGrade } = req.body;

    // Validar que se envió la clave
    if (!claveZipGrade || claveZipGrade.trim() === '') {
      return res.status(400).json({
        success: false,
        mensaje: 'La clave de zipGrade es obligatoria'
      });
    }

    // Buscar alumno por clave (normalizada a mayúsculas)
    const alumno = await Alumno.findOne({
      claveZipGrade: claveZipGrade.toUpperCase().trim(),
      activo: true
    })
      .populate('grupo')
      .populate({
        path: 'insignias.insigniaId',
        model: 'Insignia'
      });

    // Verificar si existe el alumno
    if (!alumno) {
      return res.status(401).json({
        success: false,
        mensaje: 'Clave incorrecta o alumno no encontrado'
      });
    }

    // Verificar que el grupo esté activo
    if (!alumno.grupo || !alumno.grupo.activo) {
      return res.status(403).json({
        success: false,
        mensaje: 'El grupo asociado no está activo'
      });
    }

    // Obtener la insignia de nivel más reciente (si tiene)
    let insigniaActual = null;
    if (alumno.insignias && alumno.insignias.length > 0) {
      // Filtramos solo las insignias de nivel
      const insigniasNivel = alumno.insignias.filter(
        ins => ins.insigniaId && ins.insigniaId.tipo === 'nivel'
      );

      if (insigniasNivel.length > 0) {
        // Ordenamos por fecha de obtención descendente y tomamos la primera
        insigniasNivel.sort((a, b) => b.fechaObtencion - a.fechaObtencion);
        insigniaActual = insigniasNivel[0].insigniaId;
      }
    }

    // Retornar datos del alumno para la sesión
    // Usamos un objeto simple en lugar de JWT para mantenerlo sencillo
    res.json({
      success: true,
      mensaje: 'Login exitoso',
      alumno: {
        id: alumno._id,
        nombre: alumno.nombre,
        apellidos: alumno.apellidos,
        nombreCompleto: alumno.nombreCompleto,
        nombrePreferido: alumno.obtenerNombrePreferido(),
        avatar: alumno.avatar,
        xp: alumno.xp,
        salud: alumno.salud,
        claveZipGrade: alumno.claveZipGrade,
        grupo: {
          id: alumno.grupo._id,
          nombre: `${alumno.grupo.grado}${alumno.grupo.grupo}`,
          materia: alumno.grupo.materia,
          ciclo: alumno.grupo.ciclo
        },
        insigniaActual: insigniaActual ? {
          id: insigniaActual._id,
          nombre: insigniaActual.nombre,
          icono: insigniaActual.icono,
          color: insigniaActual.color,
          descripcion: insigniaActual.descripcion
        } : null
      }
    });

  } catch (error) {
    console.error('Error en login de estudiante:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al iniciar sesión',
      error: error.message
    });
  }
};

/**
 * Obtener perfil del estudiante
 * GET /api/estudiante/perfil/:alumnoId
 */
exports.obtenerPerfil = async (req, res) => {
  try {
    const { alumnoId } = req.params;

    const alumno = await Alumno.findById(alumnoId)
      .populate('grupo')
      .populate({
        path: 'insignias.insigniaId',
        model: 'Insignia'
      });

    if (!alumno || !alumno.activo) {
      return res.status(404).json({
        success: false,
        mensaje: 'Alumno no encontrado'
      });
    }

    // Obtener la insignia de nivel actual
    let insigniaActual = null;
    if (alumno.insignias && alumno.insignias.length > 0) {
      const insigniasNivel = alumno.insignias.filter(
        ins => ins.insigniaId && ins.insigniaId.tipo === 'nivel'
      );

      if (insigniasNivel.length > 0) {
        insigniasNivel.sort((a, b) => b.fechaObtencion - a.fechaObtencion);
        insigniaActual = insigniasNivel[0].insigniaId;
      }
    }

    res.json({
      success: true,
      alumno: {
        id: alumno._id,
        nombre: alumno.nombre,
        apellidos: alumno.apellidos,
        nombreCompleto: alumno.nombreCompleto,
        nombrePreferido: alumno.obtenerNombrePreferido(),
        avatar: alumno.avatar,
        xp: alumno.xp,
        salud: alumno.salud,
        claveZipGrade: alumno.claveZipGrade,
        grupo: {
          id: alumno.grupo._id,
          nombre: `${alumno.grupo.grado}${alumno.grupo.grupo}`,
          materia: alumno.grupo.materia,
          ciclo: alumno.grupo.ciclo
        },
        insigniaActual: insigniaActual ? {
          id: insigniaActual._id,
          nombre: insigniaActual.nombre,
          icono: insigniaActual.icono,
          color: insigniaActual.color,
          descripcion: insigniaActual.descripcion
        } : null
      }
    });

  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener el perfil',
      error: error.message
    });
  }
};

// ============================================
// RANKING Y ESTADÍSTICAS DEL GRUPO
// ============================================

/**
 * Obtener ranking del grupo del estudiante
 * GET /api/estudiante/ranking/:grupoId
 */
exports.obtenerRanking = async (req, res) => {
  try {
    const { grupoId } = req.params;

    // Verificar que el grupo existe y está activo
    const grupo = await Grupo.findById(grupoId);
    if (!grupo || !grupo.activo) {
      return res.status(404).json({
        success: false,
        mensaje: 'Grupo no encontrado o inactivo'
      });
    }

    // Obtener todos los alumnos activos del grupo, ordenados por XP descendente
    const alumnos = await Alumno.find({
      grupo: grupoId,
      activo: true
    })
      .populate({
        path: 'insignias.insigniaId',
        model: 'Insignia'
      })
      .sort({ xp: -1, salud: -1 }) // Ordenar por XP desc, salud desc como desempate
      .lean(); // Convertir a objeto plano para mejor rendimiento

    // Formatear datos del ranking
    const ranking = alumnos.map((alumno, index) => {
      // Obtener la insignia de nivel actual
      let insigniaActual = null;
      if (alumno.insignias && alumno.insignias.length > 0) {
        const insigniasNivel = alumno.insignias.filter(
          ins => ins.insigniaId && ins.insigniaId.tipo === 'nivel'
        );

        if (insigniasNivel.length > 0) {
          insigniasNivel.sort((a, b) =>
            new Date(b.fechaObtencion) - new Date(a.fechaObtencion)
          );
          insigniaActual = insigniasNivel[0].insigniaId;
        }
      }

      return {
        posicion: index + 1,
        id: alumno._id,
        nombre: alumno.nombre,
        apellidos: alumno.apellidos,
        nombreCompleto: `${alumno.nombre} ${alumno.apellidos}`,
        avatar: alumno.avatar,
        xp: alumno.xp,
        salud: alumno.salud,
        insignia: insigniaActual ? {
          nombre: insigniaActual.nombre,
          icono: insigniaActual.icono,
          color: insigniaActual.color
        } : null
      };
    });

    // Calcular estadísticas del grupo
    const estadisticas = {
      totalAlumnos: alumnos.length,
      xpPromedio: alumnos.length > 0
        ? Math.round(alumnos.reduce((sum, a) => sum + a.xp, 0) / alumnos.length)
        : 0,
      saludPromedio: alumnos.length > 0
        ? Math.round(alumnos.reduce((sum, a) => sum + a.salud, 0) / alumnos.length)
        : 0,
      xpMaximo: alumnos.length > 0 ? alumnos[0].xp : 0,
      xpMinimo: alumnos.length > 0 ? alumnos[alumnos.length - 1].xp : 0
    };

    res.json({
      success: true,
      grupo: {
        id: grupo._id,
        nombre: `${grupo.grado}${grupo.grupo}`,
        materia: grupo.materia,
        ciclo: grupo.ciclo
      },
      ranking,
      estadisticas
    });

  } catch (error) {
    console.error('Error al obtener ranking:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener el ranking',
      error: error.message
    });
  }
};

// ============================================
// HISTORIAL DE AJUSTES DEL ESTUDIANTE
// ============================================

/**
 * Obtener historial de ajustes XP/HP del estudiante
 * GET /api/estudiante/historial/:alumnoId
 * Query params opcionales: ?tipo=xp&desde=YYYY-MM-DD&hasta=YYYY-MM-DD&limite=50
 */
exports.obtenerHistorial = async (req, res) => {
  try {
    const { alumnoId } = req.params;
    const { tipo, desde, hasta, limite = 50 } = req.query;

    // Verificar que el alumno existe
    const alumno = await Alumno.findById(alumnoId);
    if (!alumno || !alumno.activo) {
      return res.status(404).json({
        success: false,
        mensaje: 'Alumno no encontrado'
      });
    }

    // Construir filtros
    const filtros = {
      alumno: alumnoId,
      visibleParaAlumno: true // Solo mostrar ajustes visibles para el alumno
    };

    // Filtro por tipo (xp o hp)
    if (tipo && ['xp', 'hp'].includes(tipo.toLowerCase())) {
      filtros.tipo = tipo.toLowerCase();
    }

    // Filtro por rango de fechas
    if (desde || hasta) {
      filtros.fecha = {};
      if (desde) {
        filtros.fecha.$gte = new Date(desde);
      }
      if (hasta) {
        // Agregar un día para incluir todo el día "hasta"
        const fechaHasta = new Date(hasta);
        fechaHasta.setDate(fechaHasta.getDate() + 1);
        filtros.fecha.$lt = fechaHasta;
      }
    }

    // Obtener ajustes con los filtros
    const ajustes = await Ajuste.find(filtros)
      .sort({ fecha: -1 })
      .limit(parseInt(limite))
      .lean();

    // Obtener estadísticas solo de ajustes visibles
    const estadisticas = await calcularEstadisticas(alumnoId);

    // Formatear datos para el frontend
    const historial = ajustes.map(ajuste => ({
      id: ajuste._id,
      tipo: ajuste.tipo,
      cantidad: ajuste.cantidad,
      motivo: ajuste.motivo,
      comentario: ajuste.comentarioAlumno || ajuste.motivo,
      valorAnterior: ajuste.valorAnterior,
      valorDespues: ajuste.valorDespues,
      fecha: ajuste.fecha,
      esPositivo: ajuste.cantidad > 0
    }));

    res.json({
      success: true,
      alumno: {
        id: alumno._id,
        nombreCompleto: alumno.nombreCompleto
      },
      historial,
      estadisticas,
      totalRegistros: historial.length,
      filtrosAplicados: {
        tipo: tipo || 'todos',
        desde: desde || null,
        hasta: hasta || null
      }
    });

  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener el historial',
      error: error.message
    });
  }
};

/**
 * Función auxiliar para calcular estadísticas de ajustes
 */
async function calcularEstadisticas(alumnoId) {
  const ajustes = await Ajuste.find({
    alumno: alumnoId,
    visibleParaAlumno: true
  }).lean();

  const stats = {
    totalAjustes: ajustes.length,
    xp: {
      ganado: 0,
      perdido: 0,
      neto: 0
    },
    hp: {
      ganado: 0,
      perdido: 0,
      neto: 0
    },
    motivoMasFrecuente: null
  };

  // Calcular estadísticas de XP y HP
  ajustes.forEach(ajuste => {
    if (ajuste.tipo === 'xp') {
      if (ajuste.cantidad > 0) {
        stats.xp.ganado += ajuste.cantidad;
      } else {
        stats.xp.perdido += Math.abs(ajuste.cantidad);
      }
      stats.xp.neto += ajuste.cantidad;
    } else if (ajuste.tipo === 'hp') {
      if (ajuste.cantidad > 0) {
        stats.hp.ganado += ajuste.cantidad;
      } else {
        stats.hp.perdido += Math.abs(ajuste.cantidad);
      }
      stats.hp.neto += ajuste.cantidad;
    }
  });

  // Encontrar motivo más frecuente
  if (ajustes.length > 0) {
    const motivosCount = {};
    ajustes.forEach(ajuste => {
      motivosCount[ajuste.motivo] = (motivosCount[ajuste.motivo] || 0) + 1;
    });

    stats.motivoMasFrecuente = Object.keys(motivosCount).reduce((a, b) =>
      motivosCount[a] > motivosCount[b] ? a : b
    );
  }

  return stats;
}
