# GUÍA DE CONFIGURACIÓN PARA CLIENTE
## Sistema de Inscripciones JAGUARES

---

## 📋 RESUMEN

Esta guía te ayudará a configurar el sistema completo para un nuevo cliente en **30 minutos**.

### Lo que vas a hacer:
1. ✅ Crear Google Sheet con estructura correcta
2. ✅ Copiar y configurar Apps Script
3. ✅ Crear folder de Drive para documentos
4. ✅ Obtener URL del script publicado
5. ✅ Configurar variables en Render
6. ✅ Probar el sistema completo

---

## 🗂️ PASO 1: CREAR GOOGLE SHEET

### 1.1 Crear nueva hoja de cálculo
1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea nueva hoja de cálculo
3. Nómbrala: **"JAGUARES - Sistema de Inscripciones"**

### 1.2 Crear hojas requeridas
Crea estas hojas (pestañas) con estos nombres EXACTOS:

**Hojas obligatorias:**
- `HORARIOS`
- `INSCRIPCIONES`
- `PAGOS`

**Hojas por día (opcionales pero recomendadas):**
- `LUNES`
- `MARTES`
- `MIÉRCOLES`
- `JUEVES`
- `VIERNES`
- `SÁBADO`
- `DOMINGO`

**Hojas por deporte (según los deportes del cliente):**
- `FÚTBOL`
- `VÓLEY`
- `BÁSQUET`
- `FÚTBOL FEMENINO`
- `MAMAS FIT` (o `MAMÁ FIT`)
- Etc.

### 1.3 Configurar hoja HORARIOS
En la hoja `HORARIOS`, crea estos encabezados en la **fila 1**:

```
A: horario_id
B: deporte
C: dia
D: hora_inicio
E: hora_fin
F: cupo_maximo
G: cupos_ocupados
H: estado
I: precio
J: plan
K: categoria
L: nivel
M: año_min
N: año_max
O: genero
```

**Agregar horarios del cliente:**
- Llena filas con los horarios que tenga la academia
- `cupos_ocupados` empieza en 0
- `estado` debe ser "activo"
- `año_min` y `año_max` según las edades (recuerda: año más bajo = persona más vieja)

**Ejemplo de fila:**
```
1 | Fútbol | LUNES | 08:30 | 09:40 | 20 | 0 | activo | 120 | Económico | Sub-18 | AVANZADO | 2008 | 2010 | Mixto
```

### 1.4 Configurar hoja INSCRIPCIONES
En la hoja `INSCRIPCIONES`, crea estos encabezados en la **fila 1**:

```
A: fecha_registro
B: dni
C: nombres
D: apellidos
E: fecha_nacimiento
F: edad
G: sexo
H: telefono
I: email
J: apoderado
K: direccion
L: seguro_tipo
M: condicion_medica
N: telefono_apoderado
O: url_dni_frontal
P: url_dni_reverso
Q: url_foto_carnet
R: deporte
S: dia
T: codigo_registro
```

**No agregues datos aún** - el sistema lo llenará automáticamente.

### 1.5 Configurar hoja PAGOS
En la hoja `PAGOS`, crea estos encabezados en la **fila 1**:

```
A: codigo_operacion
B: dni
C: nombres
D: apellidos
E: telefono
F: monto
G: metodo_pago
H: estado_pago
I: fecha_registro
J: url_comprobante
K: fecha_subida
```

**No agregues datos aún** - el sistema lo llenará automáticamente.

### 1.6 Configurar hojas de días y deportes (opcional)
Las hojas de `LUNES`, `MARTES`, etc. y `FÚTBOL`, `VÓLEY`, etc. deben tener los **mismos encabezados que INSCRIPCIONES**.

Estas hojas se llenarán automáticamente cuando se inscriban alumnos.

---

## 📁 PASO 2: GOOGLE DRIVE (AUTOMÁTICO)

### 2.1 El sistema crea el folder automáticamente

**¡Buenas noticias!** No necesitas crear manualmente un folder en Drive. 

