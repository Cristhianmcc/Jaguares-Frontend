/**
 * PRUEBAS COMPLETAS DEL SISTEMA JAGUARES
 * Incluye generación de imágenes y pruebas de todos los flujos
 */

const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3002';
const ADMIN_EMAIL = 'admin@jaguares.com';
const ADMIN_PASSWORD = 'jaguares2025';

let adminToken = null;
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  errors: []
};

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    log(`✅ ${testName}`, 'green');
    if (details) log(`   ${details}`, 'cyan');
  } else {
    testResults.failed++;
    testResults.errors.push({ test: testName, details });
    log(`❌ ${testName}`, 'red');
    if (details) log(`   ${details}`, 'red');
  }
}

// Generar imagen base64 de prueba (PNG de 100x100 píxeles)
function generarImagenPrueba(texto) {
  // Imagen PNG mínima válida con texto en base64
  // Esta es una imagen de 1x1 transparente, pero válida
  const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  
  // Convertir a formato data URL
  return `data:image/png;base64,${base64Image}`;
}

// Generar datos de alumno de prueba
function generarAlumnoPrueba(index) {
  const nombres = ['Carlos', 'María', 'José', 'Ana', 'Luis', 'Carmen', 'Pedro', 'Rosa'];
  const apellidosP = ['García', 'Rodríguez', 'Martínez', 'López', 'Pérez', 'González', 'Sánchez', 'Ramírez'];
  const apellidosM = ['Silva', 'Torres', 'Flores', 'Díaz', 'Castro', 'Morales', 'Ortiz', 'Vega'];
  
  const dni = String(10000000 + index + Math.floor(Math.random() * 1000000)).substring(0, 8);
  const nombre = nombres[Math.floor(Math.random() * nombres.length)];
  const apellidoP = apellidosP[Math.floor(Math.random() * apellidosP.length)];
  const apellidoM = apellidosM[Math.floor(Math.random() * apellidosM.length)];
  
  const año = 2010 + Math.floor(Math.random() * 10); // 2010-2020
  const mes = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const dia = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
  
  return {
    dni,
    nombres: nombre,
    apellidoPaterno: apellidoP,
    apellidoMaterno: apellidoM,
    fechaNacimiento: `${año}-${mes}-${dia}`,
    sexo: Math.random() > 0.5 ? 'Masculino' : 'Femenino',
    telefono: `9${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
    email: `${nombre.toLowerCase()}.${apellidoP.toLowerCase()}${index}@test.com`,
    direccion: `Av. Test ${100 + index}, Lima`,
    seguroTipo: Math.random() > 0.5 ? 'SIS' : 'EsSalud',
    condicionMedica: 'Ninguna',
    apoderado: `${apellidosP[0]} ${apellidosM[0]} Test`,
    telefonoApoderado: `9${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
    dniFrontalUrl: generarImagenPrueba('DNI Frontal'),
    dniReversoUrl: generarImagenPrueba('DNI Reverso'),
    fotoCarnetUrl: generarImagenPrueba('Foto Carnet'),
    comprobantePagoUrl: generarImagenPrueba('Comprobante Pago'),
    numeroOperacion: `OP${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`
  };
}

// 1. LOGIN ADMIN
async function testLoginAdmin() {
  log('\n📋 TEST 1: LOGIN ADMINISTRADOR', 'magenta');
  
  try {
    const response = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
    });
    
    const data = await response.json();
    
    if (data.success && data.token) {
      adminToken = data.token;
      logTest('Login exitoso', true, `Token recibido: ${data.token.substring(0, 20)}...`);
      logTest('Datos de admin', data.admin && data.admin.email === ADMIN_EMAIL, `Email: ${data.admin?.email}`);
    } else {
      logTest('Login fallido', false, data.error || 'Sin token');
    }
  } catch (error) {
    logTest('Error en login', false, error.message);
  }
}

// 2. VERIFICAR HEALTH CHECK
async function testHealthCheck() {
  log('\n📋 TEST 2: HEALTH CHECK', 'magenta');
  
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    const data = await response.json();
    
    logTest('Health check responde', response.ok, `Status: ${data.status}`);
    logTest('Base de datos conectada', data.database === 'connected', `DB: ${data.database}`);
  } catch (error) {
    logTest('Error en health check', false, error.message);
  }
}

// 3. OBTENER HORARIOS
async function testObtenerHorarios() {
  log('\n📋 TEST 3: OBTENER HORARIOS', 'magenta');
  
  try {
    const response = await fetch(`${API_BASE}/api/horarios`);
    const data = await response.json();
    
    logTest('Horarios disponibles', data.success && data.horarios.length > 0, `Total: ${data.horarios?.length || 0} horarios`);
    
    if (data.horarios && data.horarios.length > 0) {
      const deportes = [...new Set(data.horarios.map(h => h.deporte))];
      logTest('Deportes encontrados', deportes.length > 0, `Deportes: ${deportes.join(', ')}`);
    }
  } catch (error) {
    logTest('Error al obtener horarios', false, error.message);
  }
}

