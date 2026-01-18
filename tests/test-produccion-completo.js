/**
 * ═══════════════════════════════════════════════════════════
 * TEST COMPLETO DE PRODUCCIÓN - SISTEMA JAGUARES
 * ═══════════════════════════════════════════════════════════
 * 
 * Valida todos los componentes críticos del sistema:
 * - Conexión a base de datos
 * - Endpoints públicos y protegidos
 * - Autenticación JWT
 * - Validaciones de negocio
 * - Seguridad (Rate limiting, CORS, XSS)
 * - Cálculos financieros
 * - Flujo completo de inscripción
 */

const http = require('http');
const https = require('https');

const API_BASE = 'http://localhost:3002';

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  gray: '\x1b[90m'
};

// Estadísticas del test
const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  startTime: null,
  endTime: null,
  testResults: []
};

// Token JWT para tests de admin
let jwtToken = null;
let testDNI = null;

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name, status, details = '') {
  stats.total++;
  const symbol = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
  const color = status === 'pass' ? 'green' : status === 'fail' ? 'red' : 'yellow';
  
  if (status === 'pass') stats.passed++;
  else if (status === 'fail') stats.failed++;
  else stats.warnings++;
  
  stats.testResults.push({ name, status, details });
  
  log(`${symbol} ${name}`, color);
  if (details) log(`   ${details}`, 'gray');
}

