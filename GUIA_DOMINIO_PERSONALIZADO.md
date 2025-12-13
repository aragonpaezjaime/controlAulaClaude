# 🌐 Guía Paso a Paso: Dominio Personalizado

**Para:** Control de Aula - Secundaria Técnica #50
**Objetivo:** Tener tu propio dominio como `secundariatecnica50.com`
**Tiempo estimado:** 30 minutos
**Costo:** $180-300 MXN/año

---

## 📋 ANTES DE EMPEZAR

Necesitarás:
- ✅ Tarjeta de crédito/débito (Visa, Mastercard, American Express)
- ✅ Correo electrónico activo
- ✅ 30 minutos de tiempo
- ✅ Conexión a internet

**IMPORTANTE:** Los dominios se renuevan automáticamente cada año. Asegúrate de poder pagar ~$200-300 MXN anuales.

---

# 🟣 OPCIÓN A: PORKBUN (MÁS BARATO)

## 💰 Precio: $9-12 USD/año (~$180-240 MXN)

### PASO 1: Crear Cuenta en Porkbun

1. **Abre tu navegador** y ve a: [https://porkbun.com](https://porkbun.com)

2. **Click en "Sign Up"** (arriba a la derecha)

3. **Llena el formulario:**
   - Email: Tu correo personal (lo usarás para todo)
   - Password: Crea una contraseña segura
   - Confirm Password: Repite la contraseña
   - Click en "Create Account"

4. **Verifica tu email:**
   - Revisa tu correo (puede estar en spam)
   - Click en el link de verificación
   - Ya tienes cuenta creada ✅

---

### PASO 2: Buscar y Verificar Disponibilidad

1. **En la página principal** de Porkbun verás una barra de búsqueda grande

2. **Escribe el dominio** que quieres:
   - Ejemplos: `secundariatecnica50`, `st50`, `controldealumnos`
   - **NO** escribas el `.com` todavía, solo el nombre

3. **Click en "Search"**

4. **Verás una lista de opciones:**
   ```
   secundariatecnica50.com     $9.73/year   [Add to Cart]
   secundariatecnica50.net     $13.98/year  [Add to Cart]
   secundariatecnica50.org     $14.66/year  [Add to Cart]
   secundariatecnica50.com.mx  $29.54/year  [Add to Cart]
   ```

5. **Recomendación:**
   - Si está disponible: **`.com`** (el más barato y universal)
   - Si prefieres identidad mexicana: **`.com.mx`** (más caro pero local)

---

### PASO 3: Agregar al Carrito

1. **Click en "Add to Cart"** junto al dominio que elegiste

2. **Configurar opciones:**
   - **Domain Privacy (WHOIS Privacy):** ✅ GRATIS - Déjalo marcado
     - Protege tus datos personales
   - **Auto-Renew:** ✅ Recomendado
     - Se renovará automáticamente cada año
   - **Years:** Selecciona **1 year** (puedes cambiar después)

3. **Click en "Checkout"** o "Proceed to Checkout"

---

### PASO 4: Completar Información

1. **Información de Contacto:**
   - First Name: Tu nombre
   - Last Name: Tu apellido
   - Email: Tu correo (el mismo de la cuenta)
   - Phone: Tu teléfono (formato: +52 1234567890)
   - Address: Tu dirección
   - City: Tu ciudad
   - State: Tu estado
   - Postal Code: Tu código postal
   - Country: Mexico

2. **Método de Pago:**
   - Selecciona **"Credit Card"**
   - Ingresa los datos de tu tarjeta:
     - Número de tarjeta
     - Fecha de expiración (MM/YY)
     - CVV (3 dígitos atrás)
     - Nombre como aparece en la tarjeta

3. **Revisar el Total:**
   ```
   Domain: secundariatecnica50.com    $9.73
   WHOIS Privacy: FREE                $0.00
   ----------------------------------------
   TOTAL:                             $9.73 USD
   ```
   (Aproximadamente $180-200 MXN según el tipo de cambio)

4. **Click en "Place Order"**

---

### PASO 5: Confirmación

1. **Espera unos segundos** mientras procesa el pago

2. **Recibirás un email** con:
   - Subject: "Order Confirmation - Porkbun.com"
   - Confirmación de compra
   - Detalles del dominio

3. **¡Felicidades!** Ya tienes tu dominio ✅

---

### PASO 6: Configurar DNS para Render

1. **Ve al Dashboard de Porkbun:**
   - Login en [https://porkbun.com](https://porkbun.com)
   - Click en "Account" → "Domain Management"

2. **Click en tu dominio** (ej: secundariatecnica50.com)

3. **Ir a DNS Settings:**
   - Busca la pestaña **"DNS"** o **"DNS Records"**
   - Click ahí

4. **IMPORTANTE - Primero obtén la dirección de Render:**

   **Ir a Render (en otra pestaña):**
   - Ve a [https://dashboard.render.com](https://dashboard.render.com)
   - Click en tu servicio "control-aula-secundaria50"
   - Ve a **Settings** → **Custom Domain**
   - Click en **"Add Custom Domain"**
   - Escribe tu dominio: `secundariatecnica50.com`
   - Click en **"Add"**
   - **Render te mostrará algo como:**
     ```
     Add this CNAME record to your DNS provider:

     Type: CNAME
     Name: secundariatecnica50.com
     Value: control-aula-secundaria50.onrender.com
     ```
     **O podría ser una IP tipo A:**
     ```
     Type: A
     Name: @
     Value: 216.24.57.X
     ```
   - **COPIA ESTA INFORMACIÓN** (la necesitarás)

5. **Volver a Porkbun DNS Settings:**

   **Si Render te dio CNAME:**
   - Click en **"Add Record"** o **"+"**
   - Type: **CNAME**
   - Host: **@** (o deja en blanco si pide)
   - Answer: **control-aula-secundaria50.onrender.com**
   - TTL: **600** (déjalo por defecto)
   - Click en **"Add"** o **"Save"**

   **Si Render te dio una IP (registro A):**
   - Click en **"Add Record"** o **"+"**
   - Type: **A**
   - Host: **@**
   - Answer: **[La IP que te dio Render]**
   - TTL: **600**
   - Click en **"Add"** o **"Save"**

   **TAMBIÉN agrega para www:**
   - Click en **"Add Record"**
   - Type: **CNAME**
   - Host: **www**
   - Answer: **secundariatecnica50.com** (tu dominio raíz)
   - TTL: **600**
   - Click en **"Add"**

6. **Eliminar registros antiguos (si los hay):**
   - Si ves registros A o CNAME antiguos apuntando a otros lados
   - Elimínalos (botón 🗑️ o "Delete")
   - **NO elimines** los registros MX, TXT, o NS

7. **Click en "Save Changes"** o "Update"

---

### PASO 7: Esperar Propagación DNS

1. **Tiempo de espera:** 5 minutos a 24 horas
   - Usualmente: 15-30 minutos
   - Máximo: 24 horas

2. **Verificar si ya funciona:**
   - Abre una ventana de incógnito
   - Ve a: `http://tu-dominio.com`
   - Si carga tu sitio, ¡funciona! ✅
   - Si dice "Site not found" o no carga, espera más

3. **Herramienta de verificación:**
   - Ve a: [https://www.whatsmydns.net](https://www.whatsmydns.net)
   - Ingresa tu dominio
   - Selecciona "A" o "CNAME"
   - Click en "Search"
   - Verás si los DNS se propagaron mundialmente

---

### PASO 8: Verificar en Render

1. **Ve a Render Dashboard**

2. **Tu servicio → Settings → Custom Domain**

3. **Deberías ver:**
   ```
   secundariatecnica50.com     ✅ Verified
   SSL Certificate:            ✅ Active
   ```

4. **Si ves "Pending":**
   - Espera unos minutos más
   - La verificación es automática

5. **Cuando veas ✅ Verified:**
   - ¡Tu dominio está activo!
   - HTTPS se configurará automáticamente en 5-10 minutos

---

### PASO 9: Probar Todo

1. **Abre tu dominio:**
   - `https://tu-dominio.com`
   - Debería cargar tu página de inicio

2. **Probar el portal de estudiantes:**
   - `https://tu-dominio.com/portal-estudiante-login.html`

3. **Probar tu dashboard:**
   - `https://tu-dominio.com/index.html`

4. **Verificar HTTPS:**
   - Deberías ver un candado 🔒 en la barra de direcciones
   - Si no aparece, espera 10-15 minutos más

---

# 🔵 OPCIÓN B: NAMECHEAP (MÁS CONOCIDO)

## 💰 Precio: $10-15 USD/año (~$200-300 MXN)

### PASO 1: Crear Cuenta en Namecheap

1. **Ve a:** [https://www.namecheap.com](https://www.namecheap.com)

2. **Click en "Sign Up"** (arriba a la derecha)

3. **Llenar formulario:**
   - Username: Elige un nombre de usuario
   - Email Address: Tu correo
   - Password: Contraseña segura
   - Check: "I'm not a robot"
   - Click en "Create Account"

4. **Verificar email** (revisa spam si no llega)

---

### PASO 2: Buscar Dominio

1. **En la página principal** verás una barra de búsqueda

2. **Escribe tu dominio:**
   - Ejemplo: `secundariatecnica50`
   - Click en 🔍 o presiona Enter

3. **Verás resultados:**
   ```
   secundariatecnica50.com     $10.18/yr   [Add to Cart]
   secundariatecnica50.net     $13.98/yr   [Add to Cart]
   secundariatecnica50.org     $14.98/yr   [Add to Cart]
   ```

4. **Click en "Add to Cart"** en el `.com`

---

### PASO 3: Configurar y Pagar

1. **En el carrito, verás:**
   - Domain Registration: $10.18
   - WhoisGuard: FREE for 1st Year ✅
   - Auto-Renew: ON (recomendado)

2. **Duración:**
   - Selecciona **1 year** (puedes renovar después)

3. **Click en "Confirm Order"**

4. **Método de pago:**
   - Credit Card/Debit Card
   - Ingresa datos de tu tarjeta
   - Click en "Continue"

5. **Completar información de contacto:**
   - Nombre completo
   - Dirección
   - Teléfono
   - País: Mexico

6. **Click en "Continue to Payment"**

7. **Revisar total y confirmar:**
   - Click en "Pay Now"

---

### PASO 4: Configurar DNS en Namecheap

1. **Dashboard de Namecheap:**
   - Login en [https://www.namecheap.com](https://www.namecheap.com)
   - Click en "Domain List" (menú lateral)

2. **Click en "Manage"** junto a tu dominio

3. **Ir a Advanced DNS:**
   - Click en la pestaña **"Advanced DNS"**

4. **Obtener dirección de Render** (igual que Porkbun Paso 6.4)

5. **Agregar registros DNS:**

   **Eliminar registros existentes:**
   - Elimina cualquier registro A o CNAME que veas
   - Click en el ícono 🗑️
   - **NO borres** registros de tipo MX, TXT o NS

   **Agregar nuevo registro CNAME:**
   - Click en **"Add New Record"**
   - Type: **CNAME Record**
   - Host: **@**
   - Value: **control-aula-secundaria50.onrender.com**
   - TTL: **Automatic**
   - Click en ✅ (guardar)

   **Agregar para www:**
   - Click en **"Add New Record"**
   - Type: **CNAME Record**
   - Host: **www**
   - Value: **secundariatecnica50.com** (tu dominio)
   - TTL: **Automatic**
   - Click en ✅

6. **Click en "Save All Changes"** (arriba a la derecha)

---

### PASO 5-9: Igual que Porkbun

- Los pasos de propagación DNS, verificación en Render y pruebas son exactamente iguales
- Sigue los pasos 7-9 de la guía de Porkbun

---

# 🆘 SOLUCIÓN DE PROBLEMAS

## Problema 1: "Domain not verified" en Render

**Causa:** Los DNS aún no se han propagado

**Solución:**
1. Espera 1-2 horas más
2. Verifica en [whatsmydns.net](https://www.whatsmydns.net)
3. Asegúrate que los registros DNS estén bien configurados

---

## Problema 2: "Site not found" al abrir el dominio

**Causa:** DNS no apuntan correctamente

**Solución:**
1. Verifica que agregaste el registro CNAME correcto
2. Verifica que apunta a: `control-aula-secundaria50.onrender.com`
3. Espera 30 minutos más
4. Intenta en modo incógnito

---

## Problema 3: "Not Secure" o sin candado HTTPS

**Causa:** El certificado SSL aún se está generando

**Solución:**
1. Espera 15-30 minutos después de que DNS funcione
2. Render genera el certificado automáticamente
3. Si después de 2 horas no aparece, contacta soporte de Render

---

## Problema 4: Rechazaron mi tarjeta

**Causa:** Compra internacional, límites de tarjeta, o validación

**Solución:**
1. Llama a tu banco y autoriza compras internacionales
2. Verifica que tu tarjeta tenga fondos suficientes
3. Intenta con otra tarjeta
4. Usa PayPal como método alternativo

---

# 📊 COMPARACIÓN FINAL

| Aspecto | Porkbun | Namecheap |
|---------|---------|-----------|
| **Precio .com** | $9-12 USD | $10-15 USD |
| **Interfaz** | Simple, moderna | Más opciones, compleja |
| **Soporte** | Email, chat | Email, chat, teléfono |
| **WHOIS Privacy** | GRATIS siempre | GRATIS 1er año, después $2.88/año |
| **Facilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Recomendado para** | Principiantes | Usuarios con experiencia |

---

# ✅ CHECKLIST FINAL

Antes de finalizar, verifica que:

- [ ] El dominio está registrado a tu nombre
- [ ] Los DNS apuntan a Render
- [ ] El dominio carga tu sitio web
- [ ] HTTPS está activo (🔒)
- [ ] El portal de estudiantes funciona con el nuevo dominio
- [ ] Tu dashboard funciona con el nuevo dominio
- [ ] Guardaste las credenciales de tu proveedor de dominio
- [ ] Configuraste auto-renovación

---

# 🎉 ¡LISTO!

Ahora tienes:
- ✅ Tu propio dominio profesional
- ✅ HTTPS seguro
- ✅ Fácil de compartir con estudiantes
- ✅ Renovación automática cada año

**URLs finales:**
- Portal Estudiantes: `https://tu-dominio.com/portal-estudiante-login.html`
- Dashboard Profesor: `https://tu-dominio.com/index.html`

---

# 📱 Actualizar en tus Materiales

Ahora puedes cambiar el link en:
- Mensajes a estudiantes
- Presentaciones
- Pósters en la escuela
- Códigos QR

**¡Tu proyecto ahora es totalmente profesional! 🚀**

---

**Desarrollado para Secundaria Técnica #50**
**Fecha:** Diciembre 2025
**🤖 Asistido por Claude Code**