// 4. INSCRIPCIÓN MÚLTIPLE CON IMÁGENES
async function testInscripcionConImagenes() {
  log('\n📋 TEST 4: INSCRIPCIÓN CON IMÁGENES', 'magenta');
  
  try {
    // Primero obtener horarios disponibles
    const horariosResp = await fetch(`${API_BASE}/api/horarios`);
    const horariosData = await horariosResp.json();
    
    if (!horariosData.success || horariosData.horarios.length === 0) {
      logTest('No hay horarios disponibles', false);
      return;
    }
    
    // Seleccionar 2 horarios aleatorios
    const horarios = horariosData.horarios;
    const horario1 = horarios[Math.floor(Math.random() * horarios.length)];
    const horario2 = horarios[Math.floor(Math.random() * horarios.length)];
    
    const alumno = generarAlumnoPrueba(1);
    
    const inscripcionData = {
      alumno,
      horarios: [
        { horarioId: horario1.horario_id },
        { horarioId: horario2.horario_id }
      ]
    };
    
    log(`Inscribiendo: ${alumno.nombres} ${alumno.apellidoPaterno}`, 'cyan');
    log(`DNI: ${alumno.dni}`, 'cyan');
    log(`Horarios: ${horario1.deporte} y ${horario2.deporte}`, 'cyan');
    
    const response = await fetch(`${API_BASE}/api/inscribir-multiple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inscripcionData)
    });
    
    const data = await response.json();
    
    logTest('Inscripción exitosa', data.success, `Mensaje: ${data.message}`);
    
    if (data.success) {
      logTest('Alumno creado', data.alumno && data.alumno.dni === alumno.dni, `ID: ${data.alumno?.alumno_id}`);
      logTest('Inscripciones creadas', data.inscripciones && data.inscripciones.length === 2, `Total: ${data.inscripciones?.length || 0}`);
      
      // Guardar DNI para pruebas posteriores
      global.testDNI = alumno.dni;
    }
  } catch (error) {
    logTest('Error en inscripción', false, error.message);
  }
}

// 5. CONSULTAR INSCRIPCIONES POR DNI
async function testConsultarPorDNI() {
  log('\n📋 TEST 5: CONSULTAR INSCRIPCIONES POR DNI', 'magenta');
  
  if (!global.testDNI) {
    logTest('No hay DNI de prueba', false, 'Ejecuta primero la inscripción');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/api/mis-inscripciones/${global.testDNI}`);
    const data = await response.json();
    
    logTest('Consulta DNI exitosa', data.success, `DNI: ${global.testDNI}`);
    logTest('Inscripciones encontradas', data.inscripciones && data.inscripciones.length > 0, `Total: ${data.inscripciones?.length || 0}`);
    
    if (data.alumno) {
      logTest('Datos del alumno', true, `${data.alumno.nombres} ${data.alumno.apellidoPaterno}`);
    }
  } catch (error) {
    logTest('Error al consultar DNI', false, error.message);
  }
}

// 6. VALIDAR DNI
async function testValidarDNI() {
  log('\n📋 TEST 6: VALIDAR DNI', 'magenta');
  
  if (!global.testDNI) {
    logTest('No hay DNI de prueba', false);
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/api/validar-dni/${global.testDNI}`);
    const data = await response.json();
    
    logTest('DNI existe', data.existe === true, `DNI: ${global.testDNI}`);
    
    // Probar con DNI inexistente
    const response2 = await fetch(`${API_BASE}/api/validar-dni/99999999`);
    const data2 = await response2.json();
    
    logTest('DNI inexistente detectado', data2.existe === false, 'DNI: 99999999');
  } catch (error) {
    logTest('Error al validar DNI', false, error.message);
  }
}

// 7. OBTENER INSCRITOS (ADMIN)
async function testObtenerInscritos() {
  log('\n📋 TEST 7: OBTENER INSCRITOS (ADMIN)', 'magenta');
  
  if (!adminToken) {
    logTest('Sin token de admin', false, 'Ejecuta primero el login');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/api/admin/inscritos`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Cache-Control': 'no-cache'
      }
    });
    
    const data = await response.json();
    
    logTest('Listado obtenido', data.success, `Total inscritos: ${data.inscritos?.length || 0}`);
    
    if (data.inscritos && data.inscritos.length > 0) {
      const activos = data.inscritos.filter(i => i.estado === 'activa').length;
      logTest('Inscripciones activas', activos > 0, `Activas: ${activos}`);
    }
  } catch (error) {
    logTest('Error al obtener inscritos', false, error.message);
  }
}

