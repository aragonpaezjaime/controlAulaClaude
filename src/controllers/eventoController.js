const { Evento, EventoSalida, EventoDisciplinario } = require('../models/Evento');
const Alumno = require('../models/Alumno');
const Grupo = require('../models/Grupo');
const Ajuste = require('../models/Ajuste');

// ============================================
// EVENTOS DE SALIDA
// ============================================

// Registrar una salida (baño, enfermería, agua, otros)
const registrarSalida = async (req, res) => {
  try {
    const { alumno, tipoSalida, horaSalida, descripcion, observaciones } = req.body;

    // Verificar que el alumno existe
    const alumnoExiste = await Alumno.findById(alumno);
    if (!alumnoExiste) {
      return res.status(404).json({
        success: false,
        mensaje: 'Alumno no encontrado'
      });
    }

    // Crear evento de salida
    const salida = new EventoSalida({
      alumno,
      tipoSalida,
      horaSalida: horaSalida || Date.now(),
      fecha: horaSalida || Date.now(),
      descripcion,
      observaciones
    });

    const salidaGuardada = await salida.save();
    await salidaGuardada.populate('alumno', 'nombre apellidos');

    res.status(201).json({
      success: true,
      mensaje: `${salidaGuardada.obtenerNombreTipo()} registrada exitosamente`,
      data: salidaGuardada
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        mensaje: 'Error de validación',
        errores: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      mensaje: 'Error al registrar la salida',
      error: error.message
    });
  }
};

// Registrar regreso de una salida
const registrarRegreso = async (req, res) => {
  try {
    const { id } = req.params;
    const { horaRegreso } = req.body;

    const salida = await EventoSalida.findById(id);

    if (!salida) {
      return res.status(404).json({
        success: false,
        mensaje: 'Salida no encontrada'
      });
    }

    if (salida.horaRegreso) {
      return res.status(400).json({
        success: false,
        mensaje: 'El regreso ya fue registrado previamente'
      });
    }

    salida.horaRegreso = horaRegreso || Date.now();
    await salida.save();
    await salida.populate('alumno', 'nombre apellidos');

    res.status(200).json({
      success: true,
      mensaje: 'Regreso registrado exitosamente',
      data: {
        ...salida.toObject(),
        duracionMinutos: salida.duracionMinutos
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al registrar el regreso',
      error: error.message
    });
  }
};

// Obtener todas las salidas de un alumno
const obtenerSalidasAlumno = async (req, res) => {
  try {
    const { alumnoId } = req.params;
    const { tipoSalida, fechaInicio, fechaFin } = req.query;

    // Construir filtro
    const filtro = { alumno: alumnoId };

    if (tipoSalida) {
      filtro.tipoSalida = tipoSalida;
    }

    if (fechaInicio || fechaFin) {
      filtro.fecha = {};
      if (fechaInicio) filtro.fecha.$gte = new Date(fechaInicio);
      if (fechaFin) filtro.fecha.$lte = new Date(fechaFin);
    }

    const salidas = await EventoSalida.find(filtro)
      .populate('alumno', 'nombre apellidos')
      .sort({ fecha: -1 });

    res.status(200).json({
      success: true,
      cantidad: salidas.length,
      data: salidas
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener las salidas',
      error: error.message
    });
  }
};

// Obtener conteo de salidas al baño de la semana
const obtenerConteoSalidasBanoSemana = async (req, res) => {
  try {
    const { alumnoId } = req.params;

    // Verificar que el alumno existe
    const alumnoExiste = await Alumno.findById(alumnoId);
    if (!alumnoExiste) {
      return res.status(404).json({
        success: false,
        mensaje: 'Alumno no encontrado'
      });
    }

    const conteo = await EventoSalida.contarSalidasBanoSemana(alumnoId);
    const salidas = await EventoSalida.obtenerSalidasBanoSemana(alumnoId);

    res.status(200).json({
      success: true,
      alumno: {
        id: alumnoExiste._id,
        nombre: alumnoExiste.nombreCompleto
      },
      semana: {
        inicio: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())),
        conteoTotal: conteo
      },
      salidas: salidas
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener el conteo de salidas',
      error: error.message
    });
  }
};

// ============================================
// EVENTOS DISCIPLINARIOS
// ============================================

