require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Alumno = require('../src/models/Alumno');

async function importarClavesZipGrade() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Leer el archivo CSV
    const csvPath = path.join(__dirname, '../students.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = csvContent.split('\n');

    // Remover el header y líneas vacías
    const dataLines = lines.slice(1).filter(line => line.trim() !== '');

    console.log(`📄 Archivo: students.csv`);
    console.log(`📊 Total de registros: ${dataLines.length}\n`);
    console.log('🔄 Procesando...\n');

    let exitosos = 0;
    let noEncontrados = [];
    let duplicados = [];
    let errores = [];

    for (const line of dataLines) {
      // Parsear CSV (considerando que puede haber comas en los nombres)
      const columns = line.split(',');

      // ZipGrade ID, External ID, First Name, Last Name, Access Code, Classes
      const zipGradeId = columns[0]?.trim();
      const externalId = columns[1]?.trim(); // Formato: "2°A"
      const firstName = columns[2]?.trim();
      const lastName = columns[3]?.trim();
      const accessCode = columns[4]?.trim();

      if (!firstName || !lastName || !accessCode || !externalId) {
        console.log(`⚠️ Línea inválida, saltando: ${line.substring(0, 50)}...`);
        continue;
      }

      // Parsear el grupo: "2°A" -> grado: 2, grupo: "A"
      const grupoMatch = externalId.match(/^(\d)°([A-Z])$/);
      if (!grupoMatch) {
        console.log(`⚠️ Formato de grupo inválido: ${externalId} (${firstName} ${lastName})`);
        continue;
      }

      const grado = parseInt(grupoMatch[1]);
      const grupo = grupoMatch[2];

      try {
        // Buscar el alumno en la BD
        // Primero obtenemos el grupo de la BD
        const Grupo = require('../src/models/Grupo');
        const grupoDB = await Grupo.findOne({ grado, grupo, activo: true });

        if (!grupoDB) {
          noEncontrados.push({
            nombre: `${firstName} ${lastName}`,
            grupo: externalId,
            razon: 'Grupo no encontrado en BD'
          });
          continue;
        }

        // Buscar alumno por nombre, apellidos y grupo
        const alumno = await Alumno.findOne({
          nombre: new RegExp(`^${firstName}$`, 'i'),
          apellidos: new RegExp(`^${lastName}$`, 'i'),
          grupo: grupoDB._id,
          activo: true
        });

        if (!alumno) {
          noEncontrados.push({
            nombre: `${firstName} ${lastName}`,
            grupo: externalId,
            razon: 'Alumno no encontrado en BD'
          });
          continue;
        }

        // Verificar si ya tiene una clave asignada
        if (alumno.claveZipGrade && alumno.claveZipGrade !== accessCode) {
          duplicados.push({
            nombre: alumno.nombreCompleto,
            grupo: externalId,
            claveAnterior: alumno.claveZipGrade,
            claveNueva: accessCode
          });
        }

        // Asignar la clave
        alumno.claveZipGrade = accessCode;
        await alumno.save();

        exitosos++;

        // Mostrar progreso cada 10 alumnos
        if (exitosos % 10 === 0) {
          console.log(`✅ ${exitosos} claves asignadas...`);
        }

      } catch (error) {
        errores.push({
          nombre: `${firstName} ${lastName}`,
          grupo: externalId,
          error: error.message
        });
      }
    }

    // Reporte final
    console.log('\n' + '='.repeat(60));
    console.log('📊 REPORTE FINAL');
    console.log('='.repeat(60));
    console.log(`✅ Claves asignadas exitosamente: ${exitosos}`);
    console.log(`❌ Alumnos no encontrados: ${noEncontrados.length}`);
    console.log(`⚠️ Claves duplicadas (reemplazadas): ${duplicados.length}`);
    console.log(`🔴 Errores: ${errores.length}`);
    console.log('='.repeat(60));

    if (noEncontrados.length > 0) {
      console.log('\n📋 ALUMNOS NO ENCONTRADOS:');
      console.log('-'.repeat(60));
      noEncontrados.forEach((item, index) => {
        console.log(`${index + 1}. ${item.nombre} (${item.grupo}) - ${item.razon}`);
      });
    }

    if (duplicados.length > 0) {
      console.log('\n⚠️ CLAVES DUPLICADAS (ACTUALIZADAS):');
      console.log('-'.repeat(60));
      duplicados.forEach((item, index) => {
        console.log(`${index + 1}. ${item.nombre} (${item.grupo})`);
        console.log(`   Anterior: ${item.claveAnterior} → Nueva: ${item.claveNueva}`);
      });
    }

    if (errores.length > 0) {
      console.log('\n🔴 ERRORES:');
      console.log('-'.repeat(60));
      errores.forEach((item, index) => {
        console.log(`${index + 1}. ${item.nombre} (${item.grupo})`);
        console.log(`   Error: ${item.error}`);
      });
    }

    console.log('\n🎉 Importación completada');
    console.log('\n💡 Próximo paso: Compartir el link del portal a tus estudiantes');
    console.log('🌐 URL: http://localhost:3000/portal-estudiante-login.html\n');

  } catch (error) {
    console.error('❌ Error fatal:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar
importarClavesZipGrade();
