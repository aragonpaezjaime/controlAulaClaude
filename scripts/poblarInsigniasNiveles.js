const mongoose = require('mongoose');
require('dotenv').config();
const Insignia = require('../src/models/Insignia');

// ============================================
// SCRIPT: Poblar las 6 Insignias de Niveles
// ============================================
// Crea las 6 insignias de niveles (1-6) con sus
// imágenes y privilegios específicos del sistema

const insigniasNiveles = [
  {
    nombre: 'Elite',
    descripcion: 'Nivel más alto: desempeño excepcional y compromiso total',
    icono: '👑',
    imagen: '/images/nivel1.png',
    color: '#FFD700',
    nivel: 1,
    privilegios: [
      'Sale a tomar agua',
      'Puede sentarse en otro lugar',
      'Puede tener su teléfono en la butaca',
      'Puede entregar tarea hasta 3 días después',
      'Puede tener audífonos',
      'Puede ir por alimentos a la tienda y comerlos'
    ],
    categoria: 'especial',
    rareza: 'legendaria',
    activa: true,
    xpRequerido: 8000,
    otorgamientoAutomatico: false,
    criterios: {
      descripcion: 'Otorgamiento manual por el profesor según desempeño excepcional'
    }
  },
  {
    nombre: 'Avanzado',
    descripcion: 'Nivel alto: excelente desempeño y compromiso',
    icono: '⭐',
    imagen: '/images/nivel2.png',
    color: '#C0C0C0',
    nivel: 2,
    privilegios: [
      'Sale a tomar agua',
      'Puede sentarse en otro lugar',
      'Puede tener su teléfono en la butaca',
      'Puede entregar tarea hasta 3 días después',
      'Puede tener audífonos'
    ],
    categoria: 'especial',
    rareza: 'epica',
    activa: true,
    xpRequerido: 6000,
    otorgamientoAutomatico: false,
    criterios: {
      descripcion: 'Otorgamiento manual por el profesor según buen desempeño'
    }
  },
  {
    nombre: 'Competente',
    descripcion: 'Nivel medio-alto: buen desempeño y compromiso constante',
    icono: '🎖️',
    imagen: '/images/nivel3.png',
    color: '#CD7F32',
    nivel: 3,
    privilegios: [
      'Sale a tomar agua',
      'Puede sentarse en otro lugar',
      'Puede tener su teléfono en la butaca',
      'Puede entregar tarea hasta 3 días después'
    ],
    categoria: 'especial',
    rareza: 'rara',
    activa: true,
    xpRequerido: 4000,
    otorgamientoAutomatico: false,
    criterios: {
      descripcion: 'Otorgamiento manual por el profesor'
    }
  },
  {
    nombre: 'Intermedio',
    descripcion: 'Nivel medio: desempeño adecuado',
    icono: '🥉',
    imagen: '/images/nivel4.png',
    color: '#4A90E2',
    nivel: 4,
    privilegios: [
      'Sale a tomar agua',
      'Puede sentarse en otro lugar',
      'Puede tener su teléfono en la butaca'
    ],
    categoria: 'especial',
    rareza: 'comun',
    activa: true,
    xpRequerido: 2000,
    otorgamientoAutomatico: false,
    criterios: {
      descripcion: 'Otorgamiento manual por el profesor'
    }
  },
  {
    nombre: 'Básico',
    descripcion: 'Nivel inicial-medio: desempeño básico',
    icono: '🔰',
    imagen: '/images/nivel5.png',
    color: '#50C878',
    nivel: 5,
    privilegios: [
      'Sale a tomar agua',
      'Puede sentarse en otro lugar'
    ],
    categoria: 'especial',
    rareza: 'comun',
    activa: true,
    xpRequerido: 500,
    otorgamientoAutomatico: false,
    criterios: {
      descripcion: 'Otorgamiento manual por el profesor'
    }
  },
  {
    nombre: 'Inicial',
    descripcion: 'Nivel de inicio: primer privilegio desbloqueado',
    icono: '🌱',
    imagen: '/images/nivel6.png',
    color: '#95A5A6',
    nivel: 6,
    privilegios: [
      'Sale a tomar agua'
    ],
    categoria: 'especial',
    rareza: 'comun',
    activa: true,
    xpRequerido: 0,
    otorgamientoAutomatico: false,
    criterios: {
      descripcion: 'Nivel inicial disponible para todos'
    }
  }
];

async function poblarInsigniasNiveles() {
  try {
    console.log('🔗 Conectando a MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB Atlas\n');

    console.log('🏆 Poblando insignias de niveles...');

    // Verificar si ya existen insignias de niveles
    const insigniasExistentes = await Insignia.find({ nivel: { $exists: true, $ne: null } });

    if (insigniasExistentes.length > 0) {
      console.log(`⚠️  Ya existen ${insigniasExistentes.length} insignias de niveles`);
      console.log('📋 Eliminando insignias existentes de niveles...');
      await Insignia.deleteMany({ nivel: { $exists: true, $ne: null } });
      console.log('✅ Insignias de niveles anteriores eliminadas\n');
    }

    // Insertar las 6 insignias de niveles
    console.log('➕ Insertando las 6 insignias de niveles...\n');

    for (const insigniaData of insigniasNiveles) {
      const insignia = await Insignia.create(insigniaData);
      console.log(`✅ Nivel ${insignia.nivel} - ${insignia.nombre}`);
      console.log(`   📷 Imagen: ${insignia.imagen}`);
      console.log(`   🎯 Privilegios: ${insignia.privilegios.length}`);
      console.log('');
    }

    console.log('✅ ¡Todas las insignias de niveles han sido creadas exitosamente!\n');

    // Mostrar resumen
    const todasInsignias = await Insignia.find({ nivel: { $exists: true, $ne: null } })
      .sort({ nivel: 1 });

    console.log('📊 RESUMEN DE INSIGNIAS:');
    console.log('═══════════════════════════════════════════════════════════════');
    todasInsignias.forEach(insignia => {
      console.log(`Nivel ${insignia.nivel}: ${insignia.nombre} (${insignia.rareza})`);
      console.log(`  └─ ${insignia.privilegios.length} privilegios | XP requerido: ${insignia.xpRequerido}`);
    });
    console.log('═══════════════════════════════════════════════════════════════');

  } catch (error) {
    console.error('❌ Error al poblar insignias:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Desconectado de MongoDB');
    process.exit(0);
  }
}

// Ejecutar el script
poblarInsigniasNiveles();
