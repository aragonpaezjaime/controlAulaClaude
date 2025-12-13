# 📚 RESUMEN DEL PROYECTO - Sistema de Control de Aula

**Fecha de creación**: Noviembre 29, 2025
**Última actualización**: Diciembre 12, 2025
**Desarrollador**: Docente en México aprendiendo Node.js
**Propósito**: Sistema gamificado para registrar eventos del aula con puntos XP/HP
**Institución**: Secundaria técnica #50

---

## 🚀 ESTADO ACTUAL DEL PROYECTO

### ✅ Sistema Funcional en Producción

**Backend**:
- Node.js + Express + MongoDB Atlas
- 4 modelos: Grupo, Alumno, Evento, Ajuste
- API REST completa (30+ endpoints)
- Sistema de gamificación XP (0-10,000) y HP
- Sistema de sesiones de clase con contador

**Frontend** (HTML/CSS/JS Vanilla):
- Dashboard interactivo con avatares de robots
- Toma de asistencias (Presente, Ausente, Retardo, Justificado)
- Sistema de audio gaming (15 sonidos)
- Ranking de alumnos por XP
- Historial de eventos con filtros
- Tabla de asistencias tipo calendario
- Registro de salidas (baño, enfermería)
- Sistema disciplinario
- **Importación automática de Plickers** (CSV con multiplicador de puntos)

**Datos Actuales**:
- 8 grupos activos
- 272 estudiantes
- 8 materias: Tecnología 1/2/3, Física Elemental, Robótica, etc.
- Sistema de backup/restauración de XP/HP

### 🔄 Funcionalidades Principales

1. **Modo Clase Activa**: Sesión de clase en vivo con contador de clases impartidas
2. **Sistema de Asistencias**: 4 estados con modificación de puntos
3. **Sistema de XP Manual**: Otorgar/quitar puntos con 9 motivos predefinidos
4. **Importación Plickers**: Cargar CSV con calificaciones y convertir a XP automáticamente
5. **Backup de Puntos**: Exportar/importar XP/HP de todos los estudiantes
6. **Multi-materia**: Soporte para diferentes asignaturas por grupo

### ⏳ PRÓXIMOS CAMBIOS MAYORES

- [ ] **Interfaz para alumnos** - Portal de estudiantes
- [ ] **Despliegue en Render** - Migración a producción en la nube
- [ ] Sistema de insignias/badges
- [ ] Autenticación JWT (multi-usuario)
- [ ] Gráficas de evolución temporal
- [ ] Exportación Excel/PDF

---

## 📂 ARQUITECTURA BÁSICA

```
controlAulaClaude/
├── src/
│   ├── models/           # Mongoose schemas
│   │   ├── Grupo.js
│   │   ├── Alumno.js
│   │   ├── Evento.js     # Discriminadores: Asistencia, Salida, Indisciplina, Ajuste
│   │   └── Ajuste.js
│   ├── controllers/      # Lógica de negocio
│   ├── routes/          # Rutas API
│   ├── config/          # Configuración DB
│   └── app.js           # Servidor Express
├── public/              # Frontend
│   ├── index.html       # Selector de grupos
│   ├── dashboard.html   # Panel principal
│   ├── asistencia.html  # Toma de asistencias
│   ├── historial.html   # Registro de eventos
│   ├── ranking.html     # Top estudiantes
│   ├── tabla-asistencias.html
│   ├── actividades.html
│   ├── gestion-alumnos.html
│   ├── insignias.html
│   ├── css/            # Estilos
│   ├── images/         # Avatares, logos, niveles
│   └── sounds/         # Audio gaming
├── scripts/            # Utilidades
│   ├── poblarDatosEjemplo.js
│   ├── exportarPuntos.js
│   ├── importarPuntos.js
│   └── [otros scripts]
├── backups/           # CSV de respaldo
├── uploads/           # Archivos temporales
└── .env              # Variables de entorno
```

---

## 🗄️ BASE DE DATOS (MongoDB Atlas)

### Colecciones Principales

**1. grupos**
```javascript
{ nombre, grado, seccion, materia, sesionesImpartidas }
```

**2. alumnos**
```javascript
{ nombre, apellidos, numeroLista, grupo, xp, hp, avatar, grupoId }
```

**3. eventos** (5 tipos con discriminadores)
```javascript
// Asistencia
{ tipo, alumno, grupo, materia, fecha, estado, xpAnterior, hpAnterior, xpNuevo, hpNuevo }

// Salida
{ tipo, alumno, grupo, materia, horaSalida, horaRegreso, motivo }

// Indisciplina
{ tipo, alumno, grupo, materia, descripcion, hpAnterior, hpNuevo }

// Ajuste
{ tipo, alumno, grupo, materia, motivo, puntos, observacion }
```

### Índices Únicos
- `grupos`: nombre + grado + seccion + materia
- `alumnos`: numeroLista + grupoId
- `eventos`: alumno + grupo + materia + fecha (solo para asistencias)