Cuando ejecutes el script por primera vez y autorices los permisos de Drive, el sistema automáticamente:
- ✅ Crea una carpeta llamada **"Comprobantes JAGUARES"** en tu Drive
- ✅ Dentro crea subcarpetas por alumno (Nombre_Apellido)
- ✅ Guarda los documentos organizados por alumno

**Lo que SÍ debes hacer:**
1. Al ejecutar el script por primera vez, autorizarás permisos de Drive
2. Después de la primera inscripción, ve a tu Drive
3. Busca la carpeta **"Comprobantes JAGUARES"**
4. Clic derecho → Compartir → **"Cualquiera con el enlace"** (Lector)

**Esto permite que el panel admin muestre las imágenes correctamente.**

### 2.2 Estructura que se crea automáticamente

```
📁 Comprobantes JAGUARES/
   ├── 📁 Juan_Perez_12345678/
   │   ├── 🖼️ comprobante_ACAD-20260109-ABC123.jpg
   │   ├── 🖼️ dni_frontal_12345678.jpg
   │   ├── 🖼️ dni_reverso_12345678.jpg
   │   └── 🖼️ foto_carnet_12345678.jpg
   │
   └── 📁 Maria_Lopez_87654321/
       ├── 🖼️ comprobante_ACAD-20260109-XYZ789.jpg
       ├── 🖼️ dni_frontal_87654321.jpg
       └── ...
```

---

## 💻 PASO 3: CONFIGURAR APPS SCRIPT

### 3.1 Abrir editor de Apps Script
1. En el Google Sheet creado, ve a **Extensiones → Apps Script**
2. Borra el código por defecto

### 3.2 Copiar el script completo
1. Abre el archivo `APPS-SCRIPT-GOOGLE-SHEETS.gs` de tu proyecto
2. **Copia TODO el contenido**
3. Pégalo en el editor de Apps Script

### 3.3 Configurar variables del cliente

**Busca estas líneas al inicio del script:**

```javascript
// ============= CONFIGURACIÓN =============
const SECURITY_TOKEN = 'tu_token_secreto_aqui_123456';
```

**Modifica:**

