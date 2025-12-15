const Asistencia = require("../models/Asistencia");
const Alumno = require("../models/Alumno");
const Grupo = require("../models/Grupo");

// ============================================
// REGISTRAR ASISTENCIA DE UN GRUPO COMPLETO
// ============================================
const registrarAsistenciaGrupo = async (req, res) => {
  try {
    const { grupoId, asistencias, fecha } = req.body;
    // Validar que el grupo existe
    const grupo = await Grupo.findById(grupoId);
    if (!grupo) {
      return res.status(404).json({
        success: false,
        mensaje: "Grupo no encontrado",
      });
    }

    // Registrar asistencias
    const resultado = await Asistencia.registrarGrupo(
      grupoId,
      asistencias,
      fecha
    );

    // ============================================
    // OTORGAMIENTO AUTOMÁTICO DE XP DESACTIVADO
    // ============================================
    // El docente ahora otorga XP manualmente según tareas y prácticas
    // Para reactivar, descomenta el código siguiente:

    /*
    // Otorgar XP automáticamente según el estado de asistencia
    const xpOtorgado = {
      presente: 0,
      retardo: 0,
      ausente: 0,
      justificado: 0,
    };

    for (const asistencia of asistencias) {
      let xpGanado = 0;

      // Reglas de XP:
      // Presente = +10 XP
      // Retardo = +5 XP
      // Ausente = 0 XP
      // Justificado = 0 XP
      switch (asistencia.estado) {
        case "presente":
          xpGanado = 10;
          xpOtorgado.presente++;
          break;
        case "retardo":
          xpGanado = 5;
          xpOtorgado.retardo++;
          break;
        case "ausente":
          xpOtorgado.ausente++;
          break;
        case "justificado":
          xpOtorgado.justificado++;
          break;
      }

      // Otorgar XP al alumno
      if (xpGanado > 0) {
        await Alumno.findByIdAndUpdate(asistencia.alumnoId, {
          $inc: { xp: xpGanado },
        });
      }
    }
    */

    res.status(201).json({
      success: true,
      mensaje: "Asistencia registrada exitosamente",
      data: {
        registradas: resultado.length,
        grupo: grupo.obtenerNombreCompleto(),
        horaRegistro: new Date().toLocaleString("es-MX", {
          timeZone: "America/Mexico_City",
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    });
  } catch (error) {
    console.error("Error al registrar asistencia:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al registrar la asistencia",
      error: error.message,
    });
  }
};

// ============================================
// OBTENER ASISTENCIA DE UN GRUPO POR FECHA
// ============================================
const obtenerAsistenciaPorGrupoYFecha = async (req, res) => {
  try {
    const { grupoId } = req.params;
    const { fecha } = req.query;

    // Usar fecha de hoy si no se proporciona
    const fechaBusqueda = fecha ? new Date(fecha) : new Date();
    fechaBusqueda.setHours(0, 0, 0, 0);

    const asistencias = await Asistencia.obtenerPorGrupoYFecha(
      grupoId,
      fechaBusqueda
    );

    res.status(200).json({
      success: true,
      fecha: fechaBusqueda,
      cantidad: asistencias.length,
      data: asistencias,
    });
  } catch (error) {
    console.error("Error al obtener asistencia:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener la asistencia",
      error: error.message,
    });
  }
};

// ============================================
// OBTENER RESUMEN DE ASISTENCIA DE UN GRUPO
// ============================================
const obtenerResumenGrupo = async (req, res) => {
  try {
    const { grupoId } = req.params;
    const { fecha } = req.query;

    const fechaBusqueda = fecha ? new Date(fecha) : new Date();
    fechaBusqueda.setHours(0, 0, 0, 0);

    // Obtener todos los alumnos del grupo
    const alumnos = await Alumno.find({ grupo: grupoId, activo: true });

    // Obtener asistencias registradas
    const asistencias = await Asistencia.find({
      grupo: grupoId,
      fecha: fechaBusqueda,
    });

    // Calcular resumen
    const resumen = {
      total: alumnos.length,
      presentes: asistencias.filter((a) => a.estado === "presente").length,
      ausentes: asistencias.filter((a) => a.estado === "ausente").length,
      retardos: asistencias.filter((a) => a.estado === "retardo").length,
      justificados: asistencias.filter((a) => a.estado === "justificado")
        .length,
      sinRegistro: alumnos.length - asistencias.length,
    };

    res.status(200).json({
      success: true,
      fecha: fechaBusqueda,
      data: resumen,
    });
  } catch (error) {
    console.error("Error al obtener resumen:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener el resumen",
      error: error.message,
    });
  }
};

