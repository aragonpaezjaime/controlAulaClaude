require('dotenv').config();
const mongoose = require('mongoose');
const Ajuste = require('../src/models/Ajuste');
const Alumno = require('../src/models/Alumno');

async function diagnosticarHistorial() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    // Buscar varios alumnos
    const alumnos = await Alumno.find({ activo: true }).limit(5);

    for (const alumno of alumnos) {
      console.log(`\n${'='.repeat(70)}`);
      console.log(`📊 Alumno: ${alumno.nombreCompleto}`);
      console.log(`🆔 ID: ${alumno._id}`);
      console.log(`⭐ XP Actual: ${alumno.xp} | ❤️ HP Actual: ${alumno.salud}`);

      // Buscar ajustes visibles
      const ajustesVisibles = await Ajuste.find({
        alumno: alumno._id,
        visibleParaAlumno: true
      }).sort({ fecha: -1 }).limit(5);

      console.log(`\n📈 Ajustes visibles: ${ajustesVisibles.length}`);

      if (ajustesVisibles.length > 0) {
        ajustesVisibles.forEach((ajuste, index) => {
          console.log(`\n  --- Ajuste #${index + 1} ---`);
          console.log(`  Tipo: ${ajuste.tipo.toUpperCase()} | Cantidad: ${ajuste.cantidad > 0 ? '+' : ''}${ajuste.cantidad}`);
          console.log(`  Motivo: "${ajuste.motivo}"`);
          console.log(`  comentarioAlumno: "${ajuste.comentarioAlumno || 'VACÍO'}"`);
          console.log(`  Observaciones: "${ajuste.observaciones || 'VACÍO'}"`);
          console.log(`  Valores: ${ajuste.valorAnterior} → ${ajuste.valorDespues}`);
          console.log(`  Visible: ${ajuste.visibleParaAlumno}`);
          console.log(`  Fecha: ${ajuste.fecha.toLocaleString('es-MX')}`);
        });
      } else {
        console.log('  ⚠️ No se encontraron ajustes visibles');
      }
    }

    // Estadísticas generales
    console.log(`\n${'='.repeat(70)}`);
    console.log('📊 ESTADÍSTICAS GENERALES');
    console.log(`${'='.repeat(70)}`);

    const totalAjustes = await Ajuste.countDocuments();
    const ajustesSinComentario = await Ajuste.countDocuments({
      $or: [
        { comentarioAlumno: null },
        { comentarioAlumno: '' },
        { comentarioAlumno: { $exists: false } }
      ]
    });
    const ajustesVisibles = await Ajuste.countDocuments({ visibleParaAlumno: true });
    const ajustesOcultos = await Ajuste.countDocuments({ visibleParaAlumno: false });

    console.log(`\nTotal de ajustes en BD: ${totalAjustes}`);
    console.log(`Ajustes visibles: ${ajustesVisibles}`);
    console.log(`Ajustes ocultos: ${ajustesOcultos}`);
    console.log(`Ajustes sin comentarioAlumno: ${ajustesSinComentario}`);
    console.log(`Porcentaje sin comentario: ${((ajustesSinComentario / totalAjustes) * 100).toFixed(1)}%`);

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

diagnosticarHistorial();
