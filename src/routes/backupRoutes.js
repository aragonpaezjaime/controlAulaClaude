const express = require('express');
const router = express.Router();
const { exportarPuntos } = require('../controllers/backupController');

// ============================================
// RUTAS DE BACKUP
// ============================================

// GET /api/backup/exportar-puntos - Descargar backup de puntos XP/HP
router.get('/exportar-puntos', exportarPuntos);

module.exports = router;
