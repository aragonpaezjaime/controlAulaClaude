const Alumno = require("../models/Alumno");
const Grupo = require("../models/Grupo");

// ============================================
// CREAR UN NUEVO ALUMNO
// ============================================
const crearAlumno = async (req, res) => {
  try {
    const {
      nombre,
      apellidos,
      grupo,
      xp,
      salud,
    } = req.body;
    // Verificar que el grupo existe
    const grupoExiste = await Grupo.findById(grupo);
    if (!grupoExiste) {
      return res.status(404).json({
        success: false,
        mensaje: "El grupo especificado no existe",
      });
    }
    // Crear nueva instancia del alumno
    const nuevoAlumno = new Alumno({
      nombre,
      apellidos,
      grupo,
      xp: xp || 0,
      salud: salud || 100,
    });
    // Guardar en la base de datos
    const alumnoGuardado = await nuevoAlumno.save();
    // Popular el grupo para mostrar información completa
    await alumnoGuardado.populate("grupo");
    res.status(201).json({
      success: true,
      mensaje: "Alumno registrado exitosamente",
      data: alumnoGuardado,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        mensaje: "Error de validación",
        errores: Object.values(error.errors).map((err) => err.message),
      });
    }
    res.status(500).json({
      success: false,
      mensaje: "Error al crear el alumno",
      error: error.message,
    });
  }
};

// ============================================
// OBTENER TODOS LOS ALUMNOS
// ============================================
const obtenerAlumnos = async (req, res) => {
  try {
    // Filtros opcionales desde query params
    const { grupo, activo, busqueda } = req.query;
    // Construir filtro dinámico
    const filtro = {};
    if (grupo) filtro.grupo = grupo;
    if (activo !== undefined) filtro.activo = activo === "true";
    // Búsqueda por texto si se proporciona
    if (busqueda) {
      filtro.$text = { $search: busqueda };
    }
    // Buscar alumnos y popular información del grupo
    const alumnos = await Alumno.find(filtro)
      .populate("grupo", "nombre nivel grado cicloEscolar") // Popular solo campos específicos
      .sort({ apellidos: 1, nombre: 1 });
    res.status(200).json({
      success: true,
      cantidad: alumnos.length,
      data: alumnos,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener los alumnos",
      error: error.message,
    });
  }
};

// ============================================
// OBTENER UN ALUMNO POR ID
// ============================================
const obtenerAlumnoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    // Buscar alumno y popular grupo
    const alumno = await Alumno.findById(id).populate("grupo");
    if (!alumno) {
      return res.status(404).json({
        success: false,
        mensaje: "Alumno no encontrado",
      });
    }
    res.status(200).json({
      success: true,
      data: alumno,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener el alumno",
      error: error.message,
    });
  }
};

// ============================================
// ACTUALIZAR UN ALUMNO
// ============================================
const actualizarAlumno = async (req, res) => {
  try {
    const { id } = req.params;
    // Si se está cambiando el grupo, verificar que existe
    if (req.body.grupo) {
      const grupoExiste = await Grupo.findById(req.body.grupo);
      if (!grupoExiste) {
        return res.status(404).json({
          success: false,
          mensaje: "El grupo especificado no existe",
        });
      }
    }
    // Actualizar alumno
    const alumnoActualizado = await Alumno.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("grupo");
    if (!alumnoActualizado) {
      return res.status(404).json({
        success: false,
        mensaje: "Alumno no encontrado",
      });
    }
    res.status(200).json({
      success: true,
      mensaje: "Alumno actualizado exitosamente",
      data: alumnoActualizado,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        mensaje: "Error de validación",
        errores: Object.values(error.errors).map((err) => err.message),
      });
    }
    res.status(500).json({
      success: false,
      mensaje: "Error al actualizar el alumno",
      error: error.message,
    });
  }
};

// ============================================
// ELIMINAR ALUMNO (SOFT DELETE)
// ============================================
const eliminarAlumno = async (req, res) => {
  try {
    const { id } = req.params;
    // Marcar como inactivo en lugar de eliminar
    const alumno = await Alumno.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true }
    );
    if (!alumno) {
      return res.status(404).json({
        success: false,
        mensaje: "Alumno no encontrado",
      });
    }
    res.status(200).json({
      success: true,
      mensaje: "Alumno desactivado exitosamente",
      data: alumno,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: "Error al eliminar el alumno",
      error: error.message,
    });
  }
};

// ============================================
// CAMBIAR ALUMNO DE GRUPO
// ============================================
const cambiarGrupo = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevoGrupoId } = req.body;
    // Verificar que el nuevo grupo existe
    const grupoExiste = await Grupo.findById(nuevoGrupoId);
    if (!grupoExiste) {
      return res.status(404).json({
        success: false,
        mensaje: "El grupo de destino no existe",
      });
    }
    // Actualizar el grupo del alumno
    const alumno = await Alumno.findByIdAndUpdate(
      id,
      { grupo: nuevoGrupoId },
      { new: true }
    ).populate("grupo");
    if (!alumno) {
      return res.status(404).json({
        success: false,
        mensaje: "Alumno no encontrado",
      });
    }
    res.status(200).json({
      success: true,
      mensaje: `Alumno cambiado al grupo ${grupoExiste.obtenerNombreCompleto()}`,
      data: alumno,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: "Error al cambiar el alumno de grupo",
      error: error.message,
    });
  }
};

// Exportar todas las funciones
module.exports = {
  crearAlumno,
  obtenerAlumnos,
  obtenerAlumnoPorId,
  actualizarAlumno,
  eliminarAlumno,
  cambiarGrupo,
};
