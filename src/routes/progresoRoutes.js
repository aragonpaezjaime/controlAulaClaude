const express = require('express');
const router = express.Router();

const {
  obtenerProgresoXP,
  obtenerProgresoHP,
  obtenerEstadisticas,
  obtenerProgresoCompleto,
  obtenerProgresoGrupo
} = require('../controllers/progresoController');

/**
 * Rutas de Progreso
 * Endpoints para obtener gráficas y estadísticas de progreso
 * de estudiantes y grupos
 */

// ============================================
// RUTAS PARA ESTUDIANTES (por claveZipGrade)
// ============================================

// GET /api/progreso/estudiante/:claveZipGrade/xp?dias=90
// Obtener progreso de XP para gráfica
router.get('/estudiante/:claveZipGrade/xp', obtenerProgresoXP);

// GET /api/progreso/estudiante/:claveZipGrade/hp?dias=90
// Obtener progreso de HP para gráfica
router.get('/estudiante/:claveZipGrade/hp', obtenerProgresoHP);

// GET /api/progreso/estudiante/:claveZipGrade/estadisticas?dias=90
// Obtener estadísticas del periodo (racha, tendencia, etc.)
router.get('/estudiante/:claveZipGrade/estadisticas', obtenerEstadisticas);

// GET /api/progreso/estudiante/:claveZipGrade/completo?dias=90
// Obtener todo en una sola petición (XP + HP + Estadísticas)
// Recomendado para optimizar requests
router.get('/estudiante/:claveZipGrade/completo', obtenerProgresoCompleto);

// ============================================
// RUTAS PARA PROFESOR (por grupoId)
// ============================================

// GET /api/progreso/grupo/:grupoId/promedio?dias=90
// Obtener progreso promedio del grupo
router.get('/grupo/:grupoId/promedio', obtenerProgresoGrupo);

module.exports = router;
