const mongoose = require('mongoose');

// ESQUEMA BASE PARA EVENTOS
// Sistema de registro de salidas del aula y eventos disciplinarios
const eventoBaseSchema = new mongoose.Schema({
  // Fecha y hora del evento
  fecha: {
    type: Date,
    default: Date.now,
    required: true
  },

  // Observaciones generales (opcional)
  observaciones: {
    type: String,
    trim: true
  }
}, {
  // Configuración para discriminadores
  discriminatorKey: 'tipoEvento',
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Crear el modelo base
const Evento = mongoose.model('Evento', eventoBaseSchema);

// ============================================
// DISCRIMINADOR: EVENTO DE SALIDA
// ============================================
const eventoSalidaSchema = new mongoose.Schema({
  // Referencia al alumno que sale
  alumno: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alumno',
    required: [true, 'El alumno es obligatorio']
  },

  // Tipo de salida
  tipoSalida: {
    type: String,
    required: [true, 'El tipo de salida es obligatorio'],
    enum: {
      values: ['baño', 'enfermería', 'agua', 'otros'],
      message: '{VALUE} no es un tipo de salida válido'
    }
  },

  // Hora de salida del aula
  horaSalida: {
    type: Date,
    required: [true, 'La hora de salida es obligatoria'],
    default: Date.now
  },

  // Hora de regreso (null si aún no regresa)
  horaRegreso: {
    type: Date,
    validate: {
      validator: function(value) {
        // Si hay hora de regreso, debe ser posterior a la salida
        return !value || value > this.horaSalida;
      },
      message: 'La hora de regreso debe ser posterior a la hora de salida'
    }
  },

  // Descripción (obligatoria solo para tipo 'otros')
  descripcion: {
    type: String,
    trim: true,
    validate: {
      validator: function(value) {
        return this.tipoSalida !== 'otros' || (value && value.length > 0);
      },
      message: 'La descripción es obligatoria cuando el tipo de salida es "otros"'
    }
  }
});

// Campo virtual: Calcula la duración de la salida en minutos
eventoSalidaSchema.virtual('duracionMinutos').get(function() {
  if (!this.horaRegreso) return null;

  const diferencia = this.horaRegreso - this.horaSalida;
  return Math.round(diferencia / 1000 / 60); // Convertir a minutos
});

// Método de instancia: Obtener el nombre descriptivo del tipo de salida
eventoSalidaSchema.methods.obtenerNombreTipo = function() {
  const nombres = {
    'baño': 'Salida al Baño',
    'enfermería': 'Salida a Enfermería',
    'agua': 'Tomar Agua',
    'otros': 'Otra Salida'
  };
  return nombres[this.tipoSalida] || this.tipoSalida;
};

// Índice para consultas por alumno y fecha
eventoSalidaSchema.index({ alumno: 1, fecha: -1 });

// Índice para consultas por tipo de salida
eventoSalidaSchema.index({ tipoSalida: 1, fecha: -1 });

const EventoSalida = Evento.discriminator('Salida', eventoSalidaSchema);

// ============================================
// DISCRIMINADOR: EVENTO DISCIPLINARIO
// ============================================
const eventoDisciplinarioSchema = new mongoose.Schema({
  // Tipo de evento disciplinario
  tipoDisciplina: {
    type: String,
    required: [true, 'El tipo de disciplina es obligatorio'],
    enum: {
      values: ['indisciplina', 'teléfono', 'dormido', 'otros', 'falta_grupal'],
      message: '{VALUE} no es un tipo de disciplina válido'
    }
  },

  // Referencia al alumno (obligatorio excepto para falta_grupal)
  alumno: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alumno',
    validate: {
      validator: function(value) {
        // Para falta_grupal no es obligatorio, para los demás sí
        return this.tipoDisciplina === 'falta_grupal' || value != null;
      },
      message: 'El alumno es obligatorio excepto para falta grupal'
    }
  },

  // Referencia al grupo (obligatorio solo para falta_grupal)
  grupo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grupo',
    validate: {
      validator: function(value) {
        // Para falta_grupal es obligatorio, para los demás no
        return this.tipoDisciplina !== 'falta_grupal' || value != null;
      },
      message: 'El grupo es obligatorio para falta grupal'
    }
  },

  // Descripción del acto (obligatoria para 'otros')
  descripcion: {
    type: String,
    trim: true,
    validate: {
      validator: function(value) {
        return this.tipoDisciplina !== 'otros' || (value && value.length > 0);
      },
      message: 'La descripción es obligatoria cuando el tipo es "otros"'
    }
  },

  // Puntos de salud descontados
  puntosDescontados: {
    type: Number,
    required: [true, 'Los puntos descontados son obligatorios'],
    min: [0, 'Los puntos descontados no pueden ser negativos'],
    default: 5
  }
});

// Método de instancia: Obtener el nombre descriptivo del tipo de disciplina
eventoDisciplinarioSchema.methods.obtenerNombreTipo = function() {
  const nombres = {
    'indisciplina': 'Indisciplina',
    'teléfono': 'Distraído con el Teléfono',
    'dormido': 'Dormido en Clase',
    'otros': 'Otra Falta',
    'falta_grupal': 'Falta Grupal'
  };
  return nombres[this.tipoDisciplina] || this.tipoDisciplina;
};

// Índices para consultas
eventoDisciplinarioSchema.index({ alumno: 1, fecha: -1 });
eventoDisciplinarioSchema.index({ grupo: 1, fecha: -1 });
eventoDisciplinarioSchema.index({ tipoDisciplina: 1, fecha: -1 });

const EventoDisciplinario = Evento.discriminator('Disciplinario', eventoDisciplinarioSchema);

// ============================================
// MÉTODOS ESTÁTICOS ÚTILES
// ============================================

// Método estático: Contar salidas al baño de un alumno en una semana
EventoSalida.contarSalidasBanoSemana = async function(alumnoId, fecha = new Date()) {
  // Calcular el inicio y fin de la semana
  const inicioSemana = new Date(fecha);
  inicioSemana.setDate(fecha.getDate() - fecha.getDay()); // Domingo
  inicioSemana.setHours(0, 0, 0, 0);

  const finSemana = new Date(inicioSemana);
  finSemana.setDate(inicioSemana.getDate() + 7); // Siguiente domingo

  const count = await this.countDocuments({
    alumno: alumnoId,
    tipoSalida: 'baño',
    fecha: {
      $gte: inicioSemana,
      $lt: finSemana
    }
  });

  return count;
};

// Método estático: Obtener todas las salidas al baño de la semana con duración
EventoSalida.obtenerSalidasBanoSemana = async function(alumnoId, fecha = new Date()) {
  const inicioSemana = new Date(fecha);
  inicioSemana.setDate(fecha.getDate() - fecha.getDay());
  inicioSemana.setHours(0, 0, 0, 0);

  const finSemana = new Date(inicioSemana);
  finSemana.setDate(inicioSemana.getDate() + 7);

  const salidas = await this.find({
    alumno: alumnoId,
    tipoSalida: 'baño',
    fecha: {
      $gte: inicioSemana,
      $lt: finSemana
    }
  }).sort({ fecha: -1 });

  return salidas;
};

// ============================================
// EXPORTAR TODOS LOS MODELOS
// ============================================
module.exports = {
  Evento, // Modelo base
  EventoSalida,
  EventoDisciplinario
};
