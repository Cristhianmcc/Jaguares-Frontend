# 📚 Sistema de Asistencias para Profesores - JAGUARES

## 🎯 Descripción

Módulo integrado al sistema JAGUARES que permite a los profesores gestionar la asistencia de sus alumnos en tiempo real.

## 📁 Estructura del Proyecto

```
profesor/
├── index.html              # Dashboard principal del profesor
├── asistencias.html        # Interfaz para tomar asistencia
├── reportes.html           # Estadísticas y reportes
└── js/
    ├── profesor-dashboard.js     # Lógica del dashboard
    ├── profesor-asistencias.js   # Lógica de toma de asistencia
    └── profesor-reportes.js      # Lógica de reportes
```

## 🚀 Instalación y Configuración

### 1. Ejecutar Script de Base de Datos

Conectarse a MySQL y ejecutar:

```bash
mysql -u root -p jaguares_db < database/crear-tabla-profesores.sql
```

O desde MySQL Workbench/phpMyAdmin:
- Abrir el archivo `database/crear-tabla-profesores.sql`
- Ejecutar el script completo

### 2. Crear Usuarios Profesores

En la tabla `administradores`, crear usuarios con rol 'profesor':

```sql
-- Ejemplo: Crear profesor
INSERT INTO administradores (usuario, password_hash, nombre_completo, email, rol, estado) 
VALUES (
  'profesor1', 
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',  -- Hash de "Admin123!"
  'Juan Pérez García', 
  'juan.perez@jaguares.com', 
  'profesor', 
  'activo'
);
```

### 3. Asignar Deportes a Profesores

Asignar qué deportes/categorías puede gestionar cada profesor:

```sql
-- Ejemplo: Asignar profesor a Fútbol categorías 2011-2012
INSERT INTO profesor_deportes (admin_id, deporte_id, categoria) VALUES
(2, 1, '2011-2012'),  -- admin_id=2 (profesor), deporte_id=1 (Fútbol)
(2, 1, '2013-2014');

-- Ejemplo: Asignar profesor a TODO el Vóley
INSERT INTO profesor_deportes (admin_id, deporte_id, categoria) VALUES
(3, 3, NULL);  -- NULL en categoría significa todas las categorías

-- Ejemplo: Asignar profesor solo a Lunes de Fútbol Femenino
INSERT INTO profesor_deportes (admin_id, deporte_id, categoria, dia) VALUES
(4, 2, NULL, 'LUNES');
```

### 4. Reiniciar el Servidor

```bash
cd server
npm install  # Si no lo has hecho
node index.js
```

## 👨‍🏫 Uso del Sistema - Profesores

### Login
1. Ir a `admin-login.html`
2. Ingresar con credenciales de profesor
3. Automáticamente redirige a `profesor/index.html`

### Tomar Asistencia
1. Desde el dashboard, hacer clic en "Tomar Asistencia"
2. Seleccionar deporte → categoría → horario
3. Cargar lista de alumnos
4. Marcar presentes/ausentes
5. Guardar asistencia

### Ver Reportes
1. Desde el dashboard, hacer clic en "Reportes"
2. Seleccionar rango de fechas y filtros
3. Ver estadísticas generales, gráficos y detalle por alumno

## 🔐 Seguridad

- **Autenticación JWT**: Todos los endpoints requieren token válido
- **Verificación de rol**: Solo usuarios con rol 'profesor' pueden acceder
- **Restricción de datos**: Profesores solo ven sus deportes/categorías asignados
- **Sesión limitada**: 8 horas de duración

## 📊 Endpoints API

