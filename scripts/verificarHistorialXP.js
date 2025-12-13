// Script para verificar si existe historial de ajustes de XP
require('dotenv').config();
const mongoose = require('mongoose');

async function verificarHistorial() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado\n');

    const db = mongoose.connection.db;

    // Verificar colección de ajustes
    console.log('📊 Verificando historial de ajustes...\n');
    const ajustesCollection = db.collection('ajustes');
    const totalAjustes = await ajustesCollection.countDocuments();

    console.log(`Total de ajustes registrados: ${totalAjustes}`);

    if (totalAjustes > 0) {
      console.log('\n✅ ¡Hay historial de ajustes!\n');

      // Mostrar algunos ejemplos
      const ejemplos = await ajustesCollection.find()
        .sort({ fecha: -1 })
        .limit(5)
        .toArray();

      console.log('Últimos 5 ajustes:');
      ejemplos.forEach((ajuste, i) => {
        console.log(`${i+1}. Tipo: ${ajuste.tipo}, Cantidad: ${ajuste.cantidad}, Fecha: ${ajuste.fecha}`);
      });

      // Verificar si hay ajustes de XP por alumno
      const ajustesXP = await ajustesCollection.aggregate([
        { $match: { tipo: 'xp' } },
        { $group: {
          _id: '$alumno',
          totalAjustes: { $sum: 1 },
          sumaXP: { $sum: '$cantidad' }
        }},
        { $sort: { sumaXP: -1 } },
        { $limit: 10 }
      ]).toArray();

      if (ajustesXP.length > 0) {
        console.log('\n✅ Top 10 alumnos con más XP en historial:');
        for (const ajuste of ajustesXP) {
          console.log(`Alumno: ${ajuste._id}, Total XP: ${ajuste.sumaXP}, Ajustes: ${ajuste.totalAjustes}`);
        }
      }
    } else {
      console.log('\n⚠️  No hay historial de ajustes guardado.');
    }

    // Verificar si hay backups en otras colecciones
    console.log('\n📁 Verificando otras colecciones...');
    const collections = await db.listCollections().toArray();
    console.log('Colecciones disponibles:');
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Conexión cerrada');
  }
}

verificarHistorial();
