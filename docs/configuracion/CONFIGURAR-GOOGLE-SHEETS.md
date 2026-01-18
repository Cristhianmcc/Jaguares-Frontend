# 🔧 CONFIGURACIÓN GOOGLE SHEETS PARA BACKUP

## 📋 Problema Identificado

Tu sistema tiene **dos formas** de conectarse a Google Sheets:

1. **Apps Script** ✅ (Configurado y funcionando)
   - Para transacciones principales
   - Ya está configurado en `.env`

2. **Google Sheets API** ❌ (No configurado - causa errores)
   - Para backup de datos
   - Para almacenar imágenes en Drive
   - **Falta configurar**

---

## ⚠️ Errores que está causando

Los siguientes endpoints fallan con: `Cannot read properties of undefined (reading 'spreadsheets')`

- POST /api/inscripciones
- GET /api/verificar-dni/:dni
- GET /api/verificar-taller/:dni
- GET /api/cupos-talleres
- GET /api/estadisticas-talleres

---

## ✅ SOLUCIÓN: Configurar Google Sheets API

### Opción 1: Deshabilitar Código Legacy (RÁPIDO)

Si no necesitas el backup en Google Sheets, podemos comentar ese código y usar solo MySQL + Apps Script.

### Opción 2: Configurar Google Sheets API (COMPLETO)

#### Paso 1: Obtener Credenciales

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto o crea uno nuevo
3. Habilita **Google Sheets API**:
   - Ve a "APIs y servicios" > "Biblioteca"
   - Busca "Google Sheets API"
   - Click en "Habilitar"

4. Crea una **Service Account**:
   - Ve a "APIs y servicios" > "Credenciales"
   - Click "Crear credenciales" > "Cuenta de servicio"
   - Nombre: `jaguares-backend`
   - Click "Crear y continuar"
   - Rol: "Editor" (o "Viewer" si solo lees)
   - Click "Listo"

5. Descarga las credenciales:
   - Click en la cuenta de servicio que creaste
   - Pestaña "Claves"
   - "Agregar clave" > "Crear clave nueva"
   - Tipo: JSON
   - Se descargará un archivo `.json`

6. Renombra el archivo a `credentials.json` y colócalo en:
   ```
   c:\Users\Cris\Desktop\jaguares-funcional\server\credentials.json
   ```

#### Paso 2: Dar Permisos al Sheet

1. Abre el archivo de credenciales JSON
2. Busca el campo `client_email` (algo como `jaguares-backend@proyecto.iam.gserviceaccount.com`)
3. Copia ese email
4. Abre tu Google Sheet de backup
5. Click en "Compartir"
6. Pega el email de la service account
7. Dale permisos de "Editor"
8. Click "Enviar"

#### Paso 3: Agregar Variables al .env

Edita `server/.env` y agrega estas líneas al final:

```env
# ============================================
# GOOGLE SHEETS API (BACKUP)
# ============================================
GOOGLE_APPLICATION_CREDENTIALS=./credentials.json
VITE_SPREADSHEET_ID=1hCbcC82oeY4auvQ6TC4FdmWcfr35Cnw-EJcPg8B8MCg
VITE_SPREADSHEET_ID_BACKUP=1Xp8VI8CulkMZMiOc1RzopFLrwL6FnTQ5a3_gskMpbcY
```

**Notas:**
- Verifica que los IDs de spreadsheet sean correctos
- El ID está en la URL del sheet: `https://docs.google.com/spreadsheets/d/ID_AQUI/edit`

#### Paso 4: Inicializar Google Sheets en el código

El código necesita inicializar `sheets`. Busca en [index.js](server/index.js) alrededor de la línea 2447 y verifica que exista código similar a:

```javascript
// Inicializar Google Sheets API
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  try {
    auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    
    sheets = google.sheets({ version: 'v4', auth });
    console.log('✅ Google Sheets API inicializada correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar Google Sheets API:', error.message);
    console.log('⚠️  Continuando sin backup de Google Sheets');
  }
} else {
  console.log('ℹ️  Google Sheets API no configurada - usando solo Apps Script');
}
```

---

## 🧪 Probar la Configuración

Una vez configurado, ejecuta:

```powershell
cd c:\Users\Cris\Desktop\jaguares-funcional\server
npm start
```

Deberías ver:
```
✅ Google Sheets API inicializada correctamente
```

Luego ejecuta las pruebas:
```powershell
cd c:\Users\Cris\Desktop\jaguares-funcional
node test-produccion-final.js
```

---

## 📊 Resultado Esperado

**Antes de configurar:**
- Tasa de éxito: ~44%
- 14 endpoints fallando

**Después de configurar:**
- Tasa de éxito: >90%
- Solo 2-3 endpoints con warnings menores
- Sistema completamente funcional

---

## 🚀 Alternativa: Usar Solo Apps Script

Si prefieres usar **solo Apps Script** y no configurar Google Sheets API:

1. Comenta todo el código que usa `sheets.spreadsheets`
2. Mueve la lógica de backup a Apps Script
3. Haz todas las operaciones a través de APPS_SCRIPT_URL

Esto simplifica la arquitectura pero pierdes acceso directo a Sheets desde Node.js.

---

## 💡 Recomendación

**Configurar Google Sheets API** porque:
- ✅ Tienes backup automático en Sheets
- ✅ Puedes almacenar referencias a imágenes en Drive
- ✅ Tienes dos capas de respaldo (MySQL + Sheets)
- ✅ Mayor confiabilidad

El tiempo de configuración es ~15 minutos y garantiza que el sistema funcione al 100%.

---

## 📞 ¿Necesitas Ayuda?

Si quieres que modifique el código para:
- Inicializar Google Sheets correctamente
- O deshabilitarlo y usar solo Apps Script

Solo dime cuál opción prefieres.
