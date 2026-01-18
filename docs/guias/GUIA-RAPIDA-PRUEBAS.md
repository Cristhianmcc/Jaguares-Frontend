# 🚀 GUÍA RÁPIDA - PRUEBAS DEL SISTEMA

## ¿Cómo verificar que todo funciona?

### Opción 1: Verificación Rápida (30 segundos)
```bash
cd server
node verificar-sistema.js
```
✅ Te dirá si MySQL, API y datos están OK

---

### Opción 2: Pruebas Técnicas Completas (30 segundos)
```bash
cd server
node test-sistema-mysql.js
```
✅ Ejecuta 14 pruebas técnicas
✅ Crea inscripciones de prueba
✅ Verifica integridad de datos

---

### Opción 3: Simulación de Usuarios Reales (1 minuto)
```bash
cd server
node simulador-usuarios.js
```
✅ Simula 5 usuarios reales
✅ Prueba el flujo completo de inscripción
✅ Ver horarios → Seleccionar → Inscribir → Consultar

---

## 🔍 Ver la Base de Datos

### Opción A: phpMyAdmin (Visual)
1. Abre tu navegador
2. Ve a: http://localhost:8080
3. Usuario: `root`
4. Contraseña: `rootpassword123`
5. Base de datos: `jaguares_db`

### Opción B: Línea de comandos
```bash
# Ver todas las tablas
docker exec -it jaguares_mysql mysql -uroot -prootpassword123 -e "USE jaguares_db; SHOW TABLES;"

# Ver alumnos
docker exec -it jaguares_mysql mysql -uroot -prootpassword123 -e "USE jaguares_db; SELECT * FROM alumnos LIMIT 10;"

# Ver inscripciones
docker exec -it jaguares_mysql mysql -uroot -prootpassword123 -e "USE jaguares_db; SELECT * FROM inscripciones LIMIT 10;"

# Ver horarios disponibles
docker exec -it jaguares_mysql mysql -uroot -prootpassword123 -e "USE jaguares_db; SELECT * FROM horarios WHERE estado='activo' LIMIT 10;"
```

---

## 🐳 Comandos Docker

### Ver estado de contenedores
```bash
docker ps
```

### Ver logs
```bash
# Logs de MySQL
docker logs jaguares_mysql

# Logs de phpMyAdmin
docker logs jaguares_phpmyadmin
```

### Reiniciar contenedores
```bash
# Reiniciar todo
docker-compose restart

# Reiniciar solo MySQL
docker restart jaguares_mysql
```

### Detener/Iniciar
```bash
# Detener todo
docker-compose down

# Iniciar todo
docker-compose up -d
```

---

## 🌐 Probar Endpoints con el Navegador

### Health Check
```
http://localhost:3002/api/health
```

### Ver todos los horarios
```
http://localhost:3002/api/horarios
```

### Ver horarios para niño de 10 años (nacido en 2016)
```
http://localhost:3002/api/horarios?año_nacimiento=2016
```

### Consultar inscripción por DNI
```
http://localhost:3002/api/consultar/98765432
```

---

## 📊 Ver Reportes

### Reporte Completo
```bash
# En Windows
notepad REPORTE-VERIFICACION-SISTEMA.md

# O abrir con VS Code
code REPORTE-VERIFICACION-SISTEMA.md
```

### Resumen Ejecutivo
```bash
code RESUMEN-VERIFICACION.md
```

### Reporte JSON (para análisis)
```bash
# Ver en la terminal
Get-Content server\reporte-pruebas-mysql.json | ConvertFrom-Json | Format-List

# O abrir con editor
code server\reporte-pruebas-mysql.json
```

---

## 🆘 Solución de Problemas

### ❌ Error: MySQL no conecta

**Verificar que Docker esté corriendo:**
```bash
docker ps
```

**Si no aparecen contenedores, iniciar:**
```bash
docker-compose up -d
```

**Esperar 10 segundos y volver a intentar**

---

### ❌ Error: API no responde

**Verificar que el servidor esté corriendo:**
```bash
# Windows
Test-NetConnection -ComputerName localhost -Port 3002
```

**Si no está corriendo, iniciar:**
```bash
cd server
node index.js
```

---

### ❌ Error: Puerto ya en uso

**Si el puerto 3002 está ocupado:**
1. Cambiar puerto en `server/.env`:
   ```
   PORT=3003
   ```
2. Reiniciar servidor

**Si el puerto 3307 (MySQL) está ocupado:**
1. Cambiar en `docker-compose.yml`:
   ```yaml
   ports:
     - "3308:3306"  # Cambiar 3307 por 3308
   ```
2. Cambiar en `server/.env`:
   ```
   DB_PORT=3308
   ```
3. Reiniciar Docker:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

---

## 📞 Consultas Útiles SQL

### Ver estadísticas
```sql
-- Total de alumnos activos
SELECT COUNT(*) FROM alumnos WHERE estado='activo';

-- Total de inscripciones por deporte
SELECT d.nombre, COUNT(*) as total
FROM inscripciones i
JOIN deportes d ON i.deporte_id = d.deporte_id
GROUP BY d.nombre;

-- Inscripciones pendientes de pago
SELECT a.dni, a.nombres, d.nombre as deporte, i.precio_mensual
FROM inscripciones i
JOIN alumnos a ON i.alumno_id = a.alumno_id
JOIN deportes d ON i.deporte_id = d.deporte_id
WHERE i.estado = 'pendiente';

-- Horarios con más inscritos
SELECT h.dia, h.hora_inicio, d.nombre, h.cupos_ocupados, h.cupo_maximo
FROM horarios h
JOIN deportes d ON h.deporte_id = d.deporte_id
ORDER BY h.cupos_ocupados DESC
LIMIT 10;
```

---

## ✅ Checklist Diario

Antes de abrir el sistema a usuarios:

- [ ] Ejecutar `node verificar-sistema.js`
- [ ] Verificar que Docker esté corriendo
- [ ] Verificar que API responda
- [ ] Revisar logs por errores
- [ ] Hacer backup de BD (recomendado)

---

**¿Dudas o problemas?**
Revisa el archivo `REPORTE-VERIFICACION-SISTEMA.md` para más detalles.
