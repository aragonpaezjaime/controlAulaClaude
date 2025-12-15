const mongoose = require('mongoose');

/**
 * Modelo de Snapshot de Progreso
 * Guarda una "fotografía" diaria del estado de cada alumno
 * para poder generar gráficas de progreso en el tiempo
 *
 * Uso: Se genera un snapshot diario (manual o automático)
 * Almacena: XP, HP, posición en ranking, promedio del grupo
 */

const progresoSnapshotSchema = new mongoose.Schema({
  // Referencia al alumno
  alumno: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Alumno',
    required: [true, 'El alumno es obligatorio']
  },

  // Referencia al grupo (para cálculos de promedio)
  grupo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Grupo',
    required: [true, 'El grupo es obligatorio']
  },

  // Fecha del snapshot (00:00:00 de cada día)
  fecha: {
    type: Date,
    required: [true, 'La fecha es obligatoria']
  },

  // XP del alumno en ese momento
  xp: {
    type: Number,
    required: [true, 'El XP es obligatorio'],
    min: 0
  },

  // HP (salud) del alumno en ese momento
  hp: {
    type: Number,
    required: [true, 'El HP es obligatorio'],
    min: 0,
    max: 100
  },

  // Posición en el ranking del grupo (1 = primero)
  posicionRanking: {
    type: Number,
    min: 1,
    default: null
  },

  // XP promedio del grupo ese día (para comparativas)
  promedioGrupoXP: {
    type: Number,
    min: 0,
    default: 0
  },

  // HP promedio del grupo ese día
  promedioGrupoHP: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },

  // Metadatos
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false // No necesitamos updatedAt
});

// Índices para optimización de consultas
progresoSnapshotSchema.index({ alumno: 1, fecha: -1 }); // Buscar snapshots de un alumno
progresoSnapshotSchema.index({ grupo: 1, fecha: -1 });  // Buscar snapshots de un grupo
progresoSnapshotSchema.index({ fecha: -1 });            // Limpiar snapshots antiguos

// Índice compuesto único: un snapshot por alumno por día
progresoSnapshotSchema.index({ alumno: 1, fecha: 1 }, { unique: true });

// Virtual para obtener el nombre completo del alumno
progresoSnapshotSchema.virtual('nombreAlumno', {
  ref: 'Alumno',
  localField: 'alumno',
  foreignField: '_id',
  justOne: true
});

// Método estático: Obtener progreso de un alumno en un rango de fechas
progresoSnapshotSchema.statics.obtenerProgreso = async function(alumnoId, dias = 90) {
  const fechaInicio = new Date();
  fechaInicio.setDate(fechaInicio.getDate() - dias);
  fechaInicio.setHours(0, 0, 0, 0);

  return await this.find({
    alumno: alumnoId,
    fecha: { $gte: fechaInicio }
  })
  .sort({ fecha: 1 })
  .lean();
};

// Método estático: Obtener último snapshot de un alumno
progresoSnapshotSchema.statics.obtenerUltimo = async function(alumnoId) {
  return await this.findOne({ alumno: alumnoId })
    .sort({ fecha: -1 })
    .lean();
};

// Método estático: Calcular estadísticas de progreso
progresoSnapshotSchema.statics.calcularEstadisticas = async function(alumnoId, dias = 90) {
  const snapshots = await this.obtenerProgreso(alumnoId, dias);

  if (snapshots.length === 0) {
    return {
      mejorRacha: 0,
      tendencia: 'sin_datos',
      xpGanado: 0,
      xpPerdido: 0,
      xpNeto: 0,
      posicionActual: null,
      posicionInicial: null,
      cambioRanking: 0
    };
  }

  // Calcular XP ganado/perdido
  let xpGanado = 0;
  let xpPerdido = 0;

  for (let i = 1; i < snapshots.length; i++) {
    const diferencia = snapshots[i].xp - snapshots[i - 1].xp;
    if (diferencia > 0) {
      xpGanado += diferencia;
    } else if (diferencia < 0) {
      xpPerdido += Math.abs(diferencia);
    }
  }

  // Calcular racha (días consecutivos ganando XP)
  let rachaActual = 0;
  let mejorRacha = 0;

  for (let i = 1; i < snapshots.length; i++) {
    if (snapshots[i].xp > snapshots[i - 1].xp) {
      rachaActual++;
      mejorRacha = Math.max(mejorRacha, rachaActual);
    } else {
      rachaActual = 0;
    }
  }

  // Calcular tendencia (últimos 7 días vs 7 días anteriores)
  let tendencia = 'estable';
  if (snapshots.length >= 14) {
    const mitad = Math.floor(snapshots.length / 2);
    const xpPrimerasMitad = snapshots.slice(0, mitad).reduce((sum, s) => sum + s.xp, 0) / mitad;
    const xpSegundaMitad = snapshots.slice(mitad).reduce((sum, s) => sum + s.xp, 0) / (snapshots.length - mitad);

    const cambio = ((xpSegundaMitad - xpPrimerasMitad) / xpPrimerasMitad) * 100;

    if (cambio > 5) tendencia = 'subiendo';
    else if (cambio < -5) tendencia = 'bajando';
  }

  // Posiciones en ranking
  const posicionInicial = snapshots[0].posicionRanking;
  const posicionActual = snapshots[snapshots.length - 1].posicionRanking;
  const cambioRanking = posicionInicial && posicionActual
    ? posicionInicial - posicionActual
    : 0;

  return {
    mejorRacha,
    tendencia,
    xpGanado,
    xpPerdido,
    xpNeto: xpGanado - xpPerdido,
    posicionActual,
    posicionInicial,
    cambioRanking, // Positivo = subió, negativo = bajó
    promedioXP: snapshots.reduce((sum, s) => sum + s.xp, 0) / snapshots.length,
    promedioHP: snapshots.reduce((sum, s) => sum + s.hp, 0) / snapshots.length
  };
};

const ProgresoSnapshot = mongoose.model('ProgresoSnapshot', progresoSnapshotSchema);

module.exports = ProgresoSnapshot;
