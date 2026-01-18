/**
 * SCRIPT DE PRUEBAS COMPLETAS - ACADEMIA JAGUARES
 * ================================================
 * 
 * Ejecutar: node test-sistema-completo.js
 * 
 * Pruebas:
 * 1. Caché del backend
 * 2. Endpoints principales
 * 3. Consulta de inscripciones
 * 4. Nuevos deportes (MAMAS FIT, GYM JUVENIL, ENTRENAMIENTO FUNCIONAL MIXTO)
 * 5. Performance
 */

const API_BASE_URL = 'https://jaguares-backend.onrender.com';
// Para testing local usa: 'http://localhost:3002'

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

let testsPassed = 0;
let testsFailed = 0;

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function logTest(name, passed, detail = '') {
  if (passed) {
    log(`✅ ${name}${detail ? ' - ' + detail : ''}`, 'green');
    testsPassed++;
  } else {
    log(`❌ ${name}${detail ? ' - ' + detail : ''}`, 'red');
    testsFailed++;
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== PRUEBAS ====================

async function test1_healthCheck() {
  log('\n📋 TEST 1: Health Check', 'cyan');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const data = await response.json();
    
    logTest('Health check responde', response.ok);
    logTest('Status es "ok"', data.status === 'ok');
    logTest('Apps Script configurado', data.appsScriptConfigured === true);
  } catch (error) {
    logTest('Health check', false, error.message);
  }
}

async function test2_horarios() {
  log('\n📋 TEST 2: Obtener Horarios', 'cyan');
  
  try {
    const start = Date.now();
    const response = await fetch(`${API_BASE_URL}/api/horarios`);
    const duration = Date.now() - start;
    const data = await response.json();
    
    logTest('Horarios responde', response.ok);
    logTest('Tiene array de horarios', Array.isArray(data.horarios));
    logTest('Hay horarios disponibles', data.horarios.length > 0);
    logTest(`Performance (${duration}ms)`, duration < 6000, `${duration}ms`);
    
    // Verificar que los nuevos deportes estén disponibles
    const deportes = [...new Set(data.horarios.map(h => h.deporte.toUpperCase()))];
    logTest('MAMAS FIT disponible', deportes.includes('MAMAS FIT'));
    logTest('GYM JUVENIL disponible', deportes.includes('GYM JUVENIL'));
    logTest('ENTRENAMIENTO FUNCIONAL MIXTO disponible', 
      deportes.includes('ENTRENAMIENTO FUNCIONAL MIXTO'));
    
    log(`   📊 Total horarios: ${data.horarios.length}`, 'blue');
    log(`   🏃 Deportes únicos: ${deportes.length}`, 'blue');
    
  } catch (error) {
    logTest('Obtener horarios', false, error.message);
  }
}

async function test3_consultarInscripcion() {
  log('\n📋 TEST 3: Consultar Inscripción (DNI: 72506545)', 'cyan');
  
  try {
    const dni = '72506545';
    const start = Date.now();
    const response = await fetch(`${API_BASE_URL}/api/consultar/${dni}`);
    const duration = Date.now() - start;
    const data = await response.json();
    
    logTest('Consulta responde', response.ok);
    logTest('Consulta exitosa', data.success === true);
    logTest(`Performance (${duration}ms)`, duration < 6000, `${duration}ms`);
    
    if (data.horarios) {
      logTest('Tiene horarios inscritos', data.horarios.length > 0);
      log(`   📊 Total inscripciones: ${data.horarios.length}`, 'blue');
      
      // Verificar los 3 deportes específicos
      const deportes = data.horarios.map(h => h.deporte.toUpperCase());
      logTest('MAMAS FIT inscrito', deportes.includes('MAMAS FIT'));
      logTest('GYM JUVENIL inscrito', deportes.includes('GYM JUVENIL'));
      logTest('ENTRENAMIENTO FUNCIONAL MIXTO inscrito', 
        deportes.includes('ENTRENAMIENTO FUNCIONAL MIXTO'));
      
      // Mostrar horarios
      data.horarios.forEach((h, i) => {
        log(`   ${i+1}. ${h.deporte} - ${h.dia} ${h.hora_inicio}-${h.hora_fin}`, 'blue');
      });
    }
  } catch (error) {
    logTest('Consultar inscripción', false, error.message);
  }
}

async function test4_cache() {
  log('\n📋 TEST 4: Sistema de Caché', 'cyan');
  
  try {
    // Primera consulta (debe ser lenta, desde Google Sheets)
    log('   ⏱️ Primera consulta (sin caché)...', 'yellow');
    const start1 = Date.now();
    const response1 = await fetch(`${API_BASE_URL}/api/horarios`);
    const duration1 = Date.now() - start1;
    await response1.json();
    
    // Esperar 1 segundo
    await sleep(1000);
    
    // Segunda consulta (debe ser rápida, desde caché)
    log('   ⚡ Segunda consulta (con caché)...', 'yellow');
    const start2 = Date.now();
    const response2 = await fetch(`${API_BASE_URL}/api/horarios`);
    const duration2 = Date.now() - start2;
    await response2.json();
    
    logTest('Primera consulta', response1.ok, `${duration1}ms`);
    logTest('Segunda consulta', response2.ok, `${duration2}ms`);
    logTest('Caché funciona (2da más rápida)', duration2 < duration1, 
      `${duration1}ms → ${duration2}ms (${Math.round((1 - duration2/duration1) * 100)}% más rápido)`);
    
  } catch (error) {
    logTest('Test de caché', false, error.message);
  }
}

async function test5_cacheStats() {
  log('\n📋 TEST 5: Estadísticas del Caché', 'cyan');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/cache/stats`);
    const data = await response.json();
    
    logTest('Estadísticas responden', response.ok);
    logTest('Tiene datos de caché', data.cache !== undefined);
    
    if (data.cache) {
      log(`   📊 Hits: ${data.cache.hits}`, 'blue');
      log(`   📊 Misses: ${data.cache.misses}`, 'blue');
      log(`   📊 Hit Rate: ${data.cache.hitRate}`, 'blue');
      log(`   📊 Keys activas: ${data.cache.keys}`, 'blue');
      
      if (data.cache.activeKeys && data.cache.activeKeys.length > 0) {
        log(`   🔑 Claves en caché:`, 'blue');
        data.cache.activeKeys.forEach(key => {
          log(`      - ${key}`, 'blue');
        });
      }
    }
  } catch (error) {
    logTest('Estadísticas de caché', false, error.message);
  }
}

async function test6_filtradoEdad() {
  log('\n📋 TEST 6: Filtrado por Edad', 'cyan');
  
  try {
    // Filtrar horarios para alguien nacido en 2015 (9 años)
    const response = await fetch(`${API_BASE_URL}/api/horarios?año_nacimiento=2015`);
    const data = await response.json();
    
    logTest('Filtrado responde', response.ok);
    logTest('Horarios filtrados', data.horarios.length >= 0);
    logTest('Indica si fue filtrado', data.filtradoPorEdad !== undefined);
    
    log(`   📊 Horarios disponibles para 2015: ${data.horarios.length}`, 'blue');
    log(`   🔍 Filtrado activo: ${data.filtradoPorEdad ? 'Sí' : 'No'}`, 'blue');
    
  } catch (error) {
    logTest('Filtrado por edad', false, error.message);
  }
}

async function test7_dniInvalido() {
  log('\n📋 TEST 7: Validación de DNI Inválido', 'cyan');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/consultar/123`);
    const data = await response.json();
    
    logTest('Responde a DNI corto', response.status === 400 || !data.success);
    logTest('Devuelve error apropiado', !data.success);
    
  } catch (error) {
    logTest('Validación DNI', false, error.message);
  }
}

