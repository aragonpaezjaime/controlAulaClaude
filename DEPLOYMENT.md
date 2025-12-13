# 🚀 Guía de Deployment - Control de Aula

**Sistema gamificado para Secundaria Técnica #50**

---

## 📋 Prerequisitos

Antes de comenzar, asegúrate de tener:

1. ✅ Cuenta en [GitHub](https://github.com) (ya tienes el código ahí)
2. ✅ Cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (ya configurada)
3. ⚠️ Cuenta en [Render](https://render.com) (crear si no la tienes)

---

## 🔧 PASO 1: Configurar MongoDB Atlas

**IMPORTANTE:** MongoDB Atlas debe permitir conexiones desde internet.

1. Ve a [MongoDB Atlas](https://cloud.mongodb.com)
2. Click en tu cluster → **Network Access** (en el menú lateral)
3. Click en **"+ ADD IP ADDRESS"**
4. Selecciona **"ALLOW ACCESS FROM ANYWHERE"** (0.0.0.0/0)
5. Click en **"Confirm"**

**¿Por qué?** Render necesita conectarse a tu base de datos desde servidores en la nube.

---

## 🌐 PASO 2: Crear cuenta en Render

1. Ve a [https://render.com](https://render.com)
2. Click en **"Get Started"** (arriba a la derecha)
3. Registrate con tu cuenta de **GitHub** (recomendado)
4. Autoriza a Render a acceder a tus repositorios

---

## 🚀 PASO 3: Crear el Web Service en Render

### 3.1 Nuevo Web Service

1. En el dashboard de Render, click en **"New +"** → **"Web Service"**
2. Conecta tu repositorio de GitHub:
   - Click en **"Connect a repository"**
   - Busca: **`controlAulaClaude`**
   - Click en **"Connect"**

### 3.2 Configurar el servicio

Llena el formulario con estos datos:

| Campo | Valor |
|-------|-------|
| **Name** | `control-aula-secundaria50` |
| **Region** | `Oregon (US West)` |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | **Free** |

### 3.3 Variables de Entorno

Antes de hacer deploy, configura las variables de entorno:

1. Scroll hasta la sección **"Environment Variables"**
2. Click en **"Add Environment Variable"**
3. Agrega estas variables:

| Key | Value | Dónde obtenerlo |
|-----|-------|-----------------|
| `NODE_ENV` | `production` | (escribir tal cual) |
| `MONGODB_URI` | `mongodb+srv://...` | MongoDB Atlas → Connect → Drivers |

**Para obtener MONGODB_URI:**
1. Ve a MongoDB Atlas → Tu Cluster
2. Click en **"Connect"** → **"Drivers"**
3. Copia la cadena de conexión
4. **IMPORTANTE:** Reemplaza `<password>` con tu contraseña real
5. Cambia `myFirstDatabase` por `test` (o el nombre de tu BD)

Ejemplo:
```
mongodb+srv://jaime:MiPassword123@cluster0.y0ukf6q.mongodb.net/test?retryWrites=true&w=majority
```

### 3.4 Deploy

1. Click en **"Create Web Service"** (abajo del formulario)
2. Render comenzará a construir y desplegar tu aplicación
3. **Espera 2-3 minutos** mientras se completa el deploy
4. Verás logs en tiempo real

---

## ✅ PASO 4: Verificar que funciona

Una vez que el deploy termine (verás "Live" en verde):

1. Render te dará una URL como: `https://control-aula-secundaria50.onrender.com`
2. Copia esa URL y ábrela en tu navegador
3. Deberías ver un JSON con los endpoints disponibles

**Probar el portal de estudiantes:**
```
https://control-aula-secundaria50.onrender.com/portal-estudiante-login.html
```

**Probar el dashboard del profesor:**
```
https://control-aula-secundaria50.onrender.com/index.html
```

---

## 📱 PASO 5: Compartir con tus estudiantes

1. Copia la URL del portal de estudiantes
2. Compártela con tus alumnos (por WhatsApp, Classroom, etc.)
3. Cada alumno ingresa con su clave de zipGrade

**Ejemplo de mensaje para tus alumnos:**

```
🎓 Portal del Estudiante - Secundaria Técnica #50

Ya pueden acceder a su portal personal para ver:
✅ Su ranking en el grupo
✅ Sus puntos XP y HP
✅ Su historial de actividades
✅ Comentarios del profesor

🌐 Link: https://tu-app.onrender.com/portal-estudiante-login.html
🔑 Clave: [Tu clave personal de zipGrade]

¡Nos vemos en clase! 👋
```

---

## ⚙️ Configuración Avanzada (Opcional)

### Dominio personalizado

Si tienes un dominio propio (ej: `secundaria50.edu.mx`):

1. En Render → Settings → Custom Domain
2. Agrega tu dominio
3. Configura los DNS según las instrucciones de Render

### Logs y Monitoreo

- **Ver logs:** Render Dashboard → Logs tab
- **Reiniciar:** Settings → Manual Deploy → "Deploy latest commit"
- **Errores:** Los verás en tiempo real en la pestaña Logs

### Plan Free de Render - Limitaciones

⚠️ **IMPORTANTE:**

El plan gratuito de Render tiene estas limitaciones:
- El servicio se "duerme" después de 15 minutos de inactividad
- La primera visita después de dormir tardará ~30 segundos en cargar
- 750 horas de uso por mes (más que suficiente)

**Solución:** Si quieres que esté siempre activo, puedes:
1. Usar el plan de pago ($7/mes)
2. Usar un servicio de "ping" gratuito que visite tu sitio cada 10 minutos

---

## 🆘 Problemas Comunes

### Error: "Application failed to respond"

**Causa:** MongoDB no permite conexiones desde Render

**Solución:**
1. MongoDB Atlas → Network Access
2. Verifica que 0.0.0.0/0 esté en la lista
3. Espera 1-2 minutos y reintenta

### Error: "MONGODB_URI is not defined"

**Causa:** Falta configurar la variable de entorno

**Solución:**
1. Render → Environment
2. Agrega MONGODB_URI con la cadena completa
3. Click en "Save Changes"
4. Render redesplegará automáticamente

### El sitio carga muy lento

**Causa:** Servicio dormido (plan Free)

**Solución:** Es normal. Después de la primera carga, funcionará normal.

---

## 📊 Monitoreo y Mantenimiento

### Ver estadísticas de uso

1. Render Dashboard → tu servicio
2. Pestaña "Metrics"
3. Verás CPU, memoria, requests

### Actualizar la aplicación

Cada vez que hagas `git push` a GitHub, Render detectará los cambios y:
1. Descargará el nuevo código automáticamente
2. Reconstruirá la aplicación
3. Redesplegará sin que tengas que hacer nada

**¡Deployment automático configurado! 🎉**

---

## 🔒 Seguridad

✅ **Buenas prácticas implementadas:**

- ✅ Variables de entorno (no hay contraseñas en el código)
- ✅ HTTPS automático (Render lo proporciona gratis)
- ✅ MongoDB con autenticación
- ✅ CORS configurado
- ✅ Validación de datos en el backend

⚠️ **Recomendaciones adicionales:**

1. Cambia la contraseña de MongoDB cada 3-6 meses
2. Monitorea los logs regularmente
3. Mantén backups de tu base de datos

---

## 📞 Soporte

Si tienes problemas:

1. **Logs de Render:** Revisa la pestaña "Logs" en Render
2. **Logs de MongoDB:** MongoDB Atlas → Metrics
3. **GitHub Issues:** Reporta problemas en el repositorio

---

## 🎉 ¡Listo!

Tu sistema de Control de Aula está ahora en producción y accesible desde cualquier lugar del mundo.

**URLs importantes:**

- 🎓 Portal Estudiantes: `https://tu-app.onrender.com/portal-estudiante-login.html`
- 👨‍🏫 Dashboard Profesor: `https://tu-app.onrender.com/index.html`
- 📊 API: `https://tu-app.onrender.com/api`

---

**Desarrollado para Secundaria Técnica #50**
**Fecha:** Diciembre 2025
**🤖 Generado con Claude Code**
