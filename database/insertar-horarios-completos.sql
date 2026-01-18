-- Script para insertar todos los horarios en la base de datos
-- Ejecutar este script después de init-db.sql

USE jaguares_db;

-- Deshabilitar verificación de foreign keys temporalmente
SET FOREIGN_KEY_CHECKS = 0;

-- Primero, limpiar la tabla de horarios existente
TRUNCATE TABLE inscripcion_horarios;
TRUNCATE TABLE horarios;

-- Habilitar verificación de foreign keys nuevamente
SET FOREIGN_KEY_CHECKS = 1;

-- Insertar deportes (si no existen)
INSERT INTO deportes (nombre, icono, matricula) VALUES
('Fútbol', 'sports_soccer', 20.00),
('Fútbol Femenino', 'sports_soccer', 20.00),
('Vóley', 'sports_volleyball', 20.00),
('Básquet', 'sports_basketball', 20.00),
('MAMAS FIT', 'fitness_center', 20.00),
('ASODE', 'sports', 20.00),
('Entrenamiento Funcional Mixto', 'fitness_center', 20.00),
('GYM JUVENIL', 'fitness_center', 20.00)
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

-- Insertar horarios completos
-- Formato: (deporte_id, dia, hora_inicio, hora_fin, cupo_maximo, cupos_ocupados, estado, categoria, nivel, año_min, año_max, genero, precio, plan)

-- MAMAS FIT
INSERT INTO horarios (deporte_id, dia, hora_inicio, hora_fin, cupo_maximo, cupos_ocupados, estado, categoria, nivel, año_min, año_max, genero, precio, plan) VALUES
((SELECT deporte_id FROM deportes WHERE nombre = 'MAMAS FIT'), 'LUNES', '06:30:00', '07:40:00', 20, 3, 'activo', 'MAMAS FIT', NULL, 1900, 2008, 'Femenino', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'MAMAS FIT'), 'LUNES', '07:45:00', '09:00:00', 20, 4, 'activo', 'MAMAS FIT', NULL, 1900, 2008, 'Femenino', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'MAMAS FIT'), 'MIERCOLES', '06:30:00', '07:40:00', 20, 2, 'activo', 'MAMAS FIT', NULL, 1900, 2008, 'Femenino', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'MAMAS FIT'), 'MIERCOLES', '07:45:00', '09:00:00', 20, 1, 'activo', 'MAMAS FIT', NULL, 1900, 2008, 'Femenino', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'MAMAS FIT'), 'VIERNES', '06:30:00', '07:40:00', 20, 0, 'activo', 'MAMAS FIT', NULL, 1900, 2008, 'Femenino', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'MAMAS FIT'), 'VIERNES', '07:45:00', '09:00:00', 20, 1, 'activo', 'MAMAS FIT', NULL, 1900, 2008, 'Femenino', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'MAMAS FIT'), 'LUNES', '16:00:00', '17:00:00', 20, 0, 'activo', 'MAMAS FIT', NULL, 1900, 2008, 'Femenino', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'MAMAS FIT'), 'LUNES', '17:00:00', '18:00:00', 20, 0, 'activo', 'MAMAS FIT', NULL, 1900, 2008, 'Femenino', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'MAMAS FIT'), 'MIERCOLES', '16:00:00', '17:00:00', 20, 1, 'activo', 'MAMAS FIT', NULL, 1900, 2008, 'Femenino', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'MAMAS FIT'), 'MIERCOLES', '17:00:00', '18:00:00', 20, 1, 'activo', 'MAMAS FIT', NULL, 1900, 2008, 'Femenino', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'MAMAS FIT'), 'VIERNES', '16:00:00', '17:00:00', 20, 0, 'activo', 'MAMAS FIT', NULL, 1900, 2008, 'Femenino', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'MAMAS FIT'), 'VIERNES', '17:00:00', '18:00:00', 20, 1, 'activo', 'MAMAS FIT', NULL, 1900, 2008, 'Femenino', 60, 'Económico');

