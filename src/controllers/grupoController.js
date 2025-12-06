const Grupo = require('../models/Grupo');

// ============================================
// CREAR UN NUEVO GRUPO
// ============================================
const crearGrupo = async (req, res) => {
  try {
    // Extraer datos del cuerpo de la petición
    const { grado, grupo, nivel, horario, cicloEscolar, aula } = req.body;

    // Crear nueva instancia del modelo Grupo
    const nuevoGrupo = new Grupo({
      grado,
      grupo,
      nivel,
      horario,
      cicloEscolar,
      aula
    });

    // Guardar en la base de datos
    const grupoGuardado = await nuevoGrupo.save();

    // Responder con el grupo creado
    res.status(201).json({
      success: true,
      mensaje: 'Grupo creado exitosamente',
      data: grupoGuardado
    });

  } catch (error) {
    // Manejo de errores de validación de Mongoose
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        mensaje: 'Error de validación',
        errores: Object.values(error.errors).map(err => err.message)
      });
    }

    // Error de duplicado (índice único)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        mensaje: 'Ya existe un grupo con ese identificador en el mismo ciclo y nivel'
      });
    }

    // Otros errores
    res.status(500).json({
      success: false,
      mensaje: 'Error al crear el grupo',
      error: error.message
    });
  }
};

// ============================================
// OBTENER TODOS LOS GRUPOS
// ============================================
const obtenerGrupos = async (req, res) => {
  try {
    // Opciones de filtrado desde query params
    const { activo, cicloEscolar, nivel } = req.query;

    // Construir filtro dinámico
    const filtro = {};
    if (activo !== undefined) filtro.activo = activo === 'true';
    if (cicloEscolar) filtro.cicloEscolar = cicloEscolar;
    if (nivel) filtro.nivel = nivel;

    // Buscar grupos con populate del campo virtual numeroAlumnos
    const grupos = await Grupo.find(filtro)
      .populate('numeroAlumnos') // Campo virtual
      .sort({ nivel: 1, grado: 1, grupo: 1 }); // Ordenar

    res.status(200).json({
      success: true,
      cantidad: grupos.length,
      data: grupos
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener los grupos',
      error: error.message
    });
  }
};

// ============================================
// OBTENER UN GRUPO POR ID
// ============================================
const obtenerGrupoPorId = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar grupo por ID y popular alumnos
    const grupo = await Grupo.findById(id).populate('numeroAlumnos');

    // Validar si existe
    if (!grupo) {
      return res.status(404).json({
        success: false,
        mensaje: 'Grupo no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: grupo
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener el grupo',
      error: error.message
    });
  }
};

// ============================================
// ACTUALIZAR UN GRUPO
// ============================================
const actualizarGrupo = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar y actualizar en una sola operación
    const grupoActualizado = await Grupo.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true, // Retorna el documento actualizado
        runValidators: true // Ejecuta las validaciones del esquema
      }
    );

    // Validar si existe
    if (!grupoActualizado) {
      return res.status(404).json({
        success: false,
        mensaje: 'Grupo no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      mensaje: 'Grupo actualizado exitosamente',
      data: grupoActualizado
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        mensaje: 'Error de validación',
        errores: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      mensaje: 'Error al actualizar el grupo',
      error: error.message
    });
  }
};

// ============================================
// ELIMINAR UN GRUPO (SOFT DELETE)
// ============================================
const eliminarGrupo = async (req, res) => {
  try {
    const { id } = req.params;

    // En lugar de eliminar, marcamos como inactivo (soft delete)
    const grupo = await Grupo.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true }
    );

    if (!grupo) {
      return res.status(404).json({
        success: false,
        mensaje: 'Grupo no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      mensaje: 'Grupo desactivado exitosamente',
      data: grupo
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al eliminar el grupo',
      error: error.message
    });
  }
};

// ============================================
// OBTENER ALUMNOS DE UN GRUPO
// ============================================
const obtenerAlumnosDelGrupo = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el grupo existe
    const grupo = await Grupo.findById(id);
    if (!grupo) {
      return res.status(404).json({
        success: false,
        mensaje: 'Grupo no encontrado'
      });
    }

    // Importar modelo Alumno aquí para evitar dependencias circulares
    const Alumno = require('../models/Alumno');

    // Buscar alumnos del grupo
    const alumnos = await Alumno.find({ grupo: id, activo: true })
      .sort({ apellidos: 1, nombre: 1 });

    res.status(200).json({
      success: true,
      grupo: grupo.obtenerNombreCompleto(),
      cantidad: alumnos.length,
      data: alumnos
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener los alumnos del grupo',
      error: error.message
    });
  }
};

// Exportar todas las funciones del controlador
module.exports = {
  crearGrupo,
  obtenerGrupos,
  obtenerGrupoPorId,
  actualizarGrupo,
  eliminarGrupo,
  obtenerAlumnosDelGrupo
};
