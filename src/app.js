const express = require('express');
const cors = require('cors');
const path = require('path');

// Crear la aplicación Express
const app = express();

// ============================================
// MIDDLEWARES GLOBALES
// ============================================

// CORS: Permite que el frontend acceda a la API desde otro dominio
app.use(cors());

// Parsear JSON: Convierte el body de las peticiones a formato JSON
app.use(express.json());

// Parsear datos de formularios URL-encoded
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, '../public')));

// Middleware para logging de peticiones (opcional en desarrollo)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// RUTAS DE LA API
// ============================================

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    mensaje: 'API de Control de Aula',
    version: '1.0.0',
    endpoints: {
      grupos: '/api/grupos',
      alumnos: '/api/alumnos',
      eventos: '/api/eventos',
      asistencia: '/api/asistencia',
      xp: '/api/xp',
      actividades: '/api/actividades',
      backup: '/api/backup',
      importar: '/api/importar',
      insignias: '/api/insignias'
    }
  });
});

// Importar y montar las rutas
const grupoRoutes = require('./routes/grupoRoutes');
const alumnoRoutes = require('./routes/alumnoRoutes');
const eventoRoutes = require('./routes/eventoRoutes');
const asistenciaRoutes = require('./routes/asistenciaRoutes');
const xpRoutes = require('./routes/xpRoutes');
const actividadRoutes = require('./routes/actividadRoutes');
const backupRoutes = require('./routes/backupRoutes');
const importarRoutes = require('./routes/importarRoutes');
const insigniaRoutes = require('./routes/insigniaRoutes');

// Montar las rutas en la aplicación
app.use('/api/grupos', grupoRoutes);
app.use('/api/alumnos', alumnoRoutes);
app.use('/api/eventos', eventoRoutes);
app.use('/api/asistencia', asistenciaRoutes);
app.use('/api/xp', xpRoutes);
app.use('/api/actividades', actividadRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/importar', importarRoutes);
app.use('/api/insignias', insigniaRoutes);

// ============================================
// MANEJO DE ERRORES
// ============================================

// Ruta no encontrada (404)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    mensaje: 'Ruta no encontrada',
    path: req.path
  });
});

// Manejador de errores global
app.use((error, req, res, next) => {
  console.error('Error:', error);

  // Error de sintaxis JSON
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      mensaje: 'JSON inválido en la petición'
    });
  }

  // Error genérico del servidor
  res.status(error.status || 500).json({
    success: false,
    mensaje: error.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

module.exports = app;