-- Fútbol (Plan Económico - Mañanas)
INSERT INTO horarios (deporte_id, dia, hora_inicio, hora_fin, cupo_maximo, cupos_ocupados, estado, categoria, nivel, año_min, año_max, genero, precio, plan) VALUES
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'LUNES', '08:10:00', '09:20:00', 20, 0, 'activo', '2011-2012', NULL, 2011, 2012, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'LUNES', '08:10:00', '09:20:00', 20, 2, 'activo', '2014-2013', NULL, 2013, 2014, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'LUNES', '10:30:00', '11:40:00', 20, 0, 'activo', '2016-2015', NULL, 2015, 2016, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'LUNES', '10:30:00', '11:40:00', 20, 1, 'activo', '2009-2010', NULL, 2009, 2010, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'LUNES', '11:40:00', '12:50:00', 20, 0, 'activo', '2018-2017', NULL, 2017, 2018, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'MIERCOLES', '08:10:00', '09:20:00', 20, 0, 'activo', '2011-2012', NULL, 2011, 2012, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'MIERCOLES', '08:10:00', '09:20:00', 20, 2, 'activo', '2014-2013', NULL, 2013, 2014, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'MIERCOLES', '10:30:00', '11:40:00', 20, 0, 'activo', '2016-2015', NULL, 2015, 2016, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'MIERCOLES', '10:30:00', '11:40:00', 20, 1, 'activo', '2009-2010', NULL, 2009, 2010, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'MIERCOLES', '11:40:00', '12:50:00', 20, 0, 'activo', '2018-2017', NULL, 2017, 2018, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'VIERNES', '08:10:00', '09:20:00', 20, 0, 'activo', '2011-2012', NULL, 2011, 2012, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'VIERNES', '08:10:00', '09:20:00', 20, 0, 'activo', '2014-2013', NULL, 2013, 2014, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'VIERNES', '10:30:00', '11:40:00', 20, 0, 'activo', '2016-2015', NULL, 2015, 2016, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'VIERNES', '10:30:00', '11:40:00', 20, 0, 'activo', '2009-2010', NULL, 2009, 2010, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'VIERNES', '11:40:00', '12:50:00', 20, 0, 'activo', '2018-2017', NULL, 2017, 2018, 'Mixto', 60, 'Económico');

-- Fútbol Femenino (Plan Económico)
INSERT INTO horarios (deporte_id, dia, hora_inicio, hora_fin, cupo_maximo, cupos_ocupados, estado, categoria, nivel, año_min, año_max, genero, precio, plan) VALUES
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol Femenino'), 'LUNES', '09:20:00', '10:30:00', 20, 3, 'activo', '2010-2015', NULL, 2010, 2015, 'Femenino', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol Femenino'), 'MIERCOLES', '09:20:00', '10:30:00', 20, 3, 'activo', '2010-2015', NULL, 2010, 2015, 'Femenino', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol Femenino'), 'VIERNES', '09:20:00', '10:30:00', 20, 0, 'activo', '2010-2015', NULL, 2010, 2015, 'Femenino', 60, 'Económico');

