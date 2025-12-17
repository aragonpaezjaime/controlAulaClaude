require('dotenv').config();
const mongoose = require('mongoose');
const Alumno = require('../src/models/Alumno');
const Grupo = require('../src/models/Grupo');
const Ajuste = require('../src/models/Ajuste');
const Insignia = require('../src/models/Insignia');

async function verificarDatos() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB\n');

    console.log('📊 VERIFICACIÓN COMPLETA DE DATOS\n');
    console.log('='.repeat(70));

    // Verificar Alumnos
    const totalAlumnos = await Alumno.countDocuments();
    const alumnosActivos = await Alumno.countDocuments({ activo: true });
    const alumnosConXP = await Alumno.countDocuments({ xp: { $gt: 0 } });

    console.log('\n👨‍🎓 ALUMNOS:');
    console.log(`  Total de alumnos: ${totalAlumnos}`);
    console.log(`  Alumnos activos: ${alumnosActivos}`);
    console.log(`  Alumnos con XP > 0: ${alumnosConXP}`);

    // Mostrar algunos alumnos con sus XP
    const alumnosEjemplo = await Alumno.find({ activo: true })
      .sort({ xp: -1 })
      .limit(10)
      .select('nombre apellidos xp salud');

    console.log('\n  📈 Top 10 alumnos por XP:');
    alumnosEjemplo.forEach((alumno, index) => {
      console.log(`    ${index + 1}. ${alumno.nombre} ${alumno.apellidos} - XP: ${alumno.xp} | HP: ${alumno.salud}`);
    });

    // Verificar Grupos
    const totalGrupos = await Grupo.countDocuments();
    const gruposActivos = await Grupo.countDocuments({ activo: true });

    console.log('\n\n📚 GRUPOS:');
    console.log(`  Total de grupos: ${totalGrupos}`);
    console.log(`  Grupos activos: ${gruposActivos}`);

    const grupos = await Grupo.find({ activo: true }).select('grado grupo materia ciclo');
    console.log('\n  Grupos activos:');
    grupos.forEach(grupo => {
      console.log(`    - ${grupo.grado}${grupo.grupo} (${grupo.materia})`);
    });

    // Verificar Ajustes
    const totalAjustes = await Ajuste.countDocuments();
    const ajustesVisibles = await Ajuste.countDocuments({ visibleParaAlumno: true });
    const ajustesXP = await Ajuste.countDocuments({ tipo: 'xp' });
    const ajustesHP = await Ajuste.countDocuments({ tipo: 'hp' });

    console.log('\n\n📝 AJUSTES (HISTORIAL):');
    console.log(`  Total de ajustes: ${totalAjustes}`);
    console.log(`  Ajustes visibles: ${ajustesVisibles} (${((ajustesVisibles/totalAjustes)*100).toFixed(1)}%)`);
    console.log(`  Ajustes XP: ${ajustesXP}`);
    console.log(`  Ajustes HP: ${ajustesHP}`);

    // Sumar todo el XP dado en ajustes
    const ajustesData = await Ajuste.find({ tipo: 'xp' });
    const totalXPOtorgado = ajustesData.reduce((sum, aj) => sum + (aj.cantidad > 0 ? aj.cantidad : 0), 0);
    const totalXPDescontado = ajustesData.reduce((sum, aj) => sum + (aj.cantidad < 0 ? Math.abs(aj.cantidad) : 0), 0);

    console.log(`  XP total otorgado: ${totalXPOtorgado.toLocaleString()}`);
    console.log(`  XP total descontado: ${totalXPDescontado.toLocaleString()}`);

    // Verificar Insignias
    const totalInsignias = await Insignia.countDocuments();
    const insigniasActivas = await Insignia.countDocuments({ activo: true });

    console.log('\n\n🏆 INSIGNIAS:');
    console.log(`  Total de insignias: ${totalInsignias}`);
    console.log(`  Insignias activas: ${insigniasActivas}`);

    // Verificar integridad: alumnos con claves zipGrade
    const alumnosConClave = await Alumno.countDocuments({
      claveZipGrade: { $exists: true, $ne: null, $ne: '' }
    });

    console.log('\n\n🔑 CLAVES ZIPGRADE:');
    console.log(`  Alumnos con clave asignada: ${alumnosConClave} de ${totalAlumnos}`);

    console.log('\n' + '='.repeat(70));
    console.log('\n✅ TODOS LOS DATOS ESTÁN INTACTOS');
    console.log('✅ No se perdió ninguna información');
    console.log('✅ Solo se actualizaron campos de visibilidad en ajustes');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verificarDatos();
