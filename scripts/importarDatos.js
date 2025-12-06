// Script para importar datos masivos desde archivos CSV
// Ejecutar con: node scripts/importarDatos.js

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');

// Importar modelos
const Grupo = require('../src/models/Grupo');
const Alumno = require('../src/models/Alumno');

// ============================================
// FUNCIÓN PARA LEER CSV
// ============================================
function leerCSV(rutaArchivo) {
  return new Promise((resolve, reject) => {
    const resultados = [];

    if (!fs.existsSync(rutaArchivo)) {
      reject(new Error(`No se encontró el archivo: ${rutaArchivo}`));
      return;
    }

    fs.createReadStream(rutaArchivo)
      .pipe(csv())
      .on('data', (data) => resultados.push(data))
      .on('end', () => resolve(resultados))
      .on('error', (error) => reject(error));
  });
}

// ============================================
// IMPORTAR GRUPOS
// ============================================
async function importarGrupos(rutaArchivo) {
  console.log('\n📚 Importando grupos desde CSV...');

  try {
    const datos = await leerCSV(rutaArchivo);

    if (datos.length === 0) {
      console.log('⚠️  El archivo de grupos está vacío');
      return [];
    }

    const gruposCreados = [];
    let errores = 0;

    for (const fila of datos) {
      try {
        // Parsear el horario desde el CSV
        // Formato esperado: "Lunes:08:00-09:00,Miércoles:10:00-11:00"
        const horario = [];
        if (fila.horario && fila.horario.trim() !== '') {
          const clasesArray = fila.horario.split(',');

          for (const clase of clasesArray) {
            const partes = clase.trim().split(':');
            if (partes.length === 3) {
              const [dia, horaInicio, horaFin] = partes;
              horario.push({
                dia: dia.trim(),
                horaInicio: horaInicio.trim(),
                horaFin: horaFin.trim()
              });
            }
          }
        }

        const grupo = new Grupo({
          grado: parseInt(fila.grado),
          grupo: fila.grupo,
          nivel: fila.nivel,
          horario: horario,
          cicloEscolar: fila.cicloEscolar,
          aula: fila.aula
        });

        const grupoGuardado = await grupo.save();
        gruposCreados.push(grupoGuardado);
        console.log(`   ✅ ${grupoGuardado.obtenerNombreCompleto()} creado`);
      } catch (error) {
        errores++;
        console.log(`   ❌ Error al crear grupo ${fila.grupo}: ${error.message}`);
      }
    }

    console.log(`\n✅ ${gruposCreados.length} grupos importados exitosamente`);
    if (errores > 0) {
      console.log(`⚠️  ${errores} errores encontrados`);
    }

    return gruposCreados;
  } catch (error) {
    console.error('❌ Error al importar grupos:', error.message);
    return [];
  }
}

// ============================================
// IMPORTAR ALUMNOS
// ============================================
async function importarAlumnos(rutaArchivo) {
  console.log('\n👨‍🎓 Importando alumnos desde CSV...');

  try {
    const datos = await leerCSV(rutaArchivo);

    if (datos.length === 0) {
      console.log('⚠️  El archivo de alumnos está vacío');
      return [];
    }

    const alumnosCreados = [];
    let errores = 0;

    for (const fila of datos) {
      try {
        // Buscar el grupo por su identificador y grado
        const grupo = await Grupo.findOne({
          grado: parseInt(fila.grado),
          grupo: fila.grupo.toUpperCase(),
          cicloEscolar: fila.cicloEscolar
        });

        if (!grupo) {
          console.log(`   ⚠️  Grupo "${fila.grado}${fila.grupo}" no encontrado para ${fila.nombre} ${fila.apellidos}`);
          errores++;
          continue;
        }

        const alumno = new Alumno({
          nombre: fila.nombre,
          apellidos: fila.apellidos,
          fechaNacimiento: fila.fechaNacimiento ? new Date(fila.fechaNacimiento) : undefined,
          grupo: grupo._id,
          promedio: parseFloat(fila.promedio) || 0,
          xp: parseInt(fila.xp) || 0,
          salud: parseInt(fila.salud) || 100
        });

        const alumnoGuardado = await alumno.save();
        alumnosCreados.push(alumnoGuardado);
        console.log(`   ✅ ${alumnoGuardado.nombreCompleto} → ${grupo.obtenerNombreCompleto()}`);
      } catch (error) {
        errores++;
        console.log(`   ❌ Error al crear alumno ${fila.nombre} ${fila.apellidos}: ${error.message}`);
      }
    }

    console.log(`\n✅ ${alumnosCreados.length} alumnos importados exitosamente`);
    if (errores > 0) {
      console.log(`⚠️  ${errores} errores encontrados`);
    }

    return alumnosCreados;
  } catch (error) {
    console.error('❌ Error al importar alumnos:', error.message);
    return [];
  }
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================
async function main() {
  try {
    // Conectar a MongoDB
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Rutas de los archivos CSV
    const archivoGrupos = './datos/grupos.csv';
    const archivoAlumnos = './datos/alumnos.csv';

    // Verificar que existan los archivos
    if (!fs.existsSync('./datos')) {
      fs.mkdirSync('./datos');
      console.log('📁 Carpeta "datos" creada');
      console.log('\n⚠️  Por favor, coloca tus archivos CSV en la carpeta "datos":');
      console.log('   - datos/grupos.csv');
      console.log('   - datos/alumnos.csv\n');
      await mongoose.connection.close();
      return;
    }

    // Importar grupos primero
    if (fs.existsSync(archivoGrupos)) {
      await importarGrupos(archivoGrupos);
    } else {
      console.log(`⚠️  No se encontró ${archivoGrupos}`);
    }

    // Luego importar alumnos
    if (fs.existsSync(archivoAlumnos)) {
      await importarAlumnos(archivoAlumnos);
    } else {
      console.log(`⚠️  No se encontró ${archivoAlumnos}`);
    }

    console.log('\n✨ Importación completada');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Conexión cerrada');
  }
}

// Ejecutar
main();
