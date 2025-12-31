# SOLUCIÓN: Sistema de Consulta y Gestión de Pagos

## Problema Identificado

1. ❌ Cuando un alumno se inscribe, los datos aparecen en **INSCRIPCIONES** pero NO en **PAGOS**
2. ❌ Sin registro en PAGOS, el administrador no puede confirmar el pago
3. ❌ Sin confirmación, el alumno no puede consultar su inscripción

## Solución Implementada

### 1. Apps Script Actualizado ✅

He creado el archivo `APPS-SCRIPT-GOOGLE-SHEETS.gs` con:

- **Registro automático en PAGOS**: Cuando se inscribe un alumno, SE CREA automáticamente un registro en la hoja PAGOS con estado "pendiente"
- **Consulta de inscripción**: Nuevo endpoint que verifica el estado en PAGOS antes de mostrar los datos
- **Validación de estado**: Solo permite consultar si el estado es "confirmado" o "activo"

### 2. Servidor Node.js Actualizado ✅

Se agregó el endpoint `/api/consultar/:dni` que:
- Consulta el estado del pago
- Retorna los datos del alumno y sus horarios
- Solo funciona si el pago está confirmado

### 3. Página de Consulta Creada ✅

Archivos creados:
- `consulta.html` - Interfaz de consulta
- `js/consulta.js` - Lógica de consulta

---

## PASOS PARA IMPLEMENTAR

### Paso 1: Actualizar Apps Script en Google Sheets

1. Abre tu Google Sheet de "Deportes"
2. Ve a **Extensiones** > **Apps Script**
3. **ELIMINA** todo el código actual
4. **COPIA Y PEGA** todo el contenido del archivo `APPS-SCRIPT-GOOGLE-SHEETS.gs`
5. **CAMBIA EL TOKEN** en la línea 13:
   ```javascript
   const SECURITY_TOKEN = "tu-token-secreto-aqui-123456";
   ```
   Cambia por algo único como: `"jaguares-2025-mi-token-secreto-xyz789"`

6. **GUARDA** el proyecto (Ctrl + S o icono de disco)

7. **DESPLIEGA** (Deploy):
   - Click en **Deploy** > **New deployment**
   - Click en el ícono de engranaje ⚙️ al lado de "Select type"
   - Selecciona **Web app**
   - Configuración:
     - **Description**: "API Jaguares v1"
     - **Execute as**: Me (tu email)
     - **Who has access**: Anyone
   - Click **Deploy**
   - **AUTORIZA** la aplicación cuando te lo pida
   - **COPIA** la URL del Web app (algo como: https://script.google.com/macros/s/AKfy.../exec)

8. **ACTUALIZA** el archivo `.env` en la carpeta `server`:
   ```
   APPS_SCRIPT_URL=https://script.google.com/macros/s/TU_URL_AQUI/exec
   APPS_SCRIPT_TOKEN=jaguares-2025-mi-token-secreto-xyz789
   ```

### Paso 2: Verificar Estructura de la Hoja PAGOS

Tu hoja **PAGOS** debe tener estas columnas (fila 1):

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| id | dni | nombres | apellidos | telefono | monto | metodo_pago | estado_pago | fecha_registro | horarios_seleccionados |

**IMPORTANTE**: La columna **H (estado_pago)** es donde cambiarás manualmente:
- `pendiente` - Recién inscrito, esperando comprobante
- `confirmado` - Comprobante verificado, puede consultar
- `rechazado` - Pago rechazado

### Paso 3: Reiniciar el Servidor

```bash
cd server
npm start
```

---

## FLUJO COMPLETO

### Inscripción:
1. Usuario llena formulario → selecciona horarios → confirma
2. ✅ Se crea 1 fila en **INSCRIPCIONES** por cada horario
3. ✅ Se crea 1 fila en **PAGOS** con estado "pendiente"
4. Usuario recibe código de operación
5. Usuario envía comprobante por WhatsApp

### Confirmación (Administrador):
1. Recibes mensaje de WhatsApp con comprobante
2. Verificas el pago
3. Abres Google Sheets → hoja **PAGOS**
4. Buscas el DNI del alumno
5. **Cambias** la columna H (estado_pago) de "pendiente" a "confirmado"
6. Guardas (Ctrl + S)

### Consulta (Usuario):
1. Usuario entra a la web → Click en "Consultar Estado"
2. Ingresa su DNI
3. ✅ Si estado = "confirmado": Ve sus datos y horarios
4. ❌ Si estado = "pendiente": Mensaje "Pendiente de confirmación"

---

## TESTING

### Probar Inscripción:
1. Ve a http://localhost:5500
2. Inscríbete con datos de prueba
3. Verifica que aparezca en ambas hojas:
   - ✅ INSCRIPCIONES (múltiples filas)
   - ✅ PAGOS (1 fila con estado "pendiente")

### Probar Consulta:
1. En Google Sheets → PAGOS, cambia el estado_pago a "confirmado"
2. Ve a http://localhost:5500/consulta.html
3. Ingresa el DNI
4. ✅ Deberías ver tus datos y horarios

---

## ESTRUCTURA DE PAGOS

Ejemplo de cómo debe verse la hoja PAGOS:

| id | dni | nombres | apellidos | telefono | monto | metodo_pago | estado_pago | fecha_registro | horarios_seleccionados |
|---|---|---|---|---|---|---|---|---|---|
| ACAD-20251231-ABC12 | 74698520 | laika | laik laik | 955195324 | 150 | Yape | **confirmado** | 31/12/2025 10:46:12 | 1,2,16 |
| ACAD-20251231-XYZ99 | 12345678 | Juan | Pérez López | 987654321 | 100 | Yape | **pendiente** | 31/12/2025 11:00:00 | 5,10 |

---

## NOTAS IMPORTANTES

1. **Token de seguridad**: Usa el MISMO token en Apps Script y en el archivo `.env`
2. **Estado inicial**: Siempre es "pendiente" al inscribirse
3. **Cambio manual**: El administrador cambia a "confirmado" después de verificar el pago
4. **Sin confirmación = Sin consulta**: El usuario NO verá sus datos hasta que esté confirmado

---

## TROUBLESHOOTING

### "Token inválido"
- Verifica que el token en Apps Script y .env sean exactamente iguales

### "No se encontró inscripción"
- El DNI no existe en PAGOS
- Revisa que se haya creado el registro al inscribirse

### "Pendiente de confirmación"
- El estado_pago está en "pendiente"
- Ve a Google Sheets y cámbialo a "confirmado"

### "Hoja PAGOS no encontrada"
- Verifica que la hoja se llame exactamente "PAGOS" (mayúsculas)
- Verifica que tenga las columnas correctas

---

✅ **Con esta implementación, el flujo completo funcionará correctamente**
