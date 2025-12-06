const mongoose = require('mongoose');

// Definición del esquema para Alumnos
// Sistema de gamificación educativa para registro de eventos del aula
const alumnoSchema = new mongoose.Schema({
  // Nombre(s) del alumno
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    trim: true
  },

  // Apellidos del alumno (paterno y materno)
  apellidos: {
    type: String,
    required: [true, 'Los apellidos son obligatorios'],
    trim: true
  },

  // Fecha de nacimiento
  fechaNacimiento: {
    type: Date,
    required: [true, 'La fecha de nacimiento es obligatoria']
  },

  // Referencia al grupo al que pertenece el alumno
  grupo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grupo',
    required: [true, 'El grupo es obligatorio']
  },

  // Promedio académico del alumno
  promedio: {
    type: Number,
    default: 0,
    min: [0, 'El promedio no puede ser negativo'],
    max: [100, 'El promedio no puede ser mayor a 100']
  },

  // Puntos de experiencia (XP) - Sistema de gamificación
  xp: {
    type: Number,
    default: 0,
    min: [0, 'Los puntos de experiencia no pueden ser negativos']
  },

  // Puntos de vida (Salud ♥️) - Sistema de gamificación
  salud: {
    type: Number,
    default: 100,
    min: [0, 'La salud no puede ser negativa'],
    max: [100, 'La salud no puede ser mayor a 100']
  },

  // Indicador si el alumno está activo (inscrito)
  activo: {
    type: Boolean,
    default: true
  }
}, {
  // Opciones del esquema
  timestamps: true, // Agrega createdAt y updatedAt
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Campo virtual: Obtiene el nombre completo del alumno
alumnoSchema.virtual('nombreCompleto').get(function() {
  return `${this.nombre} ${this.apellidos}`;
});

// Campo virtual: Calcula la edad del alumno
alumnoSchema.virtual('edad').get(function() {
  if (!this.fechaNacimiento) return null;

  const hoy = new Date();
  const nacimiento = new Date(this.fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();

  // Ajusta la edad si aún no ha cumplido años este año
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }

  return edad;
});

// Relación virtual: Obtiene todos los eventos del alumno
// No se guarda en BD, se calcula cuando se consulta
alumnoSchema.virtual('eventos', {
  ref: 'Evento',
  localField: '_id',
  foreignField: 'alumno'
});

// Método de instancia: Genera el nombre para mostrar con XP y HP
alumnoSchema.methods.obtenerNombreParaLista = function() {
  return `${this.nombreCompleto} - XP: ${this.xp} - ♥️: ${this.salud}`;
};

// ============================================
// MÉTODO DE NIVEL DESACTIVADO
// ============================================
// El sistema de niveles fue eliminado en favor de un sistema de insignias
// XP ahora va de 0 a 10000 sin niveles intermedios
/*
alumnoSchema.methods.obtenerNivel = function() {
  // Cada 100 XP = 1 nivel
  return Math.floor(this.xp / 100) + 1;
};
*/

// Middleware pre-save: Formatea los nombres a título (Primera Letra Mayúscula)
alumnoSchema.pre('save', function(next) {
  // Función auxiliar para capitalizar
  const capitalizar = (texto) => {
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  };

  // Capitaliza nombre y apellidos
  if (this.nombre) {
    this.nombre = this.nombre.split(' ').map(capitalizar).join(' ');
  }
  if (this.apellidos) {
    this.apellidos = this.apellidos.split(' ').map(capitalizar).join(' ');
  }

  next();
});

// Índice para búsquedas rápidas por grupo
alumnoSchema.index({ grupo: 1 });

// Índice de texto para búsquedas por nombre o apellidos
alumnoSchema.index({
  nombre: 'text',
  apellidos: 'text'
});

// Exportar el modelo
module.exports = mongoose.model('Alumno', alumnoSchema);
