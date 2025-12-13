// Script para importar/restaurar XP/HP desde un backup CSV
// Ejecutar con: node scripts/importarPuntos.js backups/backup-puntos-YYYY-MM-DD.csv

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const Alumno = require('../src/models/Alumno');

async function importarPuntos(rutaArchivo) {
  try {
    // Validar que se proporcionó el archivo
    if (!rutaArchivo) {
      console.log('❌ Debes especificar el archivo de backup');
      console.log('Uso: node scripts/importarPuntos.js backups/backup-puntos-YYYY-MM-DD.csv');
      console.log('\n📁 Archivos disponibles en backups/:');
      const dirBackups = path.join(__dirname, '..', 'backups');
      if (fs.existsSync(dirBackups)) {
        const archivos = fs.readdirSync(dirBackups).filter(f => f.endsWith('.csv'));
        archivos.forEach(f => console.log(`   - ${f}`));
      }
      return;
    }

    // Validar que existe el archivo
    if (!fs.existsSync(rutaArchivo)) {
      console.log(`❌ No se encontró el archivo: ${rutaArchivo}`);
      return;
    }

    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado\n');

    console.log(`📥 Importando puntos desde: ${path.basename(rutaArchivo)}\n`);

    // Leer el CSV
    const datos = await new Promise((resolve, reject) => {
      const resultados = [];
      fs.createReadStream(rutaArchivo)
        .pipe(csv())
        .on('data', (data) => resultados.push(data))
        .on('end', () => resolve(resultados))
        .on('error', (error) => reject(error));
    });

    console.log(`📊 Datos leídos: ${datos.length} alumnos\n`);

    let actualizados = 0;
    let noEncontrados = 0;
    let errores = 0;

    console.log('🔄 Actualizando puntos...\n');

    for (const fila of datos) {
      try {
        const nombreCompleto = fila.nombreCompleto;
        const xp = parseInt(fila.xp) || 0;
        const salud = parseInt(fila.salud) || 100;

        // Buscar alumno por nombre completo
        const alumno = await Alumno.findOne({
          $or: [
            { nombreCompleto: nombreCompleto },
            {
              nombre: fila.nombre,
              apellidos: fila.apellidos
            }
          ],
          activo: true
        });

        if (alumno) {
          alumno.xp = xp;
          alumno.salud = salud;
          await alumno.save();
          actualizados++;
          if (xp > 0) {
            console.log(`   ✅ ${nombreCompleto}: XP=${xp}, HP=${salud}`);
          }
        } else {
          noEncontrados++;
          console.log(`   ⚠️  No encontrado: ${nombreCompleto}`);
        }
      } catch (error) {
        errores++;
        console.log(`   ❌ Error con ${fila.nombreCompleto}: ${error.message}`);
      }
    }

    console.log(`\n✨ Importación completada!\n`);
    console.log(`📊 Resultados:`);
    console.log(`   ✅ Actualizados: ${actualizados}`);
    console.log(`   ⚠️  No encontrados: ${noEncontrados}`);
    console.log(`   ❌ Errores: ${errores}`);

    // Mostrar estadísticas finales
    const alumnosConXP = await Alumno.countDocuments({ xp: { $gt: 0 }, activo: true });
    const totalXP = await Alumno.aggregate([
      { $match: { activo: true } },
      { $group: { _id: null, total: { $sum: '$xp' } } }
    ]);

    console.log(`\n📊 Estado actual:`);
    console.log(`   Alumnos con XP: ${alumnosConXP}`);
    console.log(`   XP total en el sistema: ${totalXP[0]?.total || 0}`);

  } catch (error) {
    console.error('❌ Error al importar:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Conexión cerrada');
  }
}

// Obtener ruta del archivo desde argumentos
const rutaArchivo = process.argv[2];
importarPuntos(rutaArchivo);