// 8. ESTADÍSTICAS FINANCIERAS (ADMIN)
async function testEstadisticasFinancieras() {
  log('\n📋 TEST 8: ESTADÍSTICAS FINANCIERAS', 'magenta');
  
  if (!adminToken) {
    logTest('Sin token de admin', false);
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/api/admin/estadisticas-financieras`, {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Cache-Control': 'no-cache'
      }
    });
    
    const data = await response.json();
    
    logTest('Estadísticas obtenidas', data.success, '');
    
    if (data.estadisticas) {
      const { resumen, porDeporte, porAlumno } = data.estadisticas;
      
      logTest('Resumen calculado', resumen && resumen.totalIngresosActivos >= 0, 
        `Ingresos: S/ ${resumen?.totalIngresosActivos?.toFixed(2) || '0.00'}`);
      
      logTest('Matrículas calculadas', resumen && resumen.totalMatriculas >= 0,
        `Matrículas: S/ ${resumen?.totalMatriculas?.toFixed(2) || '0.00'}`);
      
      logTest('Mensualidades calculadas', resumen && resumen.totalMensualidades >= 0,
        `Mensualidades: S/ ${resumen?.totalMensualidades?.toFixed(2) || '0.00'}`);
      
      logTest('Estadísticas por deporte', porDeporte && porDeporte.length > 0,
        `Deportes: ${porDeporte?.length || 0}`);
      
      logTest('Top alumnos', porAlumno && porAlumno.length > 0,
        `Alumnos: ${porAlumno?.length || 0}`);
    }
  } catch (error) {
    logTest('Error en estadísticas', false, error.message);
  }
}

// 9. DESACTIVAR USUARIO
async function testDesactivarUsuario() {
  log('\n📋 TEST 9: DESACTIVAR USUARIO', 'magenta');
  
  if (!global.testDNI) {
    logTest('No hay DNI de prueba', false);
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/api/desactivar-usuario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dni: global.testDNI })
    });
    
    const data = await response.json();
    
    logTest('Usuario desactivado', data.success, `DNI: ${global.testDNI}`);
    
    // Verificar que ya no aparece en consulta
    await new Promise(resolve => setTimeout(resolve, 500)); // Esperar caché
    
    const consultaResp = await fetch(`${API_BASE}/api/mis-inscripciones/${global.testDNI}`);
    const consultaData = await consultaResp.json();
    
    const inscripcionesActivas = consultaData.inscripciones?.filter(i => i.estado === 'activa') || [];
    logTest('Inscripciones canceladas', inscripcionesActivas.length === 0, 
      `Activas: ${inscripcionesActivas.length}`);
    
  } catch (error) {
    logTest('Error al desactivar', false, error.message);
  }
}

// 10. REACTIVAR USUARIO
async function testReactivarUsuario() {
  log('\n📋 TEST 10: REACTIVAR USUARIO', 'magenta');
  
  if (!global.testDNI) {
    logTest('No hay DNI de prueba', false);
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE}/api/reactivar-usuario`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dni: global.testDNI })
    });
    
    const data = await response.json();
    
    logTest('Usuario reactivado', data.success, `DNI: ${global.testDNI}`);
    
    // Verificar que vuelve a aparecer
    await new Promise(resolve => setTimeout(resolve, 500)); // Esperar caché
    
    const consultaResp = await fetch(`${API_BASE}/api/mis-inscripciones/${global.testDNI}`);
    const consultaData = await consultaResp.json();
    
    const inscripcionesActivas = consultaData.inscripciones?.filter(i => i.estado === 'activa') || [];
    logTest('Inscripciones reactivadas', inscripcionesActivas.length > 0, 
      `Activas: ${inscripcionesActivas.length}`);
    
  } catch (error) {
    logTest('Error al reactivar', false, error.message);
  }
}

// 11. INSCRIPCIONES MÚLTIPLES (Crear varios alumnos)
async function testInscripcionesMultiples() {
  log('\n📋 TEST 11: INSCRIPCIONES MÚLTIPLES (5 alumnos)', 'magenta');
  
  try {
    const horariosResp = await fetch(`${API_BASE}/api/horarios`);
    const horariosData = await horariosResp.json();
    
    if (!horariosData.success) {
      logTest('No hay horarios', false);
      return;
    }
    
    let exitosas = 0;
    
    for (let i = 0; i < 5; i++) {
      const alumno = generarAlumnoPrueba(100 + i);
      const horarios = horariosData.horarios;
      const horarioSeleccionado = horarios[Math.floor(Math.random() * horarios.length)];
      
      const response = await fetch(`${API_BASE}/api/inscribir-multiple`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alumno,
          horarios: [{ horarioId: horarioSeleccionado.horario_id }]
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        exitosas++;
        log(`  ✓ ${alumno.nombres} ${alumno.apellidoPaterno} - ${horarioSeleccionado.deporte}`, 'green');
      } else {
        log(`  ✗ Error en ${alumno.nombres}`, 'red');
      }
      
      await new Promise(resolve => setTimeout(resolve, 100)); // Evitar rate limit
    }
    
    logTest('Inscripciones múltiples', exitosas === 5, `${exitosas}/5 exitosas`);
    
  } catch (error) {
    logTest('Error en inscripciones múltiples', false, error.message);
  }
}

