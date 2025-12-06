# 📚 RESUMEN DEL PROYECTO - Sistema de Control de Aula

**Fecha de creación**: Noviembre 29, 2025
**Última actualización**: Diciembre 6, 2025 - 21:00
**Desarrollador**: Docente en México aprendiendo Node.js
**Propósito**: Sistema gamificado para registrar eventos del aula (asistencias, salidas, indisciplina, etc.) con sistema de puntos XP/HP

---

## 🚀 ESTADO ACTUAL DEL PROYECTO

### ✅ COMPLETADO (1 Dic 2025)
- ✅ Backend 100% funcional con Node.js + Express
- ✅ MongoDB Atlas configurado y conectado
- ✅ 4 modelos de Mongoose implementados (Grupo, Alumno, Evento, Ajuste)
- ✅ 30+ endpoints REST API funcionando
- ✅ CRUD completo para grupos y alumnos
- ✅ 5 tipos de eventos con discriminadores
- ✅ **Frontend completo funcional** (HTML/CSS/JS vanilla)
- ✅ **Sistema de gamificación XP/HP implementado**
- ✅ **Sistema de toma de asistencias** con 4 estados (Presente, Ausente, Retardo, Justificado)
- ✅ **Dashboard interactivo** para gestión de grupos y alumnos
- ✅ **Tabla de asistencias históricas** tipo calendario
- ✅ **Ranking de alumnos** por XP con medallas
- ✅ **Historial de eventos** con filtros avanzados
- ✅ **Registro de salidas** (baño, enfermería, otros)
- ✅ **Sistema disciplinario** con descuento de puntos HP
- ✅ Validaciones y manejo de errores
- ✅ Datos de ejemplo poblados
- ✅ Sistema probado en producción por el docente
- ✅ Documentación completa

### 🔄 EN PROCESO (Uso Real)
- 📊 **Sistema en uso activo** por el docente (primeros registros realizados)
- 📈 Periodo de prueba de 2 semanas para análisis

### ✅ NUEVAS MEJORAS (3 Dic 2025)
- ✅ **Sistema de avatares de robots** implementado en todas las páginas
- ✅ **Sistema de audio gaming** implementado (15 sonidos con smart behavior)
- ✅ **Sistema de niveles eliminado** - Cambio a XP 0-10,000
- ✅ **Placeholder de insignias** agregado para futuro sistema de badges
- ✅ **Selector de motivos** actualizado con 9 actividades específicas
- ✅ **XP manual exclusivo** - Desactivado XP automático en asistencias
- ✅ **273 alumnos reseteados** a 0 XP para nuevo inicio

### ✅ NUEVAS FUNCIONALIDADES (6 Dic 2025)
- ✅ **FASE 1: Modo Clase Activa** - Sistema de sesión de clase en vivo implementado
- ✅ **Logo de la escuela integrado** - 80x80px en todas las páginas (6 archivos HTML)
- ✅ **Personalización institucional** - "Secundaria" muestra "Secundaria técnica #50"
- ✅ **Fix error de validación XP** - Enum actualizado en modelo Ajuste.js
- ✅ **Fix selector de botón** - Agregado id="btn-iniciar-clase" para mejor manejo

### ⏳ PENDIENTE (Futuro)
- [ ] Descargar archivos MP3 de sonidos (guía completa en SONIDOS_GAMING.md)
- [ ] Sistema de insignias/badges personalizado
- [ ] Portal para estudiantes
- [ ] Gráficas de evolución temporal (Chart.js)
- [ ] Autenticación JWT (multi-usuario)
- [ ] Reportes avanzados y estadísticas
- [ ] Exportación Excel/PDF
- [ ] Notificaciones automáticas

---

## 📝 NOTAS DE LA SESIÓN (6 DIC 2025) - MODO CLASE ACTIVA Y BRANDING

### 🎯 FASE 1: Modo Clase Activa Implementado

**Objetivo**: Permitir al docente iniciar una "sesión de clase" y ver en tiempo real el estado de asistencia de cada alumno después de tomar lista.

#### Funcionalidad completa:
1. ✅ **Botón "Iniciar Clase"** en dashboard → Redirige a toma de lista
2. ✅ **Estado guardado en sessionStorage** al completar lista
3. ✅ **Dashboard muestra estados visuales** de asistencia:
   - Ausentes: Tarjeta opaca/gris con borde rojo
   - Retardos: Borde naranja con glow
   - Justificados: Borde azul con glow
   - Presentes: Apariencia normal
4. ✅ **Badges de estado** visibles en tarjetas (✗ AUSENTE, 🕐 RETARDO, 📝 JUSTIFICADO)
5. ✅ **Modal para cambiar estado** en tiempo real (click en "Cambiar Estado")
6. ✅ **Botón "Finalizar Clase"** limpia el estado y vuelve a modo normal

#### Archivos modificados:
- **`public/css/styles.css`**: Clases `.alumno-ausente`, `.alumno-retardo`, `.alumno-justificado`, `.estado-badge`
- **`public/dashboard.html`**:
  - Agregado `id="btn-iniciar-clase"` para mejor selector
  - Función `cargarClaseActiva()` detecta estado en sessionStorage
  - Función `renderizarAlumnos()` aplica clases CSS según estado
  - Modal `#modal-cambiar-estado` para cambios en vivo
  - Función `actualizarBotonClase()` toggle Iniciar/Finalizar
- **`public/asistencia.html`**:
  - Función `guardarClaseActiva()` guarda estado al completar lista
  - Estructura de datos: `{ activa, grupoId, fechaInicio, asistencias: { alumnoId: {estado, nombreCompleto} } }`

#### Experiencia de usuario:
1. Docente entra al dashboard → Ve botón "📋 Iniciar Clase"
2. Click → Redirige a toma de asistencias
3. Toma lista normalmente (P/A/R/J)
4. Al finalizar → Estado se guarda en sessionStorage
5. Regresa a dashboard → Ve estado visual de todos (opacidad, bordes, badges)
6. Puede cambiar estados individuales con modal
7. Click en "Finalizar Clase" → Limpia estado, vuelve a normal

### 🏫 Logo y Branding Institucional

