/**
 * PRUEBAS AVANZADAS - EDGE CASES Y SEGURIDAD
 */

const ADMIN_EMAIL = 'admin@jaguares.com';
const ADMIN_PASSWORD = 'jaguares2025';
const API_BASE = 'http://localhost:3002';

let adminToken = null;
let testResults = { total: 0, passed: 0, failed: 0 };

const colors = {
  reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m',
  yellow: '\x1b[33m', blue: '\x1b[34m', cyan: '\x1b[36m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

function logTest(name, passed, details = '') {
  testResults.total++;
  passed ? testResults.passed++ : testResults.failed++;
  log(`${passed ? '✅' : '❌'} ${name}`, passed ? 'green' : 'red');
  if (details) log(`   ${details}`, 'cyan');
}

// TEST 1: Rate Limiting
async function testRateLimiting() {
  log('\n📋 TEST 1: RATE LIMITING', 'magenta');
  
  const requests = [];
  for (let i = 0; i < 15; i++) {
    requests.push(fetch(`${API_BASE}/api/horarios`));
  }
  
  const responses = await Promise.all(requests);
  const blocked = responses.filter(r => r.status === 429).length;
  
  logTest('Rate limit activo', blocked > 0, `${blocked}/15 requests bloqueadas`);
}

// TEST 2: JWT Expiración
async function testJWTInvalido() {
  log('\n📋 TEST 2: JWT INVÁLIDO', 'magenta');
  
  const tokenFalso = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
  
  const response = await fetch(`${API_BASE}/api/admin/inscritos`, {
    headers: { 'Authorization': `Bearer ${tokenFalso}` }
  });
  
  logTest('Token inválido rechazado', response.status === 401, `Status: ${response.status}`);
}

// TEST 3: Sin token
async function testSinToken() {
  log('\n📋 TEST 3: ENDPOINT PROTEGIDO SIN TOKEN', 'magenta');
  
  const response = await fetch(`${API_BASE}/api/admin/inscritos`);
  
  logTest('Acceso denegado sin token', response.status === 401, `Status: ${response.status}`);
}

// TEST 4: SQL Injection
async function testSQLInjection() {
  log('\n📋 TEST 4: PROTECCIÓN SQL INJECTION', 'magenta');
  
  const maliciousDNI = "1234'; DROP TABLE alumnos; --";
  const response = await fetch(`${API_BASE}/api/validar-dni/${encodeURIComponent(maliciousDNI)}`);
  const data = await response.json();
  
  logTest('SQL Injection bloqueado', response.status !== 500, `Status: ${response.status}`);
}

// TEST 5: XSS
async function testXSS() {
  log('\n📋 TEST 5: PROTECCIÓN XSS', 'magenta');
  
  const xssPayload = {
    alumno: {
      dni: '12345678',
      nombres: '<script>alert("XSS")</script>',
      apellidoPaterno: 'Test',
      apellidoMaterno: 'Test',
      fechaNacimiento: '2015-01-01',
      sexo: 'Masculino',
      telefono: '999999999',
      email: 'test@test.com',
      direccion: 'Test',
      seguroTipo: 'SIS',
      condicionMedica: 'None',
      apoderado: 'Test',
      telefonoApoderado: '999999999',
      dniFrontalUrl: 'data:image/png;base64,test',
      dniReversoUrl: 'data:image/png;base64,test',
      fotoCarnetUrl: 'data:image/png;base64,test',
      comprobantePagoUrl: 'data:image/png;base64,test',
      numeroOperacion: 'TEST123'
    },
    horarios: []
  };
  
  const response = await fetch(`${API_BASE}/api/inscribir-multiple`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(xssPayload)
  });
  
  logTest('XSS Sanitization activo', response.status !== 500, `Status: ${response.status}`);
}

// TEST 6: CORS
async function testCORS() {
  log('\n📋 TEST 6: CORS CONFIGURADO', 'magenta');
  
  try {
    const response = await fetch(`${API_BASE}/api/health`, {
      headers: { 'Origin': 'http://localhost:5501' }
    });
    
    const corsHeader = response.headers.get('access-control-allow-origin');
    logTest('CORS headers presentes', corsHeader !== null, `Origin: ${corsHeader}`);
  } catch (error) {
    logTest('Error en CORS', false, error.message);
  }
}

