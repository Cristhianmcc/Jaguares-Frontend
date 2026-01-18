/**
 * HELPERS PARA ARTILLERY - PRUEBAS DE CARGA
 * Funciones auxiliares para generar datos realistas
 */

module.exports = {
  generateRandomDNI,
  selectRandomYear
};

function generateRandomDNI(requestParams, context, ee, next) {
  // Generar DNI aleatorio de 8 dígitos
  const dni = String(Math.floor(10000000 + Math.random() * 90000000));
  
  // Reemplazar en la URL
  requestParams.url = requestParams.url.replace('{{ $randomString() }}', dni);
  
  return next();
}

function selectRandomYear(requestParams, context, ee, next) {
  const years = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020];
  const year = years[Math.floor(Math.random() * years.length)];
  
  requestParams.url = requestParams.url.replace('{{ $randomNumber(2010, 2020) }}', year);
  
  return next();
}
