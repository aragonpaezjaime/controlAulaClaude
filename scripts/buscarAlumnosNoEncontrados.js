require('dotenv').config();
const mongoose = require('mongoose');
const Alumno = require('../src/models/Alumno');

async function buscarAlumnosNoEncontrados() {
    try {
        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB\n');

        // Alumnos que no se encontraron en la importación de Plickers
        const alumnosNoEncontrados = [
            'GABRIEL BARRAZA CARRANZA',
            'NATSUMI VALENTINA HERRERA MILLAN',
            'VIRIDIANA JOHANA MEDINA URREA'
        ];

        console.log('🔍 Buscando los 3 alumnos que no se encontraron en la importación:\n');

        for (const nombreBuscado of alumnosNoEncontrados) {
            console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`Buscando: "${nombreBuscado}"`);
            console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

            // Normalizar el texto buscado
            const normalizarTexto = (texto) => {
                return texto
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '');
            };

            const nombreNormalizado = normalizarTexto(nombreBuscado);

            // Buscar en todos los alumnos
            const todosAlumnos = await Alumno.find({});
            let encontrado = false;

            for (const alumno of todosAlumnos) {
                const nombreAlumnoBD = normalizarTexto(alumno.nombreCompleto);

                // Buscar coincidencia exacta
                if (nombreAlumnoBD === nombreNormalizado) {
                    console.log(`✅ ENCONTRADO (coincidencia exacta):`);
                    console.log(`   Nombre en BD: "${alumno.nombreCompleto}"`);
                    console.log(`   ID: ${alumno._id}`);
                    console.log(`   XP: ${alumno.xp}`);
                    console.log(`   HP: ${alumno.salud}`);
                    encontrado = true;
                    break;
                }
            }

            if (!encontrado) {
                console.log(`❌ NO ENCONTRADO - Buscando coincidencias parciales...`);

                // Buscar coincidencias parciales
                const palabrasBuscadas = nombreNormalizado.split(' ');
                const coincidenciasParciales = [];

                for (const alumno of todosAlumnos) {
                    const nombreAlumnoBD = normalizarTexto(alumno.nombreCompleto);
                    let palabrasCoincidentes = 0;

                    for (const palabra of palabrasBuscadas) {
                        if (nombreAlumnoBD.includes(palabra)) {
                            palabrasCoincidentes++;
                        }
                    }

                    if (palabrasCoincidentes >= 2) {
                        coincidenciasParciales.push({
                            alumno: alumno,
                            coincidencias: palabrasCoincidentes,
                            total: palabrasBuscadas.length
                        });
                    }
                }

                if (coincidenciasParciales.length > 0) {
                    console.log(`\n   Posibles coincidencias (${coincidenciasParciales.length}):`);
                    coincidenciasParciales
                        .sort((a, b) => b.coincidencias - a.coincidencias)
                        .slice(0, 5)
                        .forEach((match, index) => {
                            console.log(`   ${index + 1}. "${match.alumno.nombreCompleto}" - ${match.coincidencias}/${match.total} palabras`);
                        });
                } else {
                    console.log(`   No se encontraron coincidencias parciales`);
                }
            }
        }

        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        // Cerrar conexión
        await mongoose.connection.close();
        console.log('✅ Búsqueda completada');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

buscarAlumnosNoEncontrados();
