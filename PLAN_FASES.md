# 📋 PLAN DE EVOLUCIÓN DEL SISTEMA - 4 FASES

**Fecha de inicio:** 13 de diciembre de 2025
**Objetivo general:** Dar más autonomía a los estudiantes y mejorar herramientas de administración del profesor

---

## ✅ FASE 1: ACTUALIZAR ESQUEMAS DE BASE DE DATOS (COMPLETADA)

### Cambios en Modelos

**Modelo Alumno (`src/models/Alumno.js`):**
- ✅ Agregado campo `avatar` (String, genera avatar único automático)
- ✅ Agregado campo `nombrePreferido` (String, opcional)
- ✅ Agregado campo `insignias` (Array de objetos con insigniaId, fechaObtencion, otorgadoPor)
- ✅ Agregado campo `configuracion` (Object: notificacionesPush, temaOscuro, idioma)
- ✅ Método `obtenerNombrePreferido()` - Retorna nombre preferido o primer nombre
- ✅ Método `obtenerNombreConPreferencia()` - Retorna array de palabras marcando la preferida
- ✅ Método `establecerNombrePreferido(palabra)` - Valida y establece nombre preferido
- ✅ **Eliminados campos:** `fechaNacimiento`, `promedio` (migración ejecutada en 273 alumnos)

**Modelo Ajuste (`src/models/Ajuste.js`):**
- ✅ Agregado campo `comentarioAlumno` (String, para que el alumno vea el comentario)
- ✅ Agregado campo `visibleParaAlumno` (Boolean, controla si el ajuste es visible en portal)

**Modelo Insignia (`src/models/Insignia.js`) - NUEVO:**
- ✅ Creado modelo completo con campos: nombre, descripcion, icono, imagen, color, nivel, privilegios
- ✅ Campo `imagen` (String) - Ruta a archivo PNG
- ✅ Campo `nivel` (Number 1-6) - Para las 6 insignias de niveles
- ✅ Campo `privilegios` (Array de Strings) - Lista de privilegios asociados
- ✅ Campo `categoria` (enum: asistencia, academico, conducta, especial, evento)
- ✅ Campo `rareza` (enum: comun, rara, epica, legendaria)
- ✅ Métodos: `cumpleCriterios()`, `obtenerRepresentacion()`

---

## ✅ FASE 2: HERRAMIENTAS DEL PROFESOR (COMPLETADA)

### 1. Bug de Plickers Corregido (`public/dashboard.html`)
- ✅ Reemplazado `prompt()` por modal personalizado
- ✅ Modal con dos campos: puntos totales y comentario opcional
- ✅ Mejor UX y consistente con el diseño del sistema

### 2. Sistema de Comentarios en Importación Plickers
- ✅ Controlador `importarController.js` guarda comentario en campo `comentarioAlumno`
- ✅ Campo `visibleParaAlumno: true` para que el alumno lo vea en su portal
- ✅ Comentario se guarda en el modelo Ajuste junto con el cambio de XP

### 3. Sistema de Insignias de Niveles

**Base de Datos:**
- ✅ Script `scripts/poblarInsigniasNiveles.js` creado y ejecutado
- ✅ 6 insignias de niveles creadas en MongoDB:
  - **Nivel 1 - Elite:** 6 privilegios (legendaria, 8000 XP sugerido)
  - **Nivel 2 - Avanzado:** 5 privilegios (épica, 6000 XP sugerido)
  - **Nivel 3 - Competente:** 4 privilegios (rara, 4000 XP sugerido)
  - **Nivel 4 - Intermedio:** 3 privilegios (común, 2000 XP sugerido)
  - **Nivel 5 - Básico:** 2 privilegios (común, 500 XP sugerido)
  - **Nivel 6 - Inicial:** 1 privilegio (común, 0 XP sugerido)
- ✅ Todas con imágenes en `/images/nivel1.png` hasta `/images/nivel6.png`
- ✅ Privilegios exactos copiados de `public/insignias.html`

**API Backend:**
- ✅ Controlador `src/controllers/insigniaController.js` (9 endpoints):
  - GET `/api/insignias` - Obtener todas
  - GET `/api/insignias/activas` - Solo activas
  - GET `/api/insignias/:id` - Una específica
  - POST `/api/insignias` - Crear nueva
  - PUT `/api/insignias/:id` - Actualizar
  - DELETE `/api/insignias/:id` - Eliminar
  - POST `/api/insignias/asignar` - Asignar a alumno
  - POST `/api/insignias/quitar` - Quitar de alumno
  - GET `/api/insignias/:id/alumnos` - Alumnos con insignia
- ✅ Rutas registradas en `src/app.js`
- ✅ `grupoController.js` hace populate de insignias al obtener alumnos (línea 229)

