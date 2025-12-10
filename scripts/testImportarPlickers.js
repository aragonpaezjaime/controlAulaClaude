const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testImportarPlickers() {
    try {
        console.log('🧪 Iniciando prueba de importación de Plickers...\n');

        // Verificar que existe el archivo CSV
        const csvPath = path.join(__dirname, '..', 'plicker.csv');
        if (!fs.existsSync(csvPath)) {
            console.error('❌ No se encontró el archivo plicker.csv');
            process.exit(1);
        }

        console.log(`📄 Archivo encontrado: ${csvPath}`);
        console.log(`📊 Tamaño: ${fs.statSync(csvPath).size} bytes\n`);

        // Crear FormData
        const form = new FormData();
        form.append('archivo', fs.createReadStream(csvPath));

        // Hacer la petición
        const response = await fetch('http://localhost:3000/api/importar/plickers', {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        const data = await response.json();

        console.log('📡 Respuesta del servidor:\n');
        console.log(JSON.stringify(data, null, 2));

        if (data.success) {
            console.log('\n✅ Importación exitosa!');
            console.log(`\n📊 Resumen:`);
            console.log(`  • Procesados: ${data.datos.procesados}`);
            console.log(`  • Actualizados: ${data.datos.actualizados}`);
            console.log(`  • Errores: ${data.datos.errores}`);

            if (data.datos.noEncontrados && data.datos.noEncontrados.length > 0) {
                console.log(`\n⚠️ No encontrados (${data.datos.noEncontrados.length}):`);
                data.datos.noEncontrados.forEach(alumno => {
                    console.log(`  • ${alumno.nombre} (${alumno.score} pts)`);
                });
            }
        } else {
            console.log('\n❌ Error en la importación:', data.mensaje);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Ejecutar el test
testImportarPlickers();
