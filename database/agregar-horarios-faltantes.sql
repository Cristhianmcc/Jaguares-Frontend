-- Script para agregar los 8 horarios faltantes
USE jaguares_db;

-- Horarios con precio 0 que faltaban (IDs 63, 64, 74, 75, 104)
INSERT INTO horarios (deporte_id, dia, hora_inicio, hora_fin, cupo_maximo, cupos_ocupados, estado, categoria, nivel, ano_min, ano_max, genero, precio, plan) VALUES
-- ID 63: Fútbol LUNES 15:30-16:55 (2020-2021, sin precio/plan)
(1, 'LUNES', '15:30:00', '16:55:00', 20, 0, 'activo', '2020-2021', NULL, 2020, 2021, 'Mixto', 0, NULL),
-- ID 64: Fútbol LUNES 15:30-16:55 (2019, sin precio/plan)
(1, 'LUNES', '15:30:00', '16:55:00', 20, 0, 'activo', '2019', NULL, 2019, 2019, 'Mixto', 0, NULL),
-- ID 74: Fútbol MIERCOLES 15:30-16:55 (2020-2021, sin precio/plan)
(1, 'MIERCOLES', '15:30:00', '16:55:00', 20, 0, 'activo', '2020-2021', NULL, 2020, 2021, 'Mixto', 0, NULL),
-- ID 75: Fútbol MIERCOLES 15:30-16:55 (2019, sin precio/plan)
(1, 'MIERCOLES', '15:30:00', '16:55:00', 20, 0, 'activo', '2019', NULL, 2019, 2019, 'Mixto', 0, NULL),
-- ID 104: Fútbol SABADO 8:30-9:50 (2008-2009, sin precio/plan)
(1, 'SABADO', '08:30:00', '09:50:00', 20, 0, 'activo', '2008-2009', NULL, 2008, 2009, 'Mixto', 0, NULL);

-- Horarios duplicados que faltaban (IDs 94, 101, 109)
INSERT INTO horarios (deporte_id, dia, hora_inicio, hora_fin, cupo_maximo, cupos_ocupados, estado, categoria, nivel, ano_min, ano_max, genero, precio, plan) VALUES
-- ID 94: Fútbol MARTES 17:00-18:20 (2017-2016 duplicado)
(1, 'MARTES', '17:00:00', '18:20:00', 20, 0, 'activo', '2017-2016', 'NF', 2016, 2017, 'Mixto', 120, 'Estándar'),
-- ID 101: Fútbol JUEVES 17:00-18:20 (2017-2016 duplicado)
(1, 'JUEVES', '17:00:00', '18:20:00', 20, 0, 'activo', '2017-2016', 'NF', 2016, 2017, 'Mixto', 120, 'Estándar'),
-- ID 109: Fútbol SABADO 10:00-11:20 (2017-2016 duplicado)
(1, 'SABADO', '10:00:00', '11:20:00', 20, 0, 'activo', '2017-2016', 'NF', 2016, 2017, 'Mixto', 120, 'Estándar');

-- Verificar total de horarios insertados
SELECT COUNT(*) as 'Total horarios después de agregar faltantes' FROM horarios;
