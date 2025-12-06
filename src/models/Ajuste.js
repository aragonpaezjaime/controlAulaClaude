const mongoose = require('mongoose');

// ============================================
// ESQUEMA DE AJUSTES MANUALES (XP/HP)
// ============================================
// Registra todos los ajustes manuales de XP y HP realizados por el docente

const ajusteSchema = new mongoose.Schema({
  // Referencia al alumno
  alumno: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alumno',
    required: [true, 'El alumno es obligatorio']
  },

  // Tipo de ajuste
  tipo: {
    type: String,
    required: [true, 'El tipo de ajuste es obligatorio'],
    enum: {
      values: ['xp', 'hp'],
      message: '{VALUE} no es un tipo válido. Use: xp, hp'
    }
  },

  // Cantidad ajustada (puede ser positiva o negativa)
  cantidad: {
    type: Number,
    required: [true, 'La cantidad es obligatoria']
  },

  // Motivo del ajuste
  motivo: {
    type: String,
    required: [true, 'El motivo es obligatorio'],
    enum: {
      values: [
        // Motivos académicos específicos (actualizados 6-Dic-2025)
        'Tarea',
        'Práctica',
        'Plickers',
        'Jeopardy',
        'Reto (examen)',
        'Bonus de Constancia (Asistencia)',
        'Extra',
        'Escaperoom',
        // Motivos generales
        'Participación destacada',
        'Ayudó a compañero',
        'Proyecto excelente',
        'Trabajo extra',
        'Comportamiento ejemplar',
        'Evento disciplinario',
        'Corrección manual',
        'Otro'
      ],
      message: '{VALUE} no es un motivo válido'
    }
  },

  // Observaciones adicionales
  observaciones: {
    type: String,
    trim: true
  },

  // Valores antes y después del ajuste (para auditoría)
  valorAnterior: {
    type: Number,
    required: true
  },

  valorDespues: {
    type: Number,
    required: true
  },

  // Fecha del ajuste
  fecha: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// ============================================
// ÍNDICES
// ============================================

// Índice para consultas por alumno
ajusteSchema.index({ alumno: 1, fecha: -1 });

// Índice para consultas por tipo
ajusteSchema.index({ tipo: 1, fecha: -1 });

// ============================================
// MÉTODOS ESTÁTICOS
// ============================================

// Obtener historial de ajustes de un alumno
ajusteSchema.statics.obtenerHistorialAlumno = async function(alumnoId, limite = 50) {
  return await this.find({ alumno: alumnoId })
    .sort({ fecha: -1 })
    .limit(limite)
    .populate('alumno', 'nombre apellidos');
};

// Obtener estadísticas de ajustes de un alumno
ajusteSchema.statics.obtenerEstadisticasAlumno = async function(alumnoId) {
  const ajustes = await this.find({ alumno: alumnoId });

  return {
    totalAjustes: ajustes.length,
    xpGanado: ajustes
      .filter(a => a.tipo === 'xp' && a.cantidad > 0)
      .reduce((sum, a) => sum + a.cantidad, 0),
    xpPerdido: ajustes
      .filter(a => a.tipo === 'xp' && a.cantidad < 0)
      .reduce((sum, a) => sum + Math.abs(a.cantidad), 0),
    hpGanado: ajustes
      .filter(a => a.tipo === 'hp' && a.cantidad > 0)
      .reduce((sum, a) => sum + a.cantidad, 0),
    hpPerdido: ajustes
      .filter(a => a.tipo === 'hp' && a.cantidad < 0)
      .reduce((sum, a) => sum + Math.abs(a.cantidad), 0)
  };
};

// ============================================
// EXPORTAR MODELO
// ============================================

module.exports = mongoose.model('Ajuste', ajusteSchema);