-- Vóley (Plan Económico)
INSERT INTO horarios (deporte_id, dia, hora_inicio, hora_fin, cupo_maximo, cupos_ocupados, estado, categoria, nivel, año_min, año_max, genero, precio, plan) VALUES
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'LUNES', '08:30:00', '09:40:00', 20, 2, 'activo', '2009-2008', NULL, 2008, 2009, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'LUNES', '08:30:00', '09:40:00', 20, 0, 'activo', '2010', NULL, 2010, 2010, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'LUNES', '09:40:00', '10:50:00', 20, 0, 'activo', '2011', NULL, 2011, 2011, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'LUNES', '09:40:00', '10:50:00', 20, 0, 'activo', '2012-2013', NULL, 2012, 2013, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'LUNES', '10:50:00', '12:00:00', 20, 0, 'activo', '2014', NULL, 2014, 2014, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'LUNES', '10:50:00', '12:00:00', 20, 0, 'activo', '2015-2016', NULL, 2015, 2016, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'MIERCOLES', '08:30:00', '09:40:00', 20, 0, 'activo', '2009-2008', NULL, 2008, 2009, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'MIERCOLES', '08:30:00', '09:40:00', 20, 0, 'activo', '2010', NULL, 2010, 2010, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'MIERCOLES', '09:40:00', '10:50:00', 20, 0, 'activo', '2011', NULL, 2011, 2011, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'MIERCOLES', '09:40:00', '10:50:00', 20, 0, 'activo', '2012-2013', NULL, 2012, 2013, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'MIERCOLES', '10:50:00', '12:00:00', 20, 0, 'activo', '2014', NULL, 2014, 2014, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'MIERCOLES', '10:50:00', '12:00:00', 20, 0, 'activo', '2015-2016', NULL, 2015, 2016, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'VIERNES', '08:30:00', '09:40:00', 20, 0, 'activo', '2009-2008', NULL, 2008, 2009, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'VIERNES', '08:30:00', '09:40:00', 20, 0, 'activo', '2010', NULL, 2010, 2010, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'VIERNES', '09:40:00', '10:50:00', 20, 0, 'activo', '2011', NULL, 2011, 2011, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'VIERNES', '09:40:00', '10:50:00', 20, 2, 'activo', '2012-2013', NULL, 2012, 2013, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'VIERNES', '10:50:00', '12:00:00', 20, 0, 'activo', '2014', NULL, 2014, 2014, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'VIERNES', '10:50:00', '12:00:00', 20, 0, 'activo', '2015-2016', NULL, 2015, 2016, 'Mixto', 60, 'Económico');

-- Básquet (Plan Económico)
INSERT INTO horarios (deporte_id, dia, hora_inicio, hora_fin, cupo_maximo, cupos_ocupados, estado, categoria, nivel, año_min, año_max, genero, precio, plan) VALUES
((SELECT deporte_id FROM deportes WHERE nombre = 'Básquet'), 'MARTES', '08:30:00', '09:40:00', 20, 0, 'activo', '2009-2008', NULL, 2008, 2009, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Básquet'), 'MARTES', '08:30:00', '09:40:00', 20, 1, 'activo', '2010', NULL, 2010, 2010, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Básquet'), 'MARTES', '09:40:00', '10:50:00', 20, 0, 'activo', '2011', NULL, 2011, 2011, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Básquet'), 'MARTES', '09:40:00', '10:50:00', 20, 2, 'activo', '2012-2013', NULL, 2012, 2013, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Básquet'), 'MARTES', '10:50:00', '12:00:00', 20, 0, 'activo', '2014', NULL, 2014, 2014, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Básquet'), 'MARTES', '10:50:00', '12:00:00', 20, 0, 'activo', '2015-2016', NULL, 2015, 2016, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Básquet'), 'JUEVES', '08:30:00', '09:40:00', 20, 0, 'activo', '2009-2008', NULL, 2008, 2009, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Básquet'), 'JUEVES', '08:30:00', '09:40:00', 20, 1, 'activo', '2010', NULL, 2010, 2010, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Básquet'), 'JUEVES', '09:40:00', '10:50:00', 20, 0, 'activo', '2011', NULL, 2011, 2011, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Básquet'), 'JUEVES', '09:40:00', '10:50:00', 20, 2, 'activo', '2012-2013', NULL, 2012, 2013, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Básquet'), 'JUEVES', '10:50:00', '12:00:00', 20, 0, 'activo', '2014', NULL, 2014, 2014, 'Mixto', 60, 'Económico'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Básquet'), 'JUEVES', '10:50:00', '12:00:00', 20, 0, 'activo', '2015-2016', NULL, 2015, 2016, 'Mixto', 60, 'Económico');

