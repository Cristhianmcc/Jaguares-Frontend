# Guía de Despliegue en Dokploy - Academia Jaguares

## Pre-requisitos Completados ✅
- ✅ Dokploy instalado en VPS (187.77.6.232:3000)
- ✅ Dockerfile creado
- ✅ .dockerignore creado

## Pasos para Desplegar

### 1. Crear Base de Datos MySQL en Dokploy

1. En el panel lateral, ve a **"Docker"** → **"Databases"** o crea uno dentro del proyecto
2. Click en **"Create Database"**
3. Selecciona **MySQL**
4. Configura:
   - **Name**: `jaguares-db`
   - **MySQL Root Password**: (guarda esta contraseña, la necesitarás)
   - **Database Name**: `jaguares_db`
   - **MySQL User**: `jaguares_user`
   - **MySQL Password**: (crea una contraseña segura)
   - **Port**: `3306` (dejarlo por defecto)

5. Click en **"Create"** y espera a que esté **"Running"**

### 2. Crear Proyecto en Dokploy

1. Click en **"+ Create Project"**
2. Nombre del proyecto: `jaguares-academia`
3. Descripción: `Sistema de inscripciones deportivas`
4. Click en **"Create"**

### 3. Crear Aplicación

1. Dentro del proyecto, click en **"Create Service"**
2. Selecciona **"Application"**
3. Configura:
   - **Application Name**: `jaguares-backend`
   - **Source**: Selecciona **"Git"**
   
### 4. Configurar Repositorio Git

**Opción A: Si tienes el código en GitHub/GitLab**
1. Ingresa la URL del repositorio
2. Selecciona la rama (generalmente `main` o `master`)
3. Dokploy detectará automáticamente el Dockerfile

**Opción B: Si NO tienes repositorio Git**
Necesitas subir tu código a GitHub primero:

```bash
# En tu terminal PowerShell, ejecuta:
cd C:\Users\Cris\Desktop\jaguares-funcional

# Inicializar git si no lo has hecho
git init

# Agregar todos los archivos
git add .

# Commit
git commit -m "Preparar proyecto para despliegue en Dokploy"

# Crear repositorio en GitHub y luego:
git remote add origin <TU_REPO_URL>
git push -u origin main
```

### 5. Configurar Variables de Entorno

En Dokploy, ve a la pestaña **"Environment"** y agrega:

```env
# Base de Datos (usa los valores de la base de datos que creaste)
DB_HOST=jaguares-db
DB_PORT=3306
DB_USER=jaguares_user
DB_PASSWORD=TU_PASSWORD_MYSQL
DB_NAME=jaguares_db

# Servidor
PORT=3002
NODE_ENV=production

# Google Apps Script (opcional si lo usas)
APPS_SCRIPT_URL=https://script.google.com/macros/s/AKfycbzUSJ0k79mdjd13pk5Rbv9obkXxDx2IvLV8KjglNMkBWW3RPQ1i-kFlm7G0NDDb6W1HSg/exec
APPS_SCRIPT_TOKEN=academia_2025_TOKEN_8f7s9dF!23xL

# JWT Secret (genera uno seguro)
JWT_SECRET=GENERA_UN_SECRET_SEGURO_AQUI_123456789
```

### 6. Configurar Dominio y Puerto

1. Ve a la pestaña **"Domains"**
2. Agrega tu dominio o usa la IP del servidor
3. Puerto interno: **3002**
4. Habilita HTTPS si tienes dominio

### 7. Importar Base de Datos

Una vez que la aplicación esté desplegada, necesitas importar tus datos:

#### Conectarse a la base de datos:
```bash
# SSH a tu VPS
ssh root@187.77.6.232

# Ver el nombre del contenedor de MySQL
docker ps | grep mysql

# Importar el backup
docker exec -i <NOMBRE_CONTENEDOR_MYSQL> mysql -ujaguares_user -p<PASSWORD> jaguares_db < backup-aws-rds-20260209-000653.sql
```

O también puedes usar un cliente MySQL como SequelAce, DBeaver o phpMyAdmin apuntando a:
- Host: `187.77.6.232`
- Puerto: `3306` (el que Dokploy exponga)
- Usuario: `jaguares_user`
- Password: (el que configuraste)
- Database: `jaguares_db`

### 8. Desplegar

1. Ve a la pestaña **"Deployments"**
2. Click en **"Deploy"**
3. Dokploy construirá la imagen Docker y desplegará tu aplicación
4. Espera a que el estado sea **"Running"**

### 9. Verificar Despliegue

Accede a tu aplicación en:
- `http://187.77.6.232:3002` (si configuraste el puerto directamente)
- `http://tu-dominio.com` (si configuraste un dominio)

### Solución de Problemas

#### Ver logs:
En Dokploy, ve a la pestaña **"Logs"** para ver los logs en tiempo real

#### Reiniciar aplicación:
En la pestaña **"Actions"**, click en **"Restart"**

#### Ver contenedores:
```bash
ssh root@187.77.6.232
docker ps
docker logs <container_name>
```

## Próximos Pasos

1. ✅ Configurar dominio personalizado
2. ✅ Habilitar SSL/HTTPS automático con Let's Encrypt
3. ✅ Configurar backups automáticos de la base de datos
4. ✅ Configurar monitoreo y alertas
5. ✅ Configurar CI/CD para despliegues automáticos

## Notas Importantes

- **Puerto del backend**: 3002
- **Puerto de MySQL en Dokploy**: Generalmente 3306
- **Archivos estáticos**: Dokploy servirá automáticamente los archivos HTML/CSS/JS desde la raíz del proyecto
- **Logs**: Siempre revisa los logs si algo no funciona
- **Variables de entorno**: NUNCA commits las contraseñas reales al repositorio Git

## Comandos Útiles

```bash
# Ver servicios Docker
docker service ls

# Ver logs de un servicio
docker service logs <service_name>

# Escalar servicios (más réplicas)
docker service scale <service_name>=3

# Ver estado de Dokploy
docker ps | grep dokploy
```
