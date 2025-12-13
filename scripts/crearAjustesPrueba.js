require('dotenv').config();
const mongoose = require('mongoose');
const Alumno = require('../src/models/Alumno');
const Ajuste = require('../src/models/Ajuste');

async function crearAjustesPrueba() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Obtener el primer alumno con clave zipGrade
    const alumno = await Alumno.findOne({ claveZipGrade: 'CLAVE001' });

    if (!alumno) {
      console.log('❌ No se encontró alumno con clave CLAVE001');
      process.exit(1);
    }

    console.log(`\n📚 Alumno: ${alumno.nombreCompleto}`);
    console.log(`   XP actual: ${alumno.xp}`);
    console.log(`   HP actual: ${alumno.salud}\n`);

    // Crear ajustes de prueba
    const ajustesPrueba = [
      {
        tipo: 'xp',
        cantidad: 50,
        motivo: 'Tarea',
        comentarioAlumno: 'Excelente trabajo en la tarea de física',
        valorAnterior: alumno.xp - 50,
        valorDespues: alumno.xp,
        fecha: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Hace 7 días
      },
      {
        tipo: 'xp',
        cantidad: 30,
        motivo: 'Plickers',
        comentarioAlumno: 'Quiz de Plickers - 8/10 respuestas correctas',
        valorAnterior: alumno.xp - 80,
        valorDespues: alumno.xp - 50,
        fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // Hace 5 días
      },
      {
        tipo: 'hp',
        cantidad: -10,
        motivo: 'Evento disciplinario',
        comentarioAlumno: 'Llegada tarde',
        valorAnterior: 100,
        valorDespues: 90,
        fecha: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) // Hace 4 días
      },
      {
        tipo: 'xp',
        cantidad: 100,
        motivo: 'Reto (examen)',
        comentarioAlumno: 'Examen Parcial 1 - Calificación sobresaliente',
        valorAnterior: alumno.xp - 180,
        valorDespues: alumno.xp - 80,
        fecha: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // Hace 3 días
      },
      {
        tipo: 'hp',
        cantidad: 10,
        motivo: 'Bonus de Constancia (Asistencia)',
        comentarioAlumno: 'Asistencia perfecta esta semana',
        valorAnterior: 90,
        valorDespues: 100,
        fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // Hace 2 días
      },
      {
        tipo: 'xp',
        cantidad: 25,
        motivo: 'Participación destacada',
        comentarioAlumno: 'Participación activa en clase',
        valorAnterior: alumno.xp - 80,
        valorDespues: alumno.xp - 55,
        fecha: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // Hace 1 día
      },
      {
        tipo: 'xp',
        cantidad: 40,
        motivo: 'Práctica',
        comentarioAlumno: 'Práctica de laboratorio completada correctamente',
        valorAnterior: alumno.xp - 55,
        valorDespues: alumno.xp - 15,
        fecha: new Date(Date.now() - 12 * 60 * 60 * 1000) // Hace 12 horas
      },
      {
        tipo: 'xp',
        cantidad: 15,
        motivo: 'Extra',
        comentarioAlumno: 'Puntos extra por ayudar a organizar el aula',
        valorAnterior: alumno.xp - 15,
        valorDespues: alumno.xp,
        fecha: new Date() // Hoy
      }
    ];

    console.log('🔨 Creando ajustes de prueba...\n');

    for (const ajusteData of ajustesPrueba) {
      const ajuste = new Ajuste({
        ...ajusteData,
        alumno: alumno._id,
        visibleParaAlumno: true
      });

      await ajuste.save();

      const signo = ajuste.cantidad > 0 ? '+' : '';
      console.log(`✅ ${ajuste.tipo.toUpperCase()} ${signo}${ajuste.cantidad} - ${ajuste.motivo}`);
      console.log(`   ${ajuste.comentarioAlumno}`);
      console.log(`   📅 ${ajuste.fecha.toLocaleDateString('es-MX')}\n`);
    }

    console.log('🎉 Ajustes de prueba creados exitosamente');
    console.log(`\n📊 Total: ${ajustesPrueba.length} ajustes`);
    console.log('\n💡 Ahora puedes probar el historial en:');
    console.log('🌐 http://localhost:3000/portal-estudiante-login.html');
    console.log('🔑 Clave: CLAVE001\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar
crearAjustesPrueba();
