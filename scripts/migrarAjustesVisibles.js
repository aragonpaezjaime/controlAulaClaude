require('dotenv').config();
const mongoose = require('mongoose');
const Ajuste = require('../src/models/Ajuste');

async function migrarAjustesVisibles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    console.log('🔍 Buscando ajustes que necesitan migración...\n');

    // Contar ajustes sin visibleParaAlumno o con valor false/null
    const ajustesSinVisible = await Ajuste.countDocuments({
      $or: [
        { visibleParaAlumno: { $exists: false } },
        { visibleParaAlumno: null },
        { visibleParaAlumno: false }
      ]
    });

    console.log(`📊 Ajustes que necesitan migración: ${ajustesSinVisible}`);

    if (ajustesSinVisible === 0) {
      console.log('✅ Todos los ajustes ya están correctamente configurados');
      process.exit(0);
    }

    // Migrar ajustes: establecer visibleParaAlumno = true
    console.log('\n🔧 Actualizando campo visibleParaAlumno...');
    const resultadoVisible = await Ajuste.updateMany(
      {
        $or: [
          { visibleParaAlumno: { $exists: false } },
          { visibleParaAlumno: null },
          { visibleParaAlumno: false }
        ]
      },
      {
        $set: { visibleParaAlumno: true }
      }
    );

    console.log(`✅ Actualizados ${resultadoVisible.modifiedCount} ajustes con visibleParaAlumno: true`);

    // Contar ajustes sin comentarioAlumno
    const ajustesSinComentario = await Ajuste.countDocuments({
      $or: [
        { comentarioAlumno: { $exists: false } },
        { comentarioAlumno: null },
        { comentarioAlumno: '' }
      ]
    });

    console.log(`\n📊 Ajustes sin comentarioAlumno: ${ajustesSinComentario}`);

    if (ajustesSinComentario > 0) {
      console.log('🔧 Actualizando campo comentarioAlumno...');

      // Obtener ajustes sin comentario y actualizarlos uno por uno
      const ajustes = await Ajuste.find({
        $or: [
          { comentarioAlumno: { $exists: false } },
          { comentarioAlumno: null },
          { comentarioAlumno: '' }
        ]
      });

      let actualizados = 0;
      for (const ajuste of ajustes) {
        // Usar observaciones como comentario, o motivo como fallback
        const comentario = ajuste.observaciones || ajuste.motivo;

        await Ajuste.updateOne(
          { _id: ajuste._id },
          { $set: { comentarioAlumno: comentario } }
        );
        actualizados++;
      }

      console.log(`✅ Actualizados ${actualizados} ajustes con comentarioAlumno`);
    }

    // Verificar resultado final
    console.log('\n📊 VERIFICACIÓN FINAL:');
    const totalAjustes = await Ajuste.countDocuments();
    const ajustesVisibles = await Ajuste.countDocuments({ visibleParaAlumno: true });
    const ajustesConComentario = await Ajuste.countDocuments({
      comentarioAlumno: { $exists: true, $ne: null, $ne: '' }
    });

    console.log(`Total de ajustes: ${totalAjustes}`);
    console.log(`Ajustes visibles: ${ajustesVisibles} (${((ajustesVisibles / totalAjustes) * 100).toFixed(1)}%)`);
    console.log(`Ajustes con comentario: ${ajustesConComentario} (${((ajustesConComentario / totalAjustes) * 100).toFixed(1)}%)`);

    console.log('\n✅ Migración completada exitosamente');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

migrarAjustesVisibles();
