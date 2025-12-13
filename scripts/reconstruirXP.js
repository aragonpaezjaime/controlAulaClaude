// Script para reconstruir XP desde el historial de ajustes
require('dotenv').config();
const mongoose = require('mongoose');
const Alumno = require('../src/models/Alumno');

async function reconstruirXP() {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado\n');

    const db = mongoose.connection.db;
    const ajustesCollection = db.collection('ajustes');

    console.log('📊 Analizando historial de ajustes...\n');

    // Obtener todos los ajustes con información del alumno
    const ajustes = await ajustesCollection.find({ tipo: 'xp' }).toArray();

    console.log(`Total de ${ajustes.length} ajustes de XP encontrados\n`);

    // Agrupar por alumno (ID antiguo) y calcular XP total
    const xpPorAlumnoAntiguo = {};

    for (const ajuste of ajustes) {
      const alumnoId = ajuste.alumno.toString();
      if (!xpPorAlumnoAntiguo[alumnoId]) {
        xpPorAlumnoAntiguo[alumnoId] = {
          totalXP: 0,
          ajustes: []
        };
      }
      xpPorAlumnoAntiguo[alumnoId].totalXP += ajuste.cantidad;
      xpPorAlumnoAntiguo[alumnoId].ajustes.push(ajuste);
    }

    console.log(`${Object.keys(xpPorAlumnoAntiguo).length} alumnos únicos con ajustes de XP\n`);

    // Intentar mapear por último XP conocido en el ajuste
    console.log('🔄 Reconstruyendo XP de alumnos...\n');

    let alumnosActualizados = 0;
    let errores = 0;

    for (const [alumnoIdAntiguo, datos] of Object.entries(xpPorAlumnoAntiguo)) {
      // Buscar el último ajuste para obtener el XP final
      const ultimoAjuste = datos.ajustes.sort((a, b) =>
        new Date(b.fecha) - new Date(a.fecha)
      )[0];

      if (ultimoAjuste && ultimoAjuste.valorDespues !== undefined) {
        // Buscar alumno actual que tenga XP=0 y pertenezca al grupo correcto
        // Esto es un workaround - idealmente necesitaríamos el nombre del alumno
        const xpFinal = ultimoAjuste.valorDespues;

        console.log(`  Alumno antiguo ${alumnoIdAntiguo}: XP final = ${xpFinal}`);
      }
    }

    console.log('\n⚠️  LIMITACIÓN DETECTADA:');
    console.log('Los ajustes no contienen el nombre del alumno, solo el ID.');
    console.log('No es posible mapear automáticamente con los nuevos IDs.\n');

    console.log('💡 SOLUCIÓN ALTERNATIVA:');
    console.log('¿Tienes un respaldo de la base de datos anterior?');
    console.log('O podemos:');
    console.log('1. Revisar si MongoDB Atlas tiene snapshots automáticos');
    console.log('2. Manualmente ingresar los valores de XP que recuerdes');
    console.log('3. Comenzar de nuevo con XP en 0 (como estaba planeado según el resumen)');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Conexión cerrada');
  }
}

reconstruirXP();
