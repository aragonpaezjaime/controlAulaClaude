const express = require('express');
const router = express.Router();

// Importar controlador de alumnos
const {
  crearAlumno,
  obtenerAlumnos,
  obtenerAlumnoPorId,
  actualizarAlumno,
  eliminarAlumno,
  cambiarGrupo
} = require('../controllers/alumnoController');

// ============================================
// DEFINICIÓN DE RUTAS
// ============================================

// Ruta base: /api/alumnos

// POST /api/alumnos - Crear un nuevo alumno
router.post('/', crearAlumno);

// GET /api/alumnos - Obtener todos los alumnos
// Query params opcionales: ?grupo=ID&activo=true&busqueda=texto
router.get('/', obtenerAlumnos);

// GET /api/alumnos/:id - Obtener un alumno específico por ID
router.get('/:id', obtenerAlumnoPorId);

// PUT /api/alumnos/:id - Actualizar un alumno
router.put('/:id', actualizarAlumno);

// DELETE /api/alumnos/:id - Eliminar (desactivar) un alumno
router.delete('/:id', eliminarAlumno);

// PATCH /api/alumnos/:id/cambiar-grupo - Cambiar alumno de grupo
router.patch('/:id/cambiar-grupo', cambiarGrupo);

module.exports = router;