#### Logo de la escuela integrado:
- **Archivo**: `/public/images/logo-escuela.svg` (160mm x 160mm, color #D13539)
- **Tamaño**: 80x80px (aumentado desde 50px por solicitud del usuario)
- **Color**: Convertido a blanco mediante `filter: brightness(0) invert(1)` CSS
- **Hover effect**: Glow dorado + escala 1.05
- **Ubicación**: Primer elemento dentro de `<h1>` en todas las páginas

#### Páginas actualizadas con logo (6 archivos):
1. ✅ `public/index.html` - Página de selección de grupos
2. ✅ `public/dashboard.html` - Dashboard principal (con JavaScript dinámico)
3. ✅ `public/asistencia.html` - Toma de lista (con JavaScript dinámico)
4. ✅ `public/ranking.html` - Ranking de alumnos
5. ✅ `public/historial.html` - Historial de eventos
6. ✅ `public/tabla-asistencias.html` - Tabla de asistencias

#### Implementación técnica:
```html
<h1>
  <img src="/images/logo-escuela.svg" alt="Logo Escuela" class="logo-escuela">
  Texto del título
</h1>
```

```css
.logo-escuela {
  width: 80px;
  height: 80px;
  filter: brightness(0) invert(1);
  opacity: 0.95;
  transition: all 0.3s ease;
  margin-right: 10px;
  flex-shrink: 0;
}
```

#### Personalización de texto institucional:
- **Cambio**: "Secundaria" → "Secundaria técnica #50"
- **Implementación**: Condicional JavaScript en 3 archivos
  ```javascript
  const nivelTexto = grupo.nivel === 'Secundaria' ? 'Secundaria técnica #50' : grupo.nivel;
  ```
- **Archivos modificados**:
  - `public/index.html:64` - Tarjetas de grupos
  - `public/dashboard.html:317` - Encabezado del dashboard
  - `public/asistencia.html:613` - Info del grupo en asistencias

### 🐛 Bugs Corregidos (6 Dic 2025)

#### 1. Error de validación al asignar XP:
**Problema**: "Error: Ajuste validation failed: motivo: Tarea no es un motivo válido"

**Causa**: El modelo `Ajuste.js` tenía un enum desactualizado que no incluía los nuevos motivos académicos agregados al frontend el 3-Dic-2025.

**Solución**: Actualizado enum en `src/models/Ajuste.js:23-45`
```javascript
enum: {
  values: [
    // Motivos académicos específicos (actualizados 6-Dic-2025)
    'Tarea', 'Práctica', 'Plickers', 'Jeopardy',
    'Reto (examen)', 'Bonus de Constancia (Asistencia)',
    'Extra', 'Escaperoom',
    // Motivos generales
    'Participación destacada', 'Ayudó a compañero',
    'Proyecto excelente', 'Trabajo extra',
    'Comportamiento ejemplar', 'Evento disciplinario',
    'Corrección manual', 'Otro'
  ]
}
```

**Impacto**: Ahora el sistema permite asignar XP con motivos específicos sin errores de validación.

#### 2. Selector de botón no funcionaba:
**Problema**: Función `actualizarBotonClase()` no encontraba el botón después de cambiar dinámicamente el onclick.

**Causa**: El selector `document.querySelector('button[onclick="tomarLista()"]')` dejaba de funcionar cuando el onclick cambiaba a `finalizarClase()`.

**Solución**: Agregado `id="btn-iniciar-clase"` al botón y cambiado selector a `document.getElementById('btn-iniciar-clase')`.

**Archivo**: `public/dashboard.html:12` y función `actualizarBotonClase()`

### 📊 Estado del sistema (6 Dic 2025):
- ✅ FASE 1: Modo Clase Activa funcionando
- ✅ Logo institucional en todas las páginas
- ✅ Personalización "Secundaria técnica #50" implementada
- ✅ Sistema XP/HP funcionando sin errores de validación
- ✅ Sin bugs conocidos en consola
- ✅ Sistema en uso real por el docente

### 📁 Archivos importantes modificados hoy:
**CSS:**
- `public/css/styles.css` - Estilos para estados de asistencia, logo

**HTML (6 archivos):**
- `public/index.html` - Logo + personalización nivel
- `public/dashboard.html` - Logo + modo clase activa + fix botón + personalización
- `public/asistencia.html` - Logo + guardar estado clase + personalización
- `public/ranking.html` - Logo
- `public/historial.html` - Logo
- `public/tabla-asistencias.html` - Logo

**Backend:**
- `src/models/Ajuste.js` - Actualizado enum de motivos

---

## 📝 NOTAS DE LA SESIÓN (3 DIC 2025) - CAMBIOS MAYORES

### 🎮 Sistema de XP modificado:
1. ✅ **Desactivado otorgamiento automático de XP al tomar asistencia**
   - **Archivo**: `src/controllers/asistenciaController.js:26-74`
   - **Cambio**: El código está comentado (puede reactivarse)
   - **Razón**: El docente ahora otorga XP manualmente según tareas y prácticas
   - **Impacto**: Tomar lista ya NO modifica el XP de los alumnos

2. ✅ **Todos los alumnos reseteados a 0 XP**
   - **Script creado**: `scripts/resetearXP.js`
   - **Ejecutado**: 273 alumnos reseteados exitosamente
   - **Propósito**: Nuevo inicio con sistema manual de XP

3. ✅ **Selector de motivos actualizado con actividades específicas**
   - **Archivo**: `public/dashboard.html` (modal de ajuste XP)
   - **Nuevas opciones**: Tarea, Práctica, Plickers, Jeopardy, Reto (examen), Bonus de Constancia (Asistencia), Extra, Escaperoom, Otro
   - **Cambio adicional**: Máximo de XP por ajuste aumentado de 100 a 1000
   - **Propósito**: Facilitar el registro específico de actividades académicas

### 🎯 Sistema de Niveles Eliminado:
1. ✅ **Eliminación completa del sistema de niveles**
   - **Razón**: Simplificación del sistema de progreso
   - **Nuevo sistema**: XP va de 0 a 10,000 sin niveles intermedios
   - **Placeholder agregado**: "Insignia" (badge) - Para futuro sistema de logros/badges

2. ✅ **Archivos modificados**:
   - `public/dashboard.html`:
     - Removido badge de nivel en tarjetas de alumnos
     - Agregado stat-box "Insignia" mostrando "-"
     - Barra de XP ahora es de 0 a 10,000 (en lugar de 0 a 100 por nivel)
   - `public/asistencia.html`:
     - Removido display de nivel en card del alumno actual
   - `public/ranking.html`:
     - Removida columna de nivel en tabla
     - Removida estadística "Nivel Promedio" del grupo
     - Barra de progreso ahora muestra XP/10000
   - `src/controllers/xpController.js`:
     - Eliminados cálculos de nivel del backend
     - Removido campo `nivel` y `xpParaSiguienteNivel` de respuestas API
     - Ranking ahora solo muestra: posición, nombre, XP, HP
   - `src/models/Alumno.js`:
     - Método `obtenerNivel()` comentado con nota explicativa

3. ✅ **Impacto visual**:
   - Interfaz más limpia y enfocada en XP/HP/Insignia
   - Progreso más claro: "Has ganado 2,450 de 10,000 XP"
   - Espacio preparado para futuro sistema de badges personalizados

### 🤖 Sistema de Avatares Implementado:
1. ✅ **Avatares de robots coloridos en TODAS las páginas**
   - **Tecnología**: DiceBear API (estilo "bottts")
   - **Tipo**: Robots únicos generados dinámicamente
   - **Características**: Gratis, sin límites, SVG escalables
   - **Documentación**: Ver `AVATARES.md`

2. ✅ **Páginas actualizadas con avatares**:
   - `dashboard.html` - Tarjetas de alumnos (60x60px)
   - `asistencia.html` - Avatar grande del alumno actual (150x150px)
   - `ranking.html` - Avatar en cada posición (50x50px con borde dorado para top 3)
   - `tabla-asistencias.html` - Mini avatar antes del nombre (30x30px)
   - `historial.html` - Avatar en eventos (25x25px)

3. ✅ **Beneficios del sistema de avatares**:
   - Cada alumno tiene su robot único basado en su nombre
   - Consistencia: mismo alumno = mismo robot siempre
   - Dinámicos: se generan en tiempo real (no en BD)
   - Alumnos nuevos tienen avatar automáticamente
   - Sistema más atractivo y gaming para adolescentes

4. ✅ **Generación de avatares**:
   ```javascript
   const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(nombreCompleto)}`;
   ```
   - Cada nombre genera un robot único y consistente
   - Sin necesidad de almacenamiento de imágenes
   - 6 estilos alternativos disponibles (ver AVATARES.md)

### 🔊 Sistema de Audio Gaming Implementado:
1. ✅ **Sistema completo de sonidos temática gaming**
   - **Tecnología**: HTML5 Audio API
   - **Volumen**: 40% por defecto (configurable)
   - **Formato**: MP3, 128 kbps
   - **Total de sonidos**: 15 efectos diferentes
   - **Documentación completa**: Ver `SONIDOS_GAMING.md`

2. ✅ **Dashboard - 9 sonidos**:
   - `xp-gain.mp3` - Ganar XP pequeño (10-99 XP)
   - `xp-big-gain.mp3` - Ganar XP grande (100+ XP) ⭐ Smart behavior
   - `xp-lose.mp3` - Perder XP
   - `hp-gain.mp3` - Recuperar HP
   - `hp-lose.mp3` - Perder HP / Daño
   - `click.mp3` - Click general
   - `success.mp3` - Acción exitosa
   - `error.mp3` - Error / Cancelar
   - `complete.mp3` - Tarea completada

3. ✅ **Asistencia - 6 sonidos**:
   - `check-presente.mp3` - Marcar presente ✓
   - `alert-ausente.mp3` - Marcar ausente ✗
   - `warning-retardo.mp3` - Marcar retardo 🕐
   - `notify-justificado.mp3` - Justificado 📝
   - `complete-fanfare.mp3` - Lista completada 🎉
   - `click.mp3` - Navegación (compartido con dashboard)

4. ✅ **Características del sistema de audio**:
   - **Pre-carga**: Todos los sonidos se cargan al inicio
   - **Manejo de errores**: Funciona incluso si faltan archivos
   - **Comportamiento inteligente**: Diferente sonido según cantidad de XP
   - **Volumen ajustable**: `audio.volume = 0.4` (0.0 a 1.0)
   - **Compatibilidad**: Chrome, Firefox, Safari, Edge, Opera

5. ✅ **Implementación técnica**:
   ```javascript
   // Dashboard - dashboard.html:155-175
   const sonidos = {
       xpGain: new Audio('/sounds/xp-gain.mp3'),
       xpBigGain: new Audio('/sounds/xp-big-gain.mp3'),
       // ... más sonidos
   };
   Object.values(sonidos).forEach(audio => audio.volume = 0.4);

   // Smart behavior en ajustarXPHP()
   if (tipo === 'xp' && signo === 'positivo') {
       reproducirSonido(cantidadFinal >= 100 ? 'xpBigGain' : 'xpGain');
   }
   ```

6. ✅ **Guía de descarga de sonidos** (SONIDOS_GAMING.md):
   - 6 sitios recomendados (Pixabay ⭐, Mixkit, Zapsplat, etc.)
   - Búsquedas específicas para cada sonido
   - 3 estilos sugeridos: Gaming Moderno ✅, Retro 8-bit, Cyber/Futurista
   - Especificaciones técnicas completas
   - Quick start con 5 sonidos esenciales
   - Troubleshooting guide

7. ✅ **Estructura de carpetas esperada**:
   ```
   public/
   └── sounds/
       ├── xp-gain.mp3
       ├── xp-big-gain.mp3
       ├── xp-lose.mp3
       ├── hp-gain.mp3
       ├── hp-lose.mp3
       ├── check-presente.mp3
       ├── alert-ausente.mp3
       ├── warning-retardo.mp3
       ├── notify-justificado.mp3
       ├── complete-fanfare.mp3
       ├── click.mp3
       ├── success.mp3
       ├── error.mp3
       └── complete.mp3
   ```

### 🐛 Bugs corregidos:
1. ✅ **Error "Cannot read properties of null (reading 'style')"** en `tabla-asistencias.html:500`
   - **Problema**: El código intentaba acceder a `document.getElementById('resumen-container')` pero el elemento no existía en el HTML
   - **Solución**: Eliminada la línea 500 que referenciaba el elemento inexistente
   - **Archivo**: `public/tabla-asistencias.html:500`
   - **Impacto**: La tabla de asistencias ahora carga sin errores de JavaScript

2. ✅ **Línea decorativa rectangular en modal de asistencia**
   - **Problema**: Pseudo-elemento ::before creaba una línea gradient de 6px en la parte superior de la card del alumno
   - **Solución**: Eliminado el bloque CSS completo `.alumno-card-large::before`
   - **Archivo**: `public/asistencia.html:69-77`
   - **Impacto**: Card del alumno ahora tiene diseño limpio sin líneas no deseadas

### 📊 Estado del sistema:
- ✅ Sistema funcionando en uso real
- ✅ Todas las páginas frontend operativas con avatares
- ✅ Sin errores conocidos en consola
- ✅ XP manual implementado (0-10,000 sin niveles)
- 🤖 Avatares de robots en producción
- 🔊 Sistema de audio implementado (pendiente descarga de archivos MP3)
- 🎯 Placeholder de insignias listo para futuro sistema

### 💡 Recomendaciones proporcionadas:
1. **Sistema de gamificación del aula**:
   - Rangos de XP sugeridos para tareas/prácticas
   - Ideas de niveles con recompensas tangibles
   - Sistema de misiones semanales (futuro)
   - Sistema de logros/badges (futuro)
   - Equipos y XP grupal (futuro)

2. **Gráficas de evolución temporal** (para dentro de unos meses):
   - **Tecnología recomendada**: Chart.js (compatible con vanilla JS)
   - Alternativa: ApexCharts
   - Tipos de gráficas sugeridas: Line, Multi-line, Bar, Heatmap
   - Preparación necesaria: Endpoints de evolución, snapshots semanales
   - Documentación para estudiar: Chart.js docs

3. **Sonidos gaming**:
   - Sitio principal: Pixabay Sound Effects (gratis, sin atribución)
   - Alternativas: Mixkit, Zapsplat, Freesound, GameSounds.xyz
   - Generador custom: Bfxr.net para sonidos retro
   - Estilo recomendado: Gaming Moderno (profesional, satisfactorio)

---

## 📝 NOTAS DE LA SESIÓN (1 DIC 2025) - FRONTEND E IMPLEMENTACIÓN COMPLETA

### 🎉 Lo que se logró hoy:
1. ✅ **Frontend completo implementado** sin React (HTML/CSS/JS vanilla)
2. ✅ **Sistema XP completo** con otorgamiento automático y ajustes manuales
3. ✅ **Interfaz de toma de asistencias** con 4 estados y atajos de teclado
4. ✅ **Dashboard interactivo** con tarjetas de alumnos y gestión visual
5. ✅ **Tabla de asistencias** histórica tipo calendario
6. ✅ **Ranking de grupo** con medallas para top 3
7. ✅ **Historial de eventos** con filtros por tipo, alumno, fecha
8. ✅ **Registro de eventos** (salidas, disciplina) desde el dashboard
9. ✅ **Sistema probado en producción** por el docente

### 🐛 Bugs corregidos (1 Dic):
1. ✅ **Nombres "undefined"** en tabla de asistencias - Fix en asistenciaController.js usando `select('nombre apellidos')`
2. ✅ **Eventos mal categorizados** en historial - Fix comparando con 'Salida' y 'Disciplinario' capitalizados (discriminadores de Mongoose)

### 🐛 Bugs corregidos (3 Dic):
3. ✅ **Error JavaScript en tabla-asistencias.html** - Eliminada referencia a elemento inexistente 'resumen-container'

### 🆕 Nuevos archivos creados:

#### Modelos:
- `src/models/Ajuste.js` - Modelo para tracking de ajustes manuales de XP/HP

#### Controladores:
- `src/controllers/xpController.js` - Controlador para sistema XP/HP (5 funciones)
- `src/controllers/asistenciaController.js` - Método `obtenerTablaAsistencias()` agregado

#### Rutas:
- `src/routes/xpRoutes.js` - Rutas para sistema XP
- `src/routes/asistenciaRoutes.js` - Rutas para asistencias

#### Frontend (HTML/CSS/JS):
- `public/index.html` - Página de selección de grupo
- `public/dashboard.html` - Dashboard principal con tarjetas de alumnos
- `public/asistencia.html` - Interfaz de toma de lista
- `public/tabla-asistencias.html` - Tabla histórica calendario
- `public/ranking.html` - Ranking de alumnos por XP
- `public/historial.html` - Historial de eventos con filtros
- `public/eventos.html` - Registro de salidas y eventos
- `public/css/styles.css` - Estilos globales del sistema

#### Scripts (3 DIC 2025):
- `scripts/resetearXP.js` - Script para resetear XP de todos los alumnos a 0

#### Documentación (3 DIC 2025):
- `AVATARES.md` - Guía completa del sistema de avatares (robots, DiceBear API, alternativas)
- `SONIDOS_GAMING.md` - Guía completa de sonidos gaming (15 sonidos, sitios de descarga, búsquedas específicas)

### 🎮 Sistema de Gamificación XP/HP:

**XP (Experiencia):**
- ❌ **DESACTIVADO**: Otorgamiento automático en asistencias (comentado en código)
- ✅ **ACTUAL**: Exclusivamente manual mediante dashboard
- **Rango**: 0 a 10,000 XP (sin niveles intermedios)
- **Motivos disponibles**: Tarea, Práctica, Plickers, Jeopardy, Reto, Bonus, Extra, Escaperoom, Otro
- **Máximo por ajuste**: 1,000 XP
- **Controlador**: `xpController.ajustarXP()`
- **Estado**: 273 alumnos reseteados a 0 XP el 3-Dic-2025

**HP (Salud/Conducta):**
- Inicial: 100 HP
- Rango: 0 a 100 HP
- Eventos disciplinarios descuentan HP según gravedad
- Ajustes manuales: Controlador `xpController.ajustarHP()`

**Insignias (Badges):**
- 🎯 **Placeholder agregado** (muestra "-" por ahora)
- **Futuro**: Sistema de logros/badges personalizados según XP y comportamiento

**Tracking:**
- Todos los ajustes se guardan en modelo `Ajuste` con motivo, valores anterior/después, fecha

### 🎨 Características del Frontend:

**Dashboard:**
- 🤖 Tarjetas visuales de alumnos con avatares de robots únicos
- 🔊 Sonidos gaming en todas las acciones (XP gain/loss, HP gain/loss, success, error)
- 🎯 Stats boxes: XP (0-10000), HP (0-100), Insignia (placeholder)
- Stats boxes clickeables para ajustar XP/HP con modal
- Modal de ajuste con 9 motivos específicos (Tarea, Práctica, Plickers, etc.)
- Máximo de ajuste: 1,000 XP (aumentado desde 100)
- 🧠 Smart behavior: Sonido diferente si XP ≥100
- Acciones rápidas: Tomar lista, Ver ranking, Historial, Tabla asistencias
- Botones para registrar salidas y eventos disciplinarios

**Toma de Asistencias:**
- 🤖 Avatar grande (150x150px) del alumno actual
- 🔊 Sonidos específicos: check-presente, alert-ausente, warning-retardo, notify-justificado, complete-fanfare
- 4 botones grandes: Presente [P], Ausente [A], Retardo [R], Justificado [J]
- Atajos de teclado para rapidez
- Panel lateral con resumen en tiempo real
- Navegación por alumnos con flechas o clicks
- Pantalla de confirmación al finalizar con fanfarria
- ❌ **XP automático DESACTIVADO** (antes: +10 XP presente, +5 XP retardo)

**Tabla de Asistencias:**
- 🤖 Mini avatares (30x30px) antes de cada nombre
- Vista calendario: Estudiantes × Fechas
- Indicadores visuales: ✓ (presente), ✗ (ausente), 🕐 (retardo), 📝 (justificado)
- Filtros por rango de fechas
- Resalta alumnos con ≥3 ausencias en rojo
- Estadísticas de asistencia

**Ranking:**
- 🤖 Avatares en cada posición (50x50px con borde dorado para top 3)
- Top 3 con medallas 🥇🥈🥉
- Muestra: posición, XP total, HP
- ❌ **Sin niveles** (eliminado)
- Barra de progreso: XP / 10,000
- Estadísticas del grupo: XP promedio, HP promedio (sin nivel promedio)

**Historial:**
- 🤖 Mini avatares (25x25px) en eventos
- Filtros por tipo (salida/disciplinario), alumno, rango de fechas
- Badges coloridos por tipo de evento
- Detalles de cada evento (tipo salida, puntos descontados, etc.)
- Estadísticas totales

### 📊 Endpoints agregados en esta sesión:

#### XP/HP:
```
POST   /api/xp/alumno/:alumnoId/ajustar-xp
POST   /api/xp/alumno/:alumnoId/ajustar-hp
GET    /api/xp/alumno/:alumnoId/historial
GET    /api/xp/grupo/:grupoId/ranking
POST   /api/xp/grupo/:grupoId/ajustar-grupal
```

#### Asistencias:
```
GET    /api/asistencia/grupo/:grupoId/tabla
POST   /api/asistencia/grupo/:grupoId
GET    /api/asistencia/grupo/:grupoId
```

### 🎯 UX Improvements implementadas:
1. ✅ Stat-boxes clickeables en lugar de botón superior
2. ✅ Modal de ajuste XP muestra alumno pre-seleccionado
3. ✅ Atajos de teclado en toma de asistencias
4. ✅ Navegación fluida entre páginas
5. ✅ Loading states y feedback visual
6. ✅ Responsive design para móviles

### 💡 Decisiones técnicas importantes:
- **Frontend sin frameworks**: HTML/CSS/JS vanilla (NO React)
- **Fetch API nativo** para comunicación con backend
- **CSS moderno** con variables y gradients
- **JavaScript embebido** en archivos HTML
- **Estilos globales** en `/css/styles.css`
- **Sin bundlers** ni npm packages de frontend

---

## 📝 NOTAS DE LA SESIÓN (29 NOV 2025)

### Lo que se logró hoy:
1. ✅ Proyecto creado desde cero
2. ✅ Estructura MVC implementada
3. ✅ MongoDB Atlas configurado exitosamente
4. ✅ Script de datos de ejemplo funcionando
5. ✅ Servidor probado con todos los endpoints
6. ✅ 4 documentos de referencia creados

### Configuración MongoDB:
- **Tipo**: MongoDB Atlas (cloud)
- **URI**: Configurada en `.env`
- **Base de datos**: `control-aula` (aunque muestra "test" en conexión inicial)
- **Estado**: ✅ Conectado y funcionando
- **Colecciones**: grupos, alumnos, eventos

### IDs importantes de datos de ejemplo:
```
Grupo 3°A ID: 692b844d4d5eb27657fb648e
Alumno 1 ID:  692b844d4d5eb27657fb6491
```

### Endpoints probados exitosamente:
- ✅ GET /api/grupos (obtener todos)
- ✅ GET /api/alumnos (obtener todos)
- ✅ POST /api/eventos/asistencia (presente, retardo, justificada)
- ✅ POST /api/eventos/salida-bano
- ✅ PATCH /api/eventos/salida-bano/:id/regreso
- ✅ POST /api/eventos/indisciplina
- ✅ POST /api/alumnos (crear nuevo)
- ✅ GET /api/grupos/:id/alumnos

---

## 📚 PLAN DE APRENDIZAJE SUGERIDO

### FASE 1: Dominar el Backend (1 semana)

#### Días 1-2: Grupos y Alumnos
**Objetivos:**
- Entender relaciones entre modelos
- Practicar CRUD completo
- Usar filtros y búsquedas

**Ejercicios con Postman:**
1. Crear 5 grupos de diferentes niveles y turnos
2. Agregar 3 alumnos a cada grupo
3. Cambiar un alumno de grupo
4. Filtrar grupos por nivel: `GET /api/grupos?nivel=Secundaria`
5. Buscar alumno por matrícula: `GET /api/alumnos/matricula/SEC2024001`
6. Actualizar información de contacto de un alumno
7. Desactivar un grupo (soft delete)
8. Obtener todos los alumnos de un grupo específico

**Archivos a estudiar:**
- `src/models/Grupo.js` - Ver campos virtuales y métodos
- `src/models/Alumno.js` - Ver middleware pre-save
- `src/controllers/grupoController.js` - Lógica de negocio
- `src/controllers/alumnoController.js` - Validaciones

#### Días 3-4: Asistencias
**Objetivos:**
- Entender discriminadores de Mongoose
- Practicar validaciones condicionales
- Manejar diferentes estados

**Ejercicios con Postman:**
1. Pasar lista completa a un grupo (todos presente)
2. Registrar 3 retardos con diferentes minutos
3. Registrar 2 faltas justificadas con motivos reales
4. Registrar 1 ausente sin justificar
5. Obtener historial de asistencia de un alumno
6. Filtrar asistencias por fecha: `GET /api/eventos?tipoEvento=Asistencia&fechaInicio=2024-11-01`
7. Contar cuántas asistencias tiene cada alumno

**Archivos a estudiar:**
- `src/models/Evento.js` líneas 1-60 - Esquema base y Asistencia
- `src/controllers/eventoController.js` líneas 1-80 - Función registrarAsistencia

#### Días 5-6: Eventos Especiales
**Objetivos:**
- Dominar todos los tipos de eventos
- Entender campos virtuales (duracionMinutos)
- Practicar actualizaciones PATCH

**Ejercicios con Postman:**
1. Registrar 10 salidas al baño de diferentes alumnos
2. Registrar regresos y verificar duración calculada
3. Crear eventos de enfermería con todos los motivos disponibles
4. Actualizar estado de regreso de enfermería
5. Registrar indisciplinas de diferente gravedad (Leve, Moderado, Grave)
6. Notificar tutores de indisciplinas graves
7. Crear eventos personalizados (participación destacada, préstamo material)
8. Obtener todos los eventos de un alumno específico

**Archivos a estudiar:**
- `src/models/Evento.js` completo - Todos los discriminadores
- `src/controllers/eventoController.js` completo - Todas las funciones

#### Día 7: Consultas Avanzadas
**Objetivos:**
- Dominar filtros y query params
- Entender populate y relaciones
- Practicar consultas complejas

**Ejercicios con Postman:**
1. Filtrar eventos por rango de fechas
2. Obtener solo indisciplinas de un grupo
3. Ver eventos de hoy de todos los alumnos
4. Contar salidas al baño por alumno
5. Buscar alumnos con más de 3 retardos
6. Ver alumnos sin asistencia registrada hoy
7. Obtener eventos con información completa del alumno y su grupo

**Conceptos clave:**
- Query params: `?tipoEvento=X&fechaInicio=Y&limite=Z`
- Populate: Cómo se cargan relaciones
- Campos virtuales vs campos reales

---

### FASE 2: Aprender React (1 semana paralela)

**Recursos recomendados:**
1. **Documentación oficial**: https://react.dev/learn
   - "Quick Start"
   - "Thinking in React"
   - "Managing State"
   - "useEffect"

2. **Tutoriales en YouTube (español):**
   - "Curso React desde cero" - midudev
   - Conceptos clave: Componentes, Hooks, Fetch

3. **Práctica recomendada:**
   - Mini-proyecto: Lista de tareas (TODO app)
   - Consumir API pública: https://jsonplaceholder.typicode.com
   - Practicar: useState, useEffect, fetch, formularios

**Conceptos esenciales para este proyecto:**
- ✅ Componentes funcionales
- ✅ useState (manejo de estado)
- ✅ useEffect (llamadas API)
- ✅ Props (pasar datos entre componentes)
- ✅ Fetch/Axios (peticiones HTTP)
- ✅ Formularios controlados
- ✅ Condicional rendering

---

### FASE 3: Frontend (Cuando regreses)
**Objetivos:**
- Conectar React con tu API
- Crear interfaces para gestión de grupos, alumnos y eventos
- Implementar CRUD completo desde el navegador

---

## 🎯 DESCRIPCIÓN GENERAL

Sistema backend REST API desarrollado con:
- **Node.js** + **Express** (servidor)
- **MongoDB Atlas** (base de datos cloud)
- **Mongoose** (ODM - Object Document Mapper)

### Funcionalidades Principales:
1. ✅ Gestión de grupos escolares (secundaria/preparatoria)
2. ✅ Gestión de alumnos por grupo
3. ✅ Registro de asistencia (Presente, Ausente, Retardo, **Justificada**)
4. ✅ Control de salidas al baño con timer
5. ✅ Registro de salidas a enfermería
6. ✅ Control de indisciplina con notificaciones
7. ✅ Eventos personalizados

---

## 📂 ARQUITECTURA DEL PROYECTO

```
controlAulaClaude/
├── src/
│   ├── models/              # Esquemas de Mongoose (4 archivos)
│   │   ├── Grupo.js         # Modelo de grupos escolares
│   │   ├── Alumno.js        # Modelo de alumnos (con XP/HP)
│   │   ├── Evento.js        # Modelo unificado con 5 discriminadores
│   │   └── Ajuste.js        # Modelo de ajustes XP/HP manuales
│   │
│   ├── controllers/         # Lógica de negocio (5 archivos)
│   │   ├── grupoController.js       # 6 funciones CRUD grupos
│   │   ├── alumnoController.js      # 7 funciones CRUD alumnos
│   │   ├── eventoController.js      # 13 funciones para eventos
│   │   ├── asistenciaController.js  # 4 funciones para asistencias
│   │   └── xpController.js          # 5 funciones sistema XP/HP
│   │
│   ├── routes/             # Rutas de la API (5 archivos)
│   │   ├── grupoRoutes.js
│   │   ├── alumnoRoutes.js
│   │   ├── eventoRoutes.js
│   │   ├── asistenciaRoutes.js
│   │   └── xpRoutes.js
│   │
│   ├── config/
│   │   └── database.js     # Configuración MongoDB
│   │
│   └── app.js              # Configuración Express (middlewares, rutas)
│
├── public/                 # Frontend (HTML/CSS/JS vanilla)
│   ├── index.html          # Página de inicio/selección de grupo
│   ├── dashboard.html      # Dashboard principal
│   ├── asistencia.html     # Toma de lista
│   ├── tabla-asistencias.html  # Tabla histórica de asistencias
│   ├── ranking.html        # Ranking de alumnos por XP
│   ├── historial.html      # Historial de eventos
│   ├── eventos.html        # Registro de salidas y eventos
│   └── css/
│       └── styles.css      # Estilos globales
│
├── scripts/
│   ├── poblarDatosEjemplo.js    # Script para datos de prueba
│   ├── importarDatos.js         # Script para importar datos reales
│   └── resetearXP.js            # Script para resetear XP a 0
│
├── server.js               # Punto de entrada (inicia servidor)
├── package.json
├── .env                    # Variables de entorno (MongoDB URI)
├── .gitignore
│
└── Documentación/
    ├── README.md           # Guía general
    ├── EJEMPLOS_API.md     # Ejemplos de uso de todos los endpoints
    ├── SETUP_MONGODB.md    # Configuración MongoDB local/Atlas
    ├── RESUMEN_PROYECTO.md # Este archivo (contexto completo)
    ├── AVATARES.md         # Guía de avatares de robots (DiceBear API)
    └── SONIDOS_GAMING.md   # Guía de sonidos gaming (15 efectos)
```

---

## 🗄️ DISEÑO DE BASE DE DATOS

### Colección: **grupos**
Representa los grupos escolares (ej: 3°A Secundaria)

**Campos principales:**
- `nombre`: String (ej: "3A")
- `nivel`: Enum ['Secundaria', 'Preparatoria', 'Universidad']
- `grado`: Number (1-6)
- `cicloEscolar`: String formato "YYYY-YYYY"
- `turno`: Enum ['Matutino', 'Vespertino']
- `capacidad`: Number (opcional)
- `activo`: Boolean

**Campos virtuales:**
- `numeroAlumnos`: Cuenta cuántos alumnos tiene el grupo

**Métodos:**
- `obtenerNombreCompleto()`: Retorna "3° 3A - Secundaria (Matutino)"

**Índices:**
- Único compuesto: `nombre + cicloEscolar + turno`

---

### Colección: **alumnos**
Representa a cada estudiante

**Campos principales:**
- `matricula`: String único (ej: "SEC2024001")
- `nombre`, `apellidoPaterno`, `apellidoMaterno`: String (DEPRECADO: usar `nombre` y `apellidos`)
- `nombre`: String
- `apellidos`: String
- `grupo`: ObjectId → referencia a grupos
- `fechaNacimiento`: Date (opcional)
- `contacto`: Object
  - `email`: String
  - `telefono`: String
  - `nombreTutor`: String
- `activo`: Boolean
- `notas`: String (alergias, condiciones especiales)
- **`xp`**: Number (default: 0) - Experiencia acumulada
- **`salud`**: Number (default: 100) - HP/Puntos de conducta

**Campos virtuales:**
- `nombreCompleto`: "Juan Carlos Pérez García"
- `edad`: Calculada desde fechaNacimiento
- **`nivel`**: Calculado como `Math.floor(xp / 100) + 1`

**Relación virtual:**
- `eventos`: Todos los eventos del alumno

**Middleware pre-save:**
- Capitaliza automáticamente nombres y apellidos

**Índices:**
- `grupo`: Para búsquedas por grupo
- Índice de texto: `nombre`, `apellidoPaterno`, `apellidoMaterno`

---

### Colección: **ajustes**
Representa los ajustes manuales de XP/HP realizados por el docente

**Campos principales:**
- `alumno`: ObjectId → referencia a alumnos (requerido)
- `tipo`: Enum ['xp', 'hp'] - Tipo de ajuste (requerido)
- `cantidad`: Number - Cantidad ajustada (+/-) (requerido)
- `motivo`: String - Razón del ajuste (requerido)
- `valorAnterior`: Number - Valor antes del ajuste (requerido)
- `valorDespues`: Number - Valor después del ajuste (requerido)
- `fecha`: Date - Fecha del ajuste (default: Date.now)

**Propósito:**
- Tracking completo de todos los ajustes manuales
- Auditoría de cambios en XP/HP
- Historial de intervenciones del docente

**Índice:**
- Compuesto: `alumno + fecha` (descendente)

---

### Colección: **eventos**
**Diseño con discriminadores** (colección única, múltiples tipos)

#### Campos Base (todos los eventos):
- `alumno`: ObjectId → referencia a alumnos
- `fecha`: Date
- `observaciones`: String (opcional)
- `tipoEvento`: String (automático por discriminador)

#### Tipo 1: **Asistencia** (`tipoEvento: "Asistencia"`)
Campos adicionales:
- `estado`: Enum ['Presente', 'Ausente', 'Retardo', 'Justificada']
- `minutosRetardo`: Number (solo si estado=Retardo)
- `justificante`: String (solo si estado=Justificada)

**Validaciones condicionales:**
- `minutosRetardo` obligatorio si es Retardo
- `justificante` obligatorio si es Justificada

#### Tipo 2: **SalidaBano** (`tipoEvento: "SalidaBano"`)
Campos adicionales:
- `horaSalida`: Date
- `horaRegreso`: Date (null si no ha regresado)

**Campo virtual:**
- `duracionMinutos`: Calculado como `horaRegreso - horaSalida`

#### Tipo 3: **SalidaEnfermeria** (`tipoEvento: "SalidaEnfermeria"`)
Campos adicionales:
- `motivo`: Enum ['Dolor de cabeza', 'Dolor de estómago', 'Mareo', 'Lesión', 'Sangrado', 'Fiebre', 'Otro']
- `descripcion`: String
- `horaSalida`: Date
- `horaRegreso`: Date
- `regreso`: Enum ['Regresó a clase', 'Se fue a casa', 'Aún en enfermería']
- `atencionRecibida`: String

**Campo virtual:**
- `duracionMinutos`: Calculado

#### Tipo 4: **Indisciplina** (`tipoEvento: "Indisciplina"`)
Campos adicionales:
- `descripcion`: String (obligatorio)
- `tipo`: Enum ['Falta de respeto', 'Disturbio en clase', 'Tarea incompleta', 'Sin material', 'Uso de celular', 'Pelea', 'Lenguaje inapropiado', 'Otro']
- `gravedad`: Enum ['Leve', 'Moderado', 'Grave']
- `accionTomada`: String
- `tutorNotificado`: Boolean (default: false)
- `fechaNotificacion`: Date

#### Tipo 5: **Personalizado** (`tipoEvento: "Personalizado"`)
Campos adicionales:
- `titulo`: String (obligatorio)
- `categoria`: String
- `descripcion`: String (obligatorio)
- `datosAdicionales`: Mixed (objeto JSON flexible)

**Índice:**
- Compuesto: `alumno + fecha` (descendente)

---

## 🔌 API ENDPOINTS COMPLETA

### BASE URL: `http://localhost:3000`

### 📚 GRUPOS

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/grupos` | Crear grupo |
| GET | `/api/grupos` | Obtener todos (filtros: ?activo=true&cicloEscolar=2024-2025&nivel=Secundaria) |
| GET | `/api/grupos/:id` | Obtener por ID |
| PUT | `/api/grupos/:id` | Actualizar |
| DELETE | `/api/grupos/:id` | Desactivar (soft delete) |
| GET | `/api/grupos/:id/alumnos` | Obtener alumnos del grupo |

### 👨‍🎓 ALUMNOS

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/alumnos` | Crear alumno |
| GET | `/api/alumnos` | Obtener todos (filtros: ?grupo=ID&activo=true&busqueda=texto) |
| GET | `/api/alumnos/:id` | Obtener por ID |
| GET | `/api/alumnos/matricula/:matricula` | Buscar por matrícula |
| PUT | `/api/alumnos/:id` | Actualizar |
| DELETE | `/api/alumnos/:id` | Desactivar |
| PATCH | `/api/alumnos/:id/cambiar-grupo` | Cambiar de grupo |

### ⚡ XP / HP (Sistema de Gamificación)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/xp/alumno/:alumnoId/ajustar-xp` | Ajustar XP de alumno (body: `{ cantidad, motivo }`) |
| POST | `/api/xp/alumno/:alumnoId/ajustar-hp` | Ajustar HP de alumno (body: `{ cantidad, motivo }`) |
| GET | `/api/xp/alumno/:alumnoId/historial` | Historial de ajustes del alumno |
| GET | `/api/xp/grupo/:grupoId/ranking` | Ranking del grupo por XP |
| POST | `/api/xp/grupo/:grupoId/ajustar-grupal` | Ajustar XP a múltiples alumnos (body: `{ alumnos[], cantidad, motivo }`) |

### 📋 ASISTENCIAS

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/asistencia/grupo/:grupoId` | Registrar asistencia grupal (body: `{ asistencias[], fecha? }`) |
| GET | `/api/asistencia/grupo/:grupoId` | Obtener asistencias del grupo (filtros: ?fecha=YYYY-MM-DD) |
| GET | `/api/asistencia/grupo/:grupoId/tabla` | Tabla histórica de asistencias (filtros: ?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD) |

**Nota**: Al registrar asistencia se otorga automáticamente:
- `presente`: +10 XP
- `retardo`: +5 XP

### 📝 EVENTOS

#### Consultas generales:
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/eventos` | Todos los eventos (filtros: ?tipoEvento=Salida&fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD&limite=100) |
| GET | `/api/eventos/alumno/:alumnoId` | Eventos de un alumno (filtros: ?tipoEvento=...&fechaInicio=...&fechaFin=...) |
| GET | `/api/eventos/historial` | Historial con filtros avanzados (filtros: ?grupoId=...&alumnoId=...&tipoEvento=...&fechaInicio=...&fechaFin=...) |

#### Salidas (Baño, Enfermería, Otros):
| Método | Endpoint | Descripción / Body |
|--------|----------|---------------------|
| POST | `/api/eventos/salida` | Registrar salida (body: `{ alumno, tipoSalida, horaSalida?, descripcion?, observaciones? }`) |
| PATCH | `/api/eventos/salida/:id/regreso` | Registrar regreso (body: `{ horaRegreso? }`) |
| GET | `/api/eventos/salidas/alumno/:alumnoId` | Obtener salidas de un alumno |
| GET | `/api/eventos/salidas/alumno/:alumnoId/bano-semana` | Conteo de salidas al baño esta semana |

**Tipos de salida**: `bano`, `enfermeria`, `agua`, `otros`

#### Eventos Disciplinarios:
| Método | Endpoint | Descripción / Body |
|--------|----------|---------------------|
| POST | `/api/eventos/disciplinario` | Registrar evento individual (body: `{ alumno, tipoDisciplina, descripcion, puntosDescontados, observaciones? }`) |
| POST | `/api/eventos/disciplinario/grupal` | Falta grupal (body: `{ grupo, descripcion?, puntosDescontados, observaciones? }`) |
| GET | `/api/eventos/disciplinarios/alumno/:alumnoId` | Eventos disciplinarios de un alumno |

**Nota**: Los eventos disciplinarios descuentan automáticamente puntos HP del alumno según `puntosDescontados`

---

## 🎓 CONCEPTOS AVANZADOS IMPLEMENTADOS

### 1. **Discriminadores de Mongoose**
**Archivo**: `src/models/Evento.js`

```javascript
// Un modelo base
const Evento = mongoose.model('Evento', eventoBaseSchema);

// Cinco modelos especializados que heredan del base
const EventoAsistencia = Evento.discriminator('Asistencia', asistenciaSchema);
const EventoSalidaBano = Evento.discriminator('SalidaBano', salidaBanoSchema);
// ...
```

**Ventajas:**
- ✅ Una sola colección en MongoDB
- ✅ Cada tipo tiene sus campos específicos
- ✅ Fácil consultar historial completo
- ✅ Campo `tipoEvento` automático

### 2. **Campos Virtuales**
**No se guardan en BD, se calculan al consultar**

```javascript
// Alumno.js:148
alumnoSchema.virtual('nombreCompleto').get(function() {
  return `${this.nombre} ${this.apellidoPaterno} ${this.apellidoMaterno}`;
});

// Evento.js:75 (SalidaBano)
salidaBanoSchema.virtual('duracionMinutos').get(function() {
  if (!this.horaRegreso) return null;
  const diferencia = this.horaRegreso - this.horaSalida;
  return Math.round(diferencia / 1000 / 60);
});
```

### 3. **Relaciones con `.populate()`**
```javascript
// Buscar alumnos e incluir info del grupo
await Alumno.find().populate('grupo');

// Buscar eventos e incluir info del alumno
await Evento.find().populate('alumno');

// Populate anidado
await Evento.find().populate({
  path: 'alumno',
  populate: { path: 'grupo' }
});
```

### 4. **Validaciones Condicionales**
```javascript
// Evento.js:56
justificante: {
  validate: {
    validator: function(value) {
      // Solo obligatorio si estado es 'Justificada'
      return this.estado !== 'Justificada' || (value && value.length > 0);
    },
    message: 'El justificante es obligatorio cuando el estado es "Justificada"'
  }
}
```

### 5. **Middleware Pre-Save**
```javascript
// Alumno.js:115
alumnoSchema.pre('save', function(next) {
  const capitalizar = (texto) => {
    return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
  };

  if (this.nombre) {
    this.nombre = this.nombre.split(' ').map(capitalizar).join(' ');
  }
  // "juan carlos" → "Juan Carlos"

  next();
});
```

### 6. **Índices para Optimización**
```javascript
// Índice compuesto único
grupoSchema.index({ nombre: 1, cicloEscolar: 1, turno: 1 }, { unique: true });

// Índice de texto para búsquedas
alumnoSchema.index({
  nombre: 'text',
  apellidoPaterno: 'text',
  apellidoMaterno: 'text'
});

// Índice para consultas frecuentes
eventoBaseSchema.index({ alumno: 1, fecha: -1 });
```

### 7. **Soft Delete**
```javascript
// No elimina, solo marca como inactivo
const eliminarGrupo = async (req, res) => {
  const grupo = await Grupo.findByIdAndUpdate(
    id,
    { activo: false },
    { new: true }
  );
};
```

---

## ⚙️ CONFIGURACIÓN

### Variables de Entorno (.env)
```env
PORT=3000
MONGODB_URI=mongodb+srv://nodejs:password@cluster0.xxxxx.mongodb.net/control-aula?retryWrites=true&w=majority
NODE_ENV=development
```

### Scripts NPM
```json
{
  "start": "node server.js",           // Producción
  "dev": "nodemon server.js"           // Desarrollo (reinicio automático)
}
```

---

## 🚀 CÓMO INICIAR EL PROYECTO

### 1. Primera vez (instalación):
```bash
npm install
node scripts/poblarDatosEjemplo.js  # Datos de prueba
```

### 2. Iniciar servidor:
```bash
npm run dev
```

### 3. Probar:
- Navegador: http://localhost:3000
- Postman/Thunder Client: Ver `EJEMPLOS_API.md`

---

## 📊 DATOS DE EJEMPLO INCLUIDOS

Al ejecutar `poblarDatosEjemplo.js` se crean:

**2 Grupos:**
1. 3°A - Secundaria (Matutino)
2. 1°B - Preparatoria (Vespertino)

**3 Alumnos** (en el grupo 3°A):
1. SEC2024001 - Juan Carlos Pérez García
2. SEC2024002 - Ana María López Martínez
3. SEC2024003 - Carlos Eduardo Ramírez Hernández

**5 Eventos:**
- 3 Asistencias (Presente, Retardo, Justificada)
- 1 Salida al baño (con duración calculada)
- 1 Indisciplina (leve)

---

## 🐛 NOTA TÉCNICA CONOCIDA

**Issue menor**: En `eventoController.js`, al poblar eventos con `.populate('alumno', 'nombreCompleto matricula')`, el campo virtual `nombreCompleto` retorna `undefined` porque necesita los campos base.

**Solución**:
```javascript
// En lugar de:
.populate('alumno', 'nombreCompleto matricula')

// Usar:
.populate('alumno', 'nombre apellidoPaterno apellidoMaterno matricula')
```

O simplemente:
```javascript
.populate('alumno')  // Incluye todos los campos
```

---

## 📈 PRÓXIMAS FUNCIONALIDADES PLANEADAS

### Prioridad Alta (Planes del docente):
- [ ] **Sistema de avatares** para alumnos (personalización visual)
- [ ] **Portal para estudiantes** (ver su propio progreso, XP, HP, historial)
- [ ] Mejoras en el sistema XP basadas en el uso real

### Prioridad Media:
- [ ] Autenticación con JWT (multi-usuario)
- [ ] Reportes avanzados y estadísticas visuales
- [ ] Exportación a Excel/PDF
- [ ] Sistema de permisos por rol
- [ ] Dashboard con gráficas (Chart.js)

### Prioridad Baja:
- [ ] Notificaciones automáticas por email/SMS
- [ ] Sistema de respaldo automático
- [ ] Integración con Google Classroom

---

## 🖥️ CÓMO USAR EL SISTEMA COMPLETO (FRONTEND)

### Flujo principal de uso:

#### 1. **Iniciar el sistema**
```bash
cd /home/jaime/Node/controlAulaClaude
npm run dev
```
Abre el navegador en: `http://localhost:3000`

#### 2. **Página de inicio** (`index.html`)
- Muestra tarjetas con todos los grupos disponibles
- Click en un grupo para acceder a su dashboard

#### 3. **Dashboard principal** (`dashboard.html?grupo=ID`)
- **Vista general del grupo**: Nombre, grado, nivel, ciclo escolar
- 🤖 **Tarjetas de alumnos**: Avatar de robot único, nombre, XP, HP, Insignia
- 🔊 **Sonidos**: Efectos de audio en todas las acciones
- 🎯 **Stats boxes**: XP (0-10000), HP (0-100), Insignia (placeholder "-")
- **Acciones rápidas**:
  - 📋 Tomar Lista
  - 🏆 Ver Ranking
  - 📊 Historial
  - 📅 Tabla Asistencias
- **Registrar eventos**:
  - 🚪 Registrar Salida (baño, enfermería, agua, otros)
  - ⚠️ Evento Disciplinario
- **Ajustar XP/HP**: Click en las stat-boxes → Modal con 9 motivos específicos
- **Máximo por ajuste**: 1,000 XP (aumentado desde 100)

#### 4. **Toma de asistencias** (`asistencia.html?grupo=ID`)
- 🤖 Avatar grande (150x150px) del alumno actual
- 🔊 Sonido específico para cada estado + fanfarria al completar
- Navegación alumno por alumno (flechas ← →)
- 4 botones grandes: **[P]resente**, **[A]usente**, **[R]etardo**, **[J]ustificado**
- **Atajos de teclado**: P, A, R, J
- Panel lateral con resumen en tiempo real
- Botón "Finalizar" al terminar
- ❌ **XP automático DESACTIVADO** (antes: +10 XP presente, +5 XP retardo)

#### 5. **Tabla de asistencias** (`tabla-asistencias.html?grupo=ID`)
- 🤖 Mini avatares (30x30px) antes de cada nombre
- Vista calendario: Filas=alumnos, Columnas=fechas
- Indicadores: ✓ presente, ✗ ausente, 🕐 retardo, 📝 justificado
- Filtros por rango de fechas
- Resalta en rojo alumnos con ≥3 ausencias
- Estadísticas de asistencia por alumno

#### 6. **Ranking** (`ranking.html?grupo=ID`)
- 🤖 Avatares (50x50px) con borde dorado para top 3
- Top 3 con medallas 🥇🥈🥉
- Muestra: posición, nombre, XP total, HP
- ❌ **Sin niveles** (eliminado)
- Barra de progreso: XP / 10,000
- Estadísticas del grupo: XP promedio, HP promedio (sin nivel promedio)

#### 7. **Historial de eventos** (`historial.html?grupo=ID`)
- Filtros:
  - Tipo de evento (Todos/Salidas/Disciplinarios)
  - Alumno específico
  - Rango de fechas
- Tabla con: Fecha, Tipo, Alumno, Detalles, Observaciones
- Estadísticas: Total eventos, Salidas, Disciplinarios
- Por defecto muestra últimos 7 días

#### 8. **Registro de eventos** (`eventos.html?grupo=ID`)
- **Registrar salidas**: Seleccionar alumno, tipo (baño/enfermería/agua/otros), descripción
- **Registrar regresos**: Ver salidas activas y registrar hora de regreso
- **Eventos disciplinarios**: Alumno, tipo, descripción, puntos a descontar
- **Faltas grupales**: Afecta a todos los alumnos del grupo

### 🎮 Sistema de Gamificación en uso:

**XP (Experiencia):**
- ❌ **NO se otorga automáticamente** al tomar lista (desactivado 3-Dic-2025)
- ✅ **Exclusivamente manual** desde el dashboard (click en stat-box)
- **Rango**: 0 a 10,000 XP (sin niveles)
- **Motivos**: Tarea, Práctica, Plickers, Jeopardy, Reto, Bonus, Extra, Escaperoom, Otro
- **Máximo por ajuste**: 1,000 XP
- Se muestra en tarjetas de alumnos y ranking con barra de progreso /10,000

**HP (Salud/Conducta):**
- Todos empiezan con 100 HP
- **Rango**: 0 a 100 HP
- Se descuenta automáticamente al registrar eventos disciplinarios
- Se puede ajustar manualmente desde el dashboard
- Se muestra en tarjetas de alumnos

**Insignias (Badges):**
- 🎯 **Placeholder agregado** (muestra "-")
- **Futuro**: Sistema de logros/badges personalizados

**❌ Niveles (ELIMINADO):**
- El sistema de niveles fue eliminado el 3-Dic-2025
- Antes: Cada 100 XP = 1 nivel
- Ahora: XP acumulativo de 0 a 10,000

### 🎨 Características visuales:

- 🤖 **Avatares de robots únicos** para cada alumno (DiceBear API)
- 🔊 **Sonidos gaming** en todas las acciones (15 efectos diferentes)
- **Tema oscuro gaming** (morado/dorado)
- **Animaciones suaves** en hover y transiciones
- **Responsive design** (funciona en móvil)
- **Feedback visual** (notificaciones, loading states)
- **Feedback auditivo** (sonidos contextuales)
- **Atajos de teclado** en toma de asistencias
- **Tarjetas clickeables** para acciones rápidas

---

## 💡 TIPS PARA DESARROLLO

### 1. Probar con curl:
```bash
# Ver todos los grupos
curl http://localhost:3000/api/grupos

# Crear grupo
curl -X POST http://localhost:3000/api/grupos \
  -H "Content-Type: application/json" \
  -d '{"nombre":"4A","nivel":"Secundaria","grado":4,"cicloEscolar":"2024-2025","turno":"Matutino"}'
```

### 2. Ver logs del servidor:
Los logs muestran cada petición en desarrollo.

### 3. Reiniciar datos de ejemplo:
```bash
node scripts/poblarDatosEjemplo.js
```
(Elimina todo y crea datos frescos)

### 4. Conectar a MongoDB Atlas:
```bash
# Ver datos en la web
https://cloud.mongodb.com
# Database → Browse Collections
```

---

## 📞 CÓMO RETOMAR ESTE PROYECTO CON CLAUDE CODE

### Cuando regreses (en 2 días o cuando sea):

**Opción 1 - Referencia directa:**
```
"Lee RESUMEN_PROYECTO.md y ayúdame con [tu pregunta]"
```

**Opción 2 - Contexto específico:**
```
"Estoy en el proyecto de Node.js para control de aula.
Ayúdame a [agregar/modificar/entender] [funcionalidad específica]"
```

**Opción 3 - Desde un archivo:**
```
"Lee src/models/Evento.js y explícame cómo funcionan los discriminadores"
```

### Claude Code SIEMPRE puede:
- ✅ Leer todos los archivos del proyecto
- ✅ Buscar código específico con Grep
- ✅ Encontrar archivos con Glob
- ✅ Entender la estructura completa

### No necesitas:
- ❌ Mantener la conversación abierta
- ❌ Copiar/pegar código anterior
- ❌ Explicar todo desde cero

---

## 🎯 COMANDOS ÚTILES DE REFERENCIA

```bash
# Servidor
npm run dev              # Iniciar en desarrollo
npm start               # Iniciar en producción

# Base de datos
node scripts/poblarDatosEjemplo.js  # Crear datos de prueba

# Verificar
curl http://localhost:3000/api/grupos  # Test rápido
```

---

## ⚠️ RECORDATORIOS IMPORTANTES

### Al regresar mañana (o cualquier día):

1. **Iniciar el servidor:**
   ```bash
   cd /home/jaime/Node/controlAulaClaude
   npm run dev
   ```

2. **Verificar que funciona:**
   ```bash
   curl http://localhost:3000/api/grupos
   # O abre http://localhost:3000 en el navegador
   ```

3. **Si necesitas datos frescos:**
   ```bash
   node scripts/poblarDatosEjemplo.js
   ```

4. **Si el puerto 3000 está ocupado:**
   ```bash
   # Ver qué lo está usando
   lsof -i :3000

   # Matar el proceso
   kill -9 [PID]

   # O cambiar puerto en .env
   PORT=3001
   ```

### Archivos clave por orden de estudio:
1. `RESUMEN_PROYECTO.md` (este archivo) - Empieza aquí
2. `EJEMPLOS_API.md` - Para Postman
3. `src/models/Grupo.js` - Modelo simple
4. `src/models/Alumno.js` - Modelo con relaciones
5. `src/models/Evento.js` - Modelo avanzado (discriminadores)
6. `src/controllers/` - Lógica de negocio

### Base de datos:
- **Acceso web**: https://cloud.mongodb.com
- **Colecciones**: grupos, alumnos, eventos
- Puedes ver/editar datos directamente en MongoDB Atlas

---

## 🎯 OBJETIVOS CLAROS

### Antes de hacer el frontend, debes:
- ✅ Entender cómo funcionan los discriminadores en Evento.js
- ✅ Saber hacer CRUD completo de grupos y alumnos con Postman
- ✅ Comprender populate y relaciones
- ✅ Dominar filtros con query params
- ✅ Haber practicado los 40+ ejercicios sugeridos en Postman
- ✅ Entender useState, useEffect, fetch en React

### Cuando estés listo para frontend:
**Simplemente di:** "Estoy listo para el frontend, empecemos con gestión de grupos"

---

**Fecha de última actualización**: 2025-12-06 21:00
**Estado del proyecto**: ✅ Funcionando completamente (Backend + Frontend + Avatares + Audio + Modo Clase Activa)
**Backend**: ✅ Completo con sistema XP/HP manual (sin niveles)
**Frontend**: ✅ Completo y funcional (HTML/CSS/JS vanilla)
**Avatares**: 🤖 Implementado (robots únicos por alumno)
**Audio**: 🔊 Implementado (15 sonidos gaming - pendiente descarga MP3)
**Branding**: 🏫 Logo institucional en 6 páginas + personalización "Secundaria técnica #50"
**Modo Clase**: 🎯 FASE 1 implementada (sesión de clase en vivo con estados visuales)
**Sistema**: 🎮 En uso real por el docente
**XP**: 0-10,000 exclusivamente manual (273 alumnos reseteados a 0)
**Bugs conocidos**: ✅ Ninguno (últimos 2 bugs corregidos 6-Dic-2025)
**Próxima sesión**: Después del periodo de prueba de 2 semanas
**Planes futuros**: Insignias/badges, gráficas temporales, portal para estudiantes, control de versiones con Git/GitHub

---

## 📚 ARCHIVOS DE DOCUMENTACIÓN

1. **RESUMEN_PROYECTO.md** ⭐ (este archivo) - **EMPIEZA AQUÍ**
2. **EJEMPLOS_API.md** - Ejemplos prácticos de todos los endpoints para Postman
3. **README.md** - Guía general del proyecto y características
4. **SETUP_MONGODB.md** - Configuración de MongoDB local/Atlas
5. **AVATARES.md** 🤖 - Documentación completa del sistema de avatares (robots)
6. **SONIDOS_GAMING.md** 🔊 - Guía completa de sonidos gaming (15 sonidos, sitios, búsquedas específicas)

---

## 💤 PARA TERMINAR LA SESIÓN DE HOY

```bash
# El servidor quedará corriendo, pero si quieres detenerlo:
# En la terminal donde corre: Ctrl + C

# O si lo dejaste en background:
ps aux | grep node
kill [PID]
```

**MongoDB Atlas seguirá funcionando** (está en la nube, no en tu computadora)

---

## 🎯 RESUMEN EJECUTIVO PARA LA PRÓXIMA SESIÓN

### ✅ Lo que está funcionando AHORA:
1. ✅ Sistema completo backend + frontend
2. ✅ Gamificación XP/HP manual (0-10,000 XP sin niveles)
3. ✅ Toma de asistencias con 4 estados
4. ✅ Dashboard interactivo con avatares de robots
5. ✅ Ranking de alumnos con avatares
6. ✅ Historial de eventos
7. ✅ Tabla de asistencias con avatares
8. ✅ Sistema de audio gaming implementado (15 sonidos)
9. ✅ Placeholder de insignias para futuro sistema de badges
10. ✅ Sistema en uso real por el docente

### 📊 Estado actual:
- **Sistema**: En periodo de prueba (2 semanas)
- **Datos**: 273 alumnos reseteados a 0 XP para nuevo inicio
- **XP**: Exclusivamente manual (no automático en asistencias)
- **Frontend**: HTML/CSS/JS vanilla (NO React)
- **Base de datos**: MongoDB Atlas
- **Colecciones**: grupos, alumnos, eventos, asistencias, ajustes
- **Avatares**: 🤖 Robots únicos por alumno (DiceBear API)
- **Audio**: 🔊 15 sonidos gaming implementados (pendiente descarga MP3)
- **Niveles**: ❌ Eliminados - Sistema 0-10,000 XP
- **Última actualización**: 3-Dic-2025 20:30

### 🔜 Próximos pasos sugeridos:
1. **INMEDIATO**: Descargar archivos MP3 de sonidos (ver SONIDOS_GAMING.md)
2. Usar el sistema durante 2 semanas con XP manual
3. Recopilar feedback de los alumnos sobre avatares y sonidos
4. Identificar mejoras necesarias
5. Implementar sistema de insignias/badges personalizado
6. Crear gráficas de evolución temporal (Chart.js)
7. Crear portal para estudiantes

### 📁 Archivos clave para referencia rápida:
- **Este archivo**: Contexto completo del proyecto
- `AVATARES.md` 🤖 - Documentación del sistema de avatares (robots)
- `SONIDOS_GAMING.md` 🔊 - Guía completa de sonidos gaming (sitios de descarga)
- `public/dashboard.html` - Dashboard principal (avatares + audio + sin niveles)
- `public/asistencia.html` - Toma de lista (avatares + audio)
- `public/ranking.html` - Ranking (avatares, sin niveles)
- `src/controllers/xpController.js` - Sistema XP/HP (sin niveles)
- `src/controllers/asistenciaController.js` - Asistencias (XP desactivado)
- `src/models/Alumno.js` - Modelo (método nivel comentado)
- `scripts/resetearXP.js` - Script para resetear XP a 0

### 🎮 Cambios clave de la sesión:
- ❌ Sistema de niveles eliminado → ✅ XP 0-10,000
- ❌ XP automático en asistencias → ✅ XP manual exclusivo
- ✅ 9 opciones específicas de motivos (Tarea, Práctica, Plickers, etc.)
- 🤖 Avatares de robots en todas las páginas
- 🔊 Sistema de audio gaming (smart behavior: sonido diferente si XP ≥100)
- 🎯 Placeholder de insignias para futuro sistema

---

**¡Sistema completo y funcionando con avatares, audio, modo clase activa y branding institucional! 🎓🎮🤖🔊🏫**

**Siguiente paso: Configurar Git/GitHub para control de versiones (RECOMENDADO)**
**Otros pasos**: Descargar 15 archivos MP3 de sonidos (guía en SONIDOS_GAMING.md)
**Éxito con el periodo de prueba. Nos vemos en 2 semanas con feedback real de uso.** 😊
