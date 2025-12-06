# Ejemplos de Uso de la API

Esta guía contiene ejemplos prácticos para probar todos los endpoints de la API.

## 🔧 Herramientas para Probar

Puedes usar cualquiera de estas herramientas:
- **Postman**: Interfaz gráfica (recomendado para principiantes)
- **Thunder Client**: Extensión de VS Code
- **curl**: Desde la terminal
- **Insomnia**: Cliente REST

---

## 📚 GRUPOS

### 1. Crear un grupo de Secundaria

**POST** `http://localhost:3000/api/grupos`

```json
{
  "nombre": "3A",
  "nivel": "Secundaria",
  "grado": 3,
  "cicloEscolar": "2024-2025",
  "turno": "Matutino",
  "capacidad": 40
}
```

### 2. Crear un grupo de Preparatoria

**POST** `http://localhost:3000/api/grupos`

```json
{
  "nombre": "1B",
  "nivel": "Preparatoria",
  "grado": 1,
  "cicloEscolar": "2024-2025",
  "turno": "Vespertino",
  "capacidad": 35
}
```

### 3. Obtener todos los grupos

**GET** `http://localhost:3000/api/grupos`

### 4. Obtener grupos filtrados

**GET** `http://localhost:3000/api/grupos?nivel=Secundaria&activo=true`

### 5. Actualizar un grupo

**PUT** `http://localhost:3000/api/grupos/[ID_DEL_GRUPO]`

```json
{
  "capacidad": 45
}
```

---

## 👨‍🎓 ALUMNOS

### 1. Registrar un alumno

**POST** `http://localhost:3000/api/alumnos`

```json
{
  "matricula": "SEC2024001",
  "nombre": "Juan Carlos",
  "apellidoPaterno": "Pérez",
  "apellidoMaterno": "García",
  "grupo": "[ID_DEL_GRUPO]",
  "fechaNacimiento": "2010-05-15",
  "contacto": {
    "email": "maria.garcia@email.com",
    "telefono": "5512345678",
    "nombreTutor": "María García"
  },
  "notas": "Sin alergias conocidas"
}
```

### 2. Registrar varios alumnos

**Alumno 2:**
```json
{
  "matricula": "SEC2024002",
  "nombre": "Ana María",
  "apellidoPaterno": "López",
  "apellidoMaterno": "Martínez",
  "grupo": "[ID_DEL_GRUPO]",
  "fechaNacimiento": "2010-08-22",
  "contacto": {
    "email": "lopez.tutor@email.com",
    "telefono": "5523456789",
    "nombreTutor": "Roberto López"
  }
}
```

**Alumno 3:**
```json
{
  "matricula": "SEC2024003",
  "nombre": "Carlos Eduardo",
  "apellidoPaterno": "Ramírez",
  "apellidoMaterno": "Hernández",
  "grupo": "[ID_DEL_GRUPO]",
  "fechaNacimiento": "2010-03-10"
}
```

### 3. Buscar alumno por matrícula

**GET** `http://localhost:3000/api/alumnos/matricula/SEC2024001`

### 4. Obtener alumnos de un grupo específico

**GET** `http://localhost:3000/api/alumnos?grupo=[ID_DEL_GRUPO]`

### 5. Buscar alumnos por texto

**GET** `http://localhost:3000/api/alumnos?busqueda=Juan`

### 6. Cambiar alumno de grupo

**PATCH** `http://localhost:3000/api/alumnos/[ID_DEL_ALUMNO]/cambiar-grupo`

```json
{
  "nuevoGrupoId": "[ID_DEL_NUEVO_GRUPO]"
}
```

---

## ✅ EVENTOS: ASISTENCIA

### 1. Registrar asistencia PRESENTE

**POST** `http://localhost:3000/api/eventos/asistencia`

```json
{
  "alumno": "[ID_DEL_ALUMNO]",
  "estado": "Presente"
}
```

### 2. Registrar AUSENTE

```json
{
  "alumno": "[ID_DEL_ALUMNO]",
  "estado": "Ausente",
  "observaciones": "No se presentó"
}
```

### 3. Registrar RETARDO