**Frontend - Dashboard:**
- ✅ `public/dashboard.html` muestra imagen de insignia en tarjeta de alumno (línea 473-477)
- ✅ Si no tiene insignia muestra "-"
- ✅ Botón "🏆 Gestionar Insignias" para ir a interfaz de asignación

**Frontend - Gestión de Insignias:**
- ✅ `public/gestion-insignias.html` COMPLETAMENTE REESCRITO
- ✅ Lista de alumnos del grupo con avatar, nombre, XP e insignia actual
- ✅ Estadísticas: Total alumnos | Con insignia | Sin insignia
- ✅ Click en alumno abre modal para asignar/cambiar/quitar insignia
- ✅ Modal muestra las 6 insignias de niveles con imágenes
- ✅ Indica cuál es la insignia actual (pre-seleccionada)
- ✅ Botón "Asignar Insignia" para cambiar o asignar nueva
- ✅ Botón "Quitar Insignia" para remover (solo si tiene)
- ✅ **IMPORTANTE:** Las insignias NO afectan XP ni HP, solo son reconocimiento visual

**Notas Importantes:**
- Las insignias son SOLO reconocimientos, no afectan mecánicas de juego
- Cada alumno puede tener UNA insignia de nivel a la vez
- El profesor asigna manualmente desde la interfaz
- Los rangos de XP son solo sugerencias, no automáticos

---

## ❌ FASE 3: PORTAL DE ESTUDIANTES (PENDIENTE)

### Objetivos
Crear portal web donde los estudiantes puedan:
1. Ver su progreso personal (XP, HP, nivel)
2. Ver su historial de ajustes de XP/HP con comentarios del profesor
3. Ver sus insignias y privilegios asociados
4. Personalizar su perfil (avatar, nombre preferido)
5. Ver su ranking en el grupo
6. **NO pueden modificar nada**, solo visualizar

### Tareas Pendientes

**1. Sistema de Autenticación Simple**
- Crear modelo Usuario/Login (o usar matrícula + contraseña simple)
- Endpoint de login para estudiantes
- Sesión o token simple (localStorage)
- Middleware de autenticación para rutas de estudiantes

**2. API Backend para Estudiantes**
- GET `/api/estudiante/perfil` - Datos del alumno logueado
- GET `/api/estudiante/historial` - Historial de ajustes (solo visibleParaAlumno: true)
- GET `/api/estudiante/ranking` - Posición en el grupo
- PUT `/api/estudiante/perfil` - Actualizar avatar y nombrePreferido
- GET `/api/estudiante/insignias` - Sus insignias y privilegios

**3. Frontend - Portal de Estudiante**
- Crear `public/portal-estudiante/login.html` - Página de login
- Crear `public/portal-estudiante/dashboard.html` - Dashboard personal
  - Tarjeta con avatar, nombre, XP, HP, insignia
  - Gráfica de progreso XP
  - Barra de HP con estado visual
  - Privilegios desbloqueados (basados en insignia)
- Crear `public/portal-estudiante/historial.html` - Ver ajustes de XP/HP
  - Tabla con fecha, tipo, cantidad, motivo, comentario
  - Filtros por tipo y rango de fechas
  - Solo muestra ajustes con visibleParaAlumno: true
- Crear `public/portal-estudiante/perfil.html` - Personalización
  - Cambiar avatar (generador de Dicebear)
  - Establecer nombre preferido (validación de palabras del nombre)
  - Ver configuración (notificaciones, tema, idioma)
- Crear `public/portal-estudiante/ranking.html` - Ranking del grupo
  - Lista de alumnos ordenados por XP
  - Mostrar posición propia destacada

**4. Consideraciones de Seguridad**
- Los estudiantes solo pueden ver SUS propios datos
- No pueden modificar XP, HP ni insignias
- No pueden ver datos privados de otros alumnos
- Comentarios del profesor solo si visibleParaAlumno: true

**5. Diseño UI**
- Tema gaming consistente con el dashboard del profesor
- Responsive para móviles (los estudiantes accederán desde celular)
- Animaciones y efectos visuales motivacionales
- Paleta de colores diferente para distinguir de panel profesor

---

## ❌ FASE 4: REFINAMIENTO DE UI (PENDIENTE)

### Objetivos
Mejorar la experiencia visual y usabilidad del sistema completo

### Tareas Pendientes

**1. Dashboard del Profesor**
- Mejorar animaciones de transiciones
- Agregar gráficas de estadísticas del grupo
- Optimizar para tablets
- Agregar atajos de teclado

**2. Sistema de Notificaciones**
- Toast notifications en lugar de alerts
- Notificaciones de éxito/error animadas
- Confirmaciones más visuales

