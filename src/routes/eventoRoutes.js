const express = require('express');
const router = express.Router();

// Importar controlador de eventos
const {
  // Salidas
  registrarSalida,
  registrarRegreso,
  obtenerSalidasAlumno,
  obtenerConteoSalidasBanoSemana,

  // Disciplinarios
  registrarEventoDisciplinario,
  registrarFaltaGrupal,
  obtenerEventosDisciplinariosAlumno,

  // Consultas generales
  obtenerTodosLosEventos,
  obtenerEventosAlumno,
  obtenerHistorial
} = require('../controllers/eventoController');

// ============================================
// RUTAS DE SALIDAS
// ============================================

// POST /api/eventos/salida - Registrar una salida (baño, enfermería, agua, otros)
router.post('/salida', registrarSalida);

// PATCH /api/eventos/salida/:id/regreso - Registrar regreso de una salida
router.patch('/salida/:id/regreso', registrarRegreso);

// GET /api/eventos/salidas/alumno/:alumnoId - Obtener todas las salidas de un alumno
// Query params: ?tipoSalida=baño&fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD
router.get('/salidas/alumno/:alumnoId', obtenerSalidasAlumno);

// GET /api/eventos/salidas-bano-semana/:alumnoId - Conteo de salidas al baño de la semana
router.get('/salidas-bano-semana/:alumnoId', obtenerConteoSalidasBanoSemana);

// ============================================
// RUTAS DE EVENTOS DISCIPLINARIOS
// ============================================

// POST /api/eventos/disciplinario - Registrar evento disciplinario individual
router.post('/disciplinario', registrarEventoDisciplinario);

// POST /api/eventos/falta-grupal - Registrar falta grupal (afecta a todos los alumnos)
router.post('/falta-grupal', registrarFaltaGrupal);

// GET /api/eventos/disciplinarios/alumno/:alumnoId - Obtener eventos disciplinarios de un alumno
// Query params: ?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD
router.get('/disciplinarios/alumno/:alumnoId', obtenerEventosDisciplinariosAlumno);

// ============================================
// RUTAS DE CONSULTAS GENERALES
// ============================================

// GET /api/eventos/historial - Obtener historial con filtros avanzados
// Query params: ?grupoId=xxx&alumnoId=xxx&tipoEvento=salida&fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD&limite=100
router.get('/historial', obtenerHistorial);

// GET /api/eventos - Obtener todos los eventos
// Query params: ?tipoEvento=Salida&fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD&limite=100
router.get('/', obtenerTodosLosEventos);

// GET /api/eventos/alumno/:alumnoId - Obtener todos los eventos de un alumno
// Query params: ?tipoEvento=Salida&fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD
router.get('/alumno/:alumnoId', obtenerEventosAlumno);

module.exports = router;