---

## 🔌 API ENDPOINTS PRINCIPALES

```
/api/grupos          GET, POST, PUT, DELETE
/api/alumnos         GET, POST, PUT, DELETE
/api/eventos         GET, POST
/api/asistencias     GET, POST, PUT, DELETE (por fecha)
/api/salidas         GET, POST
/api/indisciplinas   GET, POST
/api/ajustes         GET, POST
/api/backup          GET, POST (exportar/importar puntos)
/api/importar/plickers  POST (CSV de Plickers)
```

---

## ⚙️ CONFIGURACIÓN

### Variables de Entorno (.env)
```
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/controlAula
PORT=3000
```

### Instalación
```bash
npm install
```

**Dependencias principales**:
- express, mongoose, cors, dotenv
- multer, csv-parser, csv-writer
- nodemon (dev)

---

## 🚀 CÓMO INICIAR EL PROYECTO

```bash
# Desarrollo
npm run dev

# Producción
npm start

# Poblar datos de ejemplo (si la BD está vacía)
node scripts/poblarDatosEjemplo.js
```

**Acceso**: http://localhost:3000

---

## 💡 CARACTERÍSTICAS DESTACADAS

### Sistema de Gamificación
- **XP**: 0 a 10,000 puntos (asistencias, actividades, conducta)
- **HP**: 100 puntos base (descuentos por indisciplina)
- **Avatares**: 10 robots generados con RoboHash
- **Audio**: 15 sonidos gaming con smart behavior (límite 3 por minuto)

### Sistema de Sesiones
- Contador de clases impartidas por grupo/materia
- Modo "Clase Activa" con indicador visual
- Filtrado de historial por número de sesión

### Importación Plickers
- Carga CSV con calificaciones
- Multiplicador variable de puntos
- Fórmula: `XP = PuntosTotales × (Porcentaje / 100)`
- Normalización automática de nombres
- Registro de auditoría completo

---

## 📊 SISTEMA DE PUNTOS

### Valores de XP (configurables en código)
- Presente: +0 XP (manual activado)
- Retardo: +0 XP
- Justificado: +0 XP
- Ausente: +0 XP
- Ajuste manual: Variable (1-10,000)
- Importación Plickers: Variable por actividad

### Valores de HP
- Inicial: 100 HP
- Por indisciplina: -5 a -50 HP (configurable)

---

## 🎯 COMANDOS ÚTILES

```bash
# Resetear XP de todos los alumnos
node scripts/resetearXP.js

# Exportar puntos a CSV
node scripts/exportarPuntos.js

# Importar puntos desde CSV
node scripts/importarPuntos.js

# Limpiar nombres con guiones
node scripts/limpiarNombresConGuion.js

# Actualizar materias de grupos
node scripts/actualizarMaterias.js

# Migrar índices de MongoDB
node scripts/migrarIndiceGrupos.js
```

---

## ⚠️ NOTAS IMPORTANTES

1. **Asistencias**: Una por alumno/grupo/materia/fecha (no duplicados)
2. **Sesiones**: Incremental, no se resetean entre días
3. **Backups**: Carpeta `backups/` (no en Git)
4. **Uploads**: Carpeta `uploads/` para CSV temporales (no en Git)
5. **Audio**: Smart behavior limita reproducción a 3 sonidos/minuto
6. **XP Manual**: Sistema actual privilegia otorgar XP manualmente, no automático

---

## 📞 RETOMAR PROYECTO CON CLAUDE CODE

1. **Contexto rápido**: Leer este archivo (RESUMEN_PROYECTO.md)
2. **Verificar conexión**: Revisar que MongoDB Atlas esté conectado
3. **Iniciar servidor**: `npm run dev`
4. **Explorar**: Abrir http://localhost:3000 en navegador
5. **Datos**: Si vacío, ejecutar `node scripts/poblarDatosEjemplo.js`

### Archivos Clave para Modificaciones
- **Backend**: `src/controllers/` y `src/routes/`
- **Frontend**: `public/*.html`
- **Estilos**: `public/css/styles.css`
- **Modelos**: `src/models/`

---

## 📚 DOCUMENTACIÓN ADICIONAL

- **SONIDOS_GAMING.md**: Guía completa del sistema de audio
- **MODO_CLASE_ACTIVA.md**: Documentación del sistema de sesiones
- **README.md**: Guía de inicio rápido

---

## 🎓 APRENDIZAJES DEL PROYECTO

- Desarrollo fullstack con MERN stack (sin React, vanilla JS)
- Diseño de APIs RESTful
- Mongoose: modelos, discriminadores, índices únicos
- MongoDB Atlas: configuración, conexión, manejo de datos
- Sistema de archivos con Multer
- Procesamiento CSV con csv-parser
- Normalización de strings (acentos, mayúsculas)
- Sistema de backup/restauración de datos
- Gamificación en aplicaciones educativas

---

**Sistema desarrollado con aprendizaje continuo y Claude Code** 🤖
