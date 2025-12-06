const express = require('express');
const router = express.Router();

// Importar controlador de grupos
const {
  crearGrupo,
  obtenerGrupos,
  obtenerGrupoPorId,
  actualizarGrupo,
  eliminarGrupo,
  obtenerAlumnosDelGrupo
} = require('../controllers/grupoController');

// ============================================
// DEFINICIÓN DE RUTAS
// ============================================

// Ruta base: /api/grupos

// POST /api/grupos - Crear un nuevo grupo
router.post('/', crearGrupo);

// GET /api/grupos - Obtener todos los grupos
// Query params opcionales: ?activo=true&cicloEscolar=2024-2025&nivel=Secundaria
router.get('/', obtenerGrupos);

// GET /api/grupos/:id - Obtener un grupo específico por ID
router.get('/:id', obtenerGrupoPorId);

// PUT /api/grupos/:id - Actualizar un grupo
router.put('/:id', actualizarGrupo);

// DELETE /api/grupos/:id - Eliminar (desactivar) un grupo
router.delete('/:id', eliminarGrupo);

// GET /api/grupos/:id/alumnos - Obtener todos los alumnos de un grupo
router.get('/:id/alumnos', obtenerAlumnosDelGrupo);

module.exports = router;