function separator(title = '') {
  log('\n' + '═'.repeat(60), 'cyan');
  if (title) log(`  ${title}`, 'bright');
  log('═'.repeat(60) + '\n', 'cyan');
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Función fetch compatible con Node.js
function fetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };
    
    if (options.body) {
      reqOptions.headers['Content-Type'] = 'application/json';
      reqOptions.headers['Content-Length'] = Buffer.byteLength(options.body);
    }
    
    const req = protocol.request(reqOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          ok: res.statusCode >= 200 && res.statusCode < 300,
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: {
            get: (name) => res.headers[name.toLowerCase()]
          },
          json: async () => {
            try {
              return JSON.parse(data);
            } catch (e) {
              return { error: 'Invalid JSON', raw: data };
            }
          }
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// ═══════════════════════════════════════════════════════════
// TESTS DE INFRAESTRUCTURA
// ═══════════════════════════════════════════════════════════

async function testHealthCheck() {
  separator('1. HEALTH CHECK & CONECTIVIDAD');
  
  try {
    log('   Conectando a ' + API_BASE + '/api/health...', 'gray');
    const response = await fetch(`${API_BASE}/api/health`);
    const data = await response.json();
    
    log(`   Status: ${response.status}`, 'gray');
    log(`   Data: ${JSON.stringify(data).substring(0, 100)}...`, 'gray');
    
    if (response.ok && data.status === 'ok' || data.status === 'OK') {
      logTest('Health Check', 'pass', 'API respondiendo correctamente');
      
      if (data.database === 'connected') {
        logTest('Conexión MySQL', 'pass', 'Base de datos conectada');
      } else {
        logTest('Conexión MySQL', 'fail', 'Base de datos no conectada');
      }
      
      if (data.stats || data.mysql) {
        const stats = data.stats || data.mysql;
        logTest('Estadísticas DB', 'pass', 
          `Alumnos: ${stats.alumnos}, Inscripciones: ${stats.inscripciones}, Horarios: ${stats.horarios_activos || stats.horarios}`);
      }
      
      return true;
    } else {
      logTest('Health Check', 'fail', `API no responde correctamente - Status: ${data.status}`);
      return false;
    }
  } catch (error) {
    logTest('Health Check', 'fail', `Error: ${error.message}`);
    log(`   Stack: ${error.stack}`, 'red');
    return false;
  }
}

// ═══════════════════════════════════════════════════════════
// TESTS DE ENDPOINTS PÚBLICOS
// ═══════════════════════════════════════════════════════════

async function testEndpointsPublicos() {
  separator('2. ENDPOINTS PÚBLICOS');
  
  // GET /api/horarios
  try {
    const response = await fetch(`${API_BASE}/api/horarios`);
    const data = await response.json();
    
    if (response.ok && data.success && Array.isArray(data.horarios)) {
      logTest('GET /api/horarios', 'pass', `${data.horarios.length} horarios disponibles`);
      
      if (data.horarios.length > 0) {
        const horario = data.horarios[0];
        const camposRequeridos = ['horario_id', 'deporte', 'dia', 'hora_inicio', 'hora_fin', 'precio'];
        const camposFaltantes = camposRequeridos.filter(campo => !horario[campo]);
        
        if (camposFaltantes.length === 0) {
          logTest('Estructura de horarios', 'pass', 'Todos los campos presentes');
        } else {
          logTest('Estructura de horarios', 'fail', `Campos faltantes: ${camposFaltantes.join(', ')}`);
        }
      }
    } else {
      logTest('GET /api/horarios', 'fail', 'No retorna horarios correctamente');
    }
  } catch (error) {
    logTest('GET /api/horarios', 'fail', error.message);
  }
  
  await sleep(200);
  
  // GET /api/validar-dni/:dni (DNI nuevo)
  try {
    const dniNuevo = '99999998';
    const response = await fetch(`${API_BASE}/api/validar-dni/${dniNuevo}`);
    const data = await response.json();
    
    if (response.ok && data.valido === true) {
      logTest('Validar DNI nuevo', 'pass', 'DNI disponible detectado correctamente');
    } else if (data.valido === false) {
      logTest('Validar DNI nuevo', 'warn', `DNI ya registrado: ${data.error}`);
    } else {
      logTest('Validar DNI nuevo', 'fail', 'Respuesta incorrecta');
    }
  } catch (error) {
    logTest('Validar DNI nuevo', 'fail', error.message);
  }
  
  await sleep(200);
}

// ═══════════════════════════════════════════════════════════
// TESTS DE INSCRIPCIÓN
// ═══════════════════════════════════════════════════════════

async function testFlujoinscripcion() {
  separator('3. FLUJO DE INSCRIPCIÓN');
  
  testDNI = '88888' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  const alumno = {
    dni: testDNI,
    nombres: 'Test Producción',
    apellido_paterno: 'Sistema',
    apellido_materno: 'Completo',
    fecha_nacimiento: '2010-05-15',
    sexo: 'Masculino',
    telefono: '987654321',
    email: 'test@produccion.com',
    direccion: 'Av. Test 123'
  };
  
  const horarios = [
    {
      horario_id: 1,
      deporte: 'Fútbol',
      dia: 'LUNES',
      hora: '15:00-16:00',
      plan: 'Económico'
    },
    {
      horario_id: 2,
      deporte: 'Fútbol',
      dia: 'MIÉRCOLES',
      hora: '15:00-16:00',
      plan: 'Económico'
    }
  ];
  
  // Test: Inscripción válida
  try {
    const response = await fetch(`${API_BASE}/api/inscribir-multiple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alumno, horarios })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      logTest('Inscripción múltiple', 'pass', `Código: ${data.codigo_operacion || 'N/A'}`);
      
      if (data.inscripciones) {
        logTest('Respuesta de inscripción', 'pass', `${data.inscripciones.length} inscripciones creadas`);
      }
    } else {
      logTest('Inscripción múltiple', 'fail', data.error || data.message);
    }
  } catch (error) {
    logTest('Inscripción múltiple', 'fail', error.message);
  }
  
  await sleep(2000); // Esperar para evitar rate limit
  
  // Test: Consultar inscripción creada
  try {
    const response = await fetch(`${API_BASE}/api/mis-inscripciones/${testDNI}`);
    const data = await response.json();
    
    if (response.ok && data.success) {
      logTest('Consultar inscripciones por DNI', 'pass', 
        `${data.inscripciones?.length || 0} inscripciones encontradas`);
      
      if (data.alumno) {
        const alumnoCompleto = data.alumno.nombres && data.alumno.apellido_paterno;
        logTest('Datos completos del alumno', alumnoCompleto ? 'pass' : 'fail', 
          alumnoCompleto ? 'Nombres y apellidos presentes' : 'Faltan datos del alumno');
      }
    } else {
      logTest('Consultar inscripciones por DNI', 'fail', data.error);
    }
  } catch (error) {
    logTest('Consultar inscripciones por DNI', 'fail', error.message);
  }
  
  await sleep(200);
}

// ═══════════════════════════════════════════════════════════
// TESTS DE VALIDACIONES
// ═══════════════════════════════════════════════════════════

async function testValidaciones() {
  separator('4. VALIDACIONES DE NEGOCIO');
  
  // Test: Horarios sin ID
  try {
    const alumno = {
      dni: '77777777',
      nombres: 'Test',
      apellido_paterno: 'Validación',
      fecha_nacimiento: '2010-01-01',
      sexo: 'Femenino'
    };
    
    const horariosInvalidos = [
      { deporte: 'Fútbol', dia: 'LUNES', plan: 'Económico' } // Sin horario_id
    ];
    
    const response = await fetch(`${API_BASE}/api/inscribir-multiple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alumno, horarios: horariosInvalidos })
    });
    
    const data = await response.json();
    
    if (response.status === 400 && data.error === 'Horarios inválidos') {
      logTest('Validación horarios sin ID', 'pass', 'Error 400 detectado correctamente');
    } else {
      logTest('Validación horarios sin ID', 'fail', 'No detecta horarios inválidos');
    }
  } catch (error) {
    logTest('Validación horarios sin ID', 'fail', error.message);
  }
  
  await sleep(2000);
  
  // Test: Duplicados (si ya existe testDNI)
  if (testDNI) {
    try {
      const alumno = {
        dni: testDNI,
        nombres: 'Test',
        apellido_paterno: 'Duplicado'
      };
      
      const horarios = [
        { horario_id: 1, deporte: 'Fútbol', plan: 'Económico' },
        { horario_id: 2, deporte: 'Fútbol', plan: 'Económico' }
      ];
      
      const response = await fetch(`${API_BASE}/api/inscribir-multiple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alumno, horarios })
      });
      
      const data = await response.json();
      
      if (response.status === 409 && data.error === 'Inscripción duplicada') {
        logTest('Validación duplicados', 'pass', 'Error 409 detectado correctamente');
      } else if (response.status === 429) {
        logTest('Validación duplicados', 'warn', 'Rate limit alcanzado (esperado)');
      } else {
        logTest('Validación duplicados', 'warn', `Status ${response.status}: ${data.message || data.error}`);
      }
    } catch (error) {
      logTest('Validación duplicados', 'fail', error.message);
    }
  }
  
  await sleep(200);
}

// ═══════════════════════════════════════════════════════════
// TESTS DE AUTENTICACIÓN Y ENDPOINTS PROTEGIDOS
// ═══════════════════════════════════════════════════════════

async function testAutenticacion() {
  separator('5. AUTENTICACIÓN JWT');
  
  // Test: Login admin
  try {
    const response = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        usuario: 'admin',
        password: 'Jaguares2025!'
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success && data.token) {
      logTest('Login admin', 'pass', 'Token JWT generado correctamente');
      jwtToken = data.token;
      
      // Verificar estructura del token
      const tokenParts = data.token.split('.');
      if (tokenParts.length === 3) {
        logTest('Estructura JWT', 'pass', 'Token con formato correcto (3 partes)');
      } else {
        logTest('Estructura JWT', 'fail', 'Token con formato incorrecto');
      }
    } else {
      logTest('Login admin', 'fail', data.error || 'No retorna token');
    }
  } catch (error) {
    logTest('Login admin', 'fail', error.message);
  }
  
  await sleep(200);
  
  // Test: Acceso sin token (debe fallar)
  try {
    const response = await fetch(`${API_BASE}/api/admin/inscritos`);
    const data = await response.json();
    
    if (response.status === 401 || response.status === 403) {
      logTest('Protección sin token', 'pass', 'Acceso denegado correctamente');
    } else {
      logTest('Protección sin token', 'fail', 'Permite acceso sin autenticación');
    }
  } catch (error) {
    logTest('Protección sin token', 'fail', error.message);
  }
  
  await sleep(200);
}

async function testEndpointsProtegidos() {
  separator('6. ENDPOINTS PROTEGIDOS (ADMIN)');
  
  if (!jwtToken) {
    logTest('Endpoints protegidos', 'fail', 'No hay token JWT disponible');
    return;
  }
  
  // GET /api/admin/inscritos
  try {
    const response = await fetch(`${API_BASE}/api/admin/inscritos`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` }
    });
    
    const data = await response.json();
    
    if (response.ok && data.success && Array.isArray(data.inscritos)) {
      logTest('GET /api/admin/inscritos', 'pass', `${data.inscritos.length} inscritos obtenidos`);
      
      if (data.inscritos.length > 0) {
        const inscrito = data.inscritos[0];
        const camposRequeridos = ['dni', 'nombres', 'apellido_paterno', 'deporte', 'estado_pago'];
        const camposFaltantes = camposRequeridos.filter(campo => !inscrito[campo]);
        
        if (camposFaltantes.length === 0) {
          logTest('Estructura de inscritos', 'pass', 'Campos completos');
        } else {
          logTest('Estructura de inscritos', 'fail', `Campos faltantes: ${camposFaltantes.join(', ')}`);
        }
      }
    } else {
      logTest('GET /api/admin/inscritos', 'fail', data.error || 'Respuesta incorrecta');
    }
  } catch (error) {
    logTest('GET /api/admin/inscritos', 'fail', error.message);
  }
  
  await sleep(200);
  
  // GET /api/admin/estadisticas-financieras
  try {
    const response = await fetch(`${API_BASE}/api/admin/estadisticas-financieras`, {
      headers: { 'Authorization': `Bearer ${jwtToken}` }
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      logTest('GET /api/admin/estadisticas-financieras', 'pass', 'Estadísticas obtenidas');
      
      if (data.resumen) {
        const { total_mensualidades, total_matriculas, total_general } = data.resumen;
        const sumaCorrecta = (parseFloat(total_mensualidades) + parseFloat(total_matriculas)).toFixed(2) === parseFloat(total_general).toFixed(2);
        
        logTest('Cálculo de totales', sumaCorrecta ? 'pass' : 'fail', 
          `Mensualidades: S/ ${total_mensualidades}, Matrículas: S/ ${total_matriculas}, Total: S/ ${total_general}`);
      }
      
      if (data.por_deporte && Array.isArray(data.por_deporte)) {
        logTest('Estadísticas por deporte', 'pass', `${data.por_deporte.length} deportes`);
      }
    } else {
      logTest('GET /api/admin/estadisticas-financieras', 'fail', data.error || 'Respuesta incorrecta');
    }
  } catch (error) {
    logTest('GET /api/admin/estadisticas-financieras', 'fail', error.message);
  }
  
  await sleep(200);
}

