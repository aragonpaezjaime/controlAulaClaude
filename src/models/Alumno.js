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

  // Referencia al grupo al que pertenece el alumno
  grupo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grupo',
    required: [true, 'El grupo es obligatorio']
  },

  // Clave de zipGrade para autenticación del estudiante
  // Esta clave es única por grupo y permite el acceso al portal del estudiante
  claveZipGrade: {
    type: String,
    trim: true,
    sparse: true, // Permite múltiples valores null/undefined
    uppercase: true // Normaliza a mayúsculas para consistencia
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

  // Avatar seleccionado por el alumno (seed para RoboHash o identificador)
  avatar: {
    type: String,
    default: function() {
      // Genera un seed único basado en el nombre del alumno
      // Se puede cambiar después por el alumno
      return `${this.nombre || 'alumno'}${Date.now()}`;
    },
    trim: true
  },

  // Configuración del avatar de RoboHash
  // Define el set de estilos: set1 (robots clásicos), set2 (robots simplificados), set3 (abstractos), set4 (monstruos)
  avatarConfig: {
    type: String,
    enum: ['set1', 'set2', 'set3', 'set4'],
    default: 'set1'
  },

  // Nombre preferido (palabra específica del nombre completo que prefiere)
  // Si es null, se usa el primer nombre por defecto
  nombrePreferido: {
    type: String,
    trim: true,
    default: null
  },

  // Preferencia de cómo mostrar su nombre en clase
  // 'nombre': Solo nombre de pila (ej. "Jaime")
  // 'apellido': Solo apellidos (ej. "Aragón Páez")
  // 'completo': Nombre completo (ej. "Jaime Aragón Páez")
  preferenciaNombre: {
    type: String,
    enum: ['nombre', 'apellido', 'completo'],
    default: 'completo'
  },

  // Array de insignias obtenidas por el alumno
  insignias: [{
    insigniaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Insignia'
    },
    fechaObtencion: {
      type: Date,
      default: Date.now
    },
    otorgadoPor: {
      type: String,
      default: 'Profesor'
    }
  }],

  // Configuración de personalización del alumno
  configuracion: {
    // Preferencias de notificaciones (para uso futuro)
    notificacionesPush: {
      type: Boolean,
      default: true
    },
    // Tema oscuro en portal del alumno (para uso futuro)
    temaOscuro: {
      type: Boolean,
      default: false
    },
    // Idioma preferido (para uso futuro)
    idioma: {
      type: String,
      enum: ['es', 'en'],
      default: 'es'
    }
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
// MÉTODOS PARA GESTIÓN DE NOMBRE PREFERIDO
// ============================================

// Método de instancia: Obtiene el nombre preferido del alumno
// Si no tiene nombrePreferido configurado, retorna el primer nombre
alumnoSchema.methods.obtenerNombrePreferido = function() {
  if (this.nombrePreferido && this.nombrePreferido.trim().length > 0) {
    return this.nombrePreferido;
  }
  // Por defecto, retorna el primer nombre
  return this.nombre.split(' ')[0];
};

// Método de instancia: Retorna el nombre completo dividido en palabras
// con indicador de cuál es la palabra preferida
// Útil para el frontend que permite seleccionar el nombre preferido
alumnoSchema.methods.obtenerNombreConPreferencia = function() {
  const nombreCompleto = this.nombreCompleto;
  const preferido = this.obtenerNombrePreferido();

  // Divide el nombre completo en palabras
  const palabras = nombreCompleto.split(' ');

  // Retorna array de objetos con cada palabra y si es la preferida
  return palabras.map(palabra => ({
    texto: palabra,
    esPreferido: palabra.toLowerCase() === preferido.toLowerCase()
  }));
};

// Método de instancia: Establece el nombre preferido
// Valida que la palabra exista en el nombre completo
alumnoSchema.methods.establecerNombrePreferido = function(palabraPreferida) {
  const nombreCompleto = this.nombreCompleto.toLowerCase();
  const palabraBuscada = palabraPreferida.toLowerCase().trim();

  // Verifica que la palabra exista en el nombre completo
  if (nombreCompleto.includes(palabraBuscada)) {
    this.nombrePreferido = palabraPreferida.trim();
    return true;
  }

  return false;
};

// Método de instancia: Obtiene el nombre a mostrar según la preferencia del alumno
// Retorna el nombre en el formato que el alumno prefiere
alumnoSchema.methods.obtenerNombreParaMostrar = function() {
  switch (this.preferenciaNombre) {
    case 'nombre':
      return this.nombre;
    case 'apellido':
      return this.apellidos;
    case 'completo':
    default:
      return this.nombreCompleto;
  }
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

// Índice compuesto para garantizar que claveZipGrade sea única por grupo
// El sparse:true permite que alumnos sin clave puedan existir sin conflicto
alumnoSchema.index({ grupo: 1, claveZipGrade: 1 }, { unique: true, sparse: true });

// Exportar el modelo
module.exports = mongoose.model('Alumno', alumnoSchema);
