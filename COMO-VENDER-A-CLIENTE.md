# 🚀 Cómo vender el sistema a un CLIENTE (Opciones Reales)

## Tu situación actual:
- ✅ Tienes 1 servidor en Render funcionando
- ✅ Tienes 1 Google Sheet con Apps Script
- ✅ Todo funciona para TI (Jaguares)

## Cuando vendas al cliente, tienes 2 OPCIONES:

---

## ✅ OPCIÓN 1: Cambiar variables en Render (MÁS SIMPLE)

### ¿Cómo funciona?
Tu servidor en Render trabaja para UN cliente a la vez. Cuando vendas, solo cambias la configuración.

### Pasos cuando vendas:

#### Para el CLIENTE:
1. **Copia el Google Sheet** (tu plantilla actual)
   - File → Make a copy
   - Compártelo con el cliente

2. **Copia el código Apps Script al Sheet del cliente**
   - Extensions → Apps Script
   - Pega el código de `scrip-desheet.gs`
   - **CAMBIA el TOKEN en línea ~11:**
     ```javascript
     const AUTH_TOKEN = "cliente1_token_secreto_2025";
     ```
   - Deploy → New deployment → Web App
   - Copia la URL (termina en /exec)

3. **En Render, cambia las variables de entorno:**
   - Ve a tu servicio en Render
   - Environment → Edit
   - Cambia:
     ```
     APPS_SCRIPT_URL = https://script.google.com/.../exec (del cliente)
     APPS_SCRIPT_TOKEN = cliente1_token_secreto_2025 (del cliente)
     ```
   - Render reinicia solo y YA FUNCIONA para el cliente

4. **Dale al cliente su dominio personalizado:**
   - En Render: Settings → Custom Domains
   - Agrega: `cliente1.tudominio.com`

#### Para seguir usando TU versión (Jaguares):
- Guarda tus URLs originales en un documento
- Cuando quieras volver a tu versión, cambias las variables de nuevo en Render

### ✅ Ventajas:
- Súper simple, no tocas código
- Gratis (un solo servidor)
- 5 minutos por cliente

### ❌ Desventajas:
- Solo UN cliente activo a la vez
- Si vendes a 2 clientes, necesitas 2 servidores en Render

---

## 🔥 OPCIÓN 2: Un servidor para MÚLTIPLES clientes a la vez

### ¿Cómo funciona?
Tu servidor en Render maneja TODOS los clientes simultáneamente. Identifica al cliente por parámetro `?client=nombre`.

### Pasos de configuración:

#### 1. Agregar clientes al archivo de configuración

Edita `server/clients-config.json`:
```json
{
  "clients": {
    "jaguares": {
      "name": "Jaguares - Tu Academia",
      "appsScriptUrl": "https://script.google.com/macros/s/TU_URL/exec",
      "appsScriptToken": "TU_TOKEN_ACTUAL"
    },
    "cliente1": {
      "name": "Academia Cliente 1",
      "appsScriptUrl": "https://script.google.com/macros/s/URL_CLIENTE1/exec",
      "appsScriptToken": "TOKEN_CLIENTE1"
    }
  }
}
```

#### 2. Modificar server/index.js

Agregar al inicio (después de las importaciones):
```javascript
// Cargar configuración de clientes
let clientsConfig = { clients: {} };
try {
  clientsConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'clients-config.json'), 'utf8'));
} catch (error) {
  console.warn('⚠️  No se encontró clients-config.json, usando .env');
}

// Middleware para identificar cliente
app.use((req, res, next) => {
  // Obtener cliente del parámetro ?client=nombre
  const clientId = req.query.client || req.body?.client || 'jaguares';
  
  // Buscar configuración del cliente
  const clientConfig = clientsConfig.clients[clientId];
  
  if (clientConfig) {
    // Usar configuración del cliente específico
    req.appsScriptUrl = clientConfig.appsScriptUrl;
    req.appsScriptToken = clientConfig.appsScriptToken;
  } else {
    // Usar configuración del .env (por defecto)
    req.appsScriptUrl = APPS_SCRIPT_URL;
    req.appsScriptToken = APPS_SCRIPT_TOKEN;
  }
  
  next();
});
```

#### 3. Cambiar todas las rutas para usar req.appsScriptUrl

Busca todas las líneas donde usas `APPS_SCRIPT_URL` y `APPS_SCRIPT_TOKEN` y cámbialo por:
```javascript
const response = await fetch(req.appsScriptUrl, {  // <-- Cambiado
  headers: {
    'Authorization': `Bearer ${req.appsScriptToken}`,  // <-- Cambiado
    // ...
  }
});
```

#### 4. En el frontend (js/api-service.js)

Detectar cliente automáticamente por URL:
```javascript
const API_CONFIG = {
    // Detectar cliente del URL ?client=nombre
    clientId: new URLSearchParams(window.location.search).get('client') || 'jaguares',
    
    baseUrl: window.location.hostname === 'localhost'
        ? 'http://localhost:3002'
        : 'https://jaguares-backend.onrender.com',
    
    // Agregar ?client= a todas las peticiones
    getEndpoint(path) {
        return `${this.baseUrl}${path}?client=${this.clientId}`;
    }
};
```

#### 5. URLs para cada cliente:
- Tu academia: `https://jaguares.com/index.html` (usa cliente "jaguares" por defecto)
- Cliente 1: `https://cliente1.com/index.html?client=cliente1`
- Cliente 2: `https://cliente2.com/index.html?client=cliente2`

### ✅ Ventajas:
- Un solo servidor maneja TODOS los clientes
- Costos bajos (solo pagas 1 servidor)
- Fácil agregar más clientes

### ❌ Desventajas:
- Requiere modificar código (15-30 min de trabajo)
- Más complejo de mantener

---

## 🎯 ¿Cuál elegir?

### Si vas a vender a 1-2 clientes:
👉 **USA OPCIÓN 1** (cambiar variables en Render)

### Si vas a vender a 3+ clientes:
👉 **USA OPCIÓN 2** (multi-cliente)

---

## 📝 Resumen OPCIÓN 1 (La más simple):

1. Copia Google Sheet para el cliente
2. Copia Apps Script y cambia el TOKEN
3. En Render: cambias 2 variables (URL y TOKEN)
4. Listo - funciona para el cliente

**NO necesitas crear otro servidor en Render**  
**NO necesitas tocar código**  
**NO necesitas programar nada**

Solo cambias 2 variables de entorno en el dashboard de Render y reinicia automáticamente.

---

¿Cuál opción prefieres? Te ayudo a implementarla paso a paso.
