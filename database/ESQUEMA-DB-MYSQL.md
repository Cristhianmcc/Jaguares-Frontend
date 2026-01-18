# Esquema de Base de Datos MySQL - JAGUARES

## Tablas Principales

### 1. `deportes`
```sql
CREATE TABLE deportes (
    deporte_id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    icono VARCHAR(50),
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    matricula DECIMAL(10,2) DEFAULT 20.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. `horarios`
```sql
CREATE TABLE horarios (
    horario_id INT PRIMARY KEY AUTO_INCREMENT,
    deporte_id INT NOT NULL,
    dia ENUM('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO') NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    cupo_maximo INT NOT NULL DEFAULT 20,
    cupos_ocupados INT NOT NULL DEFAULT 0,
    estado ENUM('activo', 'inactivo', 'suspendido') DEFAULT 'activo',
    categoria VARCHAR(50),  -- Ej: "2011-2012", "Infantil (7-10 años)"
    nivel VARCHAR(50),      -- Ej: "NF" (No federado), "I" (Intermedio)
    año_min INT,           -- Año de nacimiento mínimo
    año_max INT,           -- Año de nacimiento máximo
    genero ENUM('Masculino', 'Femenino', 'Mixto') DEFAULT 'Mixto',
    precio DECIMAL(10,2) NOT NULL,
    plan VARCHAR(50),      -- Económico, Estándar, Premium
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (deporte_id) REFERENCES deportes(deporte_id) ON DELETE CASCADE,
    INDEX idx_deporte_dia (deporte_id, dia),
    INDEX idx_horario (hora_inicio, hora_fin),
    INDEX idx_estado (estado)
);
```

### 3. `alumnos`
```sql
CREATE TABLE alumnos (
    alumno_id INT PRIMARY KEY AUTO_INCREMENT,
    dni VARCHAR(20) NOT NULL UNIQUE,
    nombres VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    sexo ENUM('Masculino', 'Femenino') NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(150),
    direccion TEXT,
    seguro_tipo VARCHAR(100),
    condicion_medica TEXT,
    apoderado VARCHAR(200),
    telefono_apoderado VARCHAR(20),
    dni_frontal_url TEXT,    -- URL de Google Drive
    dni_reverso_url TEXT,    -- URL de Google Drive
    foto_carnet_url TEXT,    -- URL de Google Drive
    estado ENUM('activo', 'inactivo', 'suspendido') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_dni (dni),
    INDEX idx_nombres (nombres, apellido_paterno)
);
```

### 4. `inscripciones`
```sql
CREATE TABLE inscripciones (
    inscripcion_id INT PRIMARY KEY AUTO_INCREMENT,
    alumno_id INT NOT NULL,
    deporte_id INT NOT NULL,
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('pendiente', 'activa', 'cancelada', 'suspendida') DEFAULT 'pendiente',
    plan VARCHAR(50),           -- Económico, Estándar, Premium
    precio_mensual DECIMAL(10,2) NOT NULL,
    matricula_pagada BOOLEAN DEFAULT FALSE,
    fecha_inicio DATE,
    fecha_fin DATE,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (alumno_id) REFERENCES alumnos(alumno_id) ON DELETE CASCADE,
    FOREIGN KEY (deporte_id) REFERENCES deportes(deporte_id) ON DELETE CASCADE,
    INDEX idx_alumno (alumno_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha_inscripcion (fecha_inscripcion)
);
```

### 5. `inscripcion_horarios` (Relación muchos a muchos)
```sql
CREATE TABLE inscripcion_horarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    inscripcion_id INT NOT NULL,
    horario_id INT NOT NULL,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    FOREIGN KEY (inscripcion_id) REFERENCES inscripciones(inscripcion_id) ON DELETE CASCADE,
    FOREIGN KEY (horario_id) REFERENCES horarios(horario_id) ON DELETE CASCADE,
    UNIQUE KEY unique_inscripcion_horario (inscripcion_id, horario_id),
    INDEX idx_inscripcion (inscripcion_id),
    INDEX idx_horario (horario_id)
);
```

### 6. `pagos`
```sql
CREATE TABLE pagos (
    pago_id INT PRIMARY KEY AUTO_INCREMENT,
    inscripcion_id INT NOT NULL,
    tipo_pago ENUM('matricula', 'mensualidad', 'clase_extra') NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metodo_pago VARCHAR(50),    -- Yape, Plin, Transferencia, Efectivo
    banco VARCHAR(50),
    numero_operacion VARCHAR(100),
    comprobante_url TEXT,       -- URL de Google Drive
    estado ENUM('pendiente', 'verificado', 'rechazado') DEFAULT 'pendiente',
    verificado_por INT,         -- admin_id
    fecha_verificacion TIMESTAMP NULL,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (inscripcion_id) REFERENCES inscripciones(inscripcion_id) ON DELETE CASCADE,
    INDEX idx_inscripcion (inscripcion_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha_pago (fecha_pago)
);
```

### 7. `asistencias`
```sql
CREATE TABLE asistencias (
    asistencia_id INT PRIMARY KEY AUTO_INCREMENT,
    alumno_id INT NOT NULL,
    horario_id INT NOT NULL,
    fecha DATE NOT NULL,
    presente BOOLEAN DEFAULT FALSE,
    observaciones TEXT,
    registrado_por INT,         -- admin_id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (alumno_id) REFERENCES alumnos(alumno_id) ON DELETE CASCADE,
    FOREIGN KEY (horario_id) REFERENCES horarios(horario_id) ON DELETE CASCADE,
    UNIQUE KEY unique_asistencia (alumno_id, horario_id, fecha),
    INDEX idx_alumno_fecha (alumno_id, fecha),
    INDEX idx_horario_fecha (horario_id, fecha)
);
```

### 8. `administradores`
```sql
CREATE TABLE administradores (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(200) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    rol ENUM('super_admin', 'admin', 'profesor') DEFAULT 'admin',
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    ultimo_acceso TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_usuario (usuario),
    INDEX idx_email (email)
);
```

### 9. `logs_actividad`
```sql
CREATE TABLE logs_actividad (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT,
    accion VARCHAR(100) NOT NULL,
    tabla_afectada VARCHAR(50),
    registro_id INT,
    descripcion TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES administradores(admin_id) ON DELETE SET NULL,
    INDEX idx_admin (admin_id),
    INDEX idx_fecha (created_at)
);
```

## Triggers para automatización

### Actualizar cupos al inscribir/cancelar
```sql
DELIMITER //

CREATE TRIGGER after_inscripcion_horario_insert
AFTER INSERT ON inscripcion_horarios
FOR EACH ROW
BEGIN
    UPDATE horarios 
    SET cupos_ocupados = cupos_ocupados + 1 
    WHERE horario_id = NEW.horario_id;
END//

CREATE TRIGGER after_inscripcion_horario_delete
AFTER DELETE ON inscripcion_horarios
FOR EACH ROW
BEGIN
    UPDATE horarios 
    SET cupos_ocupados = cupos_ocupados - 1 
    WHERE horario_id = OLD.horario_id;
END//

DELIMITER ;
```

## Vistas útiles

### Vista de horarios con información completa
```sql
CREATE VIEW vista_horarios_completos AS
SELECT 
    h.horario_id,
    d.nombre as deporte,
    h.dia,
    h.hora_inicio,
    h.hora_fin,
    h.cupo_maximo,
    h.cupos_ocupados,
    (h.cupo_maximo - h.cupos_ocupados) as cupos_disponibles,
    h.estado,
    h.categoria,
    h.nivel,
    h.genero,
    h.precio,
    h.plan
FROM horarios h
INNER JOIN deportes d ON h.deporte_id = d.deporte_id;
```

### Vista de inscripciones activas
```sql
CREATE VIEW vista_inscripciones_activas AS
SELECT 
    i.inscripcion_id,
    a.alumno_id,
    a.dni,
    CONCAT(a.nombres, ' ', a.apellido_paterno, ' ', a.apellido_materno) as nombre_completo,
    d.nombre as deporte,
    i.plan,
    i.precio_mensual,
    i.estado,
    i.fecha_inscripcion,
    COUNT(ih.horario_id) as cantidad_horarios
FROM inscripciones i
INNER JOIN alumnos a ON i.alumno_id = a.alumno_id
INNER JOIN deportes d ON i.deporte_id = d.deporte_id
LEFT JOIN inscripcion_horarios ih ON i.inscripcion_id = ih.inscripcion_id
WHERE i.estado = 'activa'
GROUP BY i.inscripcion_id;
```

## Índices adicionales para optimización

```sql
-- Para búsquedas rápidas de horarios disponibles
CREATE INDEX idx_horarios_disponibles ON horarios(deporte_id, estado, dia) 
WHERE cupos_ocupados < cupo_maximo;

-- Para reportes de pagos
CREATE INDEX idx_pagos_mes ON pagos(YEAR(fecha_pago), MONTH(fecha_pago));

-- Para consultas de asistencia
CREATE INDEX idx_asistencias_mes ON asistencias(YEAR(fecha), MONTH(fecha));
```

## Datos iniciales (Seeds)

### Planes
```sql
-- Los planes se manejan en constantes de la aplicación, pero aquí está la referencia
/*
Plan Económico:
- Base: 60 soles (2 clases/semana = 8 clases/mes)
- +1 día: +20 soles (3 clases/semana = 12 clases/mes) = 80 soles total

Plan Estándar:
- Base: 80 soles (2 clases/semana = 8 clases/mes)
- +1 día: +40 soles (3 clases/semana = 12 clases/mes) = 120 soles total

Plan Premium:
- Base: 100 soles (2 clases/semana = 8 clases/mes)
- +1 día: +50 soles (3 clases/semana = 12 clases/mes) = 150 soles total
- +2 días: +100 soles (4 clases/semana = 16 clases/mes) = 200 soles total
*/
```

### Deportes iniciales
```sql
INSERT INTO deportes (nombre, icono, matricula) VALUES
('Fútbol', 'sports_soccer', 20.00),
('Fútbol Femenino', 'sports_soccer', 20.00),
('Vóley', 'sports_volleyball', 20.00),
('Básquet', 'sports_basketball', 20.00),
('MAMAS FIT', 'fitness_center', 20.00);
```

### Admin inicial
```sql
-- Password: Admin123! (usar bcrypt en producción)
INSERT INTO administradores (usuario, password_hash, nombre_completo, email, rol) VALUES
('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador Principal', 'admin@jaguares.com', 'super_admin');
```

## Consultas útiles para el backend

### Obtener horarios disponibles para un alumno (por edad)
```sql
SELECT h.*, d.nombre as deporte, d.icono
FROM horarios h
INNER JOIN deportes d ON h.deporte_id = d.deporte_id
WHERE h.estado = 'activo'
  AND h.cupos_ocupados < h.cupo_maximo
  AND (
    (h.año_min IS NULL AND h.año_max IS NULL) -- Sin restricción de edad
    OR (YEAR(?) BETWEEN h.año_min AND h.año_max) -- ? = fecha_nacimiento del alumno
  )
ORDER BY d.nombre, h.dia, h.hora_inicio;
```

### Verificar traslape de horarios
```sql
SELECT COUNT(*) as conflictos
FROM inscripcion_horarios ih1
INNER JOIN horarios h1 ON ih1.horario_id = h1.horario_id
INNER JOIN inscripcion_horarios ih2 ON ih1.inscripcion_id = ih2.inscripcion_id
INNER JOIN horarios h2 ON ih2.horario_id = h2.horario_id
WHERE ih1.horario_id != ih2.horario_id
  AND h1.dia = h2.dia
  AND (
    (h1.hora_inicio < h2.hora_fin AND h1.hora_fin > h2.hora_inicio)
  );
```

## Notas de implementación

1. **Google Drive Integration**: Las imágenes (DNI, fotos, comprobantes) se guardan en Google Drive y solo almacenamos las URLs en la BD
2. **Triggers**: Mantienen sincronizados los cupos automáticamente
3. **Índices**: Optimizados para las consultas más frecuentes
4. **Logs**: Rastreo completo de actividad para auditoría
5. **Vistas**: Simplifican consultas complejas frecuentes

## Migración desde Google Sheets

Cuando estés listo para migrar, necesitarás un script que:
1. Lea el CSV/Google Sheets actual
2. Inserte los deportes
3. Inserte los horarios
4. Mantenga sincronización bidireccional durante transición
