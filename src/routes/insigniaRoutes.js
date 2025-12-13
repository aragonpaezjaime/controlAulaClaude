const express = require('express');
const router = express.Router();
const insigniaController = require('../controllers/insigniaController');

// ============================================
// RUTAS DE INSIGNIAS (CRUD)
// ============================================

// Obtener todas las insignias
router.get('/', insigniaController.obtenerInsignias);

// Obtener solo insignias activas
router.get('/activas', insigniaController.obtenerInsigniasActivas);

// Obtener una insignia específica por ID
router.get('/:id', insigniaController.obtenerInsigniaPorId);

// Crear nueva insignia
router.post('/', insigniaController.crearInsignia);

// Actualizar insignia existente
router.put('/:id', insigniaController.actualizarInsignia);

// Eliminar insignia
router.delete('/:id', insigniaController.eliminarInsignia);

// ============================================
// RUTAS DE ASIGNACIÓN DE INSIGNIAS
// ============================================

// Asignar insignia a un alumno
router.post('/asignar', insigniaController.asignarInsignia);

// Quitar insignia de un alumno
router.post('/quitar', insigniaController.quitarInsignia);

// Obtener alumnos que tienen una insignia específica
router.get('/:id/alumnos', insigniaController.obtenerAlumnosPorInsignia);

module.exports = router;
