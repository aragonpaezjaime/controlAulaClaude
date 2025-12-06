# Configuración de MongoDB

Tienes dos opciones para usar MongoDB con este proyecto:

## OPCIÓN 1: MongoDB Local (Recomendado para desarrollo)

### Iniciar MongoDB

```bash
# Iniciar el servicio
sudo systemctl start mongod

# Verificar que está corriendo
sudo systemctl status mongod

# (Opcional) Hacer que inicie automáticamente al arrancar el sistema
sudo systemctl enable mongod
```

### Detener MongoDB

```bash
sudo systemctl stop mongod
```

### La configuración en .env ya está lista:
```
MONGODB_URI=mongodb://localhost:27017/control-aula
```

---

## OPCIÓN 2: MongoDB Atlas (Cloud - Gratis)

MongoDB Atlas es la versión cloud de MongoDB, completamente gratis para empezar.

### Pasos para configurar MongoDB Atlas:

1. **Crear cuenta gratuita:**
   - Ve a: https://www.mongodb.com/cloud/atlas/register
   - Regístrate con tu email
   - Elige el plan **FREE** (M0)

2. **Crear un Cluster:**
   - Selecciona la región más cercana (ej: AWS - N. Virginia)
   - Nombre del cluster: `control-aula`
   - Click en "Create"
   - Espera 3-5 minutos mientras se crea

3. **Configurar acceso:**

   **a) Usuario de base de datos:**
   - Ve a "Database Access" (menú izquierdo)
   - Click "Add New Database User"
   - Username: `admin` (o el que prefieras)
   - Password: Genera una contraseña segura (guárdala!)
   - Database User Privileges: "Atlas admin"
   - Click "Add User"

   **b) Permitir acceso desde tu IP:**
   - Ve a "Network Access" (menú izquierdo)
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - (En producción usa tu IP específica)
   - Click "Confirm"

4. **Obtener la URI de conexión:**
   - Ve a "Database" (menú izquierdo)
   - Click en "Connect" en tu cluster
   - Selecciona "Connect your application"
   - Copia la connection string (se ve así):
     ```
     mongodb+srv://admin:<password>@control-aula.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

5. **Configurar en tu proyecto:**

   Edita el archivo `.env` y reemplaza la URI:

   ```env
   # Reemplaza <password> con tu contraseña real
   MONGODB_URI=mongodb+srv://admin:TU_PASSWORD_AQUI@control-aula.xxxxx.mongodb.net/control-aula?retryWrites=true&w=majority
   ```

   **IMPORTANTE**: Asegúrate de:
   - Reemplazar `<password>` con tu contraseña real
   - Agregar `/control-aula` antes del `?` para especificar el nombre de la BD
   - NO incluir espacios ni caracteres especiales en la contraseña (o codifícalos)

---

## ¿Cuál elegir?

### MongoDB Local ✅
- ✅ Más rápido (no depende de internet)
- ✅ Gratis sin límites
- ✅ Ideal para desarrollo
- ❌ Requiere instalación local
- ❌ Debes iniciar el servicio cada vez

### MongoDB Atlas (Cloud) ✅
- ✅ No requiere instalación
- ✅ Accesible desde cualquier lugar
- ✅ Backups automáticos
- ✅ Gratis hasta 512 MB
- ❌ Requiere conexión a internet
- ❌ Puede ser más lento

---

## Verificar la conexión

Una vez que hayas elegido y configurado, prueba la conexión:

```bash
# Opción A: Con el script de datos de ejemplo
node scripts/poblarDatosEjemplo.js

# Opción B: Iniciando el servidor directamente
npm run dev
```

Si ves `✅ MongoDB conectado`, ¡todo está funcionando!

---

## Solución de Problemas

### Error: "MongoServerError: bad auth"
- Verifica que el usuario y contraseña en el .env sean correctos
- En Atlas, confirma que el usuario tenga permisos

### Error: "ECONNREFUSED 127.0.0.1:27017"
- MongoDB local no está corriendo
- Inicia con: `sudo systemctl start mongod`

### Error: "MongoServerSelectionTimeoutError"
- En Atlas: Verifica que tu IP esté en la whitelist
- Verifica tu conexión a internet

### Error: "Authentication failed"
- Revisa que la contraseña en .env no tenga caracteres especiales sin codificar
- Usa: https://www.urlencoder.org/ para codificar caracteres especiales
