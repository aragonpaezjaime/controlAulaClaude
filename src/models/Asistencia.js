const mongoose = require('mongoose');

// ============================================
// ESQUEMA DE ASISTENCIA
// ============================================

const asistenciaSchema = new mongoose.Schema({
  // Referencia al alumno
  alumno: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alumno',
    required: [true, 'El alumno es obligatorio']
  },

  // Referencia al grupo (para consultas rápidas)
  grupo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grupo',
    required: [true, 'El grupo es obligatorio']
  },

  // Fecha de la asistencia (solo fecha, sin hora)
  fecha: {
    type: Date,
    required: [true, 'La fecha es obligatoria'],
    default: () => {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      return hoy;
    }
  },

  // Hora completa del registro (con fecha y hora exacta)
  horaRegistro: {
    type: Date,
    required: [true, 'La hora de registro es obligatoria'],
    default: Date.now
  },

  // Estado de asistencia
  estado: {
    type: String,
    required: [true, 'El estado es obligatorio'],
    enum: {
      values: ['presente', 'ausente', 'retardo', 'justificado'],
      message: '{VALUE} no es un estado válido'
    },
    default: 'presente'
  },

  // Observaciones opcionales
  observaciones: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// ============================================
// ÍNDICES
// ============================================

// Índice compuesto para permitir múltiples registros por día
// Ahora el índice único incluye la horaRegistro para permitir múltiples asistencias en el mismo día
asistenciaSchema.index({ alumno: 1, fecha: 1, horaRegistro: 1 }, { unique: true });

// Índice para consultas por grupo y fecha
asistenciaSchema.index({ grupo: 1, fecha: 1 });

// Índice para consultas por alumno y fecha
asistenciaSchema.index({ alumno: 1, fecha: 1 });

// ============================================
// MÉTODOS ESTÁTICOS
// ============================================

// Obtener asistencia de un grupo en una fecha específica
asistenciaSchema.statics.obtenerPorGrupoYFecha = async function(grupoId, fecha) {
  const fechaBusqueda = new Date(fecha);
  fechaBusqueda.setHours(0, 0, 0, 0);

  return await this.find({
    grupo: grupoId,
    fecha: fechaBusqueda
  }).populate('alumno');
};

// Obtener estadísticas de asistencia de un alumno
asistenciaSchema.statics.obtenerEstadisticasAlumno = async function(alumnoId, fechaInicio, fechaFin) {
  const asistencias = await this.find({
    alumno: alumnoId,
    fecha: { $gte: fechaInicio, $lte: fechaFin }
  });

  return {
    total: asistencias.length,
    presente: asistencias.filter(a => a.estado === 'presente').length,
    ausente: asistencias.filter(a => a.estado === 'ausente').length,
    retardo: asistencias.filter(a => a.estado === 'retardo').length,
    justificado: asistencias.filter(a => a.estado === 'justificado').length
  };
};

// Registrar asistencia para todo un grupo
asistenciaSchema.statics.registrarGrupo = async function(grupoId, asistencias, fecha = new Date()) {
  const fechaRegistro = new Date(fecha);
  fechaRegistro.setHours(0, 0, 0, 0);

  // Capturar la hora exacta del registro para permitir múltiples asistencias por día
  const horaRegistroActual = new Date();

  const registros = asistencias.map(asistencia => ({
    alumno: asistencia.alumnoId,
    grupo: grupoId,
    fecha: fechaRegistro,
    horaRegistro: horaRegistroActual,
    estado: asistencia.estado,
    observaciones: asistencia.observaciones || undefined
  }));

  // Insertar nuevos registros (permitir múltiples asistencias por día)
  return await this.insertMany(registros);
};

// ============================================
// MIDDLEWARE
// ============================================

// Capitalizar observaciones antes de guardar
asistenciaSchema.pre('save', function(next) {
  if (this.observaciones) {
    this.observaciones = this.observaciones.charAt(0).toUpperCase() + this.observaciones.slice(1);
  }
  next();
});

// ============================================
// EXPORTAR MODELO
// ============================================

module.exports = mongoose.model('Asistencia', asistenciaSchema);
