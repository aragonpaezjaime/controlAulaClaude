const express = require('express');
const router = express.Router();
const asistenciaController = require('../controllers/asistenciaController');

// ============================================
// RUTAS DE ASISTENCIA
// ============================================

// Registrar asistencia de un grupo completo
// POST /api/asistencia/grupo
router.post('/grupo', asistenciaController.registrarAsistenciaGrupo);

// 🆕 Upsert (auto-guardar) asistencia de un grupo - Actualiza si existe, crea si no
// POST /api/asistencia/grupo/auto-guardar
router.post('/grupo/auto-guardar', asistenciaController.upsertAsistenciaGrupo);

// Obtener asistencia de un grupo por fecha
// GET /api/asistencia/grupo/:grupoId?fecha=2025-01-15
router.get('/grupo/:grupoId', asistenciaController.obtenerAsistenciaPorGrupoYFecha);

// Obtener resumen de asistencia de un grupo
// GET /api/asistencia/grupo/:grupoId/resumen?fecha=2025-01-15
router.get('/grupo/:grupoId/resumen', asistenciaController.obtenerResumenGrupo);

// Obtener estadísticas de asistencia de un alumno
// GET /api/asistencia/alumno/:alumnoId?fechaInicio=2025-01-01&fechaFin=2025-01-31
router.get('/alumno/:alumnoId', asistenciaController.obtenerEstadisticasAlumno);

// Obtener tabla de asistencias del grupo
// GET /api/asistencia/grupo/:grupoId/tabla?fechaInicio=2025-01-01&fechaFin=2025-01-31
router.get('/grupo/:grupoId/tabla', asistenciaController.obtenerTablaAsistencias);

// Justificar faltas de un alumno en un rango de fechas
// PATCH /api/asistencia/alumno/:alumnoId/justificar
router.patch('/alumno/:alumnoId/justificar', asistenciaController.justificarFaltas);

// Justificar una falta individual por ID de asistencia
// PATCH /api/asistencia/:asistenciaId/justificar-individual
router.patch('/:asistenciaId/justificar-individual', asistenciaController.justificarFaltaIndividual);

module.exports = router;