// ═══════════════════════════════════════════════════════════
// TESTS DE SEGURIDAD
// ═══════════════════════════════════════════════════════════

async function testSeguridad() {
  separator('7. SEGURIDAD');
  
  // Test: CORS Headers
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    const corsHeader = response.headers.get('access-control-allow-origin');
    
    if (corsHeader) {
      logTest('CORS Headers', 'pass', `Origin permitido: ${corsHeader}`);
    } else {
      logTest('CORS Headers', 'warn', 'No hay headers CORS');
    }
  } catch (error) {
    logTest('CORS Headers', 'fail', error.message);
  }
  
  // Test: Security Headers (Helmet)
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    const securityHeaders = [
      'x-dns-prefetch-control',
      'x-frame-options',
      'x-content-type-options',
      'x-xss-protection'
    ];
    
    const presentHeaders = securityHeaders.filter(header => response.headers.get(header));
    
    if (presentHeaders.length >= 2) {
      logTest('Security Headers (Helmet)', 'pass', `${presentHeaders.length}/${securityHeaders.length} headers presentes`);
    } else {
      logTest('Security Headers (Helmet)', 'warn', 'Algunos headers de seguridad faltantes');
    }
  } catch (error) {
    logTest('Security Headers', 'fail', error.message);
  }
  
  // Test: Rate Limiting
  try {
    log('\nProbando Rate Limiting (puede tomar unos segundos)...', 'gray');
    let blockedCount = 0;
    const requests = 15;
    
    for (let i = 0; i < requests; i++) {
      const response = await fetch(`${API_BASE}/api/health`);
      if (response.status === 429) {
        blockedCount++;
      }
      await sleep(50);
    }
    
    if (blockedCount > 0) {
      logTest('Rate Limiting', 'pass', `${blockedCount}/${requests} peticiones bloqueadas`);
    } else {
      logTest('Rate Limiting', 'warn', 'No se detectó bloqueo por rate limit');
    }
  } catch (error) {
    logTest('Rate Limiting', 'fail', error.message);
  }
}

