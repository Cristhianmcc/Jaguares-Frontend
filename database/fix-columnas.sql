USE jaguares_db;

-- Renombrar columnas con encoding corrupto
ALTER TABLE horarios 
  CHANGE COLUMN `a�o_min` ano_min INT,
  CHANGE COLUMN `a�o_max` ano_max INT;

-- Verificar cambio
DESCRIBE horarios;
