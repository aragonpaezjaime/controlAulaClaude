// Script para eliminar solo los grupos de prueba
require('dotenv').config();
const mongoose = require('mongoose');
const Grupo = require('../src/models/Grupo');
const Alumno = require('../src/models/Alumno');

// IDs de grupos que NO son reales (grupos de prueba)
const gruposPrueba = [
  { grado: 1, grupo: 'C' },  // Tecnología de prueba
  { grado: 2, grupo: 'B', materia: 'Robótica' },  // Duplicado de prueba
  { grado: 3, grupo: 'A', materia: 'Ciencias III (Química)' },
  { grado: 3, grupo: 'A', materia: 'Robótica' }
];

async function limpiarGruposPrueba() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado\n');

    console.log('🗑️  Eliminando grupos de prueba...\n');

    for (const grupoPrueba of gruposPrueba) {
      const filtro = {
        grado: grupoPrueba.grado,
        grupo: grupoPrueba.grupo,
        cicloEscolar: '2025-2026'
      };

      if (grupoPrueba.materia) {
        filtro.materia = grupoPrueba.materia;
      }

      const grupo = await Grupo.findOne(filtro);

      if (grupo) {
        // Eliminar alumnos de ese grupo (si es de prueba)
        const alumnosEliminados = await Alumno.deleteMany({ grupo: grupo._id });
        console.log(`   🗑️  ${alumnosEliminados.deletedCount} alumnos eliminados de ${grupo.grado}°${grupo.grupo} - ${grupo.materia}`);

        // Eliminar el grupo
        await Grupo.findByIdAndDelete(grupo._id);
        console.log(`   ✅ Grupo ${grupo.grado}°${grupo.grupo} - ${grupo.materia} eliminado`);
      }
    }

    console.log('\n📊 GRUPOS RESTANTES (REALES):');
    const gruposReales = await Grupo.find({ cicloEscolar: '2025-2026' })
      .sort({ grado: 1, grupo: 1 });

    for (const grupo of gruposReales) {
      const numAlumnos = await Alumno.countDocuments({ grupo: grupo._id });
      console.log(`   ${grupo.grado}°${grupo.grupo} - ${grupo.materia} (${numAlumnos} alumnos)`);
    }

    const totalAlumnos = await Alumno.countDocuments();
    console.log(`\n   Total: ${gruposReales.length} grupos, ${totalAlumnos} alumnos`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Conexión cerrada');
  }
}

limpiarGruposPrueba();
