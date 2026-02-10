# 🐆 JAGUARES - Guía Completa de Despliegue en VPS con Dokploy

Esta guía documenta el proceso completo para desplegar la aplicación **JAGUARES Academia Deportiva** en un VPS utilizando **Dokploy** como plataforma de gestión de contenedores.

---

## 📋 Tabla de Contenidos

1. [Pre-requisitos](#pre-requisitos)
2. [Instalación de Dokploy](#instalación-de-dokploy)
3. [Configuración del Proyecto](#configuración-del-proyecto)
4. [Despliegue de la Base de Datos](#despliegue-de-la-base-de-datos)
5. [Despliegue del Backend](#despliegue-del-backend)
6. [Despliegue del Frontend](#despliegue-del-frontend)
7. [Configuración de Dominios](#configuración-de-dominios)
8. [Variables de Entorno](#variables-de-entorno)
9. [Archivos de Configuración](#archivos-de-configuración)
10. [Resolución de Problemas](#resolución-de-problemas)
11. [Comandos Útiles](#comandos-útiles)
12. [Próximos Pasos](#próximos-pasos)

---

## 🛠️ Pre-requisitos

### Servidor VPS
- **SO**: Ubuntu 22.04 LTS o superior
- **RAM**: Mínimo 2GB (recomendado 4GB)
- **CPU**: Mínimo 2 cores
- **Almacenamiento**: 20GB SSD
- **IP**: `187.77.6.232` (ejemplo)

### Repositorios GitHub
- Backend: `https://github.com/Cristhianmcc/Jaguares-Backend`
- Frontend: `https://github.com/Cristhianmcc/Jaguares-Frontend`

### Dominio (Opcional)
- Dominio: `jaguarescar.com`
- DNS gestionado por Cloudflare

---

## 🚀 Instalación de Dokploy

### 1. Acceso SSH al VPS

```bash
ssh root@187.77.6.232
```

### 2. Instalación Automática de Dokploy

```bash
curl -sSL https://dokploy.com/install.sh | sh
```

**Resultado esperado:**
- ✅ Docker instalado/actualizado
- ✅ Docker Swarm inicializado
- ✅ Dokploy desplegado en puerto 3000
- ✅ Traefik como proxy reverso configurado

### 3. Acceso a la Interfaz

1. Abrir navegador en: `http://187.77.6.232:3000`
2. Crear cuenta de administrador
3. Autorizar acceso a GitHub (para clonar repositorios)

---

## 📁 Configuración del Proyecto

### 1. Crear Proyecto en Dokploy

1. En Dokploy, click en **"+ Create Project"**
2. **Nombre**: `jaguares-academia`
3. **Descripción**: `Sistema de inscripciones deportivas`
4. **Environment**: `production`

### 2. Estructura del Proyecto

El proyecto tendrá **3 servicios**:
- 📊 **jaguares-mysql**: Base de datos MySQL 8.0
- 🔧 **jaguares-backend**: API REST (Node.js + Express)
- 🎨 **jaguares-frontend**: Interfaz web (HTML/CSS/JS + Nginx)

---

## 🗄️ Despliegue de la Base de Datos

### 1. Crear Servicio MySQL

1. En el proyecto, click **"+ Create Service"** → **"Database"**
2. Seleccionar **MySQL**
3. Configuración:
   ```
   Name: jaguares-mysql
   Database Name: jaguares_db
   Database User: admin
   Database Password: kikomoreno1
   Root Password: RootJaguar2026!
   MySQL Version: 8.0
   ```
4. Click **"Create"**
5. Esperar estado **"Running"** (2-3 minutos)

### 2. Importar Datos Existentes

Una vez la base de datos esté corriendo:

```bash
# SSH al VPS
ssh root@187.77.6.232

# Copiar backup SQL desde local (desde Windows PowerShell)
scp C:\Users\Cris\Desktop\jaguares-funcional\backup-aws-rds-20260209-000653.sql root@187.77.6.232:/tmp/backup.sql

# Volver al SSH y buscar contenedor MySQL
docker ps | grep mysql

# Importar backup (usar el ID del contenedor)
docker exec -i [CONTAINER_ID] mysql -uroot -pkikomoreno1 jaguares_db < /tmp/backup.sql

# Verificar importación
docker exec -i [CONTAINER_ID] mysql -uroot -pkikomoreno1 -e "USE jaguares_db; SELECT COUNT(*) FROM deportes; SELECT COUNT(*) FROM horarios;"
```

**Resultado esperado:**
- ✅ 8 deportes
- ✅ 153 horarios
- ✅ Todas las tablas importadas

### 3. Obtener Nombre Interno de la Base de Datos

En Dokploy: **jaguares-mysql** → **"General"** → Copiar **"Internal Host"**

Ejemplo: `jaguaresacademia-jaguaresmysql-czxi5m`

---

## ⚙️ Despliegue del Backend

### 1. Preparar Repositorio Backend

Crear archivos de configuración Docker:

#### `Dockerfile`
```dockerfile
# Dockerfile para Jaguares Backend API
FROM node:20-alpine

WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias de producción
RUN npm install --production

# Copiar todo el código fuente
COPY . .

# Exponer puerto
EXPOSE 3002

# Variables de entorno por defecto
ENV PORT=3002
ENV NODE_ENV=production

# Comando para iniciar la aplicación
CMD ["node", "index.js"]
```

#### `.dockerignore`
```
node_modules
npm-debug.log
.git
.gitignore
.env
.env.local
*.md
.vscode
.idea
*.log
.DS_Store
backup*.sql
*.csv
*.tsv
*.txt
```

### 2. Crear Servicio Backend en Dokploy

1. **"+ Create Service"** → **"Application"**
2. Configuración:
   ```
   Application Name: jaguares-backend
   Source Type: Git
   Repository URL: https://github.com/Cristhianmcc/Jaguares-Backend
   Branch: main
   Build Type: Dockerfile
   Docker File: Dockerfile
   ```

### 3. Configurar Variables de Entorno

Pestaña **"Environment"**, agregar:

```env
DB_HOST=jaguaresacademia-jaguaresmysql-czxi5m
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=kikomoreno1
DB_NAME=jaguares_db
PORT=3002
NODE_ENV=production
JWT_SECRET=jaguares_2025_super_secret_key_8f7s9dF!23xD_muy_seguro_y_largo
APPS_SCRIPT_TOKEN=academia_2025_TOKEN_8f7s9dF!23xD
APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbxrAbX71R1Rzj9gHDLwmMN3eSBEwZaR_bNbWmiXbcVKe9iqn36mDP6VMd1Evaq1dZpF/exec
```

### 4. Configurar Dominio del Backend

Pestaña **"Domains"**:
```
Host: api.jaguarescar.com
Path: /
Container Port: 3002
HTTPS: Enabled
Certificate Provider: None (Cloudflare maneja SSL)
```

### 5. Deploy del Backend

1. Click **"Create"**
2. Ir a pestaña **"General"** → **"Deploy"**
3. Monitorear logs hasta ver: **"Deployment completed successfully!"**

### 6. Verificar Funcionamiento

```bash
# Probar endpoints
curl http://api.187.77.6.232.nip.io/api/health
curl http://api.187.77.6.232.nip.io/api/horarios
```

---

## 🎨 Despliegue del Frontend

### 1. Preparar Repositorio Frontend

#### `Dockerfile.frontend`
```dockerfile
# Dockerfile para Frontend Jaguares (HTML/CSS/JS estático)
FROM nginx:alpine

# Copiar archivos estáticos
COPY . /usr/share/nginx/html

# Copiar configuración de nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto 80
EXPOSE 80

# Nginx se ejecuta automáticamente
CMD ["nginx", "-g", "daemon off;"]
```

#### `nginx.conf`
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Comprimir archivos
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cachear archivos estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Servir archivos HTML sin caché
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
    }

    # Redirigir todas las rutas a index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Logs
    error_log /var/log/nginx/error.log;
    access_log /var/log/nginx/access.log;
}
```

### 2. Actualizar URLs del Backend en JavaScript

Actualizar todos los archivos JS para usar el backend en producción:

```javascript
// En api-service.js, api-service-v2.js, y archivos admin
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3002'
    : 'https://api.jaguarescar.com'; // Producción con dominio real
```

**Archivos a actualizar:**
- `js/api-service.js`
- `js/api-service-v2.js`
- `js/admin-crud.js`
- `js/admin-dashboard.js`
- `js/admin-panel.js`
- `admin-login.html` (JavaScript inline)
- `profesor/js/*.js`

### 3. Crear Servicio Frontend en Dokploy

1. **"+ Create Service"** → **"Application"**
2. Configuración:
   ```
   Application Name: jaguares-frontend
   Source Type: Git
   Repository URL: https://github.com/Cristhianmcc/Jaguares-Frontend
   Branch: master
   Build Type: Dockerfile
   Docker File: Dockerfile.frontend
   ```

### 4. Configurar Dominio del Frontend

```
Host: 187.77.6.232.nip.io
Path: /
Container Port: 80
HTTPS: Disabled (por ahora)
```

### 5. Deploy del Frontend

1. Click **"Create"** y **"Deploy"**
2. Esperar hasta estado **"Running"**



---

## 🌐 Configuración de Dominios con HTTPS

### 1. Configuración DNS en Cloudflare

Acceder a Cloudflare y crear los siguientes registros A:

| Tipo | Nombre | Destino | Proxy Status |
|------|---------|---------|---|
| A | @ (root) | 187.77.6.232 | ✅ Proxied (Naranja) |
| A | api | 187.77.6.232 | ✅ Proxied (Naranja) |
| A | www | 187.77.6.232 | ✅ Proxied (Naranja) |

**Importante**: El proxy naranja de Cloudflare maneja automáticamente los certificados SSL.

**Verificar propagación DNS:**

```bash
# Windows PowerShell
nslookup jaguarescar.com
nslookup api.jaguarescar.com
```

**Resultado esperado:**
```
Nombre: jaguarescar.com
Addresses: 104.21.3.199, 172.67.131.38 (Cloudflare IPs)
```

### 2. Configurar Dominios en Dokploy

#### Frontend Domain

1. Ve a **Dokploy** → **Projects** → **jaguares-frontend**
2. Click en tab **"Domains"**
3. **Add Domain** o edita el existente:
   - **Host**: `jaguarescar.com`
   - **Path**: `/`
   - **Container Port**: `80`
   - **HTTPS**: ✅ Enabled
   - **Certificate Provider**: `None` (Cloudflare lo maneja)
   - Click **"Update"**

4. También agregar `www.jaguarescar.com` (opcional pero recomendado):
   - Click **"Add Domain"** nuevamente
   - **Host**: `www.jaguarescar.com`
   - Misma configuración
   - Click **"Create"**

#### Backend Domain

1. Ve a **Dokploy** → **Projects** → **jaguares-backend**
2. Click en tab **"Domains"**
3. **Add Domain** o edita el existente:
   - **Host**: `api.jaguarescar.com`
   - **Path**: `/`
   - **Container Port**: `3002`
   - **HTTPS**: ✅ Enabled
   - **Certificate Provider**: `None`
   - Click **"Update"**

### 3. Actualizar URLs en el Código

#### Backend JavaScript

Actualizar en TODOS estos archivos:

**Archivos a modificar:**
- `js/api-service.js`
- `js/api-service-v2.js`
- `js/admin-crud.js`
- `js/admin-dashboard.js`
- `js/admin-panel.js`
- `admin-login.html`
- `admin.html`
- `profesor/js/profesor-dashboard.js`
- `profesor/js/profesor-asistencias.js`
- `profesor/js/profesor-reportes.js`

**Cambiar de:**
```javascript
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3002'
    : 'http://api.187.77.6.232.nip.io';
```

**A:**
```javascript
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3002'
    : 'https://api.jaguarescar.com';
```

### 4. Actualizar CORS en Backend

En `server/middleware/security.js`, actualizar el whitelist de CORS:

```javascript
const whitelist = [
    // Desarrollo local
    'http://localhost:3000',
    'http://localhost:5500',
    'http://localhost:5501',
    'http://localhost:5502',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5500',
    'http://127.0.0.1:5501',
    'http://127.0.0.1:5502',
    'http://127.0.0.1:8080',
    
    // Producción Dokploy (Legacy - para compatibilidad)
    'http://187.77.6.232.nip.io',
    'http://api.187.77.6.232.nip.io',
    
    // Producción Dominio Real con HTTPS
    'https://jaguarescar.com',
    'https://www.jaguarescar.com',
    'https://api.jaguarescar.com'
];
```

### 5. Configurar Trust Proxy en Express

Para que Express funcione correctamente con Traefik (proxy reverso):

En `server/index.js`, después de crear la aplicación Express:

```javascript
const app = express();
const PORT = process.env.PORT || 3002;

// Confiar en proxy reverso (Traefik/Dokploy) para headers X-Forwarded-*
app.set('trust proxy', 1);

// ==================== CONFIGURACIÓN ACADEMIA DEPORTIVA ====================
```

**Esto resuelve:**
- ✅ Errores `ValidationError X-Forwarded-For` del rate-limiter
- ✅ IP correcta en logs
- ✅ CORS funciona con proxy reverso

### 6. Hacer el Redeploy

**Frontend:**
1. Ve a **jaguares-frontend** → **Deployments**
2. Click en **"Redeploy"** (o **"Rebuild"**)
3. Espera a que termine (~2 minutos)

**Backend:**
1. Ve a **jaguares-backend** → **Deployments**
2. Click en **"Redeploy"**
3. Espera a que termine (~2 minutos)

### 7. Hacer Push de Cambios

```bash
# Frontend
cd C:\Users\Cris\Desktop\jaguares-funcional
git add .
git commit -m "feat: Migrar URLs de API de nip.io a jaguarescar.com

- Actualizar todas las URLs del frontend JavaScript a https://api.jaguarescar.com
- Cambios en js/*.js y profesor/js/*.js para usar dominio real
- Mantener compatibilidad con desarrollo local (localhost)
- Preparar para despliegue en dominio real con SSL"
git push origin master

# Backend
cd C:\Users\Cris\Desktop\jaguares-funcional\server
git add .
git commit -m "fix: Actualizar CORS whitelist a jaguarescar.com y agregar trust proxy

- Agregar dominios de producción: jaguarescar.com, api.jaguarescar.com, www.jaguarescar.com
- Configurar app.set('trust proxy', 1) para funcionar con proxy reverso
- Permite que express-rate-limit use X-Forwarded-For correctamente
- Mantener URLs legacy para compatibilidad"
git push origin main
```

---

## 🧪 Verificación Final

### 1. Verificar Conectividad HTTPS

```powershell
# Desde Windows PowerShell
Invoke-WebRequest -Uri "https://jaguarescar.com" -Method Head -UseBasicParsing | Select-Object StatusCode

Invoke-WebRequest -Uri "https://api.jaguarescar.com/api/health" -Method Get -UseBasicParsing | Select-Object StatusCode

Invoke-WebRequest -Uri "https://api.jaguarescar.com/api/horarios" -Method Get -UseBasicParsing | Select-Object StatusCode, @{Name='ContentLength';Expression={$_.Content.Length}}
```

**Resultado esperado:**
- Frontend: **200 OK**
- API health: **200 OK**
- API horarios: **200 OK** + datos (45KB+)

### 2. Limpiar Caché del Navegador

Después de los cambios, hacer un **hard refresh**:

- **Windows/Linux**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

O limpiar caché completo:
- F12 → **Application** → **Storage** → **Clear site data**

### 3. Acceder a la Aplicación

- **Frontend**: https://jaguarescar.com
- **Admin Panel**: https://jaguarescar.com/admin-login.html
- **Inscripciones**: https://jaguarescar.com/inscripcion.html
- **Consultas**: https://jaguarescar.com/consulta.html

### 4. Verificar Panel de Admin

1. Ir a https://jaguarescar.com/admin-login.html
2. Iniciar sesión:
   - **Email**: `administrador@jaguares.com`
   - **Password**: (contraseña configurada)
3. Verificar que carga correctamente
4. Acceder a "Gestión de Usuarios" y "Deportes y Horarios"

---

## 🐛 Resolución de Problemas - Dominio Real

### Problema: Error ERR_BLOCKED_BY_CLIENT en Consola

**Síntoma**: Error al cargar Cloudflare Insights

**Solución**: Es una advertencia de tu navegador, no afecta funcionamiento. Ignorar.

---

### Problema: Errores de Tailwind CSS en Consola

**Síntoma**: Advertencia "cdn.tailwindcss.com should not be used in production"

**Solución**: Es advertencia de Tailwind, no afecta funcionamiento. Los estilos funcionan correctamente.

---

### Problema: CORS Error después de cambiar dominio

**Síntoma**: `No 'Access-Control-Allow-Origin' header`

**Soluciones:**
1. ✅ Verificar que actualizaste el whitelist en `security.js`
2. ✅ Hacer redeploy del backend
3. ✅ Limpiar caché del navegador (Ctrl+Shift+R)

---

### Problema: Validación Error X-Forwarded-For

**Síntoma**: En logs: `ValidationError: The 'X-Forwarded-For' header is set but the Express 'trust proxy' setting is false`

**Solución**: 
1. ✅ Agregar `app.set('trust proxy', 1)` en `server/index.js`
2. ✅ Hacer redeploy del backend
3. ✅ El error desaparecerá

---

## 📊 Dashboard y Monitoreo

### Acceso a Dokploy

- **URL**: `http://187.77.6.232:3000`
- **Ver estado de servicios**: Home → Projects → jaguares-academia
- **Ver logs en tiempo real**: Click en deployment o servicio → "View"
- **Monitoreo**: Sidebar → "Monitoring"

### Logs del Backend

```bash
# SSH al VPS
ssh root@187.77.6.232

# Ver logs del backend en tiempo real
docker logs -f [CONTAINER_ID_BACKEND]

# Ver logs del frontend
docker logs -f [CONTAINER_ID_FRONTEND]

# Ver logs de MySQL
docker logs -f [CONTAINER_ID_MYSQL]
```

---

## 🎯 URLs Finales Actualizadas

### Producción - Dominio Real (HTTPS)
- ✅ **Frontend Principal**: `https://jaguarescar.com`
- ✅ **Frontend WWW**: `https://www.jaguarescar.com`
- ✅ **Backend API**: `https://api.jaguarescar.com`
- ✅ **Admin Panel**: `https://jaguarescar.com/admin-login.html`
- ✅ **Dashboard Admin**: `https://jaguarescar.com/admin-dashboard.html`
- ✅ **Inscripciones**: `https://jaguarescar.com/inscripcion.html`
- ✅ **Consultas**: `https://jaguarescar.com/consulta.html`
- ✅ **Profesor Portal**: `https://jaguarescar.com/profesor/`

### Legacy - IP con nip.io (HTTP)
- ❌ `http://187.77.6.232.nip.io` (descontinuado)
- ❌ `http://api.187.77.6.232.nip.io` (descontinuado)

---

## ✅ Checklist Final de Configuración

### Dominio y HTTPS
- [x] Registros DNS configurados en Cloudflare
- [x] Proxy naranja activado para SSL automático
- [x] Dominios actualizados en Dokploy
- [x] HTTPS habilitado en ambos servicios
- [x] Certificados SSL funcionando (via Cloudflare)

### Código y Backend
- [x] URLs actualizadas a `https://api.jaguarescar.com`
- [x] CORS whitelist actualizado
- [x] `app.set('trust proxy', 1)` configurado
- [x] Variables de entorno correctas
- [x] Cambios subidos a GitHub (push completado)

### Despliegue
- [x] Frontend redeployed
- [x] Backend redeployed
- [x] Base de datos MySQL funcionando
- [x] Todos los servicios en estado "Running"

### Verificación
- [x] Frontend responde (200 OK)
- [x] API health funciona (200 OK)
- [x] API horarios devuelve datos
- [x] Admin login responde
- [x] Panel de admin funciona
- [x] Datos se cargan correctamente (10 inscritos)

### Seguridad
- [x] CORS restringido a dominios permitidos
- [x] Rate limiting configurado
- [x] Helmet security headers activos
- [x] Variables de entorno seguras
- [x] Trust proxy configurado

---

## 🔄 Próximos Pasos Recomendados

1. **Backups Automáticos**
   - Configurar backup diario de MySQL
   - Almacenar en S3 o servicio externo
   - Documentar proceso de restauración

2. **Monitoreo y Alertas**
   - Configurar alertas de CPU/RAM
   - Monitorear disponibilidad de servicios
   - Alarmas en caso de caída de servicios

3. **Optimización**
   - CDN para assets estáticos (Cloudflare)
   - Cache headers optimizados
   - Compresión GZIP configurada

4. **CI/CD Avanzado**
   - Automatizar tests antes de deploy
   - Pipeline de integración continua
   - Rollback automático en caso de falla

5. **Escalabilidad**
   - Replicas múltiples del backend
   - Load balancing
   - Auto-scaling según demanda

---

## 📚 Documentación Oficial

- **Dokploy Oficial**: https://docs.dokploy.com/
- **Docker Documentation**: https://docs.docker.com/
- **Express.js**: https://expressjs.com/
- **Nginx**: https://nginx.org/en/docs/
- **Traefik**: https://doc.traefik.io/traefik/
- **Cloudflare**: https://developers.cloudflare.com/

---

## 🎊 Estado Final - Despliegue Completado

### ✅ Aplicación en Producción

- **Fecha**: Febrero 10, 2026
- **Dominio**: jaguarescar.com
- **Estado**: 🟢 Funcionando correctamente
- **Certificado SSL**: ✅ Activo (Cloudflare)
- **Servidor**: 187.77.6.232 (Ubuntu 22.04)
- **Plataforma**: Dokploy v0.26.7
- **Estadísticas**:
  - Storage: 8 deportes
  - Horarios: 153 disponibles
  - Inscritos: 10 usuarios
  - Activos: 1 usuario

### 🎯 Funcionalidades Activas

- ✅ Inscripción a deportes
- ✅ Selección de horarios
- ✅ Consulta de estado
- ✅ Panel administrativo
- ✅ Gestión de usuarios
- ✅ Gestión de horarios
- ✅ Sistema de pagos (integrable)
- ✅ Reportes de profesores

### 🔒 Seguridad

- ✅ HTTPS/SSL en todos los dominios
- ✅ CORS configurado y restringido
- ✅ Rate limiting activo
- ✅ Helmet security headers
- ✅ Validación de entrada
- ✅ Autenticación JWT
- ✅ Contraseñas hasheadas

---

## 📞 Soporte

Para asistencia técnica o cambios futuros:

1. **Actualizar código**: Modificar repositorio → Push a GitHub
2. **Redeploy**: Ir a Dokploy → Rebuild/Redeploy
3. **Ver logs**: Dokploy → Deployments → View logs
4. **Emergencias**: SSH al VPS y revisar docker logs

---

**¡🎉 JAGUARES Academia Deportiva está en PRODUCCIÓN con Dokploy! 🎉**

La aplicación está lista para recibir usuarios, inscripciones y gestión de deportes en tiempo real.

---

## � Variables de Entorno Completas

### Backend (jaguares-backend)

```env
# Base de Datos MySQL
DB_HOST=jaguaresacademia-jaguaresmysql-czxi5m
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=kikomoreno1
DB_NAME=jaguares_db

# Servidor Node.js
PORT=3002
NODE_ENV=production

# Seguridad - JWT
JWT_SECRET=jaguares_2025_super_secret_key_8f7s9dF!23xD_muy_seguro_y_largo

# Google Apps Script (opcional para integraciones futuras)
APPS_SCRIPT_TOKEN=academia_2025_TOKEN_8f7s9dF!23xD
APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbxrAbX71R1Rzj9gHDLwmMN3eSBEwZaR_bNbWmiXbcVKe9iqn36mDP6VMd1Evaq1dZpF/exec
```

### Base de Datos (jaguares-mysql)

```env
MYSQL_ROOT_PASSWORD=RootJaguar2026!
MYSQL_DATABASE=jaguares_db
MYSQL_USER=admin
MYSQL_PASSWORD=kikomoreno1
```

### Frontend

No requiere variables de entorno. Las URLs se detectan automáticamente en JavaScript.

---

## 💻 Comandos Útiles

### Docker en VPS

```bash
# Ver todos los contenedores corriendo
docker ps

# Ver todos los servicios Docker Swarm
docker service ls

# Ver logs de un contenedor específico
docker logs [CONTAINER_ID]

# Ver logs tiempo real
docker logs -f [CONTAINER_ID]

# Ver logs de un servicio
docker service logs [SERVICE_NAME]

# Ejecutar comandos dentro de un contenedor
docker exec -it [CONTAINER_ID] bash

# Listar redes Docker
docker network ls

# Limpiar espacio (imágenes, volúmenes no usados)
docker system prune --volumes
```

### Git y Actualizaciones

```bash
# Hacer cambios y subir a GitHub
cd /ruta/del/proyecto
git add .
git commit -m "Descripción del cambio"
git push origin main  # o master para frontend

# En Dokploy: Ir a Deployments → Rebuild/Redeploy
```

### Base de Datos MySQL

```bash
# Conectar a MySQL desde SSH del contenedor
docker exec -it [MYSQL_CONTAINER] mysql -uroot -pRootJaguar2026! jaguares_db

# Crear backup de la base de datos
docker exec [MYSQL_CONTAINER] mysqldump -uroot -pRootJaguar2026! jaguares_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar desde backup
docker exec -i [MYSQL_CONTAINER] mysql -uroot -pRootJaguar2026! jaguares_db < backup.sql

# Ver tamaño de base de datos
docker exec -it [MYSQL_CONTAINER] mysql -uroot -pRootJaguar2026! -e "SELECT table_schema, SUM(data_length + index_length) / 1024 / 1024 AS size_mb FROM information_schema.tables GROUP BY table_schema;"
```

### Verificaciones Rápidas

```bash
# Verificar que DNS está propagado
nslookup jaguarescar.com
nslookup api.jaguarescar.com

# Probar conectividad a endpoints
curl -I https://jaguarescar.com
curl -I https://api.jaguarescar.com/api/health
curl https://api.jaguarescar.com/api/horarios | head -c 300

# Ver estado de servicios en Dokploy
# Acceder a: http://187.77.6.232:3000
```

---

---

## 🎯 URLs Finales (Actualizado - En Producción)

### ✅ Producción - Dominio Real con HTTPS
- **Frontend Principal**: `https://jaguarescar.com`
- **Frontend WWW**: `https://www.jaguarescar.com`
- **Backend API**: `https://api.jaguarescar.com`
- **Admin Panel**: `https://jaguarescar.com/admin-login.html`
- **Admin Dashboard**: `https://jaguarescar.com/admin-dashboard.html`

### ⚠️ Legacy - IP con nip.io (Descontinuado)
- `http://187.77.6.232.nip.io` - No usar
- `http://api.187.77.6.232.nip.io` - No usar

---

## ✅ Checklist de Verificación (Actualizado)

Este checklist verifica que el despliegue con dominio real está completo.

---

## 🆘 Soporte y Contacto

### Documentación Oficial
- **Dokploy**: https://docs.dokploy.com/
- **Docker**: https://docs.docker.com/
- **Traefik**: https://doc.traefik.io/traefik/

### Logs Importantes
- **Dokploy Web**: `http://187.77.6.232:3000`
- **Traefik Dashboard**: `http://187.77.6.232:8080` (si está habilitado)
- **Logs del sistema**: `/var/log/dokploy/`

---

## 📝 Notas de la Implementación

- **Fecha de implementación**: Febrero 9, 2026
- **Versión de Dokploy**: v0.26.7
- **Versión de Docker**: 24.x
- **Base de datos**: MySQL 8.0
- **Frontend**: HTML/CSS/JS + Nginx
- **Backend**: Node.js 20 + Express
- **Proxy**: Traefik v3.6.7

---

**¡Despliegue completado exitosamente! 🎉**

La aplicación JAGUARES Academia Deportiva está ahora funcionando en producción con Dokploy.