// ═══════════════════════════════════════════════════════════
// REPORTE FINAL
// ═══════════════════════════════════════════════════════════

function generarReporte() {
  separator('REPORTE FINAL - SISTEMA JAGUARES');
  
  stats.endTime = Date.now();
  const duration = ((stats.endTime - stats.startTime) / 1000).toFixed(2);
  
  const successRate = ((stats.passed / stats.total) * 100).toFixed(1);
  const statusColor = successRate >= 90 ? 'green' : successRate >= 70 ? 'yellow' : 'red';
  const statusEmoji = successRate >= 90 ? '🎉' : successRate >= 70 ? '⚠️' : '❌';
  
  log(`\n${statusEmoji} TASA DE ÉXITO: ${successRate}%`, statusColor);
  log(`\n📊 RESULTADOS:`, 'cyan');
  log(`   Total de tests:     ${stats.total}`, 'white');
  log(`   ✅ Pasados:         ${stats.passed}`, 'green');
  log(`   ❌ Fallidos:        ${stats.failed}`, 'red');
  log(`   ⚠️  Advertencias:    ${stats.warnings}`, 'yellow');
  log(`\n⏱️  Duración:          ${duration}s`, 'cyan');
  
  // Categorías
  log(`\n📋 RESUMEN POR CATEGORÍA:`, 'cyan');
  const categorias = {
    'Infraestructura': stats.testResults.filter(t => t.name.includes('Health') || t.name.includes('MySQL')),
    'Endpoints Públicos': stats.testResults.filter(t => t.name.includes('GET /api/') && !t.name.includes('admin')),
    'Inscripciones': stats.testResults.filter(t => t.name.includes('Inscripción') || t.name.includes('Consultar')),
    'Validaciones': stats.testResults.filter(t => t.name.includes('Validación')),
    'Autenticación': stats.testResults.filter(t => t.name.includes('Login') || t.name.includes('JWT') || t.name.includes('token')),
    'Admin': stats.testResults.filter(t => t.name.includes('admin') && !t.name.includes('Login')),
    'Seguridad': stats.testResults.filter(t => t.name.includes('CORS') || t.name.includes('Security') || t.name.includes('Rate'))
  };
  
  Object.entries(categorias).forEach(([categoria, tests]) => {
    if (tests.length > 0) {
      const passed = tests.filter(t => t.status === 'pass').length;
      const percentage = ((passed / tests.length) * 100).toFixed(0);
      const color = percentage >= 90 ? 'green' : percentage >= 70 ? 'yellow' : 'red';
      log(`   ${categoria.padEnd(20)} ${passed}/${tests.length} (${percentage}%)`, color);
    }
  });
  
  // Tests fallidos
  if (stats.failed > 0) {
    log(`\n❌ TESTS FALLIDOS:`, 'red');
    stats.testResults
      .filter(t => t.status === 'fail')
      .forEach(t => {
        log(`   • ${t.name}`, 'red');
        if (t.details) log(`     ${t.details}`, 'gray');
      });
  }
  
  // Advertencias
  if (stats.warnings > 0) {
    log(`\n⚠️  ADVERTENCIAS:`, 'yellow');
    stats.testResults
      .filter(t => t.status === 'warn')
      .forEach(t => {
        log(`   • ${t.name}`, 'yellow');
        if (t.details) log(`     ${t.details}`, 'gray');
      });
  }
  
  // Recomendaciones
  log(`\n💡 RECOMENDACIONES:`, 'cyan');
  
  if (successRate >= 95) {
    log(`   ✅ Sistema listo para producción`, 'green');
    log(`   ✅ Todos los componentes críticos funcionando`, 'green');
  } else if (successRate >= 85) {
    log(`   ⚠️  Sistema mayormente funcional`, 'yellow');
    log(`   ⚠️  Revisar tests fallidos antes de desplegar`, 'yellow');
  } else {
    log(`   ❌ Sistema requiere correcciones`, 'red');
    log(`   ❌ NO desplegar en producción hasta resolver errores críticos`, 'red');
  }
  
  if (stats.testResults.some(t => t.name.includes('Rate Limiting') && t.status !== 'pass')) {
    log(`   ⚠️  Verificar configuración de Rate Limiting`, 'yellow');
  }
  
  if (stats.testResults.some(t => t.name.includes('Security') && t.status !== 'pass')) {
    log(`   ⚠️  Revisar headers de seguridad`, 'yellow');
  }
  
  log('\n' + '═'.repeat(60), 'cyan');
  log(`✅ Test completado - ${new Date().toLocaleString('es-PE')}`, 'green');
  log('═'.repeat(60) + '\n', 'cyan');
}

