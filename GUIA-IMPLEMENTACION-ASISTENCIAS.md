# 🚀 Guía Rápida de Implementación - Sistema de Asistencias

## ✅ Checklist de Implementación

### 1️⃣ Base de Datos (5 minutos)

**Ejecutar en orden:**

```bash
# 1. Conectar a MySQL
mysql -u root -p

# 2. Usar la base de datos
USE jaguares_db;

# 3. Ejecutar script de creación de tablas
SOURCE /ruta/completa/database/crear-tabla-profesores.sql;

# 4. (Opcional) Insertar datos de prueba
SOURCE /ruta/completa/database/datos-prueba-profesores.sql;
```

**Verificar:**
```sql
SHOW TABLES LIKE 'profesor_deportes';
SELECT * FROM administradores WHERE rol = 'profesor';
```

---

### 2️⃣ Backend - Server (Ya está listo ✅)

Los endpoints ya fueron añadidos a `server/index.js`. Solo necesitas:

```bash
cd server
node index.js
```

**Verificar que esté corriendo:**
- Deberías ver: `🚀 SERVIDOR BACKEND JAGUARES - MODO PRODUCCIÓN`
- Puerto: `3002` (o el configurado en .env)

---

### 3️⃣ Frontend - Archivos (Ya están listos ✅)

Todos los archivos HTML y JS ya están en la carpeta `profesor/`:

```
✅ profesor/index.html
✅ profesor/asistencias.html
✅ profesor/reportes.html
✅ profesor/js/profesor-dashboard.js
✅ profesor/js/profesor-asistencias.js
✅ profesor/js/profesor-reportes.js
```

---

### 4️⃣ Configurar Profesores y Asignaciones

**Opción A: Usar datos de prueba (Recomendado para testing)**

Ya están creados 3 profesores con el script `datos-prueba-profesores.sql`:
- `profesor.futbol` / Password: `Admin123!`
- `profesor.voley` / Password: `Admin123!`
- `profesor.basquet` / Password: `Admin123!`

**Opción B: Crear manualmente**

```sql
-- 1. Crear profesor
INSERT INTO administradores 
(usuario, password_hash, nombre_completo, email, rol, estado) 
VALUES (
  'tu_usuario',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'Nombre Completo',
  'email@jaguares.com',
  'profesor',
  'activo'
);

-- 2. Obtener ID del profesor
SET @profesor_id = LAST_INSERT_ID();

-- 3. Asignar deportes/categorías
INSERT INTO profesor_deportes (admin_id, deporte_id, categoria) VALUES
(@profesor_id, 1, '2011-2012'),  -- Fútbol categoría específica
(@profesor_id, 1, '2013-2014');  -- Otra categoría

-- O asignar TODO un deporte:
INSERT INTO profesor_deportes (admin_id, deporte_id, categoria) VALUES
(@profesor_id, 3, NULL);  -- NULL = todas las categorías de Vóley
```

---

### 5️⃣ Probar el Sistema

**1. Login:**
- Ir a: `http://localhost:3002/admin-login.html` (o tu dominio)
- Usuario: `profesor.futbol`
- Password: `Admin123!`

**2. Verificar redirección:**
- Debería redirigir automáticamente a `profesor/index.html`

**3. Tomar asistencia:**
- Clic en "Tomar Asistencia"
- Seleccionar Deporte → Categoría → Horario
- Cargar alumnos
- Marcar asistencia
- Guardar

**4. Ver reportes:**
- Clic en "Reportes"
- Seleccionar fechas
- Generar reporte

---

## 🔧 Solución de Problemas

### Error: "Base de datos no disponible"
**Causa:** MySQL no está corriendo o credenciales incorrectas

**Solución:**
```bash
# Verificar MySQL
mysql -u root -p

# Verificar variables de entorno en server/.env
DB_HOST=localhost
DB_PORT=3307
DB_USER=root
DB_PASSWORD=rootpassword123
DB_NAME=jaguares_db
```

---

### Error: "No tienes clases programadas para hoy"
**Causa:** No hay asignaciones de profesor_deportes o no es el día correcto