// Registrar evento disciplinario individual
const registrarEventoDisciplinario = async (req, res) => {
  try {
    const { alumno, tipoDisciplina, descripcion, puntosDescontados, observaciones } = req.body;

    // Verificar que el alumno existe
    const alumnoExiste = await Alumno.findById(alumno);
    if (!alumnoExiste) {
      return res.status(404).json({
        success: false,
        mensaje: 'Alumno no encontrado'
      });
    }

    // Verificar que el alumno tenga suficiente salud
    if (alumnoExiste.salud < puntosDescontados) {
      return res.status(400).json({
        success: false,
        mensaje: `El alumno no tiene suficiente salud. Actual: ${alumnoExiste.salud}, Descuento: ${puntosDescontados}`
      });
    }

    // Crear evento disciplinario
    const eventoDisciplinario = new EventoDisciplinario({
      alumno,
      tipoDisciplina,
      descripcion,
      puntosDescontados,
      observaciones
    });

    const eventoGuardado = await eventoDisciplinario.save();

    // Guardar HP anterior
    const hpAnterior = alumnoExiste.salud;

    // Descontar puntos de salud del alumno
    alumnoExiste.salud = Math.max(0, alumnoExiste.salud - puntosDescontados);
    await alumnoExiste.save();

    // Registrar ajuste en tabla de Ajustes para que sea visible en historial del estudiante
    const comentarioParaAlumno = observaciones || `${tipoDisciplina}: ${descripcion}`;
    await Ajuste.create({
      alumno: alumno,
      tipo: 'hp',
      cantidad: -puntosDescontados, // Negativo porque es un descuento
      motivo: `Evento disciplinario: ${tipoDisciplina}`,
      observaciones: descripcion,
      comentarioAlumno: comentarioParaAlumno,
      visibleParaAlumno: true,
      valorAnterior: hpAnterior,
      valorDespues: alumnoExiste.salud
    });

    await eventoGuardado.populate('alumno', 'nombre apellidos salud xp');

    res.status(201).json({
      success: true,
      mensaje: `${eventoGuardado.obtenerNombreTipo()} registrado. Salud actual: ${alumnoExiste.salud}`,
      data: eventoGuardado
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        mensaje: 'Error de validación',
        errores: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      mensaje: 'Error al registrar el evento disciplinario',
      error: error.message
    });
  }
};

// Registrar falta grupal (afecta a todos los alumnos del grupo)
const registrarFaltaGrupal = async (req, res) => {
  try {
    const { grupo, descripcion, puntosDescontados, observaciones } = req.body;

    // Verificar que el grupo existe
    const grupoExiste = await Grupo.findById(grupo);
    if (!grupoExiste) {
      return res.status(404).json({
        success: false,
        mensaje: 'Grupo no encontrado'
      });
    }

    // Obtener todos los alumnos activos del grupo
    const alumnos = await Alumno.find({ grupo, activo: true });

    if (alumnos.length === 0) {
      return res.status(400).json({
        success: false,
        mensaje: 'No hay alumnos activos en el grupo'
      });
    }

    // Crear evento disciplinario grupal
    const eventoDisciplinario = new EventoDisciplinario({
      grupo,
      tipoDisciplina: 'falta_grupal',
      descripcion: descripcion || 'Falta grupal',
      puntosDescontados,
      observaciones
    });

    const eventoGuardado = await eventoDisciplinario.save();

    // Descontar puntos de salud a todos los alumnos del grupo
    const alumnosAfectados = [];
    const comentarioParaAlumno = observaciones || `Falta grupal: ${descripcion}`;

    for (const alumno of alumnos) {
      const hpAnterior = alumno.salud;

      alumno.salud = Math.max(0, alumno.salud - puntosDescontados);
      await alumno.save();

      // Registrar ajuste individual para cada alumno para que sea visible en su historial
      await Ajuste.create({
        alumno: alumno._id,
        tipo: 'hp',
        cantidad: -puntosDescontados, // Negativo porque es un descuento
        motivo: 'Evento disciplinario: Falta grupal',
        observaciones: descripcion,
        comentarioAlumno: comentarioParaAlumno,
        visibleParaAlumno: true,
        valorAnterior: hpAnterior,
        valorDespues: alumno.salud
      });

      alumnosAfectados.push({
        id: alumno._id,
        nombre: alumno.nombreCompleto,
        saludActual: alumno.salud
      });
    }

    await eventoGuardado.populate('grupo', 'nombre nivel grado');

    res.status(201).json({
      success: true,
      mensaje: `Falta grupal registrada. ${alumnos.length} alumnos afectados`,
      data: {
        evento: eventoGuardado,
        alumnosAfectados
      }
    });

  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        mensaje: 'Error de validación',
        errores: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      success: false,
      mensaje: 'Error al registrar la falta grupal',
      error: error.message
    });
  }
};

// Obtener eventos disciplinarios de un alumno
const obtenerEventosDisciplinariosAlumno = async (req, res) => {
  try {
    const { alumnoId } = req.params;
    const { fechaInicio, fechaFin } = req.query;

    // Construir filtro
    const filtro = { alumno: alumnoId };

    if (fechaInicio || fechaFin) {
      filtro.fecha = {};
      if (fechaInicio) filtro.fecha.$gte = new Date(fechaInicio);
      if (fechaFin) filtro.fecha.$lte = new Date(fechaFin);
    }

    const eventos = await EventoDisciplinario.find(filtro)
      .populate('alumno', 'nombre apellidos salud')
      .sort({ fecha: -1 });

    // Calcular total de puntos descontados
    const totalPuntosDescontados = eventos.reduce((sum, e) => sum + e.puntosDescontados, 0);

    res.status(200).json({
      success: true,
      cantidad: eventos.length,
      totalPuntosDescontados,
      data: eventos
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener los eventos disciplinarios',
      error: error.message
    });
  }
};