-- Fútbol (Plan Estándar - Tardes)
INSERT INTO horarios (deporte_id, dia, hora_inicio, hora_fin, cupo_maximo, cupos_ocupados, estado, categoria, nivel, año_min, año_max, genero, precio, plan) VALUES
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'LUNES', '15:30:00', '16:55:00', 20, 0, 'activo', '2020-2021', 'NF', 2019, 2021, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'LUNES', '15:30:00', '16:55:00', 20, 0, 'activo', '2019-2020', 'I', 2019, 2020, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'LUNES', '17:00:00', '18:25:00', 20, 0, 'activo', '2014', 'I', 2014, 2014, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'LUNES', '17:00:00', '18:25:00', 20, 0, 'activo', '2015', 'NF', 2015, 2015, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'MIERCOLES', '15:30:00', '16:55:00', 20, 0, 'activo', '2020-2021', 'NF', 2019, 2021, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'MIERCOLES', '15:30:00', '16:55:00', 20, 0, 'activo', '2019', 'I', 2019, 2019, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'MIERCOLES', '17:00:00', '18:25:00', 20, 0, 'activo', '2014', 'I', 2014, 2014, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'MIERCOLES', '17:00:00', '18:25:00', 20, 0, 'activo', '2015', 'NF', 2015, 2015, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'VIERNES', '17:00:00', '18:25:00', 20, 0, 'activo', '2014', 'I', 2014, 2014, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'VIERNES', '17:00:00', '18:25:00', 20, 0, 'activo', '2015', 'NF', 2015, 2015, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'MARTES', '15:30:00', '16:50:00', 20, 0, 'activo', '2018-2019', 'NF', 2018, 2019, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'MARTES', '15:30:00', '16:50:00', 20, 0, 'activo', '2020-2021', 'NF', 2020, 2021, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'MARTES', '15:30:00', '16:50:00', 20, 1, 'activo', '2008-2009-2010-2011', 'NF', 2008, 2011, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'MARTES', '17:00:00', '18:20:00', 20, 0, 'activo', '2017-2016', 'NF', 2016, 2017, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'MARTES', '17:00:00', '18:20:00', 20, 2, 'activo', '2014-2013-2012', 'NF', 2012, 2014, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'JUEVES', '15:30:00', '16:50:00', 20, 0, 'activo', '2018-2019', 'NF', 2018, 2019, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'JUEVES', '15:30:00', '16:50:00', 20, 0, 'activo', '2020-2021', 'NF', 2020, 2021, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'JUEVES', '15:30:00', '16:50:00', 20, 1, 'activo', '2008-2009-2010-2011', 'NF', 2008, 2011, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'JUEVES', '17:00:00', '18:20:00', 20, 0, 'activo', '2017-2016', 'NF', 2016, 2017, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'JUEVES', '17:00:00', '18:20:00', 20, 2, 'activo', '2014-2013-2012', 'NF', 2012, 2014, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'SABADO', '08:30:00', '09:50:00', 20, 1, 'activo', '2010-2011', 'NF', 2010, 2011, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'SABADO', '08:30:00', '09:50:00', 20, 2, 'activo', '2012-2013', 'NF', 2012, 2013, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'SABADO', '08:30:00', '09:50:00', 20, 0, 'activo', '2014', 'NF', 2014, 2014, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'SABADO', '10:00:00', '11:20:00', 20, 0, 'activo', '2017-2016', 'NF', 2016, 2017, 'Mixto', 120, 'Estándar');