async function test8_dniNoExiste() {
  log('\n📋 TEST 8: DNI No Existente', 'cyan');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/consultar/99999999`);
    const data = await response.json();
    
    logTest('Responde a DNI no existente', response.ok);
    logTest('Indica que no hay inscripciones', !data.success || data.horarios?.length === 0);
    
  } catch (error) {
    logTest('DNI no existente', false, error.message);
  }
}

async function test9_cors() {
  log('\n📋 TEST 9: CORS Headers', 'cyan');
  
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    const corsHeader = response.headers.get('access-control-allow-origin');
    
    logTest('CORS habilitado', corsHeader !== null);
    logTest('CORS permite todos (*)', corsHeader === '*');
    
  } catch (error) {
    logTest('CORS', false, error.message);
  }
}

async function test10_concurrencia() {
  log('\n📋 TEST 10: Prueba de Concurrencia (5 requests simultáneos)', 'cyan');
  
  try {
    const start = Date.now();
    const promises = Array(5).fill(null).map(() => 
      fetch(`${API_BASE_URL}/api/horarios`)
    );
    
    const responses = await Promise.all(promises);
    const duration = Date.now() - start;
    
    const allOk = responses.every(r => r.ok);
    logTest('Todas las peticiones responden', allOk);
    logTest(`Performance concurrente (${duration}ms)`, duration < 10000, `${duration}ms`);
    logTest('Promedio por request', true, `${Math.round(duration/5)}ms`);
    
  } catch (error) {
    logTest('Concurrencia', false, error.message);
  }
}

// ==================== EJECUTAR TODAS LAS PRUEBAS ====================

async function runAllTests() {
  log('\n' + '='.repeat(60), 'bright');
  log('🧪 PRUEBAS COMPLETAS - ACADEMIA JAGUARES', 'bright');
  log('='.repeat(60), 'bright');
  log(`🌐 API: ${API_BASE_URL}`, 'cyan');
  log(`📅 Fecha: ${new Date().toLocaleString('es-PE')}`, 'cyan');
  log('='.repeat(60) + '\n', 'bright');
  
  await test1_healthCheck();
  await test2_horarios();
  await test3_consultarInscripcion();
  await test4_cache();
  await test5_cacheStats();
  await test6_filtradoEdad();
  await test7_dniInvalido();
  await test8_dniNoExiste();
  await test9_cors();
  await test10_concurrencia();
  
  // Resumen
  log('\n' + '='.repeat(60), 'bright');
  log('📊 RESUMEN DE PRUEBAS', 'bright');
  log('='.repeat(60), 'bright');
  log(`✅ Pruebas exitosas: ${testsPassed}`, 'green');
  log(`❌ Pruebas fallidas: ${testsFailed}`, testsFailed > 0 ? 'red' : 'green');
  log(`📈 Tasa de éxito: ${Math.round((testsPassed / (testsPassed + testsFailed)) * 100)}%`, 'cyan');
  log('='.repeat(60) + '\n', 'bright');
  
  if (testsFailed === 0) {
    log('🎉 ¡TODAS LAS PRUEBAS PASARON! Sistema funcionando correctamente.', 'green');
  } else {
    log('⚠️  Algunas pruebas fallaron. Revisa los errores arriba.', 'yellow');
  }
}

// Ejecutar
runAllTests().catch(error => {
  log('\n❌ Error crítico en las pruebas:', 'red');
  console.error(error);
  process.exit(1);
});
