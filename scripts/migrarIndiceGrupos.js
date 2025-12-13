// Script temporal para eliminar el índice viejo y permitir el nuevo con materia
require('dotenv').config();
const mongoose = require('mongoose');

async function migrarIndice() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado\n');

    // Obtener la colección de grupos
    const db = mongoose.connection.db;
    const gruposCollection = db.collection('grupos');

    // Eliminar el índice viejo
    console.log('🗑️  Eliminando índice viejo...');
    try {
      await gruposCollection.dropIndex('grado_1_grupo_1_cicloEscolar_1_nivel_1');
      console.log('✅ Índice viejo eliminado');
    } catch (error) {
      if (error.code === 27) {
        console.log('ℹ️  El índice viejo ya no existe');
      } else {
        throw error;
      }
    }

    console.log('\n✨ Migración completada. Ahora puedes ejecutar poblarDatosEjemplo.js');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Conexión cerrada');
  }
}

migrarIndice();