-- Fútbol (Plan Premium)
INSERT INTO horarios (deporte_id, dia, hora_inicio, hora_fin, cupo_maximo, cupos_ocupados, estado, categoria, nivel, año_min, año_max, genero, precio, plan) VALUES
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'LUNES', '17:00:00', '18:25:00', 20, 0, 'activo', '2017', 'PC', 2017, 2017, 'Mixto', 200, 'Premium'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'LUNES', '17:00:00', '18:25:00', 20, 0, 'activo', '2016', 'PC', 2016, 2016, 'Mixto', 200, 'Premium'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'LUNES', '18:30:00', '19:55:00', 20, 0, 'activo', '2014', 'PC', 2014, 2014, 'Mixto', 200, 'Premium'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'LUNES', '18:30:00', '19:55:00', 20, 0, 'activo', '2015', 'PC', 2015, 2015, 'Mixto', 200, 'Premium'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'LUNES', '18:30:00', '19:55:00', 20, 0, 'activo', '2013-2014-2015', 'PC', 2013, 2015, 'Mixto', 200, 'Premium'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'MIERCOLES', '17:00:00', '18:25:00', 20, 0, 'activo', '2017', 'PC', 2017, 2017, 'Mixto', 200, 'Premium'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'MIERCOLES', '17:00:00', '18:25:00', 20, 0, 'activo', '2016', 'PC', 2016, 2016, 'Mixto', 200, 'Premium'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'MIERCOLES', '18:30:00', '19:55:00', 20, 0, 'activo', '2014', 'PC', 2014, 2014, 'Mixto', 200, 'Premium'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'MIERCOLES', '18:30:00', '19:55:00', 20, 0, 'activo', '2015', 'PC', 2015, 2015, 'Mixto', 200, 'Premium'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'MIERCOLES', '18:30:00', '19:55:00', 20, 0, 'activo', '2013-2014-2015', 'PREMIUM', 2013, 2015, 'Mixto', 200, 'Premium'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'VIERNES', '17:00:00', '18:25:00', 20, 0, 'activo', '2017', 'PC', 2017, 2017, 'Mixto', 200, 'Premium'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'VIERNES', '17:00:00', '18:25:00', 20, 0, 'activo', '2016', 'PC', 2016, 2016, 'Mixto', 200, 'Premium'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'VIERNES', '18:30:00', '19:55:00', 20, 0, 'activo', '2014', 'PC', 2014, 2014, 'Mixto', 200, 'Premium'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'VIERNES', '18:30:00', '19:55:00', 20, 0, 'activo', '2015', 'PC', 2015, 2015, 'Mixto', 200, 'Premium'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'VIERNES', '18:30:00', '19:55:00', 20, 2, 'activo', '2013-2014-2015', 'PREMIUM', 2013, 2015, 'Mixto', 200, 'Premium'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'MARTES', '18:30:00', '19:50:00', 20, 0, 'activo', '2009-2010-2011-2012', 'PC', 2009, 2012, 'Mixto', 200, 'Premium'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Fútbol'), 'JUEVES', '18:30:00', '19:50:00', 20, 0, 'activo', '2009-2010-2011-2012', 'PREMIUM', 2009, 2012, 'Mixto', 200, 'Premium');

-- ASODE (Plan Premium)
INSERT INTO horarios (deporte_id, dia, hora_inicio, hora_fin, cupo_maximo, cupos_ocupados, estado, categoria, nivel, año_min, año_max, genero, precio, plan) VALUES
((SELECT deporte_id FROM deportes WHERE nombre = 'ASODE'), 'SABADO', '15:30:00', '16:30:00', 20, 1, 'activo', '2009-2010', 'PC', 2009, 2010, 'Mixto', 200, 'Premium'),
((SELECT deporte_id FROM deportes WHERE nombre = 'ASODE'), 'SABADO', '15:30:00', '16:30:00', 20, 0, 'activo', '2011-2012', 'PC', 2011, 2012, 'Mixto', 200, 'Premium'),
((SELECT deporte_id FROM deportes WHERE nombre = 'ASODE'), 'SABADO', '16:30:00', '17:30:00', 20, 2, 'activo', '2012-2013', 'PC', 2012, 2013, 'Mixto', 200, 'Premium'),
((SELECT deporte_id FROM deportes WHERE nombre = 'ASODE'), 'SABADO', '16:30:00', '17:30:00', 20, 0, 'activo', '2014', 'PC', 2014, 2014, 'Mixto', 200, 'Premium'),
((SELECT deporte_id FROM deportes WHERE nombre = 'ASODE'), 'SABADO', '17:30:00', '18:30:00', 20, 0, 'activo', '2015-2016', 'PC', 2015, 2016, 'Mixto', 200, 'Premium'),
((SELECT deporte_id FROM deportes WHERE nombre = 'ASODE'), 'SABADO', '17:30:00', '18:30:00', 20, 0, 'activo', '2017', 'PC', 2017, 2017, 'Mixto', 200, 'Premium');