// ============================================
// OBTENER ESTADÍSTICAS DE ASISTENCIA DE UN ALUMNO
// ============================================
const obtenerEstadisticasAlumno = async (req, res) => {
  try {
    const { alumnoId } = req.params;
    const { fechaInicio, fechaFin } = req.query;

    // Usar últimos 30 días si no se proporcionan fechas
    const fin = fechaFin ? new Date(fechaFin) : new Date();
    const inicio = fechaInicio
      ? new Date(fechaInicio)
      : new Date(fin.getTime() - 30 * 24 * 60 * 60 * 1000);

    inicio.setHours(0, 0, 0, 0);
    fin.setHours(23, 59, 59, 999);

    const estadisticas = await Asistencia.obtenerEstadisticasAlumno(
      alumnoId,
      inicio,
      fin
    );

    // Calcular porcentaje de asistencia
    const porcentajeAsistencia =
      estadisticas.total > 0
        ? (
            ((estadisticas.presente + estadisticas.retardo) /
              estadisticas.total) *
            100
          ).toFixed(2)
        : 0;

    res.status(200).json({
      success: true,
      periodo: { inicio, fin },
      data: {
        ...estadisticas,
        porcentajeAsistencia: parseFloat(porcentajeAsistencia),
      },
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener las estadísticas",
      error: error.message,
    });
  }
};

// ============================================
// OBTENER TABLA DE ASISTENCIAS DEL GRUPO
// ============================================
const obtenerTablaAsistencias = async (req, res) => {
  try {
    const { grupoId } = req.params;
    const { fechaInicio, fechaFin } = req.query;

    // Usar últimos 7 días si no se proporcionan fechas
    const fin = fechaFin ? new Date(fechaFin) : new Date();
    const inicio = fechaInicio
      ? new Date(fechaInicio)
      : new Date(fin.getTime() - 7 * 24 * 60 * 60 * 1000);

    inicio.setHours(0, 0, 0, 0);
    fin.setHours(23, 59, 59, 999);

    // Obtener todos los alumnos del grupo
    const alumnos = await Alumno.find({ grupo: grupoId, activo: true })
      .select("nombre apellidos")
      .sort({ apellidos: 1 });

    // Obtener todas las asistencias en el rango de fechas
    const asistencias = await Asistencia.find({
      grupo: grupoId,
      fecha: { $gte: inicio, $lte: fin },
    })
      .select("alumno fecha estado observaciones horaRegistro")
      .sort({ fecha: 1, horaRegistro: 1 });

    // Obtener todas las fechas únicas en el rango
    const fechasSet = new Set();
    asistencias.forEach((a) => {
      const fecha = new Date(a.fecha);
      fecha.setHours(0, 0, 0, 0);
      fechasSet.add(fecha.getTime());
    });

    // Convertir a array y ordenar
    const fechas = Array.from(fechasSet)
      .sort((a, b) => a - b)
      .map((timestamp) => new Date(timestamp));

    // Construir matriz de asistencias
    const tabla = alumnos.map((alumno) => {
      const filaAsistencias = {};

      fechas.forEach((fecha) => {
        // Buscar TODAS las asistencias del alumno en esa fecha (puede haber múltiples)
        // Comparar por fecha ISO en vez de timestamp para evitar problemas de zona horaria
        const fechaISO = fecha.toISOString().split("T")[0];
        const asistenciasDia = asistencias.filter((a) => {
          const asistenciaFechaISO = new Date(a.fecha).toISOString().split("T")[0];
          return (
            a.alumno.toString() === alumno._id.toString() &&
            asistenciaFechaISO === fechaISO
          );
        });

        // Si hay múltiples asistencias en el día, incluir todas con su hora
        if (asistenciasDia.length > 0) {
          filaAsistencias[fecha.toISOString().split("T")[0]] =
            asistenciasDia.map((a) => ({
              id: a._id,
              estado: a.estado,
              observaciones: a.observaciones,
              hora: new Date(a.horaRegistro).toLocaleTimeString("es-MX", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            }));
        } else {
          filaAsistencias[fecha.toISOString().split("T")[0]] = null;
        }
      });

      // Calcular resumen del alumno
      const asistenciasAlumno = asistencias.filter(
        (a) => a.alumno.toString() === alumno._id.toString()
      );
      const resumen = {
        total: asistenciasAlumno.length,
        presente: asistenciasAlumno.filter((a) => a.estado === "presente")
          .length,
        ausente: asistenciasAlumno.filter((a) => a.estado === "ausente").length,
        retardo: asistenciasAlumno.filter((a) => a.estado === "retardo").length,
        justificado: asistenciasAlumno.filter((a) => a.estado === "justificado")
          .length,
      };

      return {
        alumnoId: alumno._id,
        nombreCompleto: `${alumno.nombre} ${alumno.apellidos}`,
        asistencias: filaAsistencias,
        resumen,
      };
    });

    res.status(200).json({
      success: true,
      periodo: { inicio, fin },
      fechas: fechas.map((f) => f.toISOString().split("T")[0]),
      data: tabla,
    });
  } catch (error) {
    console.error("Error al obtener tabla de asistencias:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al obtener la tabla de asistencias",
      error: error.message,
    });
  }
};

