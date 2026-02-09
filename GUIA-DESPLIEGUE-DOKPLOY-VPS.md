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
Host: api.187.77.6.232.nip.io
Path: /
Container Port: 3002
HTTPS: Disabled (por ahora)
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
    : 'http://api.187.77.6.232.nip.io'; // Producción en Dokploy
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

## ⚠️ Resolución de Problemas

### Problema 1: Error CORS en Frontend

**Síntoma**: Error `No 'Access-Control-Allow-Origin' header` al hacer login

**Solución**: Actualizar whitelist de CORS en el backend.

En `server/middleware/security.js`:

```javascript
const whitelist = [
    'http://localhost:3000',
    'http://localhost:5500',
    // ... otros localhost
    // Agregar URLs de producción
    'http://187.77.6.232.nip.io',
    'http://api.187.77.6.232.nip.io'
];
```

**Pasos:**
1. Actualizar archivo en repositorio backend
2. Push a GitHub
3. Rebuild backend en Dokploy

### Problema 2: Backend No Conecta a Base de Datos

**Síntoma**: `Error: getaddrinfo ENOTFOUND jaguares-mysql`

**Solución**: Verificar `DB_HOST` en variables de entorno.

1. Ir a **jaguares-mysql** → **"General"** → Copiar **"Internal Host"**
2. Actualizar `DB_HOST` en variables del backend
3. Restart del backend

### Problema 3: GitHub Provider Not Found

**Solución**: Autorizar Dokploy en GitHub.

1. Settings → Git → Connect GitHub
2. O cambiar de "GitHub" a "Git" genérico en configuración del servicio

---

## 🌐 Configuración de Dominios

### 1. DNS en Cloudflare

Crear registros A:

| Tipo | Nombre | Destino | Proxy |
|------|---------|---------|-------|
| A | @ | 187.77.6.232 | ✅ |
| A | api | 187.77.6.232 | ✅ |
| A | www | 187.77.6.232 | ✅ |

### 2. Actualizar Dominios en Dokploy

**Frontend:**
- Cambiar de `187.77.6.232.nip.io` a `jaguarescar.com`
- Habilitar HTTPS

**Backend:**
- Cambiar de `api.187.77.6.232.nip.io` a `api.jaguarescar.com`
- Habilitar HTTPS

### 3. Actualizar URLs en Código

```javascript
// Actualizar a HTTPS y dominio real
const API_BASE = window.location.hostname === 'localhost'
    ? 'http://localhost:3002'
    : 'https://api.jaguarescar.com';
```

### 4. Actualizar CORS

```javascript
const whitelist = [
    // ... localhost entries
    'https://jaguarescar.com',
    'https://www.jaguarescar.com',
    'https://api.jaguarescar.com'
];
```

---

## 💻 Comandos Útiles

### Docker en VPS

```bash
# Ver todos los contenedores
docker ps

# Ver servicios de Docker Swarm
docker service ls

# Ver logs de un contenedor
docker logs [CONTAINER_ID]

# Ver logs de un servicio
docker service logs [SERVICE_NAME]

# Ejecutar comandos en contenedor
docker exec -it [CONTAINER_ID] bash

# Ver redes de Docker
docker network ls

# Limpiar imágenes no utilizadas
docker system prune
```

### Git y Despliegue

```bash
# Actualizar código y redesplegar
git add .
git commit -m "Descripción del cambio"
git push origin main

# En Dokploy: General → Rebuild
```

### Base de Datos

```bash
# Conectar a MySQL
docker exec -it [MYSQL_CONTAINER_ID] mysql -uroot -pROOT_PASSWORD

# Backup de base de datos
docker exec [MYSQL_CONTAINER_ID] mysqldump -uroot -pROOT_PASSWORD jaguares_db > backup.sql

# Restaurar backup
docker exec -i [MYSQL_CONTAINER_ID] mysql -uroot -pROOT_PASSWORD jaguares_db < backup.sql
```

---

## 🔧 Variables de Entorno Completas

### Backend (jaguares-backend)

```env
# Base de Datos
DB_HOST=jaguaresacademia-jaguaresmysql-czxi5m
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=kikomoreno1
DB_NAME=jaguares_db

# Servidor
PORT=3002
NODE_ENV=production

# JWT
JWT_SECRET=jaguares_2025_super_secret_key_8f7s9dF!23xD_muy_seguro_y_largo

# Google Apps Script (opcional)
APPS_SCRIPT_TOKEN=academia_2025_TOKEN_8f7s9dF!23xD
APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbzUSJ0k79mdjd13pk5Rbv9obkXxDx2IvLV8KjglNMkBWW3RPQ1i-kFlm7G0NDDb6W1HSg/exec
```

### Base de Datos (jaguares-mysql)

```env
MYSQL_ROOT_PASSWORD=RootJaguar2026!
MYSQL_DATABASE=jaguares_db
MYSQL_USER=admin
MYSQL_PASSWORD=kikomoreno1
```

---

## 🎯 URLs Finales

### Con IP (Funcionando)
- **Frontend**: `http://187.77.6.232.nip.io`
- **Backend API**: `http://api.187.77.6.232.nip.io`
- **Admin Panel**: `http://187.77.6.232.nip.io/admin-login.html`

### Con Dominio (Próximo paso)
- **Frontend**: `https://jaguarescar.com`
- **Backend API**: `https://api.jaguarescar.com`
- **Admin Panel**: `https://jaguarescar.com/admin-login.html`

---

## ✅ Checklist de Verificación

### Despliegue Completo
- [ ] Dokploy instalado y funcionando
- [ ] Proyecto creado en Dokploy
- [ ] Base de datos MySQL desplegada ✅
- [ ] Datos importados correctamente ✅
- [ ] Backend desplegado y funcionando ✅
- [ ] Frontend desplegado y funcionando ✅
- [ ] CORS configurado correctamente ✅
- [ ] Login administrativo funcional ✅

### Configuración de Dominio
- [ ] DNS configurado en Cloudflare
- [ ] Dominios actualizados en Dokploy
- [ ] URLs actualizadas en código
- [ ] HTTPS habilitado
- [ ] Certificados SSL funcionando

### Seguridad y Optimización
- [ ] Rate limiting configurado
- [ ] Helmet security headers activos
- [ ] Variables de entorno seguras
- [ ] Backups automáticos configurados
- [ ] Monitoreo configurado

---

## 🔄 Próximos Pasos

1. **Configurar dominio real**: `jaguarescar.com` con HTTPS
2. **Backups automáticos**: Configurar backup diario de MySQL
3. **Monitoreo**: Configurar alertas y métricas
4. **CDN**: Optimizar carga de assets estáticos
5. **CI/CD**: Automatizar despliegues desde GitHub
6. **Escalabilidad**: Configurar múltiples réplicas si es necesario

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