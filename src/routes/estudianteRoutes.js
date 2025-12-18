const express = require('express');
const router = express.Router();
const estudianteController = require('../controllers/estudianteController');

// ============================================
// RUTAS DE AUTENTICACIÓN
// ============================================

/**
 * POST /api/estudiante/login
 * Login de estudiante con clave de zipGrade
 * Body: { claveZipGrade: string }
 */
router.post('/login', estudianteController.login);

// ============================================
// RUTAS DE PERFIL Y DATOS DEL ESTUDIANTE
// ============================================

/**
 * GET /api/estudiante/perfil/:alumnoId
 * Obtiene el perfil completo del estudiante
 */
router.get('/perfil/:alumnoId', estudianteController.obtenerPerfil);

/**
 * GET /api/estudiante/ranking/:grupoId
 * Obtiene el ranking completo del grupo con estadísticas
 */
router.get('/ranking/:grupoId', estudianteController.obtenerRanking);

/**
 * GET /api/estudiante/historial/:alumnoId
 * Obtiene el historial de ajustes XP/HP del estudiante
 * Query params opcionales: ?tipo=xp&desde=YYYY-MM-DD&hasta=YYYY-MM-DD&limite=50
 */
router.get('/historial/:alumnoId', estudianteController.obtenerHistorial);

/**
 * GET /api/estudiante/salidas/:alumnoId
 * Obtiene estadísticas de salidas (baño, enfermería) del estudiante
 * Query params opcionales: ?periodo=trimestre (semana|mes|trimestre|ciclo)
 */
router.get('/salidas/:alumnoId', estudianteController.obtenerSalidas);

/**
 * PUT /api/estudiante/perfil
 * Actualiza las preferencias de perfil del estudiante (nombre y avatar)
 * Body: { claveZipGrade: string, preferenciaNombre?: string, avatarConfig?: string }
 */
router.put('/perfil', estudianteController.actualizarPerfil);

module.exports = router;
