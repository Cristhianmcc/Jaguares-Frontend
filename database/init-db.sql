-- Script de inicialización de la base de datos JAGUARES
-- Se ejecuta automáticamente al levantar el contenedor Docker

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ========================================
-- CREAR TABLAS
-- ========================================

-- Tabla de deportes
CREATE TABLE IF NOT EXISTS deportes (
    deporte_id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    icono VARCHAR(50),
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    matricula DECIMAL(10,2) DEFAULT 20.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de horarios
CREATE TABLE IF NOT EXISTS horarios (
    horario_id INT PRIMARY KEY AUTO_INCREMENT,
    deporte_id INT NOT NULL,
    dia ENUM('LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO') NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    cupo_maximo INT NOT NULL DEFAULT 20,
    cupos_ocupados INT NOT NULL DEFAULT 0,
    estado ENUM('activo', 'inactivo', 'suspendido') DEFAULT 'activo',
    categoria VARCHAR(50),
    nivel VARCHAR(50),
    año_min INT,
    año_max INT,
    genero ENUM('Masculino', 'Femenino', 'Mixto') DEFAULT 'Mixto',
    precio DECIMAL(10,2) NOT NULL,
    plan VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (deporte_id) REFERENCES deportes(deporte_id) ON DELETE CASCADE,
    INDEX idx_deporte_dia (deporte_id, dia),
    INDEX idx_horario (hora_inicio, hora_fin),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de alumnos
CREATE TABLE IF NOT EXISTS alumnos (
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
    dni_frontal_url TEXT,
    dni_reverso_url TEXT,
    foto_carnet_url TEXT,
    estado ENUM('activo', 'inactivo', 'suspendido') DEFAULT 'activo',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_dni (dni),
    INDEX idx_nombres (nombres, apellido_paterno)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de inscripciones
CREATE TABLE IF NOT EXISTS inscripciones (
    inscripcion_id INT PRIMARY KEY AUTO_INCREMENT,
    alumno_id INT NOT NULL,
    deporte_id INT NOT NULL,
    fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('pendiente', 'activa', 'cancelada', 'suspendida') DEFAULT 'pendiente',
    plan VARCHAR(50),
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de relación inscripción-horarios
CREATE TABLE IF NOT EXISTS inscripcion_horarios (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS pagos (
    pago_id INT PRIMARY KEY AUTO_INCREMENT,
    inscripcion_id INT NOT NULL,
    tipo_pago ENUM('matricula', 'mensualidad', 'clase_extra') NOT NULL,
    monto DECIMAL(10,2) NOT NULL,
    fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metodo_pago VARCHAR(50),
    banco VARCHAR(50),
    numero_operacion VARCHAR(100),
    comprobante_url TEXT,
    estado ENUM('pendiente', 'verificado', 'rechazado') DEFAULT 'pendiente',
    verificado_por INT,
    fecha_verificacion TIMESTAMP NULL,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (inscripcion_id) REFERENCES inscripciones(inscripcion_id) ON DELETE CASCADE,
    INDEX idx_inscripcion (inscripcion_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha_pago (fecha_pago)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de asistencias
CREATE TABLE IF NOT EXISTS asistencias (
    asistencia_id INT PRIMARY KEY AUTO_INCREMENT,
    alumno_id INT NOT NULL,
    horario_id INT NOT NULL,
    fecha DATE NOT NULL,
    presente BOOLEAN DEFAULT FALSE,
    observaciones TEXT,
    registrado_por INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (alumno_id) REFERENCES alumnos(alumno_id) ON DELETE CASCADE,
    FOREIGN KEY (horario_id) REFERENCES horarios(horario_id) ON DELETE CASCADE,
    UNIQUE KEY unique_asistencia (alumno_id, horario_id, fecha),
    INDEX idx_alumno_fecha (alumno_id, fecha),
    INDEX idx_horario_fecha (horario_id, fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de administradores
CREATE TABLE IF NOT EXISTS administradores (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de logs de actividad
CREATE TABLE IF NOT EXISTS logs_actividad (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- TRIGGERS
-- ========================================

DELIMITER //

-- Trigger para actualizar cupos al insertar
CREATE TRIGGER after_inscripcion_horario_insert
AFTER INSERT ON inscripcion_horarios
FOR EACH ROW
BEGIN
    UPDATE horarios 
    SET cupos_ocupados = cupos_ocupados + 1 
    WHERE horario_id = NEW.horario_id;
END//

-- Trigger para actualizar cupos al eliminar
CREATE TRIGGER after_inscripcion_horario_delete
AFTER DELETE ON inscripcion_horarios
FOR EACH ROW
BEGIN
    UPDATE horarios 
    SET cupos_ocupados = cupos_ocupados - 1 
    WHERE horario_id = OLD.horario_id;
END//

DELIMITER ;

-- ========================================
-- VISTAS
-- ========================================

-- Vista de horarios completos
CREATE OR REPLACE VIEW vista_horarios_completos AS
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
    h.plan,
    h.año_min,
    h.año_max
FROM horarios h
INNER JOIN deportes d ON h.deporte_id = d.deporte_id;

-- Vista de inscripciones activas
CREATE OR REPLACE VIEW vista_inscripciones_activas AS
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
GROUP BY i.inscripcion_id, a.alumno_id, a.dni, a.nombres, a.apellido_paterno, 
         a.apellido_materno, d.nombre, i.plan, i.precio_mensual, i.estado, i.fecha_inscripcion;

-- ========================================
-- DATOS INICIALES
-- ========================================

-- Insertar deportes
INSERT INTO deportes (nombre, icono, matricula) VALUES
('Fútbol', 'sports_soccer', 20.00),
('Fútbol Femenino', 'sports_soccer', 20.00),
('Vóley', 'sports_volleyball', 20.00),
('Básquet', 'sports_basketball', 20.00),
('MAMAS FIT', 'fitness_center', 20.00)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Insertar admin de prueba (password: Admin123!)
-- Hash generado con bcrypt
INSERT INTO administradores (usuario, password_hash, nombre_completo, email, rol) VALUES
('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador Principal', 'admin@jaguares.com', 'super_admin')
ON DUPLICATE KEY UPDATE usuario = VALUES(usuario);

-- Insertar algunos horarios de ejemplo (basados en tu CSV)
INSERT INTO horarios (deporte_id, dia, hora_inicio, hora_fin, cupo_maximo, cupos_ocupados, estado, categoria, nivel, año_min, año_max, genero, precio, plan) VALUES
-- Fútbol Lunes
(1, 'LUNES', '08:10:00', '09:20:00', 20, 0, 'activo', '2011-2012', NULL, 2011, 2012, 'Mixto', 60, 'Económico'),
(1, 'LUNES', '08:10:00', '09:20:00', 20, 2, 'activo', '2014-2013', NULL, 2013, 2014, 'Mixto', 60, 'Económico'),
(1, 'LUNES', '10:30:00', '11:40:00', 20, 0, 'activo', '2016-2015', NULL, 2015, 2016, 'Mixto', 60, 'Económico'),
(1, 'LUNES', '10:30:00', '11:40:00', 20, 0, 'activo', '2009-2010', NULL, 2009, 2010, 'Mixto', 60, 'Económico'),

-- Fútbol Miércoles
(1, 'MIERCOLES', '08:10:00', '09:20:00', 20, 0, 'activo', '2011-2012', NULL, 2011, 2012, 'Mixto', 60, 'Económico'),
(1, 'MIERCOLES', '08:10:00', '09:20:00', 20, 2, 'activo', '2014-2013', NULL, 2013, 2014, 'Mixto', 60, 'Económico'),
(1, 'MIERCOLES', '10:30:00', '11:40:00', 20, 0, 'activo', '2016-2015', NULL, 2015, 2016, 'Mixto', 60, 'Económico'),

-- Fútbol Viernes
(1, 'VIERNES', '08:10:00', '09:20:00', 20, 0, 'activo', '2011-2012', NULL, 2011, 2012, 'Mixto', 60, 'Económico'),
(1, 'VIERNES', '10:30:00', '11:40:00', 20, 0, 'activo', '2016-2015', NULL, 2015, 2016, 'Mixto', 60, 'Económico'),

-- Fútbol Femenino
(2, 'LUNES', '09:20:00', '10:30:00', 20, 2, 'activo', '2010-2015', NULL, 2010, 2015, 'Femenino', 60, 'Económico'),
(2, 'MIERCOLES', '09:20:00', '10:30:00', 20, 2, 'activo', '2010-2015', NULL, 2010, 2015, 'Femenino', 60, 'Económico'),
(2, 'VIERNES', '09:20:00', '10:30:00', 20, 0, 'activo', '2010-2015', NULL, 2010, 2015, 'Femenino', 60, 'Económico'),

-- Vóley
(3, 'LUNES', '08:30:00', '09:40:00', 20, 0, 'activo', '2009-2008', NULL, 2008, 2009, 'Mixto', 60, 'Económico'),
(3, 'LUNES', '09:40:00', '10:50:00', 20, 0, 'activo', '2011', NULL, 2011, 2011, 'Mixto', 60, 'Económico'),
(3, 'MIERCOLES', '08:30:00', '09:40:00', 20, 0, 'activo', '2009-2008', NULL, 2008, 2009, 'Mixto', 60, 'Económico'),
(3, 'MIERCOLES', '09:40:00', '10:50:00', 20, 0, 'activo', '2011', NULL, 2011, 2011, 'Mixto', 60, 'Económico'),

-- MAMAS FIT
(5, 'LUNES', '06:30:00', '07:40:00', 20, 0, 'activo', NULL, NULL, NULL, NULL, 'Femenino', 60, 'Económico'),
(5, 'MIERCOLES', '06:30:00', '07:45:00', 20, 0, 'activo', NULL, NULL, NULL, NULL, 'Femenino', 60, 'Económico'),
(5, 'VIERNES', '06:30:00', '07:45:00', 20, 0, 'activo', NULL, NULL, NULL, NULL, 'Femenino', 60, 'Económico')
ON DUPLICATE KEY UPDATE horario_id = VALUES(horario_id);

SET FOREIGN_KEY_CHECKS = 1;

-- Mensaje de éxito
SELECT 'Base de datos JAGUARES inicializada correctamente' AS mensaje;