-- Vóley (Plan Estándar)
INSERT INTO horarios (deporte_id, dia, hora_inicio, hora_fin, cupo_maximo, cupos_ocupados, estado, categoria, nivel, año_min, año_max, genero, precio, plan) VALUES
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'LUNES', '14:30:00', '16:00:00', 20, 0, 'activo', '2013-2014', 'BÁSICO', 2013, 2014, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'LUNES', '14:30:00', '16:00:00', 20, 0, 'activo', '2015-2016', 'BÁSICO', 2015, 2016, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'LUNES', '16:00:00', '17:30:00', 20, 0, 'activo', '2010-2009', 'BÁSICO', 2009, 2010, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'LUNES', '16:00:00', '17:30:00', 20, 0, 'activo', '2012-2011', 'BÁSICO', 2011, 2012, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'LUNES', '17:30:00', '19:00:00', 20, 0, 'activo', '2011-2010', 'AVANZADO', 2010, 2011, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'LUNES', '17:30:00', '19:00:00', 20, 0, 'activo', '2013-2012', 'AVANZADO', 2012, 2013, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'MIERCOLES', '14:30:00', '16:00:00', 20, 0, 'activo', '2013-2014', 'BÁSICO', 2013, 2014, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'MIERCOLES', '14:30:00', '16:00:00', 20, 0, 'activo', '2015-2016', 'BÁSICO', 2015, 2016, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'MIERCOLES', '16:00:00', '17:30:00', 20, 0, 'activo', '2010-2009', 'BÁSICO', 2009, 2010, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'MIERCOLES', '16:00:00', '17:30:00', 20, 0, 'activo', '2012-2011', 'BÁSICO', 2011, 2012, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'MIERCOLES', '17:30:00', '19:00:00', 20, 0, 'activo', '2011-2010', 'AVANZADO', 2010, 2011, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'MIERCOLES', '17:30:00', '19:00:00', 20, 0, 'activo', '2013-2012', 'AVANZADO', 2012, 2013, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'VIERNES', '14:30:00', '16:00:00', 20, 0, 'activo', '2013-2014', 'BÁSICO', 2013, 2014, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'VIERNES', '14:30:00', '16:00:00', 20, 0, 'activo', '2015-2016', 'BÁSICO', 2015, 2016, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'VIERNES', '16:00:00', '17:30:00', 20, 1, 'activo', '2010-2009', 'BÁSICO', 2009, 2010, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'VIERNES', '16:00:00', '17:30:00', 20, 0, 'activo', '2012-2011', 'BÁSICO', 2011, 2012, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'VIERNES', '17:30:00', '19:00:00', 20, 1, 'activo', '2011-2010', 'AVANZADO', 2010, 2011, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Vóley'), 'VIERNES', '17:30:00', '19:00:00', 20, 0, 'activo', '2013-2012', 'AVANZADO', 2012, 2013, 'Mixto', 120, 'Estándar');