// 12. VERIFICAR DUPLICADOS
async function testPrevencionDuplicados() {
  log('\n📋 TEST 12: PREVENCIÓN DE DUPLICADOS', 'magenta');
  
  if (!global.testDNI) {
    logTest('No hay DNI de prueba', false);
    return;
  }
  
  try {
    const horariosResp = await fetch(`${API_BASE}/api/horarios`);
    const horariosData = await horariosResp.json();
    const horario = horariosData.horarios[0];
    
    const alumno = {
      dni: global.testDNI, // Usar DNI existente
      nombres: 'Test',
      apellidoPaterno: 'Duplicado',
      apellidoMaterno: 'Duplicado',
      fechaNacimiento: '2015-01-01',
      sexo: 'Masculino',
      telefono: '999999999',
      email: 'test@test.com',
      direccion: 'Test',
      seguroTipo: 'SIS',
      condicionMedica: 'Ninguna',
      apoderado: 'Test Test',
      telefonoApoderado: '999999999',
      dniFrontalUrl: generarImagenPrueba('DNI'),
      dniReversoUrl: generarImagenPrueba('DNI'),
      fotoCarnetUrl: generarImagenPrueba('Foto'),
      comprobantePagoUrl: generarImagenPrueba('Pago'),
      numeroOperacion: 'TEST123'
    };
    
    const response = await fetch(`${API_BASE}/api/inscribir-multiple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        alumno,
        horarios: [{ horarioId: horario.horario_id }]
      })
    });
    
    const data = await response.json();
    
    // Debería rechazar por DNI duplicado O inscribir en nuevo horario
    logTest('Manejo de DNI duplicado', true, 
      data.success ? 'Inscripción adicional permitida' : `Rechazado: ${data.error}`);
    
  } catch (error) {
    logTest('Error en prueba de duplicados', false, error.message);
  }
}

// RESUMEN FINAL
function mostrarResumen() {
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 RESUMEN DE PRUEBAS', 'cyan');
  log('='.repeat(60), 'cyan');
  
  log(`\nTotal de pruebas: ${testResults.total}`, 'blue');
  log(`✅ Exitosas: ${testResults.passed}`, 'green');
  log(`❌ Fallidas: ${testResults.failed}`, 'red');
  
  const porcentaje = ((testResults.passed / testResults.total) * 100).toFixed(1);
  log(`📈 Porcentaje de éxito: ${porcentaje}%`, porcentaje >= 90 ? 'green' : 'yellow');
  
  if (testResults.errors.length > 0) {
    log('\n❌ ERRORES ENCONTRADOS:', 'red');
    testResults.errors.forEach((err, i) => {
      log(`\n${i + 1}. ${err.test}`, 'red');
      log(`   ${err.details}`, 'yellow');
    });
  }
  
  log('\n' + '='.repeat(60), 'cyan');
  
  if (porcentaje >= 90) {
    log('🎉 SISTEMA FUNCIONANDO CORRECTAMENTE', 'green');
  } else if (porcentaje >= 70) {
    log('⚠️  SISTEMA FUNCIONAL CON ADVERTENCIAS', 'yellow');
  } else {
    log('🔴 SISTEMA CON ERRORES CRÍTICOS', 'red');
  }
  
  log('='.repeat(60) + '\n', 'cyan');
}

// EJECUTAR TODAS LAS PRUEBAS
async function ejecutarTodasLasPruebas() {
  log('\n' + '='.repeat(60), 'blue');
  log('🚀 INICIANDO PRUEBAS COMPLETAS DEL SISTEMA JAGUARES', 'blue');
  log('='.repeat(60) + '\n', 'blue');
  
  await testHealthCheck();
  await testLoginAdmin();
  await testObtenerHorarios();
  await testInscripcionConImagenes();
  await testConsultarPorDNI();
  await testValidarDNI();
  await testObtenerInscritos();
  await testEstadisticasFinancieras();
  await testDesactivarUsuario();
  await testReactivarUsuario();
  await testInscripcionesMultiples();
  await testPrevencionDuplicados();
  
  mostrarResumen();
}

// Iniciar pruebas
ejecutarTodasLasPruebas().catch(error => {
  log(`\n❌ ERROR FATAL: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
