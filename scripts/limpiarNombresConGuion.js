require('dotenv').config();
const mongoose = require('mongoose');
const Alumno = require('../src/models/Alumno');

async function limpiarNombresConGuion() {
    try {
        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB');

        // Buscar todos los alumnos con "-", "…" u otros caracteres especiales en nombre o apellidos
        // El carácter "…" es el ellipsis Unicode (U+2026)
        const alumnos = await Alumno.find({
            $or: [
                { nombre: { $regex: /[-….]/ } },
                { apellidos: { $regex: /[-….]/ } }
            ]
        });

        console.log(`\n📊 Encontrados ${alumnos.length} alumnos con caracteres especiales ("-", "…", ".") en sus nombres:\n`);

        if (alumnos.length === 0) {
            console.log('✅ No hay alumnos con caracteres especiales en sus nombres');
            process.exit(0);
        }

        // Mostrar alumnos encontrados
        alumnos.forEach((alumno, index) => {
            console.log(`${index + 1}. ID: ${alumno._id}`);
            console.log(`   Nombre: "${alumno.nombre}"`);
            console.log(`   Apellidos: "${alumno.apellidos}"`);
            console.log(`   Nombre completo: "${alumno.nombreCompleto}"`);
            console.log('');
        });

        console.log('\n🔧 Limpiando nombres...\n');

        let actualizados = 0;

        for (const alumno of alumnos) {
            const nombreAnterior = alumno.nombre;
            const apellidosAnterior = alumno.apellidos;
            const nombreCompletoAnterior = alumno.nombreCompleto;

            // Limpiar guiones, puntos suspensivos y puntos
            // Reemplaza: "-", "…" (ellipsis Unicode U+2026), ".", "..", "...", "...."
            alumno.nombre = alumno.nombre
                .replace(/-/g, '')           // Guiones
                .replace(/…/g, '')           // Ellipsis Unicode (U+2026)
                .replace(/\.+/g, '')         // Todos los puntos (uno o más)
                .replace(/\s+/g, ' ')        // Múltiples espacios a uno solo
                .trim();

            alumno.apellidos = alumno.apellidos
                .replace(/-/g, '')
                .replace(/…/g, '')
                .replace(/\.+/g, '')
                .replace(/\s+/g, ' ')
                .trim();

            // Recalcular nombreCompleto (esto debería hacerse automáticamente con el virtual)
            // Pero por si acaso, lo guardamos manualmente
            await alumno.save();

            actualizados++;
            console.log(`✅ Actualizado:`);
            console.log(`   Antes: "${nombreCompletoAnterior}"`);
            console.log(`   Después: "${alumno.nombreCompleto}"`);
            console.log('');
        }

        console.log(`\n✅ Limpieza completada: ${actualizados} alumnos actualizados`);

        // Cerrar conexión
        await mongoose.connection.close();
        console.log('✅ Conexión cerrada');

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

limpiarNombresConGuion();