// ============================================
// CONSULTAS GENERALES
// ============================================

// Obtener todos los eventos con filtros
const obtenerTodosLosEventos = async (req, res) => {
  try {
    const { tipoEvento, fechaInicio, fechaFin, limite = 100 } = req.query;

    // Construir filtro
    const filtro = {};

    if (tipoEvento) {
      filtro.tipoEvento = tipoEvento;
    }

    if (fechaInicio || fechaFin) {
      filtro.fecha = {};
      if (fechaInicio) filtro.fecha.$gte = new Date(fechaInicio);
      if (fechaFin) filtro.fecha.$lte = new Date(fechaFin);
    }

    const eventos = await Evento.find(filtro)
      .populate('alumno', 'nombre apellidos')
      .populate('grupo', 'nombre nivel grado')
      .sort({ fecha: -1 })
      .limit(parseInt(limite));

    res.status(200).json({
      success: true,
      cantidad: eventos.length,
      data: eventos
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener los eventos',
      error: error.message
    });
  }
};

// Obtener historial completo con filtros avanzados
const obtenerHistorial = async (req, res) => {
  try {
    const {
      grupoId,
      alumnoId,
      tipoEvento,
      fechaInicio,
      fechaFin,
      limite = 100
    } = req.query;

    // Construir filtro base
    const filtro = {};

    // Filtro por grupo
    if (grupoId) {
      if (alumnoId) {
        // Si hay alumno específico, filtrar por alumno
        filtro.alumno = alumnoId;
      } else {
        // Si solo hay grupo, obtener todos los alumnos del grupo
        const alumnos = await Alumno.find({ grupo: grupoId, activo: true }).select('_id');
        const alumnoIds = alumnos.map(a => a._id);
        filtro.$or = [
          { alumno: { $in: alumnoIds } },
          { grupo: grupoId }
        ];
      }
    } else if (alumnoId) {
      // Solo alumno, sin grupo
      filtro.alumno = alumnoId;
    }

    // Filtro por tipo de evento
    if (tipoEvento) {
      filtro.tipoEvento = tipoEvento;
    }

    // Filtro por fecha
    if (fechaInicio || fechaFin) {
      filtro.fecha = {};
      if (fechaInicio) {
        const inicio = new Date(fechaInicio);
        inicio.setHours(0, 0, 0, 0);
        filtro.fecha.$gte = inicio;
      }
      if (fechaFin) {
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999);
        filtro.fecha.$lte = fin;
      }
    }

    // Obtener eventos
    const eventos = await Evento.find(filtro)
      .populate('alumno', 'nombre apellidos grupo')
      .populate('grupo', 'grado grupo nivel')
      .sort({ fecha: -1 })
      .limit(parseInt(limite));

    // Calcular estadísticas
    const estadisticas = {
      total: eventos.length,
      salidas: eventos.filter(e => e.tipoEvento === 'Salida').length,
      disciplinarios: eventos.filter(e => e.tipoEvento === 'Disciplinario').length
    };

    res.status(200).json({
      success: true,
      cantidad: eventos.length,
      estadisticas,
      data: eventos
    });

  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener el historial',
      error: error.message
    });
  }
};

// Obtener todos los eventos de un alumno específico
const obtenerEventosAlumno = async (req, res) => {
  try {
    const { alumnoId } = req.params;
    const { tipoEvento, fechaInicio, fechaFin } = req.query;

    // Verificar que el alumno existe
    const alumnoExiste = await Alumno.findById(alumnoId);
    if (!alumnoExiste) {
      return res.status(404).json({
        success: false,
        mensaje: 'Alumno no encontrado'
      });
    }

    // Construir filtro
    const filtro = { alumno: alumnoId };

    if (tipoEvento) {
      filtro.tipoEvento = tipoEvento;
    }

    if (fechaInicio || fechaFin) {
      filtro.fecha = {};
      if (fechaInicio) filtro.fecha.$gte = new Date(fechaInicio);
      if (fechaFin) filtro.fecha.$lte = new Date(fechaFin);
    }

    const eventos = await Evento.find(filtro)
      .populate('alumno', 'nombre apellidos salud xp')
      .sort({ fecha: -1 });

    res.status(200).json({
      success: true,
      alumno: {
        id: alumnoExiste._id,
        nombre: alumnoExiste.nombreCompleto,
        salud: alumnoExiste.salud,
        xp: alumnoExiste.xp
      },
      cantidad: eventos.length,
      data: eventos
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al obtener los eventos del alumno',
      error: error.message
    });
  }
};

// ============================================
// EXPORTAR FUNCIONES
// ============================================
module.exports = {
  // Salidas
  registrarSalida,
  registrarRegreso,
  obtenerSalidasAlumno,
  obtenerConteoSalidasBanoSemana,

  // Disciplinarios
  registrarEventoDisciplinario,
  registrarFaltaGrupal,
  obtenerEventosDisciplinariosAlumno,

  // Consultas generales
  obtenerTodosLosEventos,
  obtenerEventosAlumno,
  obtenerHistorial
};
