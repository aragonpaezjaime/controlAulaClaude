// Script para intentar recuperar XP mapeando alumnos por orden y grupo
require('dotenv').config();
const mongoose = require('mongoose');
const Alumno = require('../src/models/Alumno');
const Grupo = require('../src/models/Grupo');

async function recuperarXPPorOrden() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado\n');

    const db = mongoose.connection.db;
    const ajustesCollection = db.collection('ajustes');

    console.log('📊 Intentando mapear alumnos por orden...\n');

    // Obtener todos los ajustes de XP agrupados por alumno
    const ajustesPorAlumno = await ajustesCollection.aggregate([
      { $match: { tipo: 'xp' } },
      { $sort: { fecha: 1 } },
      { $group: {
        _id: '$alumno',
        ajustes: { $push: '$$ROOT' },
        xpFinal: { $last: '$valorDespues' },
        primerAjuste: { $first: '$$ROOT' }
      }}
    ]).toArray();

    console.log(`${ajustesPorAlumno.length} alumnos con historial de XP\n`);

    // Agrupar por grupo antiguo si podemos detectarlo
    const alumnosActuales = await Alumno.find().populate('grupo').sort({
      'grupo.grado': 1,
      'grupo.grupo': 1,
      apellidos: 1,
      nombre: 1
    });

    console.log(`${alumnosActuales.length} alumnos actuales en la BD\n`);

    console.log('📋 Mostrando distribución de XP del historial:\n');

    // Agrupar por valor de XP para ver patrones
    const distribucionXP = {};
    ajustesPorAlumno.forEach(a => {
      const xp = a.xpFinal || 0;
      if (!distribucionXP[xp]) {
        distribucionXP[xp] = 0;
      }
      distribucionXP[xp]++;
    });

    console.log('Distribución de XP:');
    Object.keys(distribucionXP)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .forEach(xp => {
        console.log(`  ${xp} XP: ${distribucionXP[xp]} alumnos`);
      });

    console.log('\n💡 PREGUNTA IMPORTANTE:');
    console.log('¿Recuerdas qué grupos o actividades tenían estos valores?');
    console.log('Por ejemplo:');
    console.log('  - 40 XP = Una actividad específica');
    console.log('  - 80 XP = Dos actividades');
    console.log('  - 300 XP = ¿Algún grupo en particular?');
    console.log('  - 45 XP = ¿Actividad reciente del 8 de diciembre?');

    // Mostrar fechas de los ajustes
    console.log('\n📅 Fechas de los ajustes:');
    const fechasUnicas = [...new Set(ajustesPorAlumno.flatMap(a =>
      a.ajustes.map(aj => aj.fecha.toLocaleDateString('es-MX'))
    ))];
    fechasUnicas.forEach(fecha => console.log(`  - ${fecha}`));

    console.log('\n🎯 SIGUIENTE PASO RECOMENDADO:');
    console.log('Verifica MongoDB Atlas si tiene snapshots automáticos:');
    console.log('1. Ve a https://cloud.mongodb.com');
    console.log('2. Selecciona tu cluster');
    console.log('3. Click en "Backup" o "Snapshots"');
    console.log('4. Busca un snapshot del 8 de diciembre ANTES de las 21:14');
    console.log('\nSi hay snapshot, podemos restaurar desde ahí sin perder nada.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Conexión cerrada');
  }
}

recuperarXPPorOrden();
