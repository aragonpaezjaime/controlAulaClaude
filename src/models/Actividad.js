const mongoose = require('mongoose');

/**
 * Modelo de Actividad
 * Representa una tarea/actividad asignada a un grupo
 * Usado para calificar y otorgar XP basado en desempeño
 */
const actividadSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'El título es obligatorio'],
    trim: true,
    maxlength: [200, 'El título no puede exceder 200 caracteres']
  },

  descripcion: {
    type: String,
    trim: true,
    maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
  },

  grupo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grupo',
    required: [true, 'El grupo es obligatorio']
  },

  puntosMaximos: {
    type: Number,
    required: [true, 'Los puntos máximos son obligatorios'],
    min: [1, 'Los puntos máximos deben ser al menos 1'],
    max: [10000, 'Los puntos máximos no pueden exceder 10,000']
  },

  fecha: {
    type: Date,
    default: Date.now
  },

  activa: {
    type: Boolean,
    default: true
  },

  fechaCreacion: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índice para búsquedas frecuentes
actividadSchema.index({ grupo: 1, activa: 1, fecha: -1 });

// Virtual: Cantidad de alumnos calificados
actividadSchema.virtual('calificaciones', {
  ref: 'Evento',
  localField: '_id',
  foreignField: 'actividad',
  match: { tipoEvento: 'CalificacionActividad' }
});

// Método estático: Obtener actividades de un grupo
actividadSchema.statics.obtenerPorGrupo = async function(grupoId, soloActivas = true) {
  const filtro = { grupo: grupoId };
  if (soloActivas) {
    filtro.activa = true;
  }

  return this.find(filtro)
    .populate('grupo', 'grado grupo nivel')
    .sort({ fecha: -1 });
};

// Método estático: Obtener actividad con estadísticas de calificaciones
actividadSchema.statics.obtenerConEstadisticas = async function(actividadId) {
  const actividad = await this.findById(actividadId)
    .populate('grupo', 'grado grupo nivel');

  if (!actividad) {
    return null;
  }

  // Obtener eventos de calificación asociados
  const Evento = mongoose.model('Evento');
  const calificaciones = await Evento.find({
    actividad: actividadId,
    tipoEvento: 'CalificacionActividad'
  }).populate('alumno', 'nombre apellidos');

  return {
    ...actividad.toObject(),
    totalCalificaciones: calificaciones.length,
    calificaciones
  };
};

// Método de instancia: Obtener nombre completo de la actividad
actividadSchema.methods.obtenerNombreCompleto = function() {
  const fechaFormato = this.fecha.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  return `${this.titulo} (${fechaFormato})`;
};

// Exportar modelo (evitar error de recompilación en hot-reload)
module.exports = mongoose.models.Actividad || mongoose.model('Actividad', actividadSchema);
