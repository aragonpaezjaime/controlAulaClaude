// Script para actualizar las materias de los grupos reales
require('dotenv').config();
const mongoose = require('mongoose');
const Grupo = require('../src/models/Grupo');

// Mapeo de grupos a materias
const materiasGrupos = {
  '1B': 'Tecnología 1',
  '2A': 'Física Elemental',
  '2B': 'Tecnología 2',
  '2C': 'Física Elemental',
  '2D': 'Física Elemental',
  '2H': 'Física Elemental',
  '3B': 'Tecnología 3',
  '3I': 'Tecnología 3'
};

async function actualizarMaterias() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    console.log('📚 Actualizando materias de grupos...\n');

    for (const [grupoId, materia] of Object.entries(materiasGrupos)) {
      const grado = parseInt(grupoId[0]);
      const grupo = grupoId.substring(1);

      const resultado = await Grupo.findOneAndUpdate(
        {
          grado: grado,
          grupo: grupo,
          cicloEscolar: '2025-2026'
        },
        { materia: materia },
        { new: true }
      );

      if (resultado) {
        console.log(`   ✅ ${resultado.grado}°${resultado.grupo} → ${materia}`);
      } else {
        console.log(`   ⚠️  No se encontró el grupo ${grado}°${grupo}`);
      }
    }

    console.log('\n✨ ¡Materias actualizadas exitosamente!\n');

    // Mostrar resumen final
    console.log('📊 RESUMEN DE GRUPOS:');
    const grupos = await Grupo.find({ cicloEscolar: '2025-2026' })
      .sort({ grado: 1, grupo: 1 });

    for (const grupo of grupos) {
      console.log(`   ${grupo.grado}°${grupo.grupo} - ${grupo.materia}`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Conexión cerrada');
  }
}

actualizarMaterias();
