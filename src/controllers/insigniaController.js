const Insignia = require('../models/Insignia');
const Alumno = require('../models/Alumno');

// ============================================
// OBTENER TODAS LAS INSIGNIAS
// ============================================
exports.obtenerInsignias = async (req, res) => {
  try {
    const insignias = await Insignia.find().sort({ rareza: -1, createdAt: -1 });

    res.json({
      success: true,
      data: insignias
    });
  } catch (error) {
    console.error('Error al obtener insignias:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener las insignias',
      error: error.message
    });
  }
};

// ============================================
// OBTENER INSIGNIAS ACTIVAS
// ============================================
exports.obtenerInsigniasActivas = async (req, res) => {
  try {
    const insignias = await Insignia.find({ activa: true }).sort({ rareza: -1, createdAt: -1 });

    res.json({
      success: true,
      data: insignias
    });
  } catch (error) {
    console.error('Error al obtener insignias activas:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener las insignias activas',
      error: error.message
    });
  }
};

// ============================================
// OBTENER UNA INSIGNIA POR ID
// ============================================
exports.obtenerInsigniaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const insignia = await Insignia.findById(id);

    if (!insignia) {
      return res.status(404).json({
        success: false,
        mensaje: 'Insignia no encontrada'
      });
    }

    res.json({
      success: true,
      data: insignia
    });
  } catch (error) {
    console.error('Error al obtener insignia:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener la insignia',
      error: error.message
    });
  }
};

// ============================================
// CREAR NUEVA INSIGNIA
// ============================================
exports.crearInsignia = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      icono,
      color,
      categoria,
      rareza,
      activa,
      xpRequerido,
      otorgamientoAutomatico,
      criterios
    } = req.body;

    // Validar nombre único
    const existente = await Insignia.findOne({ nombre });
    if (existente) {
      return res.status(400).json({
        success: false,
        mensaje: `Ya existe una insignia con el nombre "${nombre}"`
      });
    }

    const nuevaInsignia = new Insignia({
      nombre,
      descripcion,
      icono: icono || '🏆',
      color: color || '#FFD700',
      categoria: categoria || 'especial',
      rareza: rareza || 'comun',
      activa: activa !== undefined ? activa : true,
      xpRequerido: xpRequerido || 0,
      otorgamientoAutomatico: otorgamientoAutomatico || false,
      criterios: criterios || {}
    });

    const insigniaGuardada = await nuevaInsignia.save();

    res.status(201).json({
      success: true,
      mensaje: 'Insignia creada exitosamente',
      data: insigniaGuardada
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        mensaje: 'Error de validación',
        errores: Object.values(error.errors).map(err => err.message)
      });
    }

    console.error('Error al crear insignia:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al crear la insignia',
      error: error.message
    });
  }
};

// ============================================
// ACTUALIZAR INSIGNIA
// ============================================
exports.actualizarInsignia = async (req, res) => {
  try {
    const { id } = req.params;

    // Si se está cambiando el nombre, verificar que no exista otra con ese nombre
    if (req.body.nombre) {
      const existente = await Insignia.findOne({
        nombre: req.body.nombre,
        _id: { $ne: id }
      });

      if (existente) {
        return res.status(400).json({
          success: false,
          mensaje: `Ya existe otra insignia con el nombre "${req.body.nombre}"`
        });
      }
    }

    const insigniaActualizada = await Insignia.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!insigniaActualizada) {
      return res.status(404).json({
        success: false,
        mensaje: 'Insignia no encontrada'
      });
    }

    res.json({
      success: true,
      mensaje: 'Insignia actualizada exitosamente',
      data: insigniaActualizada
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        mensaje: 'Error de validación',
        errores: Object.values(error.errors).map(err => err.message)
      });
    }

    console.error('Error al actualizar insignia:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al actualizar la insignia',
      error: error.message
    });
  }
};

// ============================================
// ELIMINAR INSIGNIA
// ============================================
exports.eliminarInsignia = async (req, res) => {
  try {
    const { id } = req.params;

    const insignia = await Insignia.findByIdAndDelete(id);

    if (!insignia) {
      return res.status(404).json({
        success: false,
        mensaje: 'Insignia no encontrada'
      });
    }

    // TODO: Considerar eliminar referencias de esta insignia en alumnos
    // Por ahora solo la eliminamos de la colección de insignias

    res.json({
      success: true,
      mensaje: 'Insignia eliminada exitosamente',
      data: insignia
    });
  } catch (error) {
    console.error('Error al eliminar insignia:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al eliminar la insignia',
      error: error.message
    });
  }
};

