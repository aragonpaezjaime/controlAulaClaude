require('dotenv').config();
const mongoose = require('mongoose');
const Alumno = require('../src/models/Alumno');

async function corregirNombreInvertido() {
    try {
        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB\n');

        // Buscar alumna con nombre invertido
        const alumno = await Alumno.findOne({
            nombreCompleto: 'Johana Viridiana Medina Urrea'
        });

        if (!alumno) {
            console.log('❌ No se encontró a Johana Viridiana Medina Urrea');
            process.exit(1);
        }

        console.log('📋 Alumno encontrado:');
        console.log(`   Nombre actual: "${alumno.nombre}"`);
        console.log(`   Apellidos: "${alumno.apellidos}"`);
        console.log(`   Nombre completo: "${alumno.nombreCompleto}"`);
        console.log(`   ID: ${alumno._id}\n`);

        // Corregir el nombre
        alumno.nombre = 'Viridiana Johana';

        await alumno.save();

        console.log('✅ Nombre corregido:');
        console.log(`   Nombre nuevo: "${alumno.nombre}"`);
        console.log(`   Nombre completo: "${alumno.nombreCompleto}"`);

        // Buscar si existe Gabriel Barraza
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔍 Buscando variaciones de "Gabriel Barraza"...\n');

        const gabrieles = await Alumno.find({
            $or: [
                { nombre: { $regex: /gabriel/i } },
                { apellidos: { $regex: /barraza/i } }
            ]
        });

        if (gabrieles.length > 0) {
            console.log(`Encontrados ${gabrieles.length} alumnos con "Gabriel" o "Barraza":`);
            gabrieles.forEach((g, index) => {
                console.log(`${index + 1}. "${g.nombreCompleto}" - ID: ${g._id}`);
            });
        } else {
            console.log('❌ No se encontró ningún alumno con "Gabriel" o "Barraza"');
        }

        // Cerrar conexión
        await mongoose.connection.close();
        console.log('\n✅ Proceso completado');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

corregirNombreInvertido();
