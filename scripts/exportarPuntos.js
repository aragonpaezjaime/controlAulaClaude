// Script para exportar XP/HP de todos los alumnos a CSV
// Ejecutar con: node scripts/exportarPuntos.js

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Alumno = require('../src/models/Alumno');
const Grupo = require('../src/models/Grupo');

async function exportarPuntos() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado\n');

    console.log('📊 Exportando puntos de alumnos...\n');

    // Obtener todos los alumnos con información del grupo
    const alumnos = await Alumno.find({ activo: true })
      .populate('grupo')
      .sort({ 'grupo.grado': 1, 'grupo.grupo': 1, apellidos: 1, nombre: 1 });

    if (alumnos.length === 0) {
      console.log('⚠️  No hay alumnos para exportar');
      return;
    }

    // Crear nombre de archivo con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    const nombreArchivo = `backup-puntos-${timestamp}.csv`;
    const rutaArchivo = path.join(__dirname, '..', 'backups', nombreArchivo);

    // Crear directorio backups si no existe
    const dirBackups = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(dirBackups)) {
      fs.mkdirSync(dirBackups, { recursive: true });
      console.log('📁 Directorio backups creado\n');
    }

    // Crear CSV con encabezados
    let csv = 'nombre,apellidos,nombreCompleto,grupo,grado,nivel,materia,xp,salud,activo\n';

    // Agregar datos de cada alumno
    for (const alumno of alumnos) {
      const grupo = alumno.grupo;
      csv += `"${alumno.nombre}","${alumno.apellidos}","${alumno.nombreCompleto}",`;
      csv += `"${grupo.grupo}",${grupo.grado},"${grupo.nivel}","${grupo.materia}",`;
      csv += `${alumno.xp},${alumno.salud},${alumno.activo}\n`;
    }

    // Guardar archivo
    fs.writeFileSync(rutaArchivo, csv, 'utf8');

    console.log('✅ Exportación completada exitosamente!\n');
    console.log(`📄 Archivo: ${nombreArchivo}`);
    console.log(`📂 Ubicación: ${rutaArchivo}`);
    console.log(`👥 Total alumnos: ${alumnos.length}`);

    // Mostrar estadísticas
    const totalXP = alumnos.reduce((sum, a) => sum + a.xp, 0);
    const promedioXP = Math.round(totalXP / alumnos.length);
    const alumnosConXP = alumnos.filter(a => a.xp > 0).length;

    console.log(`\n📊 Estadísticas:`);
    console.log(`   XP total: ${totalXP}`);
    console.log(`   XP promedio: ${promedioXP}`);
    console.log(`   Alumnos con XP: ${alumnosConXP} de ${alumnos.length}`);

    // Mostrar top 5
    const top5 = [...alumnos]
      .sort((a, b) => b.xp - a.xp)
      .slice(0, 5)
      .filter(a => a.xp > 0);

    if (top5.length > 0) {
      console.log(`\n🏆 Top 5 con más XP:`);
      top5.forEach((a, i) => {
        console.log(`   ${i + 1}. ${a.nombreCompleto} - ${a.xp} XP (${a.grupo.grado}°${a.grupo.grupo})`);
      });
    }

    console.log(`\n💾 BACKUP GUARDADO - Guarda este archivo en un lugar seguro`);
    console.log(`\n💡 Para restaurar: node scripts/importarPuntos.js backups/${nombreArchivo}`);

  } catch (error) {
    console.error('❌ Error al exportar:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Conexión cerrada');
  }
}

exportarPuntos();