// ============================================
// JUSTIFICAR FALTAS EN UN RANGO DE FECHAS
// ============================================
const justificarFaltas = async (req, res) => {
  try {
    const { alumnoId } = req.params;
    const { fechaInicio, fechaFin, motivo } = req.body;

    // Validar que el alumno existe
    const alumno = await Alumno.findById(alumnoId);
    if (!alumno) {
      return res.status(404).json({
        success: false,
        mensaje: "Alumno no encontrado",
      });
    }

    // Validar fechas
    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        success: false,
        mensaje: "Se requieren fechaInicio y fechaFin",
      });
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    inicio.setHours(0, 0, 0, 0);
    fin.setHours(23, 59, 59, 999);

    // Buscar todas las asistencias "ausente" del alumno en el rango de fechas
    const resultado = await Asistencia.updateMany(
      {
        alumno: alumnoId,
        fecha: { $gte: inicio, $lte: fin },
        estado: "ausente",
      },
      {
        $set: {
          estado: "justificado",
          observaciones: motivo || "Falta justificada retroactivamente",
        },
      }
    );

    res.status(200).json({
      success: true,
      mensaje: `Se justificaron ${resultado.modifiedCount} falta(s)`,
      data: {
        alumno: alumno.nombre + " " + alumno.apellidos,
        periodo: { inicio, fin },
        faltasJustificadas: resultado.modifiedCount,
        motivo: motivo || "Falta justificada retroactivamente",
      },
    });
  } catch (error) {
    console.error("Error al justificar faltas:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al justificar las faltas",
      error: error.message,
    });
  }
};

// ============================================
// JUSTIFICAR UNA FALTA INDIVIDUAL
// ============================================
const justificarFaltaIndividual = async (req, res) => {
  try {
    const { asistenciaId } = req.params;
    const { motivo } = req.body;

    // Buscar la asistencia
    const asistencia = await Asistencia.findById(asistenciaId);
    if (!asistencia) {
      return res.status(404).json({
        success: false,
        mensaje: "Asistencia no encontrada",
      });
    }

    // Verificar que sea ausente
    if (asistencia.estado !== "ausente") {
      return res.status(400).json({
        success: false,
        mensaje: `No se puede justificar. El estado actual es: ${asistencia.estado}`,
      });
    }

    // Actualizar a justificado
    asistencia.estado = "justificado";
    asistencia.observaciones = motivo || "Falta justificada retroactivamente";
    await asistencia.save();

    // Obtener datos del alumno
    const alumno = await Alumno.findById(asistencia.alumno);

    res.status(200).json({
      success: true,
      mensaje: "Falta justificada exitosamente",
      data: {
        alumno: alumno ? alumno.nombre + " " + alumno.apellidos : "Desconocido",
        fecha: asistencia.fecha,
        motivo: asistencia.observaciones,
      },
    });
  } catch (error) {
    console.error("Error al justificar falta individual:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al justificar la falta",
      error: error.message,
    });
  }
};

