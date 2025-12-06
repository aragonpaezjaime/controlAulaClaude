const express = require('express');
const router = express.Router();
const xpController = require('../controllers/xpController');

// ============================================
// RUTAS DE AJUSTE MANUAL XP/HP
// ============================================

// POST /api/xp/alumno/:alumnoId/ajustar-xp - Ajustar XP de un alumno
router.post('/alumno/:alumnoId/ajustar-xp', xpController.ajustarXP);

// POST /api/xp/alumno/:alumnoId/ajustar-hp - Ajustar HP de un alumno
router.post('/alumno/:alumnoId/ajustar-hp', xpController.ajustarHP);

// GET /api/xp/alumno/:alumnoId/historial - Obtener historial de ajustes
router.get('/alumno/:alumnoId/historial', xpController.obtenerHistorialAjustes);

// ============================================
// RUTAS DE RANKING Y BONOS GRUPALES
// ============================================

// GET /api/xp/grupo/:grupoId/ranking - Obtener ranking del grupo por XP
router.get('/grupo/:grupoId/ranking', xpController.obtenerRankingGrupo);

// POST /api/xp/grupo/:grupoId/ajustar-grupal - Ajustar XP de múltiples alumnos
router.post('/grupo/:grupoId/ajustar-grupal', xpController.ajustarXPGrupal);

module.exports = router;
