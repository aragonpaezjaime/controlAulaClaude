const express = require('express');
const router = express.Router();
const actividadController = require('../controllers/actividadController');

/**
 * Rutas para gestión de actividades y calificaciones
 * Base URL: /api/actividades
 */

// ============================================
// RUTAS DE ACTIVIDADES
// ============================================

// Crear una nueva actividad
// POST /api/actividades
router.post('/', actividadController.crearActividad);

// Obtener actividades de un grupo
// GET /api/actividades/grupo/:grupoId?soloActivas=true
router.get('/grupo/:grupoId', actividadController.obtenerActividadesPorGrupo);

// Obtener una actividad con estadísticas (incluye calificaciones)
// GET /api/actividades/:actividadId/estadisticas
router.get('/:actividadId/estadisticas', actividadController.obtenerActividadConEstadisticas);

// Desactivar una actividad
// PATCH /api/actividades/:actividadId/desactivar
router.patch('/:actividadId/desactivar', actividadController.desactivarActividad);

// ============================================
// RUTAS DE CALIFICACIONES
// ============================================

// Calificar una actividad (batch processing)
// POST /api/actividades/:actividadId/calificar
// Body: { calificaciones: [{ alumnoId, calificacion, feedback? }] }
router.post('/:actividadId/calificar', actividadController.calificarActividad);

// Obtener calificaciones de un alumno
// GET /api/actividades/alumno/:alumnoId/calificaciones
router.get('/alumno/:alumnoId/calificaciones', actividadController.obtenerCalificacionesAlumno);

module.exports = router;
