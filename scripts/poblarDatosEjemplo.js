// Script para poblar la base de datos con datos de ejemplo
// Ejecutar con: node scripts/poblarDatosEjemplo.js

require('dotenv').config();
const mongoose = require('mongoose');

// Importar modelos
const Grupo = require('../src/models/Grupo');
const Alumno = require('../src/models/Alumno');
const {
  EventoSalida,
  EventoDisciplinario
} = require('../src/models/Evento');

// Datos de ejemplo
const datosEjemplo = {
  grupos: [
    {
      grado: 1,
      grupo: 'A',
      nivel: 'Secundaria',
      horario: [
        { dia: 'Lunes', horaInicio: '08:00', horaFin: '09:00' },
        { dia: 'Miércoles', horaInicio: '10:00', horaFin: '11:00' },
        { dia: 'Viernes', horaInicio: '08:00', horaFin: '09:00' }
      ],
      cicloEscolar: '2025-2026',
      aula: 'A-201'
    },
    {
      grado: 5,
      grupo: 'A',
      nivel: 'Preparatoria',
      horario: [
        { dia: 'Martes', horaInicio: '14:00', horaFin: '15:00' },
        { dia: 'Jueves', horaInicio: '14:00', horaFin: '15:00' }
      ],
      cicloEscolar: '2025-2026',
      aula: 'B-105'
    }
  ],
  alumnos: [
    {
      nombre: 'Juan Carlos',
      apellidos: 'Pérez García',
      fechaNacimiento: new Date('2010-05-15'),
      promedio: 85,
      xp: 150,
      salud: 90
    },
    {
      nombre: 'Ana María',
      apellidos: 'López Martínez',
      fechaNacimiento: new Date('2010-08-22'),
      promedio: 92,
      xp: 250,
      salud: 100
    },
    {
      nombre: 'Carlos Eduardo',
      apellidos: 'Ramírez Hernández',
      fechaNacimiento: new Date('2010-03-10'),
      promedio: 78,
      xp: 100,
      salud: 85
    }
  ]
};

// Función principal
async function poblarBaseDeDatos() {
  try {
    // Conectar a MongoDB
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Limpiar colecciones existentes
    console.log('🗑️  Limpiando colecciones existentes...');
    await Grupo.deleteMany({});
    await Alumno.deleteMany({});
    await mongoose.connection.collection('eventos').deleteMany({});
    console.log('✅ Colecciones limpiadas\n');

    // Crear grupos
    console.log('📚 Creando grupos...');
    const gruposCreados = await Grupo.insertMany(datosEjemplo.grupos);
    console.log(`✅ ${gruposCreados.length} grupos creados`);
    gruposCreados.forEach(g => {
      console.log(`   - ${g.obtenerNombreCompleto()}`);
    });
    console.log('');

    // Asignar alumnos al primer grupo
    console.log('👨‍🎓 Creando alumnos...');
    const alumnosConGrupo = datosEjemplo.alumnos.map(alumno => ({
      ...alumno,
      grupo: gruposCreados[0]._id // Asignar al primer grupo
    }));

    const alumnosCreados = await Alumno.insertMany(alumnosConGrupo);
    console.log(`✅ ${alumnosCreados.length} alumnos creados`);
    alumnosCreados.forEach(a => {
      console.log(`   - ${a.nombreCompleto} - XP: ${a.xp} - ♥️: ${a.salud}`);
    });
    console.log('');

    // Crear eventos de ejemplo
    console.log('📝 Creando eventos de ejemplo...');

    const hoy = new Date();
    hoy.setHours(9, 0, 0, 0); // 9:00 AM

    // Salidas al baño
    await EventoSalida.create({
      alumno: alumnosCreados[0]._id,
      tipoSalida: 'baño',
      horaSalida: new Date(hoy.getTime() + 1 * 60 * 60 * 1000), // 10:00 AM
      horaRegreso: new Date(hoy.getTime() + 1.2 * 60 * 60 * 1000), // 10:12 AM
      fecha: new Date(hoy.getTime() + 1 * 60 * 60 * 1000)
    });

    await EventoSalida.create({
      alumno: alumnosCreados[1]._id,
      tipoSalida: 'baño',
      horaSalida: new Date(hoy.getTime() + 2 * 60 * 60 * 1000), // 11:00 AM
      horaRegreso: new Date(hoy.getTime() + 2.17 * 60 * 60 * 1000), // 11:10 AM
      fecha: new Date(hoy.getTime() + 2 * 60 * 60 * 1000)
    });

    console.log('✅ 2 salidas al baño creadas');

    // Salida a enfermería
    await EventoSalida.create({
      alumno: alumnosCreados[2]._id,
      tipoSalida: 'enfermería',
      horaSalida: new Date(hoy.getTime() + 3 * 60 * 60 * 1000), // 12:00 PM
      horaRegreso: new Date(hoy.getTime() + 3.5 * 60 * 60 * 1000), // 12:30 PM
      fecha: new Date(hoy.getTime() + 3 * 60 * 60 * 1000),
      observaciones: 'Dolor de cabeza'
    });

    console.log('✅ 1 salida a enfermería creada');

    // Evento disciplinario - descontar 5 puntos de salud
    await EventoDisciplinario.create({
      alumno: alumnosCreados[1]._id,
      tipoDisciplina: 'teléfono',
      puntosDescontados: 5,
      fecha: hoy,
      observaciones: 'Uso de celular durante la clase'
    });

    // Actualizar la salud del alumno manualmente en el script
    alumnosCreados[1].salud -= 5;
    await alumnosCreados[1].save();

    console.log('✅ 1 evento disciplinario creado');

    console.log('\n✨ ¡Base de datos poblada exitosamente!\n');

    // Mostrar resumen
    console.log('📊 RESUMEN:');
    console.log(`   Grupos: ${gruposCreados.length}`);
    console.log(`   Alumnos: ${alumnosCreados.length}`);
    console.log(`   Eventos: 4 (3 salidas + 1 disciplinario)`);
    console.log('');

    console.log('🎯 PRÓXIMOS PASOS:');
    console.log('   1. Inicia el servidor: npm run dev');
    console.log('   2. Prueba los endpoints en: http://localhost:3000');
    console.log('   3. Consulta EJEMPLOS_API.md para ver cómo usar la API');
    console.log('');

    // Mostrar IDs importantes
    console.log('🔑 IDs IMPORTANTES (guárdalos para pruebas):');
    console.log(`   Grupo 1 ID: ${gruposCreados[0]._id}`);
    console.log(`   Alumno 1 ID: ${alumnosCreados[0]._id}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error al poblar la base de datos:', error);
  } finally {
    // Cerrar conexión
    await mongoose.connection.close();
    console.log('👋 Conexión cerrada');
  }
}

// Ejecutar
poblarBaseDeDatos();