1. **SECURITY_TOKEN**: 
   - Genera un token único: puedes usar [este generador](https://www.uuidgenerator.net/)
   - Ejemplo: `JAGUARES-2026-a8f3d9e1b2c4`
   - **Guarda este token** - lo necesitarás en Render

**Ejemplo configurado:**
```javascript
const SECURITY_TOKEN = 'JAGUARES-2026-a8f3d9e1b2c4';
```

**Nota:** Ya NO necesitas configurar `DRIVE_FOLDER_ID` - el sistema crea el folder automáticamente.

### 3.4 Guardar el proyecto
1. Clic en **guardar** (💾)
2. Dale un nombre: **"JAGUARES Apps Script"**

---

## 🚀 PASO 4: PUBLICAR APPS SCRIPT

### 4.1 Implementar como Web App
1. En el editor de Apps Script, clic en **Implementar → Nueva implementación**
2. En "Tipo", selecciona **Aplicación web**
3. Configuración:
   - **Descripción**: "JAGUARES API v1"
   - **Ejecutar como**: **Yo** (tu cuenta de Google)
   - **Quién tiene acceso**: **Cualquier persona**
4. Clic en **Implementar**

### 4.2 Autorizar permisos
1. Te pedirá autorizar
2. Clic en **Revisar permisos**
3. Selecciona tu cuenta de Google
4. Si sale "Google no verificó esta app":
   - Clic en **Configuración avanzada**
   - Clic en **Ir a [nombre del proyecto] (no seguro)**
   - Clic en **Permitir**

### 4.3 Copiar URL del script
1. Después de implementar, verás una URL tipo:
   ```
   https://script.google.com/macros/s/AKfycbxXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec
   ```
2. **Copia esta URL completa**
3. **Guárdala** - la necesitas para Render

---

## ☁️ PASO 5: CONFIGURAR BACKEND EN RENDER

### 5.1 Acceder a tu backend en Render
1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Busca tu servicio: **jaguares-backend** (o el nombre que tenga)
3. Clic en el servicio

### 5.2 Actualizar variables de entorno
1. Ve a la pestaña **Environment**
2. Edita estas variables:

**Variables requeridas:**

```bash
# URL del Apps Script (del Paso 4.3)
APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbxXXXXXX/exec

# Token de seguridad (del Paso 3.3)
SECURITY_TOKEN=JAGUARES-2026-a8f3d9e1b2c4

# Puerto (dejar como está)
PORT=3002
```

3. Clic en **Save Changes**

### 5.3 Verificar redespliegue
- Render automáticamente redesplegar el backend
- Espera 2-3 minutos a que termine
- Verás "Deploy live" cuando esté listo

---

## 🌐 PASO 6: CONFIGURAR FRONTEND (Si es necesario)

### 6.1 Solo si el cliente tiene dominio propio

**Si el cliente usará tu dominio (escuelajaguares.netlify.app):**
- ✅ No necesitas hacer nada más

**Si el cliente tendrá su propio dominio:**
1. Ve a [Netlify](https://app.netlify.com)
2. Crea nuevo sitio desde tu repo Git
3. En **Build settings**:
   - Build command: (vacío)
   - Publish directory: `/`
4. Despliega el sitio
5. Configura dominio personalizado del cliente

---

## ✅ PASO 7: PROBAR EL SISTEMA

### 7.1 Prueba de horarios
1. Abre Postman o tu navegador
2. Prueba esta URL:
   ```
   https://jaguares-backend.onrender.com/api/horarios
   ```
3. Deberías ver los horarios que agregaste en el Sheet

**Si falla:**
- Verifica que APPS_SCRIPT_URL esté correcta en Render
- Verifica que SECURITY_TOKEN coincida en Apps Script y Render
- Revisa los logs en Render

### 7.2 Prueba de inscripción completa
1. Abre el sitio web: `https://escuelajaguares.netlify.app`
2. Ve a **Inscripción**
3. Completa el formulario con datos de prueba
4. Sube fotos de prueba
5. Selecciona horarios
6. Sube comprobante de prueba
7. Verifica que aparezca en Google Sheets (INSCRIPCIONES y PAGOS)

### 7.3 Prueba de panel admin
1. Ve a: `https://escuelajaguares.netlify.app/admin-panel.html`
2. Inicia sesión con las credenciales configuradas
3. Deberías ver la inscripción de prueba
4. Haz clic en el alumno y verifica que se vean las imágenes
5. Confirma el pago
6. Verifica en Sheet que cambió a "confirmado"

### 7.4 Prueba de consulta
1. Ve a: `https://escuelajaguares.netlify.app/consulta.html`
2. Ingresa el DNI de prueba
3. Deberías ver el estado de la inscripción
4. Verifica que muestre los horarios correctos

---

## 📝 CHECKLIST FINAL

Antes de entregar al cliente, verifica:

**Google Sheets:**
- [ ] Hoja HORARIOS con todos los horarios del cliente
- [ ] Hoja INSCRIPCIONES con encabezados correctos
- [ ] Hoja PAGOS con encabezados correctos
- [ ] Hojas de días creadas (opcional)
- [ ] Hojas de deportes creadas (opcional)

**Google Drive:**
- [ ] Folder se creará automáticamente al autorizar permisos
- [ ] Después de primera inscripción, compartir folder como "Cualquiera con el enlace"

**Apps Script:**
- [ ] Código copiado completamente
- [ ] SECURITY_TOKEN configurado y guardado
- [ ] Script implementado como Web App
- [ ] URL del script copiada y guardada
- [ ] Permisos autorizados (Sheets + Drive)

**Render:**
- [ ] APPS_SCRIPT_URL actualizada
- [ ] SECURITY_TOKEN actualizado (debe coincidir con Apps Script)
- [ ] Backend desplegado exitosamente
- [ ] Backend responde en /api/horarios

**Pruebas:**
- [ ] Horarios se cargan correctamente
- [ ] Inscripción completa funciona
- [ ] Datos se guardan en Sheet
- [ ] Imágenes se suben a Drive
- [ ] Panel admin muestra inscripciones
- [ ] Confirmación de pago funciona
- [ ] Consulta de estado funciona
- [ ] Matrícula se calcula correctamente

---

## 🎁 ENTREGABLES AL CLIENTE

### Documentos
1. ✅ Manual del Cliente (MANUAL-CLIENTE-JAGUARES.pdf)
2. ✅ Credenciales de acceso (ver abajo)
3. ✅ Links importantes

### Credenciales de Acceso

**Crear documento con:**

```
===========================================
SISTEMA JAGUARES - CREDENCIALES
===========================================

📊 GOOGLE SHEETS (Base de Datos)
URL: [link al Google Sheet]
Acceso: Tu cuenta de Google

📁 GOOGLE DRIVE (Documentos)
URL: [link al folder de Drive]
Acceso: Tu cuenta de Google

👨‍💼 PANEL DE ADMINISTRACIÓN
URL: https://escuelajaguares.netlify.app/admin-panel.html
Usuario: admin@jaguares.com
Contraseña: [contraseña que configuraste]

🌐 SITIO WEB
URL: https://escuelajaguares.netlify.app

📱 CONSULTA DE ESTADO
URL: https://escuelajaguares.netlify.app/consulta.html

⚙️ BACKEND API
URL: https://jaguares-backend.onrender.com

🔐 TOKEN DE SEGURIDAD
Token: [el SECURITY_TOKEN que configuraste]
⚠️ No compartir públicamente

===========================================
IMPORTANTE:
1. Cambia la contraseña de admin después del primer uso
2. Haz backup del Google Sheet semanalmente
3. Revisa comprobantes diariamente
===========================================
```

---

## 🔧 PROBLEMAS COMUNES Y SOLUCIONES

### Error: "Token inválido"
**Causa:** SECURITY_TOKEN no coincide entre Apps Script y Render  
**Solución:** Verifica que ambos tengan exactamente el mismo valor

### Error: "Hoja HORARIOS no encontrada"
**Causa:** El nombre de la hoja no es exacto  
**Solución:** Verifica que la hoja se llame exactamente "HORARIOS" (mayúsculas)

### Error: "No se pueden subir imágenes"
**Causa:** DRIVE_FOLDER_ID incorrecto o folder sin permisos  
**Solución:** 
- Verifica el ID del folder
- Verifica que esté compartido públicamente

### No aparecen horarios al inscribirse
**Causa:** Rangos de edad mal configurados  
**Solución:** 
- Verifica `año_min` y `año_max`
- Recuerda: año MÁS BAJO = persona MÁS VIEJA

### Backend no responde
**Causa:** Render está en sleep mode (plan gratuito)  
**Solución:** 
- Espera 30 segundos en la primera petición
- Considera plan pagado para eliminar sleep mode

---

## 📞 SOPORTE POST-ENTREGA

### Instrucciones para el cliente:

**Para agregar nuevos horarios:**
1. Editar hoja HORARIOS en Google Sheet
2. Los cambios aparecen automáticamente en el sitio

**Para revisar inscripciones:**
1. Entrar al panel admin
2. Confirmar pagos diariamente

**Para hacer backup:**
1. Abrir Google Sheet
2. Archivo → Descargar → Excel (.xlsx)
3. Guardar en computadora con fecha

**Si algo falla:**
1. Revisar Google Sheets que no esté corrupto
2. Verificar que el backend de Render esté "Live"
3. Contactar soporte técnico

---

## 🎯 RESUMEN RÁPIDO

**Para configurar un nuevo cliente:**

1. **Google Sheet** (10 min)
   - Crear hojas HORARIOS, INSCRIPCIONES, PAGOS
   - Agregar encabezados
   - Llenar horarios del cliente

2. **Apps Script** (10 min)
   - Copiar script
   - Configurar solo SECURITY_TOKEN
   - Publicar como Web App
   - Autorizar permisos (Sheets + Drive)

3. **Render** (5 min)
   - Actualizar APPS_SCRIPT_URL
   - Actualizar SECURITY_TOKEN
   - Esperar redespliegue

4. **Probar y compartir Drive** (5 min)
   - Hacer inscripción de prueba
   - Buscar folder "Comprobantes JAGUARES" en Drive
   - Compartir como "Cualquiera con el enlace"
   - Probar panel admin

**Total: ~30 minutos** ⏱️

---

**¡Sistema listo para entregar!** 🎉
