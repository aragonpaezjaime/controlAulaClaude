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

module.exports = router;
