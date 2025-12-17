require('dotenv').config();
const mongoose = require('mongoose');
const Ajuste = require('../src/models/Ajuste');
const Alumno = require('../src/models/Alumno');

async function verificarAjustes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Buscar un alumno cualquiera
    const alumno = await Alumno.findOne({ activo: true });

    if (!alumno) {
      console.log('❌ No se encontró ningún alumno activo');
      process.exit(0);
    }

    console.log('\n📊 Verificando ajustes del alumno:', alumno.nombreCompleto);
    console.log('🆔 ID:', alumno._id);

    // Buscar ajustes del alumno
    const ajustes = await Ajuste.find({ alumno: alumno._id })
      .sort({ fecha: -1 })
      .limit(10);

    console.log(`\n📈 Total de ajustes encontrados: ${ajustes.length}`);

    if (ajustes.length === 0) {
      console.log('⚠️ No se encontraron ajustes para este alumno');
      console.log('Intenta con otro alumno o verifica que se hayan creado ajustes');
    } else {
      console.log('\n🔍 Primeros 5 ajustes:');
      ajustes.slice(0, 5).forEach((ajuste, index) => {
        console.log(`\n--- Ajuste #${index + 1} ---`);
        console.log('Tipo:', ajuste.tipo);
        console.log('Cantidad:', ajuste.cantidad);
        console.log('Motivo:', ajuste.motivo);
        console.log('Observaciones:', ajuste.observaciones || 'Sin observaciones');
        console.log('comentarioAlumno:', ajuste.comentarioAlumno || 'Sin comentario');
        console.log('Visible para alumno:', ajuste.visibleParaAlumno);
        console.log('Valores:', ajuste.valorAnterior, '→', ajuste.valorDespues);
        console.log('Fecha:', ajuste.fecha);
      });
    }

    // Verificar ajustes visibles
    const ajustesVisibles = await Ajuste.find({
      alumno: alumno._id,
      visibleParaAlumno: true
    }).countDocuments();

    console.log(`\n👁️ Ajustes visibles para el alumno: ${ajustesVisibles} de ${ajustes.length}`);

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verificarAjustes();