**3. Temas y Personalización**
- Modo oscuro/claro para profesor
- Paleta de colores personalizable
- Guardado de preferencias en localStorage

**4. Performance**
- Optimizar carga de imágenes
- Lazy loading de datos
- Caché de datos frecuentes
- Reducir llamadas API innecesarias

**5. Accesibilidad**
- Mejorar contraste de colores
- Soporte de lectores de pantalla
- Navegación por teclado completa
- Textos alternativos en imágenes

**6. Deployment a Render**
- Preparar variables de entorno
- Configurar MongoDB Atlas para producción
- Configurar dominio personalizado
- SSL/HTTPS
- Backups automáticos

---

## 📊 ESTADO ACTUAL DEL PROYECTO

### Completado (FASE 1 y FASE 2)
- ✅ Modelos de BD actualizados
- ✅ Sistema de insignias de niveles completo
- ✅ Interfaz de asignación de insignias
- ✅ Dashboard del profesor con insignias
- ✅ Sistema de comentarios en Plickers
- ✅ Bug de Plickers corregido

### En Espera de Pruebas
- 🧪 Interfaz de asignación de insignias (`gestion-insignias.html`)
- 🧪 Visualización de insignias en dashboard

### Pendiente (FASE 3 y FASE 4)
- ❌ Portal de estudiantes completo
- ❌ Sistema de autenticación
- ❌ Refinamiento de UI
- ❌ Deployment a producción

---

## 🔧 INFORMACIÓN TÉCNICA IMPORTANTE

### Stack Tecnológico
- **Backend:** Node.js + Express
- **Base de Datos:** MongoDB Atlas
- **Frontend:** HTML + CSS + Vanilla JavaScript (sin frameworks)
- **Arquitectura:** MVC
- **Autenticación:** Pendiente (FASE 3)

### Puertos y URLs
- **Puerto:** 3000
- **Dashboard:** `http://localhost:3000/dashboard.html?grupo={grupoId}`
- **Insignias:** `http://localhost:3000/gestion-insignias.html?grupo={grupoId}`
- **API Base:** `http://localhost:3000/api`

### IDs de Prueba
- **Grupo 2A:** `6937a228d765107a1ee7e930`
- **Grupo 2B:** `6937a2df784903c10c4cfb17`
- **Alumno Sasha:** `6937a317784903c10c4cfded` (Tiene Nivel 6 - Inicial)
- **Alumno Jared:** `6937a2e6784903c10c4cfb81` (Tiene Nivel 3 - Competente)

### Comandos Útiles
```bash
# Iniciar servidor
npm run dev

# Poblar insignias de niveles
node scripts/poblarInsigniasNiveles.js

# Verificar modelos
node scripts/verificarModelos.js

# Migrar datos
node scripts/eliminarCamposAlumnos.js
```

---

## 📝 NOTAS DEL DESARROLLO

### Decisiones de Diseño
1. **Insignias sin automatización:** El profesor asigna manualmente para tener control total
2. **Un alumno = una insignia de nivel:** Evita confusión, la última asignada reemplaza anterior
3. **Insignias ≠ Mecánicas de juego:** Solo son reconocimientos visuales, no afectan XP/HP
4. **Comentarios opcionales:** El profesor decide qué ajustes son visibles para estudiantes

### Problemas Resueltos
- ✅ Bug de prompt() en importación Plickers → Modal personalizado
- ✅ Interfaz genérica de insignias → Interfaz específica para las 6 de niveles
- ✅ Campos obsoletos en Alumno → Migración ejecutada
- ✅ Populate de insignias → Agregado en grupoController

### Archivos Clave Modificados (FASE 2)
- `src/models/Insignia.js` - Modelo con imagen, nivel, privilegios
- `src/controllers/insigniaController.js` - 9 endpoints CRUD + asignación
- `src/controllers/grupoController.js` - Populate de insignias (línea 229)
- `src/controllers/importarController.js` - Comentarios en Plickers
- `public/dashboard.html` - Muestra imagen de insignia (línea 473-477)
- `public/gestion-insignias.html` - Interfaz completa de asignación (REESCRITO)
- `scripts/poblarInsigniasNiveles.js` - Script de inicialización de insignias

---

## 🎯 PRÓXIMOS PASOS INMEDIATOS

1. **Usuario probará** la interfaz de asignación de insignias
2. Si todo funciona correctamente, **iniciar FASE 3** (Portal de Estudiantes)
3. Planificar arquitectura de autenticación simple para estudiantes
4. Diseñar UI del portal de estudiantes (mockups o wireframes)

---

**Última actualización:** 13 de diciembre de 2025
**Última sesión completada:** Corrección del sistema de insignias (FASE 2)
