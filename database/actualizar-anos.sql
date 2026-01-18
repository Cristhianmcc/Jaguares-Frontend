USE jaguares_db;

-- Actualizar MAMAS FIT
UPDATE horarios SET ano_min = 1900, ano_max = 2008 WHERE categoria = 'adulto +18';

-- Fútbol Plan Económico
UPDATE horarios SET ano_min = 2011, ano_max = 2012 WHERE categoria = '2011-2012';
UPDATE horarios SET ano_min = 2013, ano_max = 2014 WHERE categoria = '2014-2013';
UPDATE horarios SET ano_min = 2015, ano_max = 2016 WHERE categoria = '2016-2015';
UPDATE horarios SET ano_min = 2009, ano_max = 2010 WHERE categoria = '2009-2010';
UPDATE horarios SET ano_min = 2017, ano_max = 2018 WHERE categoria = '2018-2017';

-- Fútbol Femenino
UPDATE horarios SET ano_min = 2010, ano_max = 2015 WHERE categoria = '2010-2015';

-- Vóley
UPDATE horarios SET ano_min = 2008, ano_max = 2009 WHERE categoria = '2009-2008';
UPDATE horarios SET ano_min = 2010, ano_max = 2010 WHERE categoria = '2010';
UPDATE horarios SET ano_min = 2011, ano_max = 2011 WHERE categoria = '2011';
UPDATE horarios SET ano_min = 2012, ano_max = 2013 WHERE categoria = '2012-2013';
UPDATE horarios SET ano_min = 2014, ano_max = 2014 WHERE categoria = '2014';
UPDATE horarios SET ano_min = 2015, ano_max = 2016 WHERE categoria = '2015-2016';

-- Fútbol Estándar
UPDATE horarios SET ano_min = 2019, ano_max = 2021 WHERE categoria = '2020-2021';
UPDATE horarios SET ano_min = 2019, ano_max = 2020 WHERE categoria = '2019-2020';
UPDATE horarios SET ano_min = 2019, ano_max = 2019 WHERE categoria = '2019';
UPDATE horarios SET ano_min = 2015, ano_max = 2015 WHERE categoria = '2015';
UPDATE horarios SET ano_min = 2018, ano_max = 2019 WHERE categoria = '2018-2019';
UPDATE horarios SET ano_min = 2008, ano_max = 2011 WHERE categoria = '2008-2009-2010-2011';
UPDATE horarios SET ano_min = 2016, ano_max = 2017 WHERE categoria = '2017-2016';
UPDATE horarios SET ano_min = 2012, ano_max = 2014 WHERE categoria = '2014-2013-2012';
UPDATE horarios SET ano_min = 2010, ano_max = 2011 WHERE categoria = '2010-2011';

-- Fútbol Premium
UPDATE horarios SET ano_min = 2017, ano_max = 2017 WHERE categoria = '2017';
UPDATE horarios SET ano_min = 2016, ano_max = 2016 WHERE categoria = '2016';
UPDATE horarios SET ano_min = 2013, ano_max = 2015 WHERE categoria = '2013-2014-2015';
UPDATE horarios SET ano_min = 2009, ano_max = 2012 WHERE categoria = '2009-2010-2011-2012';

-- ASODE
UPDATE horarios SET ano_min = 2009, ano_max = 2010 WHERE categoria = '2009-2010';
UPDATE horarios SET ano_min = 2011, ano_max = 2012 WHERE categoria = '2011-2012';

-- Vóley Estándar
UPDATE horarios SET ano_min = 2013, ano_max = 2014 WHERE categoria = '2013-2014';
UPDATE horarios SET ano_min = 2009, ano_max = 2010 WHERE categoria = '2010-2009';
UPDATE horarios SET ano_min = 2011, ano_max = 2012 WHERE categoria = '2012-2011';
UPDATE horarios SET ano_min = 2010, ano_max = 2011 WHERE categoria = '2011-2010';
UPDATE horarios SET ano_min = 2012, ano_max = 2013 WHERE categoria = '2013-2012';

-- Básquet
UPDATE horarios SET ano_min = 2005, ano_max = 2009 WHERE categoria = '2005-2009';

-- Verificar actualización
SELECT COUNT(*) as total, 
       SUM(CASE WHEN ano_min IS NULL THEN 1 ELSE 0 END) as sin_ano_min,
       SUM(CASE WHEN ano_max IS NULL THEN 1 ELSE 0 END) as sin_ano_max
FROM horarios;

SELECT DISTINCT categoria, ano_min, ano_max FROM horarios ORDER BY categoria;
