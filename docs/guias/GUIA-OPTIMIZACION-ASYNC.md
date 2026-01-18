# 🚀 GUÍA DE OPTIMIZACIÓN - APPS SCRIPT ASÍNCRONO

## 📋 OBJETIVO

Convertir tu sistema de **síncrono** (espera 10-20 segundos) a **asíncrono** (responde en <1 segundo).

## ⏱️ TIEMPO ESTIMADO

- **Básico** (Bull + Redis): 2-3 horas
- **Completo** (con monitoreo): 1 día
- **Producción** (con PM2 + logs): 2 días

---

## 🔧 PASO 1: INSTALAR DEPENDENCIAS

```bash
cd server
npm install bull redis ioredis
npm install --save-dev @types/bull
```

## 📦 PASO 2: INSTALAR Y CONFIGURAR REDIS

### En Windows (recomendado: WSL o Docker)

**Opción A: Docker (más fácil)**
```bash
docker run -d -p 6379:6379 --name jaguares-redis redis:alpine
```

**Opción B: WSL (Windows Subsystem for Linux)**
```bash
# En WSL
sudo apt update
sudo apt install redis-server
redis-server
```

**Verificar que Redis está corriendo:**
```bash
redis-cli ping
# Debe responder: PONG
```

---

## 💻 PASO 3: CREAR EL SISTEMA DE COLAS

### Crear archivo: `server/queue.js`

```javascript
import Bull from 'bull';
import axios from 'axios';

// Crear cola de trabajos para Apps Script
export const appScriptQueue = new Bull('apps-script-sync', {
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379
    },
    defaultJobOptions: {
        attempts: 3, // Reintentar hasta 3 veces si falla
        backoff: {
            type: 'exponential',
            delay: 5000 // Esperar 5s, luego 10s, luego 20s
        },
        removeOnComplete: true,  // Limpiar trabajos completados
        removeOnFail: false      // Mantener trabajos fallidos para debug
    }
});

// Procesar trabajos en background
appScriptQueue.process(async (job) => {
    const { inscripcionId, datosInscripcion } = job.data;
    
    console.log(`[QUEUE] Procesando sincronización de inscripción ${inscripcionId}`);
    
    try {
        // Llamar a Apps Script
        const response = await axios.post(
            process.env.APPS_SCRIPT_URL,
            {
                action: 'agregarInscripcion',
                datos: datosInscripcion
            },
            {
                timeout: 60000 // 60 segundos (más tiempo que antes)
            }
        );
        
        console.log(`[QUEUE] ✅ Inscripción ${inscripcionId} sincronizada con Google Sheets`);
        
        return {
            success: true,
            inscripcionId,
            appsScriptResponse: response.data
        };
        
    } catch (error) {
        console.error(`[QUEUE] ❌ Error sincronizando ${inscripcionId}:`, error.message);
        throw error; // Bull reintentará automáticamente
    }
});

// Eventos para monitoreo
appScriptQueue.on('completed', (job, result) => {
    console.log(`[QUEUE] ✅ Trabajo ${job.id} completado`);
});

appScriptQueue.on('failed', (job, err) => {
    console.log(`[QUEUE] ❌ Trabajo ${job.id} falló:`, err.message);
});

appScriptQueue.on('stalled', (job) => {
    console.log(`[QUEUE] ⏳ Trabajo ${job.id} está tardando demasiado`);
});

export default appScriptQueue;
```

---

## 🔄 PASO 4: MODIFICAR EL ENDPOINT DE INSCRIPCIÓN

### Editar: `server/index.js`

Busca el endpoint `/api/inscribir-multiple` y modifícalo:

```javascript
// Importar cola al inicio del archivo
import appScriptQueue from './queue.js';

// Modificar el endpoint (buscar línea ~361)
app.post('/api/inscribir-multiple', rateLimiterInscripciones, async (req, res) => {
  try {
    const { alumno, horarios } = req.body;
    
    console.log('📝 ==================== INSCRIPCIÓN MÚLTIPLE ====================');
    console.log('👤 ALUMNO:', JSON.stringify(alumno, null, 2));
    console.log('📅 HORARIOS (cantidad):', horarios.length);
    
    // ==================== GUARDAR EN MYSQL PRIMERO ====================
    // ... TODO el código actual de MySQL se queda IGUAL ...
    
    // ⭐ CAMBIO AQUÍ: En vez de llamar Apps Script directamente, encolar
    
    // ❌ ANTES (código viejo - comentar o eliminar):
    /*
    if (process.env.APPS_SCRIPT_URL) {
        try {
            await axios.post(process.env.APPS_SCRIPT_URL, { ... });
        } catch (error) {
            console.error('Error Apps Script:', error);
        }
    }
    */
    
    // ✅ AHORA (código nuevo):
    if (process.env.APPS_SCRIPT_URL) {
        // Encolar trabajo para procesar en background
        const job = await appScriptQueue.add({
            inscripcionId: codigoOperacion,
            datosInscripcion: {
                codigoOperacion,
                alumno,
                horarios,
                inscripcionesIds,
                timestamp: new Date().toISOString()
            }
        });
        
        console.log(`🔄 Trabajo encolado: ID ${job.id} para código ${codigoOperacion}`);
    }
    
    // 📬 RESPONDER INMEDIATAMENTE AL USUARIO (no esperar Apps Script)
    return res.status(200).json({
        success: true,
        message: 'Inscripción registrada exitosamente',
        codigo_operacion: codigoOperacion,
        alumno: {
            alumno_id: inscripcionData.alumnoId,
            dni: alumno.dni,
            nombres: alumno.nombres
        },
        inscripciones: inscripcionesIds.map(i => ({
            inscripcion_id: i.inscripcionId,
            deporte_id: i.deporteId
        })),
        data: inscripcionData,
        dni: alumno.dni,
        sync_status: 'encolado' // ⭐ NUEVO: indicar que se sincronizará después
    });
    
  } catch (error) {
    // ... manejo de errores igual que antes ...
  }
});
```

---

## 🌍 PASO 5: ACTUALIZAR VARIABLES DE ENTORNO

### Editar: `server/.env`

Agregar:
```env
# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Apps Script (ya existía)
APPS_SCRIPT_URL=tu_url_actual_de_apps_script
```

---

## 📊 PASO 6: CREAR PANEL DE MONITOREO

### Crear endpoint de monitoreo en `server/index.js`

```javascript
// Endpoint para ver el estado de la cola
app.get('/api/admin/queue-status', async (req, res) => {
    try {
        const waiting = await appScriptQueue.getWaitingCount();
        const active = await appScriptQueue.getActiveCount();
        const completed = await appScriptQueue.getCompletedCount();
        const failed = await appScriptQueue.getFailedCount();
        const delayed = await appScriptQueue.getDelayedCount();
        
        const jobs = await appScriptQueue.getJobs(['waiting', 'active', 'failed'], 0, 10);
        
        res.json({
            status: 'ok',
            counts: {
                waiting,
                active,
                completed,
                failed,
                delayed
            },
            recentJobs: jobs.map(job => ({
                id: job.id,
                state: await job.getState(),
                data: job.data,
                attempts: job.attemptsMade,
                timestamp: job.timestamp
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para ver trabajos fallidos
app.get('/api/admin/queue-failed', async (req, res) => {
    try {
        const failed = await appScriptQueue.getFailed(0, 50);
        
        res.json({
            count: failed.length,
            jobs: failed.map(job => ({
                id: job.id,
                data: job.data,
                failedReason: job.failedReason,
                stacktrace: job.stacktrace,
                attempts: job.attemptsMade,
                timestamp: job.timestamp
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint para reintentar trabajo fallido
app.post('/api/admin/queue-retry/:jobId', async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await appScriptQueue.getJob(jobId);
        
        if (!job) {
            return res.status(404).json({ error: 'Trabajo no encontrado' });
        }
        
        await job.retry();
        
        res.json({
            success: true,
            message: `Trabajo ${jobId} reintentado`
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
```

---

## 🖥️ PASO 7: CREAR PANEL WEB DE MONITOREO

### Crear: `admin-queue.html`

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monitor de Cola - Jaguares</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .status-card {
            background: #f5f5f5;
            padding: 20px;
            margin: 10px 0;
            border-radius: 8px;
        }
        .stat {
            display: inline-block;
            margin: 10px 20px;
        }
        .stat strong {
            font-size: 24px;
            display: block;
        }
        .job {
            background: white;
            border: 1px solid #ddd;
            padding: 10px;
            margin: 5px 0;
            border-radius: 4px;
        }
        .job.failed {
            border-left: 4px solid #dc3545;
        }
        .job.active {
            border-left: 4px solid #ffc107;
        }
        .job.completed {
            border-left: 4px solid #28a745;
        }
    </style>