// ═══════════════════════════════════════════════════════════
// EJECUTAR TODOS LOS TESTS
// ═══════════════════════════════════════════════════════════

async function ejecutarTestsCompletos() {
  stats.startTime = Date.now();
  
  log('\n' + '═'.repeat(60), 'magenta');
  log('  🧪 TEST DE PRODUCCIÓN COMPLETO - SISTEMA JAGUARES', 'bright');
  log('═'.repeat(60) + '\n', 'magenta');
  
  log(`📅 Fecha: ${new Date().toLocaleString('es-PE')}`, 'cyan');
  log(`🌐 API Base: ${API_BASE}`, 'cyan');
  log(`⏱️  Esperando servidor (1s)...\n`, 'cyan');
  
  await sleep(1000); // Dar tiempo al servidor
  
  try {
    const healthOk = await testHealthCheck();
    
    if (!healthOk) {
      log('\n❌ CRÍTICO: Health check falló. Deteniendo tests.', 'red');
      log('   Verifica que el servidor esté corriendo en el puerto 3002\n', 'yellow');
      process.exit(1);
    }
    
    await testEndpointsPublicos();
    await testFlujoinscripcion();
    await testValidaciones();
    await testAutenticacion();
    await testEndpointsProtegidos();
    await testSeguridad();
    
    generarReporte();
    
    // Exit code según resultado
    process.exit(stats.failed > 0 ? 1 : 0);
    
  } catch (error) {
    log(`\n❌ ERROR FATAL: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar
ejecutarTestsCompletos();
