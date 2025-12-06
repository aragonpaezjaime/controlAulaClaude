const mongoose = require('mongoose');

// Configuración de la conexión a MongoDB
const conectarDB = async () => {
  try {
    // Opciones de configuración para la conexión
    const opciones = {
      // useNewUrlParser y useUnifiedTopology ya no son necesarios en Mongoose 6+
      // pero se pueden incluir para compatibilidad con versiones anteriores
    };

    // Conectar a MongoDB usando la URI del archivo .env
    const conexion = await mongoose.connect(process.env.MONGODB_URI, opciones);

    console.log(`✅ MongoDB conectado: ${conexion.connection.host}`);
    console.log(`📊 Base de datos: ${conexion.connection.name}`);

    // Evento cuando se desconecta
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB desconectado');
    });

    // Evento cuando ocurre un error después de la conexión inicial
    mongoose.connection.on('error', (error) => {
      console.error('❌ Error en la conexión de MongoDB:', error);
    });

  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);

    // Terminar el proceso si no se puede conectar a la BD
    // En producción, podrías implementar un sistema de reintentos
    process.exit(1);
  }
};

// Función para cerrar la conexión de forma ordenada
const desconectarDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('✅ Conexión a MongoDB cerrada');
  } catch (error) {
    console.error('❌ Error al cerrar la conexión:', error.message);
  }
};

module.exports = {
  conectarDB,
  desconectarDB
};
