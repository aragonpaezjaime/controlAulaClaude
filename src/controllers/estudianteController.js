const Alumno = require('../models/Alumno');
const Grupo = require('../models/Grupo');
const Insignia = require('../models/Insignia');

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
