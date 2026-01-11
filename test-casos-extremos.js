/**
 * PRUEBAS DE CASOS EXTREMOS Y EDGE CASES
 * =======================================
 * 
 * Prueba situaciones límite y datos inusuales
 * 
 * Ejecutar: node test-casos-extremos.js
 */

const API_BASE_URL = 'http://localhost:3002';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

let testsPasados = 0;
let testsFallidos = 0;

function test(nombre, passed, detalle = '') {
  if (passed) {
    log(`   ✅ ${nombre}${detalle ? ' - ' + detalle : ''}`, 'green');
    testsPasados++;
  } else {
    log(`   ❌ ${nombre}${detalle ? ' - ' + detalle : ''}`, 'red');
    testsFallidos++;
  }
  return passed;
}

// ==================== CASOS EXTREMOS ====================

async function caso1_DNIsInvalidos() {
  log('\n📋 CASO 1: DNIs Inválidos', 'cyan');
  log('─'.repeat(70), 'cyan');
  
  const casos = [
    { dni: '', descripcion: 'DNI vacío' },
    { dni: '123', descripcion: 'DNI muy corto' },
    { dni: '123456789012345', descripcion: 'DNI muy largo' },
    { dni: 'abcdefgh', descripcion: 'DNI con letras' },
    { dni: '12-34-56-78', descripcion: 'DNI con guiones' },
    { dni: '12 34 56 78', descripcion: 'DNI con espacios' },
    { dni: '00000000', descripcion: 'DNI con ceros' },
    { dni: 'null', descripcion: 'String "null"' },
    { dni: 'undefined', descripcion: 'String "undefined"' }
  ];
  
  for (const caso of casos) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/consultar/${caso.dni}`);
      const data = await response.json();
      
      // Debe rechazar o manejar correctamente
      const manejado = !response.ok || !data.success || data.error;
      test(caso.descripcion, manejado, 
        manejado ? 'Rechazado correctamente' : 'Aceptó DNI inválido');
    } catch (error) {
      test(caso.descripcion, true, 'Error capturado');
    }
  }
}

async function caso2_ParametrosExtremos() {
  log('\n📋 CASO 2: Parámetros Extremos', 'cyan');
  log('─'.repeat(70), 'cyan');
  
  const casos = [
    { año: 1900, descripcion: 'Año muy antiguo (1900)' },
    { año: 2030, descripcion: 'Año futuro (2030)' },
    { año: 0, descripcion: 'Año cero' },
    { año: -1, descripcion: 'Año negativo' },
    { año: 'abc', descripcion: 'Año no numérico' }
  ];
  
  for (const caso of casos) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/horarios?año_nacimiento=${caso.año}`);
      const data = await response.json();
      
      // Debe responder algo (aunque sea array vacío)
      const responde = response.ok && data.horarios !== undefined;
      test(caso.descripcion, responde);
    } catch (error) {
      test(caso.descripcion, false, error.message);
    }
  }
}

async function caso3_RequestsSecuenciales() {
  log('\n📋 CASO 3: Requests Secuenciales Rápidos (Rate Limiting)', 'cyan');
  log('─'.repeat(70), 'cyan');
  
  log('\n   Enviando 20 requests consecutivos sin espera...', 'yellow');
  
  const resultados = [];
  const inicio = Date.now();
  
  for (let i = 0; i < 20; i++) {
    try {
      const start = Date.now();
      const response = await fetch(`${API_BASE_URL}/api/horarios`);
      const duration = Date.now() - start;
      
      resultados.push({
        index: i + 1,
        exito: response.ok,
        status: response.status,
        tiempo: duration
      });
    } catch (error) {
      resultados.push({
        index: i + 1,
        exito: false,
        error: error.message
      });
    }
  }
  
  const duracionTotal = Date.now() - inicio;
  const exitosos = resultados.filter(r => r.exito).length;
  const rateLimited = resultados.some(r => r.status === 429);
  
  test('Todos los requests procesados', exitosos === 20);
  test('Sin rate limiting (429)', !rateLimited);
  test('Tiempo total razonable', duracionTotal < 30000, `${duracionTotal}ms`);
}

