const Alumno = require('../models/Alumno');

// ============================================
// EXPORTAR PUNTOS XP/HP DE TODOS LOS ALUMNOS
// ============================================
const exportarPuntos = async (req, res) => {
  try {
    // Obtener todos los alumnos activos con información del grupo
    const alumnos = await Alumno.find({ activo: true })
      .populate('grupo')
      .sort({ 'grupo.grado': 1, 'grupo.grupo': 1, apellidos: 1, nombre: 1 });

    // Crear CSV con encabezados
    let csv = 'nombre,apellidos,nombreCompleto,grupo,grado,nivel,materia,xp,salud,activo\n';

    // Agregar datos de cada alumno
    for (const alumno of alumnos) {
      const grupo = alumno.grupo;
      csv += `"${alumno.nombre}","${alumno.apellidos}","${alumno.nombreCompleto}",`;
      csv += `"${grupo.grupo}",${grupo.grado},"${grupo.nivel}","${grupo.materia}",`;
      csv += `${alumno.xp},${alumno.salud},${alumno.activo}\n`;
    }

    // Configurar headers para descarga
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const nombreArchivo = `backup-puntos-${timestamp}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
    res.status(200).send(csv);

  } catch (error) {
    res.status(500).json({
      success: false,
      mensaje: 'Error al exportar puntos',
      error: error.message
    });
  }
};

module.exports = {
  exportarPuntos
};
