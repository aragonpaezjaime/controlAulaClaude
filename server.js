// Cargar variables de entorno desde .env
require("dotenv").config();

// Importar la configuración de la base de datos
const { conectarDB } = require("./src/config/database");

// Importar la aplicación Express configurada
const app = require("./src/app");

// ============================================
// CONFIGURACIÓN DEL SERVIDOR
// ============================================

// Puerto del servidor (desde .env o 3000 por defecto)
const PORT = process.env.PORT || 3000;

// ============================================
// INICIAR EL SERVIDOR
// ============================================

// Función asíncrona para iniciar el servidor
const iniciarServidor = async () => {
  try {
    // 1. Conectar a la base de datos MongoDB
    await conectarDB();
    // 2. Iniciar el servidor Express
    app.listen(PORT, () => {
      console.log("=================================");
      console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🌍 Entorno: ${process.env.NODE_ENV || "development"}`);
      console.log("=================================");
      console.log("Endpoints disponibles:");
      console.log(`  - GET    http://localhost:${PORT}/`);
      console.log(`  - GRUPOS http://localhost:${PORT}/api/grupos`);
      console.log(`  - ALUMNOS http://localhost:${PORT}/api/alumnos`);
      console.log(`  - EVENTOS http://localhost:${PORT}/api/eventos`);
      console.log("=================================");
    });
  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error.message);
    process.exit(1);
  }
};

// Ejecutar la función de inicio
iniciarServidor();

// ============================================
// MANEJO DE SEÑALES DE TERMINACIÓN
// ============================================

// Capturar Ctrl+C para cerrar el servidor de forma ordenada
process.on("SIGINT", async () => {
  console.log("\n⚠️  Cerrando servidor...");
  // Cerrar conexión a MongoDB
  const { desconectarDB } = require("./src/config/database");
  await desconectarDB();
  console.log("👋 Servidor cerrado correctamente");
  process.exit(0);
});

// Capturar errores no manejados
process.on("unhandledRejection", (error) => {
  console.error("❌ Error no manejado:", error);
  process.exit(1);
});