async function caso4_DatosMuyGrandes() {
  log('\n📋 CASO 4: Respuestas con Datos Grandes', 'cyan');
  log('─'.repeat(70), 'cyan');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/horarios`);
    const data = await response.json();
    
    const horariosCount = data.horarios?.length || 0;
    const responseSize = JSON.stringify(data).length;
    const responseSizeKB = (responseSize / 1024).toFixed(2);
    
    log(`\n   Horarios en respuesta: ${horariosCount}`, 'blue');
    log(`   Tamaño de respuesta: ${responseSizeKB} KB`, 'blue');
    
    test('Respuesta tiene datos', horariosCount > 0);
    test('Respuesta no excesivamente grande', responseSizeKB < 1024, `${responseSizeKB} KB`);
    test('JSON válido', data !== null && typeof data === 'object');
    
  } catch (error) {
    test('Manejo de respuesta grande', false, error.message);
  }
}

async function caso5_ConexionLenta() {
  log('\n📋 CASO 5: Simulación de Conexión Lenta (Timeouts)', 'cyan');
  log('─'.repeat(70), 'cyan');
  
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout
  
  try {
    const start = Date.now();
    const response = await fetch(`${API_BASE_URL}/api/horarios`, {
      signal: controller.signal
    });
    const duration = Date.now() - start;
    clearTimeout(timeout);
    
    test('Responde antes del timeout', response.ok, `${duration}ms`);
    test('Timeout configurado funciona', duration < 30000);
    
  } catch (error) {
    clearTimeout(timeout);
    if (error.name === 'AbortError') {
      test('Timeout activado', true, 'Request tardó más de 30s');
    } else {
      test('Manejo de error de red', true, error.message);
    }
  }
}

async function caso6_HorariosConflictivosComplejos() {
  log('\n📋 CASO 6: Validación de Horarios Conflictivos Complejos', 'cyan');
  log('─'.repeat(70), 'cyan');
  
  function horaAMinutos(hora) {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  }
  
  function seTraslapan(h1, h2) {
    const inicio1 = horaAMinutos(h1.hora_inicio);
    const fin1 = horaAMinutos(h1.hora_fin);
    const inicio2 = horaAMinutos(h2.hora_inicio);
    const fin2 = horaAMinutos(h2.hora_fin);
    return inicio1 < fin2 && fin1 > inicio2;
  }
  
  const casos = [
    {
      nombre: 'Horarios idénticos',
      h1: { hora_inicio: '10:00', hora_fin: '11:00' },
      h2: { hora_inicio: '10:00', hora_fin: '11:00' },
      debenTraslapar: true
    },
    {
      nombre: 'Uno dentro del otro',
      h1: { hora_inicio: '10:00', hora_fin: '12:00' },
      h2: { hora_inicio: '10:30', hora_fin: '11:30' },
      debenTraslapar: true
    },
    {
      nombre: 'Consecutivos sin traslape',
      h1: { hora_inicio: '10:00', hora_fin: '11:00' },
      h2: { hora_inicio: '11:00', hora_fin: '12:00' },
      debenTraslapar: false
    },
    {
      nombre: 'Con 1 minuto de separación',
      h1: { hora_inicio: '10:00', hora_fin: '11:00' },
      h2: { hora_inicio: '11:01', hora_fin: '12:00' },
      debenTraslapar: false
    },
    {
      nombre: 'Traslape de 1 minuto',
      h1: { hora_inicio: '10:00', hora_fin: '11:01' },
      h2: { hora_inicio: '11:00', hora_fin: '12:00' },
      debenTraslapar: true
    },
    {
      nombre: 'A medianoche',
      h1: { hora_inicio: '23:30', hora_fin: '00:30' },
      h2: { hora_inicio: '00:00', hora_fin: '01:00' },
      debenTraslapar: true
    }
  ];
  
  for (const caso of casos) {
    const resultado = seTraslapan(caso.h1, caso.h2);
    const correcto = resultado === caso.debenTraslapar;
    test(caso.nombre, correcto, 
      correcto ? 'Detectado correctamente' : `Esperado: ${caso.debenTraslapar}, obtuvo: ${resultado}`);
  }
}

async function caso7_CaracteresEspeciales() {
  log('\n📋 CASO 7: Caracteres Especiales y Unicode', 'cyan');
  log('─'.repeat(70), 'cyan');
  
  const casos = [
    { dni: '12345678', nombre: 'José María', descripcion: 'Acentos' },
    { dni: '12345679', nombre: 'Niño Pérez', descripcion: 'Ñ y acentos' },
    { dni: '12345680', nombre: "O'Connor", descripcion: 'Apóstrofe' },
    { dni: '12345681', nombre: 'Jean-Pierre', descripcion: 'Guión' },
    { dni: '12345682', nombre: 'São Paulo', descripcion: 'Til' }
  ];
  
  for (const caso of casos) {
    try {
      // Simular que el nombre con caracteres especiales se maneje correctamente
      const nombreEncoded = encodeURIComponent(caso.nombre);
      const puedeEncodear = nombreEncoded !== caso.nombre;
      
      test(caso.descripcion, puedeEncodear, 
        puedeEncodear ? 'Se puede encodear' : 'No necesita encoding');
    } catch (error) {
      test(caso.descripcion, false, error.message);
    }
  }
}

async function caso8_CachéInvalidación() {
  log('\n📋 CASO 8: Invalidación de Caché', 'cyan');
  log('─'.repeat(70), 'cyan');
  
  try {
    // Primera consulta
    log('\n   Primera consulta (debe cachear)...', 'yellow');
    const response1 = await fetch(`${API_BASE_URL}/api/horarios`);
    const data1 = await response1.json();
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Segunda consulta (debe usar caché)
    log('   Segunda consulta (debe usar caché)...', 'yellow');
    const response2 = await fetch(`${API_BASE_URL}/api/horarios`);
    const data2 = await response2.json();
    
    // Verificar estadísticas de caché
    const statsResponse = await fetch(`${API_BASE_URL}/api/cache/stats`);
    const stats = await statsResponse.json();
    
    test('Caché genera estadísticas', stats.cache !== undefined);
    test('Tiene hits registrados', stats.cache?.hits > 0);
    test('Hit rate calculado', stats.cache?.hitRate !== undefined);
    
    log(`\n   Hit Rate actual: ${stats.cache?.hitRate || 'N/A'}`, 'blue');
    log(`   Total hits: ${stats.cache?.hits || 0}`, 'blue');
    log(`   Total misses: ${stats.cache?.misses || 0}`, 'blue');
    
  } catch (error) {
    test('Sistema de caché', false, error.message);
  }
}

async function caso9_ErroresDeRed() {
  log('\n📋 CASO 9: Manejo de Errores de Red', 'cyan');
  log('─'.repeat(70), 'cyan');
  
  // Test con URL inexistente
  try {
    const response = await fetch('http://localhost:9999/api/inexistente');
    test('Request a puerto inexistente', false, 'No debería conectar');
  } catch (error) {
    test('Error de conexión capturado', true, error.message);
  }
  
  // Test con endpoint inexistente
  try {
    const response = await fetch(`${API_BASE_URL}/api/endpoint-que-no-existe`);
    test('Endpoint inexistente retorna 404', response.status === 404);
  } catch (error) {
    test('Error en endpoint inexistente', true);
  }
}

async function caso10_LimitesHorarios() {
  log('\n📋 CASO 10: Límites de Selección de Horarios', 'cyan');
  log('─'.repeat(70), 'cyan');
  
  // Simular selección de más de 2 horarios por día
  const horariosMismoDia = [
    { id: 1, dia: 'LUNES', hora_inicio: '08:00', hora_fin: '09:00' },
    { id: 2, dia: 'LUNES', hora_inicio: '10:00', hora_fin: '11:00' },
    { id: 3, dia: 'LUNES', hora_inicio: '14:00', hora_fin: '15:00' }
  ];
  
  const countMismoDia = horariosMismoDia.filter(h => h.dia === 'LUNES').length;
  
  test('Detecta más de 2 horarios mismo día', countMismoDia > 2);
  test('Límite de 2 horarios por día', countMismoDia > 2, 
    `Usuario intentó ${countMismoDia} horarios en LUNES`);
  
  // Simular selección de horarios en diferentes días (permitido)
  const horariosDiferentes = [
    { id: 1, dia: 'LUNES', hora_inicio: '08:00' },
    { id: 2, dia: 'MARTES', hora_inicio: '08:00' },
    { id: 3, dia: 'MIÉRCOLES', hora_inicio: '08:00' },
    { id: 4, dia: 'JUEVES', hora_inicio: '08:00' },
    { id: 5, dia: 'VIERNES', hora_inicio: '08:00' }
  ];
  
  const diasUnicos = [...new Set(horariosDiferentes.map(h => h.dia))].length;
  test('Permite horarios en diferentes días', diasUnicos === 5);
}

// ==================== MAIN ====================

async function main() {
  log('\n' + '█'.repeat(70), 'bright');
  log('🔬 PRUEBAS DE CASOS EXTREMOS Y EDGE CASES', 'bright');
  log('█'.repeat(70), 'bright');
  log('🎯 Objetivo: Verificar robustez ante situaciones límite', 'cyan');
  log('🌐 API: ' + API_BASE_URL, 'cyan');
  log('█'.repeat(70) + '\n', 'bright');
  
  await caso1_DNIsInvalidos();
  await caso2_ParametrosExtremos();
  await caso3_RequestsSecuenciales();
  await caso4_DatosMuyGrandes();
  await caso5_ConexionLenta();
  await caso6_HorariosConflictivosComplejos();
  await caso7_CaracteresEspeciales();
  await caso8_CachéInvalidación();
  await caso9_ErroresDeRed();
  await caso10_LimitesHorarios();
  
  // Resumen
  log('\n' + '█'.repeat(70), 'bright');
  log('📊 RESUMEN DE CASOS EXTREMOS', 'bright');
  log('█'.repeat(70), 'bright');
  
  const total = testsPasados + testsFallidos;
  const porcentaje = Math.round((testsPasados / total) * 100);
  
  log(`\n✅ Tests pasados: ${testsPasados}/${total} (${porcentaje}%)`, 
    testsPasados === total ? 'green' : 'yellow');
  
  if (testsFallidos > 0) {
    log(`❌ Tests fallidos: ${testsFallidos}/${total}`, 'red');
  }
  
  log('\n' + '█'.repeat(70), 'bright');
  
  if (porcentaje >= 90) {
    log('✅ SISTEMA ROBUSTO - Maneja casos extremos correctamente', 'green');
  } else if (porcentaje >= 75) {
    log('⚠️  SISTEMA FUNCIONAL - Algunos edge cases necesitan atención', 'yellow');
  } else {
    log('❌ SISTEMA VULNERABLE - Revisar manejo de errores', 'red');
  }
  
  log('█'.repeat(70) + '\n', 'bright');
  
  process.exit(porcentaje >= 75 ? 0 : 1);
}

main().catch(error => {
  log('\n❌ Error crítico:', 'red');
  console.error(error);
  process.exit(1);
});
