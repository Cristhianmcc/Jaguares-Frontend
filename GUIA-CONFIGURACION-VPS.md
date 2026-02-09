# 🚀 Guía Completa de Configuración del VPS - Academia Jaguares

## 📋 Información del VPS

- **Proveedor**: Hostinger
- **Plan**: KVM 2 ($6.99/mes)
- **IP**: 187.77.6.232
- **Sistema Operativo**: Ubuntu 24.04 LTS
- **Usuario**: root
- **Contraseña**: J@gu@res2026

---

## 🔐 Paso 1: Conexión SSH al VPS

```bash
ssh root@187.77.6.232
```

Cuando te pida confirmación de la huella digital, escribe `yes` y luego ingresa tu contraseña.

---

## 🔄 Paso 2: Actualizar el Sistema Operativo

```bash
# Actualizar lista de paquetes
sudo apt update

# Actualizar todos los paquetes instalados
sudo apt upgrade -y
```

---

## 🐳 Paso 3: Instalar Docker

### 3.1 Instalar dependencias necesarias
```bash
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
```

### 3.2 Agregar la clave GPG de Docker
```bash
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
```

### 3.3 Agregar el repositorio de Docker
```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### 3.4 Instalar Docker
```bash
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io
```

### 3.5 Verificar instalación de Docker
```bash
docker --version
```

**Resultado esperado**: `Docker version 29.2.1, build a5c7197`

---

## 🐳 Paso 4: Instalar Docker Compose

```bash
# Descargar la última versión de Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Dar permisos de ejecución
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker-compose --version
```

**Resultado esperado**: `Docker Compose version v5.0.2`

---

## 🔥 Paso 5: Configurar el Firewall (UFW)

### 5.1 Solucionar conflictos de repositorios (si es necesario)

Si tienes errores al instalar UFW, ejecuta estos comandos primero:

```bash
# Buscar archivos conflictivos
grep -r "download.docker.com" /etc/apt/

# Eliminar archivos de configuración duplicados de Docker
sudo rm -f /etc/apt/sources.list.d/docker.sources
sudo rm -f /etc/apt/sources.list.d/docker.list
sudo rm -f /etc/apt/keyrings/docker.gpg
sudo rm -f /etc/apt/keyrings/docker.asc

# Actualizar repositorios
sudo apt update
```

### 5.2 Instalar UFW
```bash
sudo apt install -y ufw
```

### 5.3 Configurar puertos permitidos
```bash
# SSH (necesario para no perder la conexión)
sudo ufw allow 22

# HTTP
sudo ufw allow 80

# HTTPS
sudo ufw allow 443

