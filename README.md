# Sistema de Control de Aula

Sistema backend para registro de eventos del aula (asistencias, salidas, indisciplina, etc.) desarrollado con Node.js, Express y MongoDB.

## 🎯 Características

- **Gestión de Grupos**: Crear y administrar grupos escolares
- **Gestión de Alumnos**: Registro completo de estudiantes por grupo
- **Registro de Eventos**:
  - ✅ Asistencia (Presente, Ausente, Retardo, Justificada)
  - 🚻 Salidas al baño con control de tiempo
  - 🏥 Salidas a enfermería con seguimiento
  - ⚠️ Registro de indisciplina con notificaciones
  - 📝 Eventos personalizados

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- MongoDB (local o MongoDB Atlas)
- npm o yarn

## 🚀 Instalación

1. **Instalar dependencias**:
```bash
npm install
```

2. **Configurar variables de entorno**:
Edita el archivo `.env` y configura tu conexión a MongoDB:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/control-aula
NODE_ENV=development
```

3. **Iniciar MongoDB local** (si usas MongoDB local):
```bash
mongod
```

4. **Iniciar el servidor**:
```bash
# Modo desarrollo (con reinicio automático)
npm run dev

# Modo producción
npm start
```

## 📚 Estructura del Proyecto

```
controlAulaClaude/
├── src/
│   ├── models/          # Modelos de Mongoose
│   │   ├── Grupo.js     # Esquema de grupos escolares
│   │   ├── Alumno.js    # Esquema de alumnos
│   │   └── Evento.js    # Esquema de eventos (con discriminadores)
│   ├── controllers/     # Lógica de negocio
│   ├── routes/          # Rutas de la API
│   ├── config/          # Configuraciones
│   └── app.js           # Configuración de Express
├── .env                 # Variables de entorno
├── server.js            # Punto de entrada
└── package.json
```

## 🔌 API Endpoints

### Grupos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/grupos` | Crear grupo |
| GET | `/api/grupos` | Obtener todos los grupos |
| GET | `/api/grupos/:id` | Obtener grupo por ID |
| PUT | `/api/grupos/:id` | Actualizar grupo |
| DELETE | `/api/grupos/:id` | Desactivar grupo |
| GET | `/api/grupos/:id/alumnos` | Obtener alumnos del grupo |

### Alumnos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/alumnos` | Crear alumno |
| GET | `/api/alumnos` | Obtener todos los alumnos |
| GET | `/api/alumnos/:id` | Obtener alumno por ID |
| GET | `/api/alumnos/matricula/:matricula` | Buscar por matrícula |
| PUT | `/api/alumnos/:id` | Actualizar alumno |
| DELETE | `/api/alumnos/:id` | Desactivar alumno |
| PATCH | `/api/alumnos/:id/cambiar-grupo` | Cambiar de grupo |

### Eventos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/eventos` | Obtener todos los eventos |
| GET | `/api/eventos/alumno/:alumnoId` | Eventos de un alumno |
| POST | `/api/eventos/asistencia` | Registrar asistencia |
| POST | `/api/eventos/salida-bano` | Registrar salida al baño |
| PATCH | `/api/eventos/salida-bano/:id/regreso` | Registrar regreso |
| POST | `/api/eventos/enfermeria` | Registrar salida a enfermería |
| PATCH | `/api/eventos/enfermeria/:id` | Actualizar enfermería |
| POST | `/api/eventos/indisciplina` | Registrar indisciplina |
| PATCH | `/api/eventos/indisciplina/:id/notificar` | Notificar tutor |
| POST | `/api/eventos/personalizado` | Evento personalizado |

## 📝 Ejemplos de Uso

### Crear un grupo

```bash
curl -X POST http://localhost:3000/api/grupos \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "3A",
    "nivel": "Secundaria",
    "grado": 3,
    "cicloEscolar": "2024-2025",
    "turno": "Matutino",
    "capacidad": 40
  }'
```

### Registrar un alumno

```bash
curl -X POST http://localhost:3000/api/alumnos \
  -H "Content-Type: application/json" \
  -d '{
    "matricula": "A12345",
    "nombre": "Juan",
    "apellidoPaterno": "Pérez",
    "apellidoMaterno": "García",
    "grupo": "ID_DEL_GRUPO",
    "contacto": {
      "email": "tutor@email.com",
      "telefono": "5512345678",
      "nombreTutor": "María García"
    }
  }'
```

### Registrar asistencia

```bash
curl -X POST http://localhost:3000/api/eventos/asistencia \
  -H "Content-Type: application/json" \
  -d '{
    "alumno": "ID_DEL_ALUMNO",
    "estado": "Presente"
  }'
```

### Registrar asistencia justificada

```bash
curl -X POST http://localhost:3000/api/eventos/asistencia \
  -H "Content-Type: application/json" \
  -d '{
    "alumno": "ID_DEL_ALUMNO",
    "estado": "Justificada",
    "justificante": "Consulta médica - Dr. López"
  }'
```

### Registrar salida al baño

```bash
curl -X POST http://localhost:3000/api/eventos/salida-bano \
  -H "Content-Type: application/json" \
  -d '{
    "alumno": "ID_DEL_ALUMNO"
  }'
```

### Registrar indisciplina

```bash
curl -X POST http://localhost:3000/api/eventos/indisciplina \
  -H "Content-Type: application/json" \
  -d '{
    "alumno": "ID_DEL_ALUMNO",
    "descripcion": "Uso de celular durante clase",
    "tipo": "Uso de celular",
    "gravedad": "Leve",
    "accionTomada": "Advertencia verbal"
  }'
```

## 🗄️ Esquemas de Base de Datos

### Modelo Grupo
- nombre, nivel, grado, cicloEscolar, turno, capacidad, activo

### Modelo Alumno
- matricula, nombre, apellidos, grupo (ref), fechaNacimiento, contacto, activo

### Modelo Evento (con discriminadores)
- **Base**: alumno (ref), fecha, observaciones, tipoEvento
- **Asistencia**: estado (Presente/Ausente/Retardo/Justificada), minutosRetardo, justificante
- **SalidaBano**: horaSalida, horaRegreso, duracionMinutos (virtual)
- **SalidaEnfermeria**: motivo, descripcion, horaSalida, horaRegreso, regreso, atencionRecibida
- **Indisciplina**: descripcion, tipo, gravedad, accionTomada, tutorNotificado
- **Personalizado**: titulo, categoria, descripcion, datosAdicionales

## 🔧 Tecnologías Utilizadas

- **Node.js**: Entorno de ejecución
- **Express**: Framework web
- **MongoDB**: Base de datos NoSQL
- **Mongoose**: ODM para MongoDB

## 📖 Aprendizaje

Este proyecto está diseñado como herramienta de aprendizaje. Incluye:
- ✅ Comentarios en español explicando cada sección
- ✅ Arquitectura MVC (Modelo-Vista-Controlador)
- ✅ Validaciones de datos con Mongoose
- ✅ Manejo de errores consistente
- ✅ Relaciones entre documentos
- ✅ Discriminadores de Mongoose para herencia
- ✅ Campos virtuales y métodos de instancia
- ✅ Índices para optimización

## 🚧 Próximas Funcionalidades

- [ ] Autenticación con JWT
- [ ] Reportes y estadísticas
- [ ] Exportación a Excel/PDF
- [ ] Sistema multi-usuario (varios maestros)
- [ ] Dashboard frontend

## 📄 Licencia

ISC

---

Desarrollado como proyecto de aprendizaje para docentes
