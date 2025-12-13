const mongoose = require('mongoose');

// ============================================
// ESQUEMA DE INSIGNIAS/BADGES
// ============================================
// Modelo para gestionar insignias que pueden ser otorgadas a los alumnos
// Implementación básica para FASE 1
// Se expandirá en FASE 2 con gestión completa

const insigniaSchema = new mongoose.Schema({
  // Nombre de la insignia
  nombre: {
    type: String,
    required: [true, 'El nombre de la insignia es obligatorio'],
    trim: true,
    unique: true,
    maxlength: [50, 'El nombre no puede exceder 50 caracteres']
  },

  // Descripción de cómo se obtiene
  descripcion: {
    type: String,
    required: [true, 'La descripción es obligatoria'],
    trim: true,
    maxlength: [200, 'La descripción no puede exceder 200 caracteres']
  },

  // Icono/emoji representativo
  icono: {
    type: String,
    default: '🏆',
    maxlength: [10, 'El icono no puede exceder 10 caracteres']
  },

  // Color de la insignia (hex code)
  color: {
    type: String,
    default: '#FFD700', // Dorado por defecto
    match: [/^#[0-9A-F]{6}$/i, 'El color debe ser un código hexadecimal válido']
  },

  // Categoría de la insignia
  categoria: {
    type: String,
    enum: {
      values: ['asistencia', 'academico', 'conducta', 'especial', 'evento'],
      message: '{VALUE} no es una categoría válida'
    },
    default: 'especial'
  },

  // Nivel de rareza (común, rara, épica, legendaria)
  rareza: {
    type: String,
    enum: {
      values: ['comun', 'rara', 'epica', 'legendaria'],
      message: '{VALUE} no es una rareza válida'
    },
    default: 'comun'
  },

  // Indica si la insignia está activa (se puede otorgar)
  activa: {
    type: Boolean,
    default: true
  },

  // Requisito de XP mínimo (opcional)
  xpRequerido: {
    type: Number,
    default: 0,
    min: [0, 'El XP requerido no puede ser negativo']
  },

  // Indica si es otorgamiento automático o manual
  otorgamientoAutomatico: {
    type: Boolean,
    default: false
  },

  // Criterios para otorgamiento automático (JSON flexible)
  // Ejemplo: { asistenciasPerfectas: 30, xpMinimo: 5000 }
  criterios: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// ============================================
// ÍNDICES
// ============================================

// Nota: El campo 'nombre' ya tiene índice único por la propiedad unique: true

// Índice compuesto por categoría y rareza
insigniaSchema.index({ categoria: 1, rareza: 1 });

// ============================================
// MÉTODOS DE INSTANCIA
// ============================================

// Obtener representación visual de la insignia
insigniaSchema.methods.obtenerRepresentacion = function() {
  return `${this.icono} ${this.nombre}`;
};

// Verificar si un alumno cumple los criterios para esta insignia
insigniaSchema.methods.cumpleCriterios = function(alumno) {
  // Si es manual, siempre retorna false (debe ser otorgada por el profesor)
  if (!this.otorgamientoAutomatico) {
    return false;
  }

  // Verificar XP mínimo
  if (this.xpRequerido > 0 && alumno.xp < this.xpRequerido) {
    return false;
  }

  // Aquí se pueden agregar más verificaciones según los criterios
  // Por ahora, solo verifica XP

  return true;
};

// ============================================
// MÉTODOS ESTÁTICOS
// ============================================

// Obtener todas las insignias activas
insigniaSchema.statics.obtenerActivas = async function() {
  return await this.find({ activa: true }).sort({ rareza: -1, nombre: 1 });
};

// Obtener insignias por categoría
insigniaSchema.statics.obtenerPorCategoria = async function(categoria) {
  return await this.find({ categoria, activa: true }).sort({ rareza: -1, nombre: 1 });
};

// ============================================
// EXPORTAR MODELO
// ============================================

module.exports = mongoose.model('Insignia', insigniaSchema);