```json
{
  "alumno": "[ID_DEL_ALUMNO]",
  "estado": "Retardo",
  "minutosRetardo": 15,
  "observaciones": "Llegó 15 minutos tarde"
}
```

### 4. Registrar falta JUSTIFICADA

```json
{
  "alumno": "[ID_DEL_ALUMNO]",
  "estado": "Justificada",
  "justificante": "Consulta médica - Clínica del IMSS. Dr. Rodríguez",
  "observaciones": "Presentó receta médica"
}
```

### 5. Registrar asistencia con fecha específica

```json
{
  "alumno": "[ID_DEL_ALUMNO]",
  "estado": "Presente",
  "fecha": "2024-11-20T08:00:00.000Z"
}
```

---

## 🚻 EVENTOS: SALIDA AL BAÑO

### 1. Registrar salida al baño

**POST** `http://localhost:3000/api/eventos/salida-bano`

```json
{
  "alumno": "[ID_DEL_ALUMNO]"
}
```

### 2. Registrar regreso del baño

**PATCH** `http://localhost:3000/api/eventos/salida-bano/[ID_DEL_EVENTO]/regreso`

```json
{
  "horaRegreso": "2024-11-29T10:15:00.000Z"
}
```

O simplemente envía un objeto vacío para registrar el regreso en el momento actual:

```json
{}
```

---

## 🏥 EVENTOS: SALIDA A ENFERMERÍA

### 1. Registrar salida a enfermería por dolor de cabeza

**POST** `http://localhost:3000/api/eventos/enfermeria`

```json
{
  "alumno": "[ID_DEL_ALUMNO]",
  "motivo": "Dolor de cabeza",
  "descripcion": "Presenta dolor intenso de cabeza y mareo"
}
```

### 2. Registrar salida por lesión

```json
{
  "alumno": "[ID_DEL_ALUMNO]",
  "motivo": "Lesión",
  "descripcion": "Se golpeó la rodilla en clase de educación física",
  "observaciones": "Requiere aplicación de hielo"
}
```

### 3. Actualizar cuando regresa de enfermería

**PATCH** `http://localhost:3000/api/eventos/enfermeria/[ID_DEL_EVENTO]`

```json
{
  "horaRegreso": "2024-11-29T11:30:00.000Z",
  "regreso": "Regresó a clase",
  "atencionRecibida": "Se aplicó hielo y tomó paracetamol"
}
```

### 4. Actualizar cuando se fue a casa

```json
{
  "horaRegreso": "2024-11-29T11:00:00.000Z",
  "regreso": "Se fue a casa",
  "atencionRecibida": "Se notificó al tutor para que lo recoja"
}
```

---

## ⚠️ EVENTOS: INDISCIPLINA

### 1. Registrar indisciplina leve (uso de celular)

**POST** `http://localhost:3000/api/eventos/indisciplina`

```json
{
  "alumno": "[ID_DEL_ALUMNO]",
  "descripcion": "Estaba usando el celular durante la explicación del tema",
  "tipo": "Uso de celular",
  "gravedad": "Leve",
  "accionTomada": "Advertencia verbal, se le pidió guardar el celular"
}
```

### 2. Registrar indisciplina moderada (disturbio)

```json
{
  "alumno": "[ID_DEL_ALUMNO]",
  "descripcion": "Interrumpió la clase en varias ocasiones hablando con compañeros",
  "tipo": "Disturbio en clase",
  "gravedad": "Moderado",
  "accionTomada": "Se cambió de lugar al alumno"
}
```

### 3. Registrar indisciplina grave (falta de respeto)

```json
{
  "alumno": "[ID_DEL_ALUMNO]",
  "descripcion": "Respondió de manera irrespetuosa al maestro",
  "tipo": "Falta de respeto",
  "gravedad": "Grave",
  "accionTomada": "Reporte a coordinación académica"
}
```

### 4. Marcar que se notificó al tutor

**PATCH** `http://localhost:3000/api/eventos/indisciplina/[ID_DEL_EVENTO]/notificar`

```json
{}
```

---

## 📝 EVENTOS: PERSONALIZADOS