# Dokploy Panel
sudo ufw allow 3000
```

### 5.4 Activar el firewall
```bash
sudo ufw enable
```

Cuando te pregunte si deseas continuar, escribe `y` y presiona Enter.

### 5.5 Verificar estado del firewall
```bash
sudo ufw status
```

---

## 📦 Paso 6: Instalar Dokploy

Dokploy es una plataforma de gestión de contenedores similar a Render, Vercel o Netlify, pero auto-hospedada.

```bash
curl -sSL https://dokploy.com/install.sh | sh
```

**Tiempo estimado**: 2-5 minutos

### 6.1 Acceder al panel de Dokploy

Abre tu navegador y ve a:
```
http://187.77.6.232:3000
```

o

```
https://187.77.6.232:3000
```

### 6.2 Crear cuenta de administrador

- **First Name**: Tu nombre
- **Last Name**: Tu apellido
- **Email**: Tu correo
- **Password**: Contraseña segura (guárdala)
- **Confirm Password**: Repetir contraseña

---

## ☁️ Paso 7: Configurar Cloudflare (DNS)

### 7.1 Agregar registros DNS

Ve a tu panel de Cloudflare → **DNS** → **Records** y agrega:

| Tipo | Nombre | Contenido | Proxy | TTL |
|------|--------|-----------|-------|-----|
| A | @ | 187.77.6.232 | 🟠 Proxied | Auto |
| A | www | 187.77.6.232 | 🟠 Proxied | Auto |
| A | api | 187.77.6.232 | 🟠 Proxied | Auto |

### 7.2 Configurar SSL/TLS

- Ve a **SSL/TLS** → **Overview**
- Selecciona: **Full (strict)**

### 7.3 Activar protecciones

En **SSL/TLS** → **Edge Certificates**:
- ✅ Always Use HTTPS: **ON**
- ✅ Automatic HTTPS Rewrites: **ON**

### 7.4 Configurar reglas de caché (opcional)

Ve a **Rules** → **Page Rules** y crea una regla:
- **URL**: `api.tudominio.com/*`
- **Setting**: Cache Level = **Bypass**

Esto evita que Cloudflare cachee las respuestas de tu API.

---

## 🎯 Paso 8: Comandos Útiles

### Gestión de Docker

```bash
# Ver contenedores en ejecución
docker ps

# Ver todos los contenedores (incluidos los detenidos)
docker ps -a

# Ver imágenes descargadas
docker images

# Detener un contenedor
docker stop <container_id>

# Iniciar un contenedor
docker start <container_id>

# Ver logs de un contenedor
docker logs <container_id>

# Ver logs en tiempo real
docker logs -f <container_id>

# Eliminar un contenedor
docker rm <container_id>

# Eliminar una imagen
docker rmi <image_id>

# Limpiar recursos no utilizados
docker system prune -a
```

### Gestión de Docker Compose

```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Ver logs
docker-compose logs

# Reiniciar servicios
docker-compose restart

# Ver estado
docker-compose ps
```

### Gestión del Sistema

```bash
# Ver uso de disco
df -h

# Ver uso de memoria
free -h

# Ver procesos en ejecución
top

# Reiniciar el servidor
sudo reboot

# Apagar el servidor
sudo shutdown -h now

# Ver logs del sistema
sudo journalctl -xe
```

### UFW (Firewall)

```bash
# Ver estado del firewall
sudo ufw status

# Ver reglas numeradas
sudo ufw status numbered

# Permitir un puerto
sudo ufw allow <puerto>

# Denegar un puerto
sudo ufw deny <puerto>

# Eliminar una regla
sudo ufw delete <número_regla>

# Desactivar firewall
sudo ufw disable

# Activar firewall
sudo ufw enable
```

---

## 🔍 Verificación Final

Ejecuta estos comandos para verificar que todo está funcionando:

```bash
# Verificar Docker
docker --version
docker ps

# Verificar Docker Compose
docker-compose --version

# Verificar firewall
sudo ufw status

# Verificar puertos abiertos
sudo netstat -tulpn | grep LISTEN

# Verificar espacio en disco
df -h

# Verificar memoria
free -h
```

---

## 📊 Recursos del Sistema

### Información del VPS KVM 2

- **RAM**: 8 GB
- **CPU**: 2 vCPU cores
- **Disco**: 100 GB NVMe
- **Bandwidth**: 8 TB/mes
- **IP Dedicada**: 187.77.6.232

### Consumo Estimado de tu Sistema

| Servicio | RAM | CPU | Disco |
|----------|-----|-----|-------|
| MySQL | ~500 MB | <10% | ~2 GB |
| Backend (Node.js) | ~100 MB | <10% | ~1 GB |
| Frontend (Nginx) | ~50 MB | <5% | ~500 MB |
| Dokploy | ~100 MB | <5% | ~500 MB |
| **TOTAL** | ~750 MB | ~30% | ~4 GB |

**Margen disponible**: 
- RAM: 7.25 GB libres (~90%)
- CPU: 70% libre
- Disco: 96 GB libres (~96%)

---

## 🚨 Solución de Problemas

### Si pierdes la conexión SSH

1. Ve al panel de Hostinger
2. Usa la consola web para acceder al servidor
3. Verifica que el puerto 22 esté permitido en UFW:
   ```bash
   sudo ufw status
   ```

### Si Docker no funciona

```bash
# Reiniciar el servicio de Docker
sudo systemctl restart docker

# Ver estado del servicio
sudo systemctl status docker

# Ver logs de Docker
sudo journalctl -u docker
```

### Si Dokploy no es accesible

```bash
# Verificar que el puerto 3000 esté permitido
sudo ufw status

# Verificar contenedores de Dokploy
docker ps | grep dokploy

# Reiniciar Dokploy
sudo systemctl restart dokploy
```

### Si el firewall bloquea la conexión

```bash
# Desactivar temporalmente el firewall
sudo ufw disable

# Volver a activarlo después de solucionar
sudo ufw enable
```

---

## 📚 Recursos Adicionales

- **Documentación de Docker**: https://docs.docker.com/
- **Documentación de Dokploy**: https://dokploy.com/docs
- **Documentación de Cloudflare**: https://developers.cloudflare.com/
- **Soporte de Hostinger**: https://www.hostinger.com/tutorials/

---

## ✅ Checklist de Configuración

- [x] Conexión SSH establecida
- [x] Sistema operativo actualizado
- [x] Docker instalado
- [x] Docker Compose instalado
- [x] Firewall configurado
- [x] Dokploy instalado
- [ ] Dominio configurado en Cloudflare
- [ ] Proyecto desplegado en Dokploy
- [ ] Base de datos MySQL configurada
- [ ] Backend desplegado
- [ ] Frontend desplegado
- [ ] SSL/HTTPS funcionando

---

## 📝 Notas Importantes

1. **Guarda tus contraseñas de forma segura**:
   - Contraseña root del VPS: J@gu@res2026
   - Contraseña de Dokploy: La que configuraste
   - Contraseñas de base de datos: Por configurar

2. **Backups regulares**:
   - Considera configurar backups automáticos desde el panel de Hostinger
   - Dokploy también tiene opciones de backup

3. **Monitoreo**:
   - Revisa regularmente el uso de recursos en Dokploy
   - Configura alertas si es necesario

4. **Actualizaciones**:
   - Mantén el sistema actualizado regularmente
   - Revisa actualizaciones de Docker y Dokploy

---

**Fecha de creación**: 8 de febrero de 2026  
**Última actualización**: 8 de febrero de 2026  
**Versión**: 1.0
