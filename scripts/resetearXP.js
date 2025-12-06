require("dotenv").config();
const mongoose = require("mongoose");
const Alumno = require("../src/models/Alumno");

// ==============================================
// SCRIPT PARA RESETEAR XP DE TODOS LOS ALUMNOS
// ==============================================
// Este script pone el XP de todos los alumnos en 0
// El docente ahora otorgará XP manualmente según tareas y prácticas
// ==============================================

const resetearXP = async () => {
  try {
    // Conectar a MongoDB
    console.log("🔄 Conectando a MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Conectado a MongoDB\n");

    // Obtener todos los alumnos activos
    const alumnos = await Alumno.find({ activo: true });
    console.log(`📊 Se encontraron ${alumnos.length} alumnos activos\n`);

    // Mostrar XP actual de cada alumno
    console.log("📋 XP ACTUAL DE LOS ALUMNOS:");
    console.log("=".repeat(80));
    alumnos.forEach((alumno) => {
      const nivel = Math.floor(alumno.xp / 100) + 1;
      console.log(
        `${alumno.nombre} ${alumno.apellidos}: ${alumno.xp} XP (Nivel ${nivel})`
      );
    });
    console.log("=".repeat(80) + "\n");

    // Preguntar confirmación
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.question(
      "⚠️  ¿Estás seguro de que quieres resetear el XP a 0 para TODOS los alumnos? (sí/no): ",
      async (respuesta) => {
        if (respuesta.toLowerCase() === "sí" || respuesta.toLowerCase() === "si") {
          console.log("\n🔄 Reseteando XP de todos los alumnos...\n");

          // Resetear XP a 0 para todos los alumnos
          const resultado = await Alumno.updateMany(
            { activo: true },
            { $set: { xp: 0 } }
          );

          console.log(`✅ XP reseteado exitosamente para ${resultado.modifiedCount} alumnos\n`);

          // Verificar los cambios
          console.log("📋 VERIFICACIÓN - XP DESPUÉS DEL RESETEO:");
          console.log("=".repeat(80));
          const alumnosActualizados = await Alumno.find({ activo: true });
          alumnosActualizados.forEach((alumno) => {
            const nivel = Math.floor(alumno.xp / 100) + 1;
            console.log(
              `${alumno.nombre} ${alumno.apellidos}: ${alumno.xp} XP (Nivel ${nivel})`
            );
          });
          console.log("=".repeat(80) + "\n");

          console.log("✨ ¡Reseteo completado! Todos los alumnos inician desde 0 XP");
          console.log("💡 Ahora puedes otorgar XP manualmente desde el dashboard según tareas y prácticas\n");
        } else {
          console.log("\n❌ Operación cancelada. No se modificó ningún dato.\n");
        }

        readline.close();
        await mongoose.connection.close();
        console.log("👋 Desconectado de MongoDB");
        process.exit(0);
      }
    );
  } catch (error) {
    console.error("❌ Error al resetear XP:", error);
    process.exit(1);
  }
};

// Ejecutar el script
resetearXP();