**Solución:**
```sql
-- Verificar asignaciones
SELECT * FROM profesor_deportes WHERE admin_id = YOUR_ADMIN_ID;

-- Verificar horarios del día
SELECT * FROM horarios WHERE dia = 'LUNES' AND estado = 'activo';
```

---

### Error: "No hay alumnos inscritos"
**Causa:** No hay inscripciones activas en ese horario

**Solución:**
```sql
-- Verificar inscripciones
SELECT 
  i.inscripcion_id,
  a.nombre_completo,
  h.categoria,
  h.dia
FROM inscripciones i
INNER JOIN alumnos a ON i.alumno_id = a.alumno_id
INNER JOIN inscripcion_horarios ih ON i.inscripcion_id = ih.inscripcion_id
INNER JOIN horarios h ON ih.horario_id = h.horario_id
WHERE h.horario_id = YOUR_HORARIO_ID
  AND i.estado = 'activa';
```

---

### Error de autenticación/token
**Causa:** Sesión expirada o token inválido

**Solución:**
1. Cerrar sesión
2. Limpiar localStorage: F12 → Console → `localStorage.clear()`
3. Volver a iniciar sesión

---

## 📊 Verificar que Todo Funciona

**Consulta SQL completa de verificación:**

```sql
-- 1. Profesores creados
SELECT COUNT(*) as total_profesores 
FROM administradores 
WHERE rol = 'profesor' AND estado = 'activo';

-- 2. Asignaciones de profesores
SELECT 
  a.nombre_completo,
  COUNT(pd.id) as total_asignaciones
FROM administradores a
LEFT JOIN profesor_deportes pd ON a.admin_id = pd.admin_id
WHERE a.rol = 'profesor'
GROUP BY a.admin_id;

-- 3. Horarios disponibles hoy
SELECT 
  d.nombre as deporte,
  h.categoria,
  h.dia,
  h.hora_inicio,
  COUNT(DISTINCT ih.inscripcion_id) as alumnos_inscritos
FROM horarios h
INNER JOIN deportes d ON h.deporte_id = d.deporte_id
LEFT JOIN inscripcion_horarios ih ON h.horario_id = ih.horario_id
WHERE h.dia = DAYNAME(CURDATE())
  AND h.estado = 'activo'
GROUP BY h.horario_id;

-- 4. Asistencias del mes
SELECT 
  COUNT(*) as total_registros,
  SUM(presente) as presentes,
  COUNT(*) - SUM(presente) as ausentes
FROM asistencias
WHERE fecha >= DATE_SUB(CURDATE(), INTERVAL 30 DAY);
```

**Resultado esperado:**
- ✅ Al menos 1 profesor activo
- ✅ Al menos 1 asignación de deporte
- ✅ Horarios disponibles para hoy
- ✅ (Opcional) Registros de asistencia

---

## 🎯 Flujo Completo de Uso

```
1. PROFESOR INICIA SESIÓN
   ↓
2. VE DASHBOARD con clases de hoy
   ↓
3. CLIC en "Tomar Asistencia"
   ↓
4. SELECCIONA: Deporte → Categoría → Horario
   ↓
5. CARGA lista de alumnos inscritos
   ↓
6. MARCA presentes/ausentes
   ↓
7. GUARDA asistencia
   ↓
8. VE confirmación de éxito
   ↓
9. (Opcional) VE REPORTES de asistencias
```

---

## 📞 Contacto de Soporte

Si después de esta guía sigues teniendo problemas:

1. **Revisar logs del servidor:**
   ```bash
   tail -f server/server-log.txt
   ```

2. **Revisar consola del navegador:**
   - F12 → Console (buscar errores en rojo)

3. **Verificar que todas las tablas existen:**
   ```sql
   SHOW TABLES;
   -- Debe incluir: profesor_deportes, asistencias, administradores
   ```

---

## ✨ ¡Listo para Producción!

Una vez que todo funcione en desarrollo:

1. **Cambiar contraseñas por defecto**
2. **Configurar variables de entorno de producción**
3. **Hacer backup de la base de datos**
4. **Desplegar en tu servidor (Render, AWS, etc.)**

---

**¡El sistema de asistencias está completamente integrado y listo para usar! 🎉**
