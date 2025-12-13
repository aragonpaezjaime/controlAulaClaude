require('dotenv').config();
const mongoose = require('mongoose');
const Alumno = require('../src/models/Alumno');
const Ajuste = require('../src/models/Ajuste');
const Insignia = require('../src/models/Insignia');

async function verificarModelos() {
  try {
    console.log('✅ Conectando a MongoDB...\n');
    await mongoose.connect(process.env.MONGODB_URI);

    // Verificar Ajuste
    console.log('📋 VERIFICANDO MODELO AJUSTE:\n');
    const ajuste = await Ajuste.findOne({}).populate('alumno', 'nombre apellidos');

    if (ajuste) {
      console.log('Ejemplo de ajuste:');
      console.log('  Alumno:', ajuste.alumno?.nombre || 'No poblado');
      console.log('  Tipo:', ajuste.tipo);
      console.log('  Cantidad:', ajuste.cantidad);
      console.log('  Motivo:', ajuste.motivo);
      console.log('  Observaciones:', ajuste.observaciones || '(vacío)');
      console.log('\n  🆕 NUEVOS CAMPOS:');
      console.log('  Comentario para alumno:', ajuste.comentarioAlumno || '(no definido)');
      console.log('  Visible para alumno:', ajuste.visibleParaAlumno !== undefined ? ajuste.visibleParaAlumno : 'true (default)');
    } else {
      console.log('⚠️  No se encontraron ajustes en la BD');
    }

    // Verificar esquema del modelo Ajuste
    console.log('\n🔍 CAMPOS DEL ESQUEMA AJUSTE:');
    const pathsAjuste = Ajuste.schema.paths;
    Object.keys(pathsAjuste).forEach(path => {
      if (!path.startsWith('_')) {
        console.log('  -', path);
      }
    });

    // Verificar modelo Insignia
    console.log('\n\n📋 VERIFICANDO MODELO INSIGNIA:\n');
    const countInsignias = await Insignia.countDocuments({});
    console.log('Total de insignias en BD:', countInsignias);

    console.log('\n🔍 CAMPOS DEL ESQUEMA INSIGNIA:');
    const pathsInsignia = Insignia.schema.paths;
    Object.keys(pathsInsignia).forEach(path => {
      if (!path.startsWith('_')) {
        console.log('  -', path);
      }
    });

    await mongoose.disconnect();
    console.log('\n✅ Verificación completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
}

verificarModelos();