### GET /api/profesor/mis-deportes
Obtiene deportes asignados al profesor

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "deportes": [
    { "deporte_id": 1, "nombre": "Fútbol", "icono": "sports_soccer" }
  ]
}
```

### GET /api/profesor/mis-clases?dia=LUNES
Obtiene clases del profesor para un día específico

**Response:**
```json
{
  "success": true,
  "clases": [
    {
      "horario_id": 1,
      "deporte": "Fútbol",
      "categoria": "2011-2012",
      "dia": "LUNES",
      "hora_inicio": "08:10:00",
      "hora_fin": "09:20:00",
      "total_alumnos": 15
    }
  ]
}
```

### GET /api/profesor/alumnos-clase/:horarioId
Obtiene lista de alumnos de una clase

**Response:**
```json
{
  "success": true,
  "horario": { ... },
  "alumnos": [
    {
      "alumno_id": 1,
      "dni": "12345678",
      "nombre_completo": "Juan Pérez García",
      "asistencia_registrada": true,
      "presente": true
    }
  ]
}
```

### POST /api/profesor/guardar-asistencia
Guarda la asistencia de una clase

**Body:**
```json
{
  "horario_id": 1,
  "fecha": "2026-01-26",
  "asistencias": [
    { "alumno_id": 1, "presente": true },
    { "alumno_id": 2, "presente": false }
  ]
}
```

### GET /api/profesor/reporte-asistencias
Genera reporte estadístico

**Query params:**
- `fecha_inicio`: YYYY-MM-DD
- `fecha_fin`: YYYY-MM-DD
- `deporte_id` (opcional)

**Response:**
```json
{
  "success": true,
  "estadisticas": {
    "total_presentes": 150,
    "total_ausentes": 20,
    "por_fecha": [...],
    "por_alumno": [...]
  }
}
```

## 🗄️ Base de Datos

### Tabla: profesor_deportes
Relación entre profesores y deportes/categorías asignados

```sql
- id (PK)
- admin_id (FK -> administradores)
- deporte_id (FK -> deportes)
- categoria (VARCHAR, NULL = todas)
- dia (ENUM, NULL = todos los días)
- created_at, updated_at
```

### Tabla: asistencias (ya existía)
Registro de asistencias de alumnos

```sql
- asistencia_id (PK)
- alumno_id (FK)
- horario_id (FK)
- fecha (DATE)
- presente (BOOLEAN)
- registrado_por (FK -> administradores)
- created_at
```

## 🎨 Características

✅ **Dashboard Intuitivo**: Ver clases del día de un vistazo  
✅ **Filtros Inteligentes**: Por deporte, categoría y horario  
✅ **Toma Rápida**: Marcar/desmarcar todos con un clic  
✅ **Reportes Visuales**: Gráficos con Chart.js  
✅ **Responsive**: Funciona en móviles y tablets  
✅ **Tiempo Real**: Se actualiza asistencia al instante  
✅ **Estadísticas**: Porcentajes de asistencia por alumno  

## 🛠️ Mantenimiento

### Cambiar contraseña de profesor
```sql
UPDATE administradores 
SET password_hash = '$2b$10$...' 
WHERE admin_id = 2;
```

### Ver asignaciones de un profesor
```sql
SELECT 
  a.nombre_completo,
  d.nombre as deporte,
  pd.categoria,
  pd.dia
FROM profesor_deportes pd
JOIN administradores a ON pd.admin_id = a.admin_id
JOIN deportes d ON pd.deporte_id = d.deporte_id
WHERE pd.admin_id = 2;
```

### Ver asistencias de hoy
```sql
SELECT 
  d.nombre as deporte,
  h.categoria,
  al.nombre_completo,
  a.presente,
  a.created_at
FROM asistencias a
JOIN horarios h ON a.horario_id = h.horario_id
JOIN deportes d ON h.deporte_id = d.deporte_id
JOIN alumnos al ON a.alumno_id = al.alumno_id
WHERE a.fecha = CURDATE()
ORDER BY d.nombre, h.categoria, al.apellido_paterno;
```

## 📞 Soporte

Para problemas o dudas:
1. Revisar este README
2. Verificar que la tabla `profesor_deportes` existe
3. Verificar que el usuario tiene rol 'profesor'
4. Revisar logs del servidor: `server-log.txt`

## 🎯 Próximas Mejoras (Opcional)

- [ ] Exportar reportes a Excel/PDF
- [ ] Notificaciones por email a padres
- [ ] Editar asistencias pasadas (con permisos)
- [ ] App móvil nativa
- [ ] QR Code para marcar asistencia
- [ ] Integración con sistema de pagos

---

**Desarrollado para JAGUARES - Sistema de Gestión Deportiva**  
Fecha: Enero 2026
