require('dotenv').config();
const mongoose = require('mongoose');

// ============================================
// SCRIPT DE MIGRACIÓN: ELIMINAR CAMPOS OBSOLETOS
// ============================================
// Este script elimina los campos 'fechaNacimiento' y 'promedio'
// de todos los documentos de la colección 'alumnos'
//
// Fecha: 12 de diciembre de 2025
// Razón: Simplificación del modelo de datos
// ============================================

async function eliminarCamposObsoletos() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas\n');

    // Obtener la colección directamente
    const collection = mongoose.connection.db.collection('alumnos');

    // Contar documentos antes
    const totalAntes = await collection.countDocuments({});
    console.log(`📊 Total de alumnos en BD: ${totalAntes}\n`);

    // Contar cuántos tienen los campos a eliminar
    const conFechaNacimiento = await collection.countDocuments({ fechaNacimiento: { $exists: true } });
    const conPromedio = await collection.countDocuments({ promedio: { $exists: true } });

    console.log(`📋 Campos a eliminar:`);
    console.log(`   - fechaNacimiento: ${conFechaNacimiento} documentos`);
    console.log(`   - promedio: ${conPromedio} documentos\n`);

    // Confirmar antes de ejecutar
    console.log('⚠️  Esta operación eliminará permanentemente estos campos.\n');

    // Ejecutar migración
    console.log('🔄 Ejecutando migración...');

    const resultado = await collection.updateMany(
      {},
      {
        $unset: {
          fechaNacimiento: "",
          promedio: ""
        }
      }
    );

    console.log(`\n✅ Migración completada exitosamente:`);
    console.log(`   - Documentos modificados: ${resultado.modifiedCount}`);
    console.log(`   - Documentos coincidentes: ${resultado.matchedCount}`);

    // Verificar que se eliminaron
    const verificacionFecha = await collection.countDocuments({ fechaNacimiento: { $exists: true } });
    const verificacionPromedio = await collection.countDocuments({ promedio: { $exists: true } });

    console.log(`\n🔍 Verificación post-migración:`);
    console.log(`   - Documentos con fechaNacimiento: ${verificacionFecha}`);
    console.log(`   - Documentos con promedio: ${verificacionPromedio}`);

    if (verificacionFecha === 0 && verificacionPromedio === 0) {
      console.log('\n✅ ¡Migración verificada! Los campos fueron eliminados correctamente.');
    } else {
      console.log('\n⚠️  Advertencia: Algunos documentos aún contienen los campos.');
    }

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar migración
eliminarCamposObsoletos();