</head>
<body>
    <h1>🔄 Monitor de Cola de Sincronización</h1>
    
    <div class="status-card">
        <h2>Estado General</h2>
        <div class="stat">
            <strong id="waiting">0</strong>
            <span>En Espera</span>
        </div>
        <div class="stat">
            <strong id="active">0</strong>
            <span>Procesando</span>
        </div>
        <div class="stat">
            <strong id="completed">0</strong>
            <span>Completados</span>
        </div>
        <div class="stat">
            <strong id="failed">0</strong>
            <span>Fallidos</span>
        </div>
    </div>
    
    <div class="status-card">
        <h2>Trabajos Recientes</h2>
        <div id="recent-jobs"></div>
    </div>
    
    <div class="status-card">
        <h2>Trabajos Fallidos</h2>
        <div id="failed-jobs"></div>
    </div>
    
    <script>
        async function actualizarEstado() {
            try {
                const response = await fetch('/api/admin/queue-status');
                const data = await response.json();
                
                document.getElementById('waiting').textContent = data.counts.waiting;
                document.getElementById('active').textContent = data.counts.active;
                document.getElementById('completed').textContent = data.counts.completed;
                document.getElementById('failed').textContent = data.counts.failed;
                
                const recentJobs = document.getElementById('recent-jobs');
                recentJobs.innerHTML = data.recentJobs.map(job => `
                    <div class="job ${job.state}">
                        <strong>Trabajo ${job.id}</strong> - ${job.state}
                        <br>Código: ${job.data.inscripcionId}
                        <br>Intentos: ${job.attempts}
                    </div>
                `).join('');
                
            } catch (error) {
                console.error('Error:', error);
            }
        }
        
        async function cargarFallidos() {
            try {
                const response = await fetch('/api/admin/queue-failed');
                const data = await response.json();
                
                const failedJobs = document.getElementById('failed-jobs');
                failedJobs.innerHTML = data.jobs.map(job => `
                    <div class="job failed">
                        <strong>Trabajo ${job.id}</strong>
                        <br>Código: ${job.data.inscripcionId}
                        <br>Error: ${job.failedReason}
                        <br>Intentos: ${job.attempts}
                        <br><button onclick="reintentar('${job.id}')">Reintentar</button>
                    </div>
                `).join('');
                
            } catch (error) {
                console.error('Error:', error);
            }
        }
        
        async function reintentar(jobId) {
            try {
                await fetch(`/api/admin/queue-retry/${jobId}`, { method: 'POST' });
                alert('Trabajo reintentado');
                actualizarEstado();
                cargarFallidos();
            } catch (error) {
                alert('Error: ' + error.message);
            }
        }
        
        // Actualizar cada 5 segundos
        actualizarEstado();
        cargarFallidos();
        setInterval(actualizarEstado, 5000);
        setInterval(cargarFallidos, 10000);
    </script>
</body>
</html>
```

---

## ✅ PASO 8: PROBAR LA IMPLEMENTACIÓN

### 1. Iniciar Redis
```bash
# Docker
docker start jaguares-redis

# O WSL
redis-server
```

### 2. Iniciar el servidor
```bash
cd server
npm start
```

### 3. Hacer una inscripción de prueba
```bash
curl -X POST http://localhost:3002/api/inscribir-multiple \
  -H "Content-Type: application/json" \
  -d '{
    "alumno": {
      "dni": "12345678",
      "nombres": "Test",
      "apellido_paterno": "Usuario",
      "apellido_materno": "Prueba",
      "fecha_nacimiento": "2010-01-01",
      "sexo": "Masculino",
      "email": "test@test.com",
      "telefono": "987654321",
      "apoderado": "Tutor Test",
      "telefono_apoderado": "987654322"
    },
    "horarios": [
      {"horario_id": 1, "deporte": "Fútbol", "plan": "Económico"}
    ]
  }'
```

### 4. Verificar que responde rápido (debe ser <1 segundo)

### 5. Ver el panel de monitoreo
Abrir en navegador: `http://localhost:3002/admin-queue.html`

---

## 🎯 RESULTADO ESPERADO

**ANTES:**
- ⏱️ Tiempo de respuesta: 10-20 segundos
- 👥 Máximo concurrente: 50 usuarios
- ❌ Timeouts con 100+ usuarios

**DESPUÉS:**
- ⚡ Tiempo de respuesta: <500ms
- 👥 Máximo concurrente: 200+ usuarios
- ✅ Sin timeouts
- 🔄 Apps Script se procesa en background

---

## 🔍 SOLUCIÓN DE PROBLEMAS

### Redis no se conecta
```bash
# Verificar que Redis está corriendo
redis-cli ping

# Debe responder: PONG
```

### Trabajos no se procesan
```bash
# Ver logs de Bull
# En server/queue.js, agregar más console.log
```

### Apps Script falla
- Ver panel de monitoreo en `/admin-queue.html`
- Revisar trabajos fallidos
- Reintentar manualmente

---

## 📚 RECURSOS ADICIONALES

- [Bull Documentation](https://github.com/OptimalBits/bull)
- [Redis Quick Start](https://redis.io/docs/getting-started/)
- [Bull Board (UI visual)](https://github.com/felixmosh/bull-board)

---

**Tiempo total de implementación**: 2-4 horas  
**Beneficio**: 20x más rápido, 4x más capacidad  
**Complejidad**: Media (requiere conocimientos de Node.js y Redis)
