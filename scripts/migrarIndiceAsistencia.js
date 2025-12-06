require('dotenv').config();
const mongoose = require('mongoose');
const Asistencia = require('../src/models/Asistencia');

/**
 * Script de migración para actualizar el índice de asistencias
 * Permite múltiples registros de asistencia por alumno por día
 */

async function migrarIndice() {
  try {
    console.log('🔄 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    console.log('\n📊 Obteniendo índices actuales...');
    const indices = await Asistencia.collection.getIndexes();
    console.log('Índices actuales:', Object.keys(indices));

    // Eliminar el índice antiguo que causaba el problema
    const indiceAntiguo = 'alumno_1_fecha_1';

    if (indices[indiceAntiguo]) {
      console.log(`\n🗑️  Eliminando índice antiguo: ${indiceAntiguo}`);
      await Asistencia.collection.dropIndex(indiceAntiguo);
      console.log('✅ Índice antiguo eliminado');
    } else {
      console.log(`\n⚠️  El índice ${indiceAntiguo} no existe (posiblemente ya fue eliminado)`);
    }

    console.log('\n📋 Creando nuevos índices...');
    // Los índices se crean automáticamente al arrancar el servidor
    // gracias a las definiciones en el modelo
    await Asistencia.syncIndexes();
    console.log('✅ Índices sincronizados correctamente');

    console.log('\n📊 Verificando índices finales...');
    const indicesNuevos = await Asistencia.collection.getIndexes();
    console.log('Índices nuevos:', Object.keys(indicesNuevos));

    console.log('\n✅ Migración completada exitosamente');
    console.log('ℹ️  Ahora puedes registrar múltiples asistencias por día');

  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Conexión a MongoDB cerrada');
  }
}

// Ejecutar migración
migrarIndice();
