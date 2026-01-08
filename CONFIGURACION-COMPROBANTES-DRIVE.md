# 📸 Configuración de Comprobantes de Pago con Google Drive

## 🎯 Descripción General

Esta funcionalidad permite que los usuarios suban capturas de sus comprobantes de pago (Yape/Plin) directamente desde el modal de pago en la página de éxito. Las imágenes se almacenan automáticamente en Google Drive y el enlace se guarda en Google Sheets para fácil acceso desde el panel de administración.

---

## 🏗️ Arquitectura

```
Usuario sube captura → Frontend (exito.js) 
    ↓
Convierte a Base64
    ↓
Backend Express → Apps Script 
    ↓
Google Drive (almacenamiento) + Google Sheets (enlace)
    ↓
Panel Admin muestra imagen
```

---

## 📋 Requisitos Previos

- ✅ Google Sheets configurado con Apps Script
- ✅ Backend Express funcionando (Render.com o local)
- ✅ Permisos de Google Drive en Apps Script

---

## 🔧 Configuración Paso a Paso

### 1️⃣ Actualizar Google Sheets - Agregar Columnas

Abre tu Google Sheet y agrega estas columnas a la hoja **PAGOS**:

| Columna | Nombre | Descripción |
|---------|--------|-------------|
| J | `url_comprobante` | Enlace a la imagen en Drive |
| K | `fecha_subida_comprobante` | Fecha de subida |

**Resultado esperado:**
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
J: url_comprobante           ← NUEVA
K: fecha_subida_comprobante  ← NUEVA
```

---

### 2️⃣ Verificar Apps Script está Actualizado

El código en `APPS-SCRIPT-GOOGLE-SHEETS.gs` ya incluye las funciones necesarias:

- ✅ `subirComprobanteDrive()` - Sube imagen a Drive
- ✅ `obtenerOCrearCarpeta()` - Crea estructura de carpetas
- ✅ Actualizado `doPost()` con case `subir_comprobante`

**Estructura de carpetas en Drive:**
```
📁 JAGUARES - Comprobantes/
   └── 📁 2026-01/
       ├── 🖼️ Juan_Perez_Garcia.png
       ├── 🖼️ Maria_Lopez_Torres.png
       └── ...
