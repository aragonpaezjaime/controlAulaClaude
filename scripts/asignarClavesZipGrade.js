require('dotenv').config();
const mongoose = require('mongoose');
const Alumno = require('../src/models/Alumno');
const Grupo = require('../src/models/Grupo');

async function asignarClavesZipGrade() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Obtener un grupo de prueba (grupo 2A o el primero disponible)
    const grupo = await Grupo.findOne({ grado: 2, grupo: 'A' });

    if (!grupo) {
      console.log('❌ No se encontró el grupo 2A');
      process.exit(1);
    }

    console.log(`\n📚 Grupo seleccionado: ${grupo.grado}${grupo.grupo} - ${grupo.materia}`);

    // Obtener los primeros 5 alumnos del grupo
    const alumnos = await Alumno.find({ grupo: grupo._id, activo: true })
      .limit(5)
      .sort({ xp: -1 }); // Ordenar por XP para tomar a los top

    if (alumnos.length === 0) {
      console.log('❌ No hay alumnos en este grupo');
      process.exit(1);
    }

    console.log(`\n🔑 Asignando claves zipGrade a ${alumnos.length} alumnos:\n`);

    // Asignar claves de prueba (formato: CLAVE001, CLAVE002, etc.)
    for (let i = 0; i < alumnos.length; i++) {
      const alumno = alumnos[i];
      const claveZipGrade = `CLAVE${String(i + 1).padStart(3, '0')}`;

      alumno.claveZipGrade = claveZipGrade;
      await alumno.save();

      console.log(`✅ ${alumno.nombreCompleto}`);
      console.log(`   Clave: ${claveZipGrade}`);
      console.log(`   XP: ${alumno.xp} | HP: ${alumno.salud}`);
      console.log('');
    }

    console.log('\n🎉 Claves asignadas exitosamente');
    console.log('\n📝 Credenciales de prueba:');
    console.log('═'.repeat(50));

    for (let i = 0; i < alumnos.length; i++) {
      const alumno = alumnos[i];
      console.log(`Alumno ${i + 1}: CLAVE${String(i + 1).padStart(3, '0')}`);
    }

    console.log('═'.repeat(50));
    console.log('\n💡 Usa estas claves para probar el portal de estudiantes');
    console.log('🌐 URL: http://localhost:3000/portal-estudiante-login.html\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar
asignarClavesZipGrade();
