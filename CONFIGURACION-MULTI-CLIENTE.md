# Configuración Multi-Cliente para JAGUARES

## 📋 Resumen
Este documento explica cómo configurar el sistema para manejar múltiples clientes, cada uno con su propio Google Sheet.

---

## 🎯 OPCIÓN 1: Sistema Multi-Cliente (UN SOLO BACKEND)

### Ventajas:
✅ Un solo servidor maneja todos los clientes  
✅ Fácil de mantener y actualizar  
✅ Costos reducidos (un solo servidor Render)  
✅ Cada cliente tiene su propio dominio/subdominio  

### Arquitectura:
```
cliente1.tudominio.com → Backend Render → Google Sheet Cliente 1
cliente2.tudominio.com → Backend Render → Google Sheet Cliente 2
jaguares.tudominio.com → Backend Render → Google Sheet Jaguares
```

### Configuración paso a paso:

#### 1. Para cada NUEVO cliente:

**A. Copiar Google Sheet:**
1. Haz una copia de tu Google Sheet actual
2. Comparte el nuevo Sheet con la cuenta de servicio (si usas Google API)
3. Anota el ID del Sheet (está en la URL)

**B. Duplicar y configurar Apps Script:**
1. Ve a Extensions → Apps Script en el nuevo Sheet
2. Copia todo el código de `scrip-desheet.gs`
3. Cambia el TOKEN en la línea ~11:
   ```javascript
   const AUTH_TOKEN = "token_unico_cliente1"; // Token diferente por cliente
   ```
4. Deploy → New deployment → Web app
5. Copia la URL del deployment

**C. Agregar cliente a `clients-config.json`:**
```json
{
  "clients": {
    "cliente1": {
      "name": "Academia Cliente 1",
      "appsScriptUrl": "https://script.google.com/macros/s/.../exec",
      "appsScriptToken": "token_unico_cliente1",
      "sheetId": "ID_DEL_SHEET_CLIENTE1",
      "domain": "cliente1.tudominio.com"
    }
  }
}
```

#### 2. Modificar el backend (server/index.js):

Agregar middleware para detectar cliente por dominio o parámetro:

```javascript
// Cargar configuración de clientes
import clientsConfig from './clients-config.json' assert { type: 'json' };

// Middleware para identificar cliente
app.use((req, res, next) => {
  // Opción 1: Por dominio
  const hostname = req.hostname;
  const clientKey = Object.keys(clientsConfig.clients).find(key => 
    clientsConfig.clients[key].domain === hostname
  );
  
  // Opción 2: Por parámetro ?client=cliente1
  const clientParam = req.query.client || req.body?.client;
  
  // Opción 3: Por subdirectorio /cliente1/api/horarios
  const pathClient = req.path.split('/')[1];
  
  const client = clientKey || clientParam || pathClient || 'jaguares';
  req.clientConfig = clientsConfig.clients[client];
  
  if (!req.clientConfig) {
    return res.status(400).json({ error: 'Cliente no configurado' });
  }
  
  next();
});

// Usar configuración del cliente en las rutas
app.post('/api/inscribir-multiple', async (req, res) => {
  const { appsScriptUrl, appsScriptToken } = req.clientConfig;
  
  // Usar appsScriptUrl y appsScriptToken del cliente específico
  const response = await fetch(appsScriptUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${appsScriptToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(req.body)
  });
  // ...
});
```

#### 3. Frontend por cliente:

Cada cliente tiene su propio dominio apuntando al mismo código, pero con configuración diferente:

**En `js/api-service.js`:**
```javascript
const API_CONFIG = {
    // Detectar cliente por dominio o parámetro
    clientId: new URLSearchParams(window.location.search).get('client') || 'jaguares',
    baseUrl: window.location.hostname === 'localhost'
        ? 'http://localhost:3002'
        : 'https://jaguares-backend.onrender.com',
    endpoints: {
        // Agregar clientId a todas las peticiones
        horarios: `/api/horarios?client=${this.clientId}`,
        // ...
    }
};
```

---

## 🔧 OPCIÓN 2: Backend Separado por Cliente (MÁS SIMPLE)

### Ventajas:
✅ Configuración más simple  
✅ Total aislamiento entre clientes  
✅ No requiere modificar código  

### Desventajas:
❌ Más servidores = más costos  
❌ Actualizaciones hay que hacerlas en cada instancia  

### Configuración:

Para cada cliente:

1. **Duplicar carpeta completa del proyecto**
2. **Crear nuevo .env con datos del cliente:**
   ```env
   APPS_SCRIPT_URL=https://script.google.com/macros/s/URL_CLIENTE1/exec
   APPS_SCRIPT_TOKEN=token_cliente1
   PORT=3002
   ```
3. **Deploy en Render/Vercel separado**
4. **Dominio propio por cliente:** cliente1.tudominio.com

---

## 🌐 OPCIÓN 3: Variables de Entorno Dinámicas (Más Rápido)

### Uso:
Cambiar fácilmente entre tu sheet y el del cliente usando variables de entorno.

### Configuración:

**1. Crear archivo `.env.jaguares`:**
```env
APPS_SCRIPT_URL=https://script.google.com/macros/s/TU_URL/exec
APPS_SCRIPT_TOKEN=tu_token
CLIENT_NAME=jaguares
```

**2. Crear archivo `.env.cliente1`:**
```env
APPS_SCRIPT_URL=https://script.google.com/macros/s/URL_CLIENTE1/exec
APPS_SCRIPT_TOKEN=token_cliente1
CLIENT_NAME=cliente1
```

**3. En el servidor, usar:**
```bash
# Para tu sheet
cp .env.jaguares .env
node index.js

# Para cliente 1
cp .env.cliente1 .env
node index.js
```

**4. En Render, cambiar las variables de entorno** directamente desde el dashboard.

---

## 📝 Checklist de Implementación

Para agregar un NUEVO CLIENTE:

- [ ] Copiar Google Sheet y configurar permisos
- [ ] Copiar código Apps Script al nuevo Sheet
- [ ] Cambiar AUTH_TOKEN en Apps Script
- [ ] Hacer deployment del Apps Script
- [ ] Obtener URL y TOKEN del deployment
- [ ] Agregar cliente a `clients-config.json` (Opción 1)
- [ ] O crear `.env.nombrecliente` (Opción 3)
- [ ] Configurar dominio/subdominio
- [ ] Probar inscripciones y pagos

---

## 🚀 Recomendación

**Para 1-3 clientes:** Usa OPCIÓN 2 (backends separados)  
**Para 4+ clientes:** Usa OPCIÓN 1 (multi-cliente con un backend)  
**Para desarrollo/pruebas:** Usa OPCIÓN 3 (variables de entorno)

---

## 📞 Soporte

Si tienes dudas sobre qué opción elegir o cómo implementarla, revisa el código de ejemplo en este repositorio.