-- Básquet (Plan Estándar)
INSERT INTO horarios (deporte_id, dia, hora_inicio, hora_fin, cupo_maximo, cupos_ocupados, estado, categoria, nivel, año_min, año_max, genero, precio, plan) VALUES
((SELECT deporte_id FROM deportes WHERE nombre = 'Básquet'), 'MARTES', '14:30:00', '16:00:00', 20, 0, 'activo', '2017', NULL, 2017, 2017, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Básquet'), 'MARTES', '14:30:00', '16:00:00', 20, 0, 'activo', '2015-2016', NULL, 2015, 2016, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Básquet'), 'MARTES', '16:00:00', '17:30:00', 20, 0, 'activo', '2014', NULL, 2014, 2014, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Básquet'), 'MARTES', '16:00:00', '17:30:00', 20, 0, 'activo', '2012-2013', NULL, 2012, 2013, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Básquet'), 'MARTES', '17:30:00', '19:00:00', 20, 0, 'activo', '2009', NULL, 2009, 2009, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Básquet'), 'MARTES', '17:30:00', '19:00:00', 20, 0, 'activo', '2010-2011', NULL, 2010, 2011, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Básquet'), 'JUEVES', '14:30:00', '16:00:00', 20, 0, 'activo', '2017', NULL, 2017, 2017, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Básquet'), 'JUEVES', '14:30:00', '16:00:00', 20, 0, 'activo', '2015-2016', NULL, 2015, 2016, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Básquet'), 'JUEVES', '16:00:00', '17:30:00', 20, 0, 'activo', '2011', NULL, 2011, 2011, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Básquet'), 'JUEVES', '16:00:00', '17:30:00', 20, 0, 'activo', '2012-2013', NULL, 2012, 2013, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Básquet'), 'JUEVES', '17:30:00', '19:00:00', 20, 0, 'activo', '2009-2008', NULL, 2008, 2009, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Básquet'), 'JUEVES', '17:30:00', '19:00:00', 20, 0, 'activo', '2010-2011', NULL, 2010, 2011, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Básquet'), 'SABADO', '08:30:00', '10:00:00', 20, 0, 'activo', '2009-2008', NULL, 2008, 2009, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Básquet'), 'SABADO', '08:30:00', '10:00:00', 20, 0, 'activo', '2010-2011', NULL, 2010, 2011, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Básquet'), 'SABADO', '10:00:00', '11:30:00', 20, 0, 'activo', '2012-2013', NULL, 2012, 2013, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Básquet'), 'SABADO', '10:00:00', '11:30:00', 20, 0, 'activo', '2014', NULL, 2014, 2014, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Básquet'), 'SABADO', '11:30:00', '13:00:00', 20, 0, 'activo', '2015-2016', NULL, 2015, 2016, 'Mixto', 120, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Básquet'), 'SABADO', '11:30:00', '13:00:00', 20, 0, 'activo', '2017', NULL, 2017, 2017, 'Mixto', 120, 'Estándar');

-- Entrenamiento Funcional Mixto y GYM JUVENIL
INSERT INTO horarios (deporte_id, dia, hora_inicio, hora_fin, cupo_maximo, cupos_ocupados, estado, categoria, nivel, año_min, año_max, genero, precio, plan) VALUES
((SELECT deporte_id FROM deportes WHERE nombre = 'Entrenamiento Funcional Mixto'), 'LUNES', '15:45:00', '16:45:00', 20, 4, 'activo', 'Entrenamiento Funcional Mixto', NULL, 1900, 2008, 'Mixto', 100, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'GYM JUVENIL'), 'LUNES', '15:00:00', '16:00:00', 20, 4, 'activo', '2005-2009', 'AVANZADO', 2005, 2009, 'Mixto', 100, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Entrenamiento Funcional Mixto'), 'MIERCOLES', '15:45:00', '16:45:00', 20, 0, 'activo', 'Entrenamiento Funcional Mixto', NULL, 1900, 2008, 'Mixto', 100, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'GYM JUVENIL'), 'MIERCOLES', '15:00:00', '16:00:00', 20, 1, 'activo', '2005-2009', NULL, 2005, 2009, 'Mixto', 100, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'Entrenamiento Funcional Mixto'), 'VIERNES', '15:45:00', '16:45:00', 20, 0, 'activo', 'Entrenamiento Funcional Mixto', NULL, 1900, 2008, 'Mixto', 100, 'Estándar'),
((SELECT deporte_id FROM deportes WHERE nombre = 'GYM JUVENIL'), 'VIERNES', '15:00:00', '16:00:00', 20, 0, 'activo', '2005-2009', NULL, 2005, 2009, 'Mixto', 100, 'Estándar');

-- Mensaje final
SELECT COUNT(*) as 'Total horarios insertados' FROM horarios;
SELECT d.nombre as 'Deporte', COUNT(h.horario_id) as 'Cantidad de horarios'
FROM deportes d
LEFT JOIN horarios h ON d.deporte_id = h.deporte_id
GROUP BY d.nombre
ORDER BY d.nombre;