// ============================================
// UPSERT ASISTENCIA GRUPO (AUTO-GUARDADO)
// ============================================
const upsertAsistenciaGrupo = async (req, res) => {
  try {
    const { grupoId, asistencias, fecha } = req.body;

    // Validar que el grupo existe
    const grupo = await Grupo.findById(grupoId);
    if (!grupo) {
      return res.status(404).json({
        success: false,
        mensaje: "Grupo no encontrado",
      });
    }

    // Preparar fecha de registro
    const fechaRegistro = fecha ? new Date(fecha) : new Date();
    fechaRegistro.setHours(0, 0, 0, 0);

    // Capturar hora actual para el registro
    const horaRegistroActual = new Date();

    // Buscar asistencias existentes para hoy
    const asistenciasExistentes = await Asistencia.find({
      grupo: grupoId,
      fecha: fechaRegistro,
    });

    // Crear un mapa de asistencias existentes por alumnoId
    const mapaExistentes = {};
    asistenciasExistentes.forEach((asist) => {
      // Usar el último registro de cada alumno
      const alumnoIdStr = asist.alumno.toString();
      if (
        !mapaExistentes[alumnoIdStr] ||
        asist.horaRegistro > mapaExistentes[alumnoIdStr].horaRegistro
      ) {
        mapaExistentes[alumnoIdStr] = asist;
      }
    });

    // Preparar operaciones de actualización/inserción
    let actualizadas = 0;
    let creadas = 0;

    for (const asistencia of asistencias) {
      const alumnoIdStr = asistencia.alumnoId;
      const asistenciaExistente = mapaExistentes[alumnoIdStr];

      if (asistenciaExistente) {
        // ACTUALIZAR asistencia existente
        await Asistencia.findByIdAndUpdate(asistenciaExistente._id, {
          estado: asistencia.estado,
          observaciones: asistencia.observaciones || undefined,
          horaRegistro: horaRegistroActual, // Actualizar hora de último guardado
        });
        actualizadas++;
      } else {
        // CREAR nueva asistencia
        await Asistencia.create({
          alumno: asistencia.alumnoId,
          grupo: grupoId,
          fecha: fechaRegistro,
          horaRegistro: horaRegistroActual,
          estado: asistencia.estado,
          observaciones: asistencia.observaciones || undefined,
        });
        creadas++;
      }
    }

    res.status(200).json({
      success: true,
      mensaje: "Asistencia auto-guardada exitosamente",
      data: {
        actualizadas,
        creadas,
        total: asistencias.length,
        grupo: grupo.obtenerNombreCompleto(),
        horaGuardado: horaRegistroActual.toLocaleString("es-MX", {
          timeZone: "America/Mexico_City",
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    });
  } catch (error) {
    console.error("Error en upsert asistencia:", error);
    res.status(500).json({
      success: false,
      mensaje: "Error al auto-guardar la asistencia",
      error: error.message,
    });
  }
};

// ============================================
// EXPORTAR CONTROLADORES
// ============================================

module.exports = {
  registrarAsistenciaGrupo,
  obtenerAsistenciaPorGrupoYFecha,
  obtenerResumenGrupo,
  obtenerEstadisticasAlumno,
  obtenerTablaAsistencias,
  justificarFaltas,
  justificarFaltaIndividual,
  upsertAsistenciaGrupo, // 🆕 Nuevo endpoint para auto-guardado
};