```

---

### 3️⃣ Permisos de Google Drive en Apps Script

**Importante:** La primera vez que uses la función, Google te pedirá permisos.

1. Ve a tu Apps Script en Google Sheets
2. Ejecuta manualmente la función `subirComprobanteDrive` con datos de prueba
3. Autoriza los permisos cuando te lo solicite
4. Acepta:
   - ✅ Ver y administrar archivos de Google Drive
   - ✅ Ver y administrar hojas de cálculo

---

### 4️⃣ Backend Express - Agregar Endpoint

Agrega este endpoint en tu backend Express (archivo principal del servidor):

```javascript
// Endpoint para subir comprobante
app.post('/api/subir-comprobante', async (req, res) => {
    try {
        const { codigo_operacion, dni, alumno, imagen, nombre_archivo } = req.body;
        
        if (!codigo_operacion || !imagen || !dni) {
            return res.status(400).json({ 
                success: false, 
                error: 'Datos incompletos' 
            });
        }
        
        // Enviar a Apps Script
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                token: SECURITY_TOKEN,
                action: 'subir_comprobante',
                codigo_operacion,
                dni,
                alumno,
                imagen,
                nombre_archivo,
                tipo: 'image/png'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            res.json({
                success: true,
                url_imagen: data.url_imagen,
                mensaje: 'Comprobante subido correctamente'
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: data.error 
            });
        }
        
    } catch (error) {
        console.error('Error al subir comprobante:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});
```

---

### 5️⃣ Modificar API de Consulta (Backend)

Asegúrate de que el endpoint `/api/consultar/:dni` devuelva el campo `url_comprobante`:

```javascript
app.get('/api/consultar/:dni', async (req, res) => {
    try {
        const { dni } = req.params;
        
        // ... código existente ...
        
        // En la respuesta, incluir:
        res.json({
            success: true,
            alumno: { /* ... */ },
            pago: {
                codigo_operacion: registro.codigo,
                monto: registro.monto,
                metodo_pago: registro.metodo_pago,
                estado: registro.estado,
                fecha: registro.fecha,
                url_comprobante: registro.url_comprobante || null  // ← AGREGAR ESTO
            },
            horarios: [ /* ... */ ]
        });
        
    } catch (error) {
        // ...
    }
});
```

---

## 🧪 Pruebas

### Test 1: Subir Comprobante desde Frontend

1. Completa una inscripción
2. En la página de éxito, haz clic en **Yape** o **Plin**
3. Se abre el modal con el QR
4. Haz clic en **"Subir Captura de Pago"**
5. Selecciona una imagen (máx 5MB)
6. Debe mostrar:
   - ✅ Preview de la imagen
   - ✅ "Subiendo..." (durante carga)
   - ✅ "Comprobante Guardado" (al finalizar)
   - ✅ Notificación de éxito

### Test 2: Verificar en Google Drive

1. Ve a Google Drive
2. Busca la carpeta **"JAGUARES - Comprobantes"**
3. Dentro debe haber:
   - Subcarpeta con el mes actual (ej: `2026-01`)
   - Tu imagen subida con nombre `ACAD-XXXXXXXX-XXXXXXXX_Nombre_Apellidos.png`
4. Haz clic derecho > "Obtener enlace"
5. Verifica que el enlace funcione

### Test 3: Verificar en Google Sheets

1. Abre tu Google Sheet
2. Ve a la hoja **PAGOS**
3. Busca la fila con tu código de operación
4. En la columna **J** (`url_comprobante`) debe haber un enlace
5. Haz clic en el enlace → Debe abrir la imagen en Drive

### Test 4: Ver en Panel Admin

1. Ve al panel de administración
2. Busca por DNI el usuario que subió el comprobante
3. En la sección de **Pago** debe aparecer:
   - Un preview de la imagen
   - Botón **"Ver"** que abre la imagen en nueva pestaña
4. La imagen debe verse correctamente

---

## 🐛 Solución de Problemas

### Problema: "Error al subir comprobante"

**Posibles causas:**
1. Apps Script no tiene permisos de Drive
   - **Solución:** Ejecuta manualmente la función en Apps Script y autoriza
2. Backend no está recibiendo la petición
   - **Solución:** Revisa logs del backend en Render.com
3. Token de seguridad inválido
   - **Solución:** Verifica que `SECURITY_TOKEN` coincida en backend y Apps Script

### Problema: "La imagen no aparece en el panel admin"

**Posibles causas:**
1. La columna `url_comprobante` no existe en Sheets
   - **Solución:** Agrega la columna J manualmente
2. El endpoint `/api/consultar/:dni` no devuelve el campo
   - **Solución:** Actualiza el backend según la sección 5️⃣
3. El enlace de Drive no es público
   - **Solución:** En Apps Script, verifica que se ejecute `archivo.setSharing()`

### Problema: "Error 413 - Payload too large"

**Causa:** La imagen es demasiado grande para el servidor

**Solución:** Agregar límite en backend Express:

```javascript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

---

## 📊 Estructura de Datos

### Request al Backend
```json
{
  "codigo_operacion": "ACAD-20260104-ABC12",
  "dni": "12345678",
  "alumno": "Juan Pérez",
  "imagen": "data:image/png;base64,iVBORw0KGgoAAAANS...",
  "nombre_archivo": "captura.png"
}
```

### Response del Backend
```json
{
  "success": true,
  "url_imagen": "https://drive.google.com/file/d/1ABC123xyz.../view",
  "mensaje": "Comprobante subido correctamente"
}
```

### Datos en Google Sheets (Hoja PAGOS)
```
| J (url_comprobante)                              | K (fecha_subida)      |
|--------------------------------------------------|-----------------------|
| https://drive.google.com/file/d/1ABC.../view     | 04/01/2026 14:30      |
```

---

## 🎨 Personalización

### Cambiar Tamaño Máximo de Imagen

En [exito.js](exito.js#L500):
```javascript
// Cambiar de 5MB a 10MB
if (file.size > 10 * 1024 * 1024) {
    Utils.mostrarNotificacion('La imagen no debe superar 10MB', 'error');
    return;
}
```

### Cambiar Estructura de Carpetas en Drive

En `APPS-SCRIPT-GOOGLE-SHEETS.gs`:
```javascript
// Opción 1: Por año y mes
const nombreMes = Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'yyyy-MM');

// Opción 2: Por año solamente
const nombreAno = Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'yyyy');

// Opción 3: Todo en una carpeta
// No crear subcarpeta, guardar directo en carpetaComprobantes
```

### Agregar Marca de Agua (Avanzado)

Requiere procesar la imagen antes de subirla. Puedes usar librerías como `canvas` en el frontend.

---

## 🔒 Seguridad

### ✅ Implementado:
- Token de seguridad en Apps Script
- Validación de tipo de archivo (solo imágenes)
- Límite de tamaño de archivo (5MB)
- Verificación de código de operación existente

### ⚠️ Recomendaciones Adicionales:
1. **Rate Limiting:** Limitar número de uploads por usuario/IP
2. **Validación de imagen:** Verificar que realmente sea una imagen válida
3. **Encriptación:** Usar HTTPS en todas las comunicaciones
4. **Permisos Drive:** Revisar periódicamente accesos

---

## 📝 Checklist de Implementación

- [ ] Columnas J y K agregadas en Google Sheets (J=url_comprobante, K=fecha_subida)
- [ ] Apps Script actualizado con funciones de Drive
- [ ] Permisos de Drive autorizados en Apps Script
- [ ] Endpoint `/api/subir-comprobante` agregado en backend
- [ ] Endpoint `/api/consultar/:dni` retorna `url_comprobante`
- [ ] Frontend `exito.js` tiene funciones de upload
- [ ] Panel admin muestra comprobantes
- [ ] Prueba completa: subir → ver en Drive → ver en admin
- [ ] Backend con límite de 10mb configurado

---

## 📞 Soporte

Si tienes problemas:

1. Revisa los logs del backend en Render.com
2. Revisa la consola del navegador (F12)
3. Ejecuta manualmente las funciones en Apps Script
4. Verifica permisos de Drive
5. Asegúrate de que el SECURITY_TOKEN coincida

---

## 🎉 ¡Listo!

Con esta configuración, tu sistema ahora puede:
- ✅ Recibir capturas de comprobantes desde el usuario
- ✅ Almacenarlas automáticamente en Google Drive
- ✅ Mostrarlas en el panel de administración
- ✅ Tener un registro completo de pagos con evidencia visual

**¡Todo sin romper nada de lo que ya estaba funcionando!** 🚀