### 1. Registrar participación destacada

**POST** `http://localhost:3000/api/eventos/personalizado`

```json
{
  "alumno": "[ID_DEL_ALUMNO]",
  "titulo": "Participación destacada",
  "categoria": "Reconocimiento",
  "descripcion": "Excelente participación en la exposición del tema de historia",
  "datosAdicionales": {
    "materia": "Historia de México",
    "calificacion": 10
  }
}
```

### 2. Registrar préstamo de material

```json
{
  "alumno": "[ID_DEL_ALUMNO]",
  "titulo": "Préstamo de material",
  "categoria": "Biblioteca",
  "descripcion": "Préstamo de calculadora científica",
  "datosAdicionales": {
    "material": "Calculadora Casio FX-991",
    "fechaDevolucion": "2024-12-15"
  }
}
```

### 3. Registrar actividad extracurricular

```json
{
  "alumno": "[ID_DEL_ALUMNO]",
  "titulo": "Participación en concurso",
  "categoria": "Actividad extracurricular",
  "descripcion": "Participó en el concurso de matemáticas interescolar",
  "datosAdicionales": {
    "concurso": "Olimpiada de Matemáticas",
    "lugar": "3er lugar",
    "premio": "Medalla de bronce"
  }
}
```

---

## 📊 CONSULTAR EVENTOS

### 1. Obtener todos los eventos recientes

**GET** `http://localhost:3000/api/eventos?limite=50`

### 2. Obtener eventos de un alumno específico

**GET** `http://localhost:3000/api/eventos/alumno/[ID_DEL_ALUMNO]`

### 3. Obtener solo asistencias de un alumno

**GET** `http://localhost:3000/api/eventos/alumno/[ID_DEL_ALUMNO]?tipoEvento=Asistencia`

### 4. Obtener eventos en un rango de fechas

**GET** `http://localhost:3000/api/eventos?fechaInicio=2024-11-01&fechaFin=2024-11-30`

### 5. Obtener solo indisciplinas

**GET** `http://localhost:3000/api/eventos?tipoEvento=Indisciplina&limite=20`

### 6. Eventos de hoy de un alumno

**GET** `http://localhost:3000/api/eventos/alumno/[ID_DEL_ALUMNO]?fechaInicio=2024-11-29T00:00:00Z&fechaFin=2024-11-29T23:59:59Z`

---

## 🎯 FLUJOS DE TRABAJO TÍPICOS

### Flujo 1: Pasar lista por la mañana

1. Obtener alumnos del grupo:
   ```
   GET /api/grupos/[ID_GRUPO]/alumnos
   ```

2. Para cada alumno, registrar asistencia:
   ```
   POST /api/eventos/asistencia
   { "alumno": "ID", "estado": "Presente" }
   ```

### Flujo 2: Alumno sale al baño y regresa

1. Registrar salida:
   ```
   POST /api/eventos/salida-bano
   { "alumno": "ID" }
   ```
   Guardar el ID del evento retornado.

2. Cuando regresa:
   ```
   PATCH /api/eventos/salida-bano/[ID_EVENTO]/regreso
   {}
   ```

### Flujo 3: Incidente de indisciplina con notificación

1. Registrar el incidente:
   ```
   POST /api/eventos/indisciplina
   { "alumno": "ID", "descripcion": "...", "tipo": "...", "gravedad": "Grave" }
   ```

2. Después de llamar al tutor:
   ```
   PATCH /api/eventos/indisciplina/[ID_EVENTO]/notificar
   {}
   ```

---

## 💡 TIPS

1. **Guardar IDs**: Cuando crees grupos y alumnos, guarda sus IDs para usarlos en otros requests.

2. **Fechas**: Si no especificas fecha, se usa la fecha/hora actual del servidor.

3. **Formato de fechas**: Usa formato ISO 8601: `2024-11-29T10:00:00.000Z`

4. **Campos opcionales**: Puedes omitir campos opcionales en los requests.

5. **Errores**: Si algo falla, la API te dirá qué salió mal en el mensaje de error.

6. **Testing**: Te recomiendo crear algunos datos de prueba antes de usar en producción.