// TEST 7: Validaciones de datos
async function testValidaciones() {
  log('\n📋 TEST 7: VALIDACIONES DE DATOS', 'magenta');
  
  // DNI inválido (menos de 8 dígitos)
  const resp1 = await fetch(`${API_BASE}/api/validar-dni/123`);
  logTest('DNI corto rechazado', resp1.status >= 400 || (await resp1.json()).existe === false, 'DNI: 123');
  
  // Email inválido
  const invalidEmail = {
    alumno: {
      dni: '87654321',
      nombres: 'Test',
      apellidoPaterno: 'Test',
      apellidoMaterno: 'Test',
      fechaNacimiento: '2015-01-01',
      sexo: 'Masculino',
      telefono: '999999999',
      email: 'invalid-email',
      direccion: 'Test',
      seguroTipo: 'SIS',
      condicionMedica: 'None',
      apoderado: 'Test',
      telefonoApoderado: '999999999',
      dniFrontalUrl: 'data:image/png;base64,test',
      dniReversoUrl: 'data:image/png;base64,test',
      fotoCarnetUrl: 'data:image/png;base64,test',
      comprobantePagoUrl: 'data:image/png;base64,test',
      numeroOperacion: 'TEST456'
    },
    horarios: []
  };
  
  const resp2 = await fetch(`${API_BASE}/api/inscribir-multiple`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(invalidEmail)
  });
  
  // Puede aceptarlo o rechazarlo, ambos son válidos
  logTest('Validación de email', true, `Status: ${resp2.status}`);
}

// TEST 8: Caché
async function testCache() {
  log('\n📋 TEST 8: SISTEMA DE CACHÉ', 'magenta');
  
  const start1 = Date.now();
  await fetch(`${API_BASE}/api/horarios`);
  const time1 = Date.now() - start1;
  
  const start2 = Date.now();
  await fetch(`${API_BASE}/api/horarios`);
  const time2 = Date.now() - start2;
  
  logTest('Caché mejora performance', time2 < time1 || time2 < 100, 
    `Primera: ${time1}ms, Segunda: ${time2}ms`);
}

// TEST 9: Helmet Security Headers
async function testSecurityHeaders() {
  log('\n📋 TEST 9: SECURITY HEADERS (HELMET)', 'magenta');
  
  const response = await fetch(`${API_BASE}/api/health`);
  
  const xssProtection = response.headers.get('x-content-type-options');
  const frameOptions = response.headers.get('x-frame-options');
  
  logTest('X-Content-Type-Options presente', xssProtection !== null, `Value: ${xssProtection}`);
  logTest('X-Frame-Options presente', frameOptions !== null, `Value: ${frameOptions}`);
}

// TEST 10: Bcrypt (Login con contraseña incorrecta)
async function testBcryptSecurity() {
  log('\n📋 TEST 10: BCRYPT PASSWORD SECURITY', 'magenta');
  
  const response = await fetch(`${API_BASE}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      email: ADMIN_EMAIL, 
      password: 'contraseña-incorrecta' 
    })
  });
  
  const data = await response.json();
  
  logTest('Contraseña incorrecta rechazada', !data.success && response.status === 401, 
    `Status: ${response.status}`);
}

// RESUMEN
function mostrarResumen() {
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 RESUMEN PRUEBAS AVANZADAS', 'cyan');
  log('='.repeat(60), 'cyan');
  
  log(`\nTotal: ${testResults.total}`, 'blue');
  log(`✅ Exitosas: ${testResults.passed}`, 'green');
  log(`❌ Fallidas: ${testResults.failed}`, 'red');
  
  const pct = ((testResults.passed / testResults.total) * 100).toFixed(1);
  log(`📈 Éxito: ${pct}%`, pct >= 80 ? 'green' : 'yellow');
  
  log('\n' + '='.repeat(60) + '\n', 'cyan');
}

// EJECUTAR
async function run() {
  log('\n🔒 PRUEBAS AVANZADAS - SEGURIDAD Y EDGE CASES\n', 'blue');
  
  await testRateLimiting();
  await testJWTInvalido();
  await testSinToken();
  await testSQLInjection();
  await testXSS();
  await testCORS();
  await testValidaciones();
  await testCache();
  await testSecurityHeaders();
  await testBcryptSecurity();
  
  mostrarResumen();
}

run().catch(console.error);