// ============================================
// ASIGNAR INSIGNIA A ALUMNO
// ============================================
exports.asignarInsignia = async (req, res) => {
  try {
    const { alumnoId, insigniaId } = req.body;

    if (!alumnoId || !insigniaId) {
      return res.status(400).json({
        success: false,
        mensaje: 'Debes proporcionar alumnoId e insigniaId'
      });
    }

    // Verificar que la insignia existe
    const insignia = await Insignia.findById(insigniaId);
    if (!insignia) {
      return res.status(404).json({
        success: false,
        mensaje: 'Insignia no encontrada'
      });
    }

    // Verificar que el alumno existe
    const alumno = await Alumno.findById(alumnoId);
    if (!alumno) {
      return res.status(404).json({
        success: false,
        mensaje: 'Alumno no encontrado'
      });
    }

    // Verificar que el alumno no tenga ya esta insignia
    const yaLaTiene = alumno.insignias.some(
      ins => ins.insigniaId.toString() === insigniaId
    );

    if (yaLaTiene) {
      return res.status(400).json({
        success: false,
        mensaje: `${alumno.nombreCompleto} ya tiene la insignia "${insignia.nombre}"`
      });
    }

    // Agregar insignia al alumno
    alumno.insignias.push({
      insigniaId: insignia._id,
      fechaObtencion: new Date(),
      otorgadoPor: req.body.otorgadoPor || 'Profesor'
    });

    await alumno.save();

    res.json({
      success: true,
      mensaje: `Insignia "${insignia.nombre}" asignada a ${alumno.nombreCompleto}`,
      data: {
        alumno: {
          id: alumno._id,
          nombre: alumno.nombreCompleto,
          insigniasTotal: alumno.insignias.length
        },
        insignia: {
          id: insignia._id,
          nombre: insignia.nombre,
          icono: insignia.icono
        }
      }
    });
  } catch (error) {
    console.error('Error al asignar insignia:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al asignar la insignia',
      error: error.message
    });
  }
};

// ============================================
// QUITAR INSIGNIA DE ALUMNO
// ============================================
exports.quitarInsignia = async (req, res) => {
  try {
    const { alumnoId, insigniaId } = req.body;

    if (!alumnoId || !insigniaId) {
      return res.status(400).json({
        success: false,
        mensaje: 'Debes proporcionar alumnoId e insigniaId'
      });
    }

    const alumno = await Alumno.findById(alumnoId);
    if (!alumno) {
      return res.status(404).json({
        success: false,
        mensaje: 'Alumno no encontrado'
      });
    }

    const insignia = await Insignia.findById(insigniaId);
    if (!insignia) {
      return res.status(404).json({
        success: false,
        mensaje: 'Insignia no encontrada'
      });
    }

    // Filtrar para remover la insignia
    const insigniasOriginales = alumno.insignias.length;
    alumno.insignias = alumno.insignias.filter(
      ins => ins.insigniaId.toString() !== insigniaId
    );

    if (alumno.insignias.length === insigniasOriginales) {
      return res.status(400).json({
        success: false,
        mensaje: `${alumno.nombreCompleto} no tiene la insignia "${insignia.nombre}"`
      });
    }

    await alumno.save();

    res.json({
      success: true,
      mensaje: `Insignia "${insignia.nombre}" removida de ${alumno.nombreCompleto}`,
      data: {
        alumno: {
          id: alumno._id,
          nombre: alumno.nombreCompleto,
          insigniasTotal: alumno.insignias.length
        }
      }
    });
  } catch (error) {
    console.error('Error al quitar insignia:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al quitar la insignia',
      error: error.message
    });
  }
};

// ============================================
// OBTENER ALUMNOS CON UNA INSIGNIA ESPECÍFICA
// ============================================
exports.obtenerAlumnosPorInsignia = async (req, res) => {
  try {
    const { id } = req.params;

    const insignia = await Insignia.findById(id);
    if (!insignia) {
      return res.status(404).json({
        success: false,
        mensaje: 'Insignia no encontrada'
      });
    }

    const alumnos = await Alumno.find({
      'insignias.insigniaId': id
    }).select('nombre apellidos xp salud insignias');

    const alumnosConInfo = alumnos.map(alumno => ({
      id: alumno._id,
      nombre: alumno.nombreCompleto,
      xp: alumno.xp,
      hp: alumno.salud,
      fechaObtencion: alumno.insignias.find(
        ins => ins.insigniaId.toString() === id
      )?.fechaObtencion
    }));

    res.json({
      success: true,
      data: {
        insignia: {
          id: insignia._id,
          nombre: insignia.nombre,
          icono: insignia.icono
        },
        alumnos: alumnosConInfo,
        total: alumnosConInfo.length
      }
    });
  } catch (error) {
    console.error('Error al obtener alumnos por insignia:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener alumnos',
      error: error.message
    });
  }
};
