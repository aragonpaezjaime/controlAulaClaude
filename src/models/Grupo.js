const mongoose = require('mongoose');

// Definición del esquema para Grupos escolares
// Sistema de gamificación educativa - Grupos del docente
const grupoSchema = new mongoose.Schema({
  // Grado escolar (1, 2, 3, etc.)
  grado: {
    type: Number,
    required: [true, 'El grado es obligatorio'],
    min: [1, 'El grado debe ser mayor a 0'],
    max: [6, 'El grado no puede ser mayor a 6']
  },

  // Identificador del grupo (ej: "A", "B", "C")
  grupo: {
    type: String,
    required: [true, 'El identificador del grupo es obligatorio'],
    trim: true,
    uppercase: true
  },

  // Nivel educativo (Secundaria, Preparatoria, etc.)
  nivel: {
    type: String,
    required: [true, 'El nivel educativo es obligatorio'],
    trim: true
  },

  // Horario de clases del grupo
  horario: [{
    // Día de la semana
    dia: {
      type: String,
      required: [true, 'El día es obligatorio'],
      enum: {
        values: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
        message: '{VALUE} no es un día válido'
      }
    },
    // Hora de inicio (formato HH:MM)
    horaInicio: {
      type: String,
      required: [true, 'La hora de inicio es obligatoria'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'El formato debe ser HH:MM (ej: 08:00)']
    },
    // Hora de fin (formato HH:MM)
    horaFin: {
      type: String,
      required: [true, 'La hora de fin es obligatoria'],
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'El formato debe ser HH:MM (ej: 09:00)']
    }
  }],

  // Ciclo escolar (ej: "2025-2026")
  cicloEscolar: {
    type: String,
    required: [true, 'El ciclo escolar es obligatorio'],
    trim: true,
    match: [/^\d{4}-\d{4}$/, 'El formato debe ser YYYY-YYYY (ej: 2025-2026)']
  },

  // Aula/Salón donde se imparten las clases
  aula: {
    type: String,
    required: [true, 'El aula es obligatoria'],
    trim: true
  },

  // Indicador si el grupo está activo
  activo: {
    type: Boolean,
    default: true
  }
}, {
  // Opciones del esquema
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Campo virtual: Calcula el número de alumnos en el grupo
grupoSchema.virtual('numeroAlumnos', {
  ref: 'Alumno',
  localField: '_id',
  foreignField: 'grupo',
  count: true
});

// Método de instancia: Obtiene el nombre completo del grupo
grupoSchema.methods.obtenerNombreCompleto = function() {
  // Convertir grado a formato "1ro", "2do", "3ro", etc.
  const gradoFormato = this.grado === 1 ? '1ro' :
                       this.grado === 2 ? '2do' :
                       this.grado === 3 ? '3ro' :
                       `${this.grado}to`;
  return `${gradoFormato}${this.grupo} - ${this.nivel} (${this.aula})`;
};

// Método de instancia: Obtiene el horario formateado
grupoSchema.methods.obtenerHorarioFormateado = function() {
  if (!this.horario || this.horario.length === 0) {
    return 'Sin horario definido';
  }

  return this.horario.map(h =>
    `${h.dia}: ${h.horaInicio} - ${h.horaFin}`
  ).join(', ');
};

// Método de instancia: Verifica si hay clase en un día específico
grupoSchema.methods.tieneClaseEnDia = function(dia) {
  return this.horario.some(h => h.dia === dia);
};

// Índice compuesto: Evita duplicados de grado+grupo+ciclo+nivel
grupoSchema.index({ grado: 1, grupo: 1, cicloEscolar: 1, nivel: 1 }, { unique: true });

// Exportar el modelo
module.exports = mongoose.model('Grupo', grupoSchema);
