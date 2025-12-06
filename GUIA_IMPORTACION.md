# Guía de Importación Masiva de Datos

Esta guía te ayudará a importar todos tus grupos y alumnos de manera rápida y eficiente usando archivos CSV de Excel.

## Pasos para Importar Datos

### 1. Prepara tus archivos Excel

Crea dos archivos Excel separados:

#### **Archivo 1: grupos.xlsx**

| grupo | nivel | horario | cicloEscolar | aula |
|-------|-------|---------|--------------|------|
| A | Secundaria | Lunes:08:00-09:00,Miércoles:10:00-11:00 | 2025-2026 | A-201 |
| B | Secundaria | Martes:09:00-10:00,Jueves:11:00-12:00 | 2025-2026 | A-202 |
| 5AVE | Preparatoria | Martes:14:00-15:00,Jueves:14:00-15:00 | 2025-2026 | B-101 |

**Formato del horario:**
- Múltiples clases separadas por comas
- Formato: `Dia:HH:MM-HH:MM`
- Ejemplo: `Lunes:08:00-09:00,Miércoles:10:00-11:00,Viernes:08:00-09:00`

**Días válidos:** Lunes, Martes, Miércoles, Jueves, Viernes, Sábado

#### **Archivo 2: alumnos.xlsx**

| nombre | apellidos | fechaNacimiento | grupo | cicloEscolar | promedio | xp | salud |
|--------|-----------|----------------|-------|--------------|----------|----|----|
| Juan Carlos | Pérez García | 2010-05-15 | A | 2025-2026 | 85 | 150 | 90 |
| Ana María | López Martínez | 2010-08-22 | A | 2025-2026 | 92 | 250 | 100 |
| María Fernanda | González Ruiz | 2011-01-20 | B | 2025-2026 | 88 | 180 | 95 |

**Notas importantes:**
- `grupo`: Debe coincidir exactamente con un grupo que ya hayas creado
- `fechaNacimiento`: Formato YYYY-MM-DD (ej: 2010-05-15)
- `promedio`: Número entre 0 y 100
- `xp`: Puntos de experiencia (default: 0)
- `salud`: Puntos de vida entre 0 y 100 (default: 100)

### 2. Exporta a CSV

**Desde Excel:**
1. Abre tu archivo Excel
2. Ve a **Archivo → Guardar como**
3. Selecciona **CSV UTF-8 (delimitado por comas) (*.csv)**
4. Guarda como `grupos.csv` y `alumnos.csv`

**Desde Google Sheets:**
1. Abre tu hoja
2. Ve a **Archivo → Descargar → Valores separados por comas (.csv)**

### 3. Coloca los archivos en la carpeta correcta

Copia tus archivos CSV a la carpeta `datos/`:

```
controlAulaClaude/
├── datos/
│   ├── grupos.csv
│   └── alumnos.csv
```

### 4. Ejecuta el script de importación

Abre la terminal en la carpeta del proyecto y ejecuta:

```bash
node scripts/importarDatos.js
```

### 5. Verifica los resultados

El script te mostrará:
- ✅ Cuántos grupos se importaron correctamente
- ✅ Cuántos alumnos se importaron correctamente
- ❌ Errores encontrados (si los hay)

**Ejemplo de salida:**
```
🔌 Conectando a MongoDB...
✅ Conectado a MongoDB

📚 Importando grupos desde CSV...
   ✅ Grupo A - Secundaria creado
   ✅ Grupo B - Secundaria creado
   ✅ Grupo C - Secundaria creado

✅ 10 grupos importados exitosamente

👨‍🎓 Importando alumnos desde CSV...
   ✅ Juan Carlos Pérez García → Grupo A
   ✅ Ana María López Martínez → Grupo A
   ✅ Carlos Eduardo Ramírez Hernández → Grupo A
   ...

✅ 350 alumnos importados exitosamente

✨ Importación completada
```

## Errores Comunes

### Error: "Grupo no encontrado"
**Causa:** El grupo especificado en alumnos.csv no existe.

**Solución:**
1. Verifica que el nombre del grupo en `alumnos.csv` sea exactamente igual al de `grupos.csv`
2. Asegúrate de importar los grupos PRIMERO, antes que los alumnos

### Error: "duplicate key error"
**Causa:** Ya existe un grupo/alumno con los mismos datos.

**Solución:**
- Si quieres reemplazar todos los datos, primero elimina los grupos y alumnos existentes
- O cambia el identificador del grupo/alumno en tu CSV

### Error: "El formato debe ser HH:MM"
**Causa:** El horario no está en el formato correcto.

**Solución:** Usa el formato `Dia:HH:MM-HH:MM` (ej: `Lunes:08:00-09:00`)

## Consejos Pro

### 1. Usa fórmulas en Excel para generar datos

**Para generar 35 alumnos similares:**
```excel
=CONCATENAR("Alumno", FILA()-1)  // Genera: Alumno1, Alumno2, etc.
```

### 2. Copia y pega desde listas existentes

Si ya tienes tus listas de alumnos en otro formato, simplemente:
1. Copia los nombres
2. Pégalos en Excel
3. Separa en columnas (nombre y apellidos)
4. Completa los demás campos

### 3. Valores por defecto

Si no especificas algunos valores, se usarán estos valores por defecto:
- `promedio`: 0
- `xp`: 0
- `salud`: 100

### 4. Importaciones incrementales

Puedes ejecutar el script múltiples veces:
- Si un grupo ya existe, se saltará (error duplicate)
- Puedes agregar más alumnos a grupos existentes sin problema

## Plantillas de Ejemplo

Los archivos en la carpeta `datos/` son plantillas que puedes usar como referencia:
- `datos/grupos.csv` - Ejemplo con 10 grupos
- `datos/alumnos.csv` - Ejemplo con 10 alumnos

## Limpieza de Datos

Si quieres empezar de cero, ejecuta:

```bash
node scripts/poblarDatosEjemplo.js
```

Esto eliminará todos los datos y creará datos de ejemplo limpios.

## Resumen de Flujo

```
1. Crear Excel con tus datos
   ↓
2. Exportar a CSV
   ↓
3. Copiar archivos a carpeta datos/
   ↓
4. Ejecutar: node scripts/importarDatos.js
   ↓
5. ¡Listo! 🎉
```

## Necesitas Ayuda?

Si tienes problemas con la importación:
1. Verifica que tus archivos CSV estén en la carpeta `datos/`
2. Revisa que el formato de los datos sea correcto
3. Lee los mensajes de error que muestra el script
4. Consulta esta guía para soluciones comunes
