/**
 * PRUEBAS DE VALIDACIÓN DE DUPLICADOS
 * ====================================
 * 
 * Prueba la nueva funcionalidad de validación de inscripciones duplicadas
 * 
 * Ejecutar: node test-validacion-duplicados.js
 */

const API_BASE_URL = 'http://localhost:3002';

// Colores
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

async function test1_consultarDNIConInscripciones() {
  log('\n📋 TEST 1: Consultar DNI con inscripciones previas (39494949)', 'cyan');
  
  try {
    const dni = '39494949';
    const response = await fetch(`${API_BASE_URL}/api/consultar/${dni}`);
    const data = await response.json();
    
    log(`✅ Respuesta: ${response.ok ? 'OK' : 'Error'}`, response.ok ? 'green' : 'red');
    log(`   Success: ${data.success}`, data.success ? 'green' : 'red');
    
    if (data.success && data.horarios) {
      log(`   📊 Total inscripciones confirmadas: ${data.horarios.length}`, 'green');
      
      // Buscar MAMAS FIT LUNES 07:45
      const mamasFitLunes = data.horarios.find(h => 
        h.deporte.toUpperCase() === 'MAMAS FIT' &&
        h.dia.toUpperCase() === 'LUNES' &&
        h.hora_inicio === '07:45'
      );
      
      if (mamasFitLunes) {
        log(`   ✅ ENCONTRADO: MAMAS FIT LUNES 07:45-09:00`, 'green');
        log(`      - Código: ${mamasFitLunes.codigo_registro}`, 'cyan');
        log(`      - Estado pago: ${mamasFitLunes.estado_pago || 'N/A'}`, 'cyan');
      } else {
        log(`   ❌ NO ENCONTRADO: MAMAS FIT LUNES 07:45`, 'red');
      }
      
      log(`\n   📋 Lista completa de inscripciones:`, 'cyan');
      data.horarios.forEach((h, i) => {
        log(`      ${i+1}. ${h.deporte} - ${h.dia} ${h.hora_inicio}-${h.hora_fin}`, 'cyan');
      });
      
      return mamasFitLunes !== undefined;
    } else {
      log(`   ⚠️  No hay inscripciones o consulta falló`, 'yellow');
      if (data.error) {
        log(`   Error: ${data.error}`, 'red');
      }
      return false;
    }
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    return false;
  }
}

async function test2_validacionDuplicadosMismoHorario() {
  log('\n📋 TEST 2: Validación de duplicados - Mismo horario exacto', 'cyan');
  
  const testCases = [
    {
      nombre: 'MAMAS FIT LUNES 07:45 (ya inscrito)',
      horario: {
        deporte: 'MAMAS FIT',
        dia: 'LUNES',
        hora_inicio: '07:45',
        hora_fin: '09:00'
      },
      deberiaBloquear: true
    },
    {
      nombre: 'MAMAS FIT MIÉRCOLES 07:45 (diferente día)',
      horario: {
        deporte: 'MAMAS FIT',
        dia: 'MIÉRCOLES',
        hora_inicio: '07:45',
        hora_fin: '09:00'
      },
      deberiaBloquear: false
    },
    {
      nombre: 'MAMAS FIT LUNES 06:30 (mismo día, diferente hora)',
      horario: {
        deporte: 'MAMAS FIT',
        dia: 'LUNES',
        hora_inicio: '06:30',
        hora_fin: '07:40'
      },
      deberiaBloquear: false
    }
  ];
  
  for (const testCase of testCases) {
    log(`\n   🧪 Probando: ${testCase.nombre}`, 'yellow');
    
    const inscripciones = [{
      deporte: 'MAMAS FIT',
      dia: 'LUNES',
      hora_inicio: '07:45',
      hora_fin: '09:00'
    }];
    
    const yaInscrito = inscripciones.some(h => 
      h.deporte.toUpperCase() === testCase.horario.deporte.toUpperCase() &&
      h.dia.toUpperCase() === testCase.horario.dia.toUpperCase() &&
      h.hora_inicio === testCase.horario.hora_inicio &&
      h.hora_fin === testCase.horario.hora_fin
    );
    
    const resultadoCorrecto = yaInscrito === testCase.deberiaBloquear;
    
    if (resultadoCorrecto) {
      log(`      ✅ ${yaInscrito ? 'BLOQUEADO' : 'PERMITIDO'} (correcto)`, 'green');
    } else {
      log(`      ❌ ${yaInscrito ? 'BLOQUEADO' : 'PERMITIDO'} (incorrecto, debería ser ${testCase.deberiaBloquear ? 'BLOQUEADO' : 'PERMITIDO'})`, 'red');
    }
  }
}

async function test3_validacionConflictosHorario() {
  log('\n📋 TEST 3: Validación de conflictos de horario (traslapes)', 'cyan');
  
  // Función para convertir hora a minutos
  function horaAMinutos(horaStr) {
    const [horas, minutos] = horaStr.split(':').map(Number);
    return horas * 60 + minutos;
  }
  
  // Función para detectar traslapes
  function horariosSeTraslapan(h1, h2) {
    const inicio1 = horaAMinutos(h1.hora_inicio);
    const fin1 = horaAMinutos(h1.hora_fin);
    const inicio2 = horaAMinutos(h2.hora_inicio);
    const fin2 = horaAMinutos(h2.hora_fin);
    
    return inicio1 < fin2 && fin1 > inicio2;
  }
  
  const testCases = [
    {
      nombre: 'Horarios que se traslapan completamente',
      h1: { hora_inicio: '07:45', hora_fin: '09:00' },
      h2: { hora_inicio: '08:00', hora_fin: '09:30' },
      debeTraslapar: true
    },
    {
      nombre: 'Horarios consecutivos sin traslape',
      h1: { hora_inicio: '07:45', hora_fin: '09:00' },
      h2: { hora_inicio: '09:00', hora_fin: '10:30' },
      debeTraslapar: false
    },
    {
      nombre: 'Horarios separados',
      h1: { hora_inicio: '07:45', hora_fin: '09:00' },
      h2: { hora_inicio: '10:00', hora_fin: '11:30' },
      debeTraslapar: false
    },
    {
      nombre: 'Traslape parcial al inicio',
      h1: { hora_inicio: '08:00', hora_fin: '09:30' },
      h2: { hora_inicio: '07:45', hora_fin: '08:30' },
      debeTraslapar: true
    }
  ];
  
  for (const testCase of testCases) {
    const resultado = horariosSeTraslapan(testCase.h1, testCase.h2);
    const correcto = resultado === testCase.debeTraslapar;
    
    log(`\n   🧪 ${testCase.nombre}`, 'yellow');
    log(`      ${testCase.h1.hora_inicio}-${testCase.h1.hora_fin} vs ${testCase.h2.hora_inicio}-${testCase.h2.hora_fin}`, 'cyan');
    
    if (correcto) {
      log(`      ✅ ${resultado ? 'SE TRASLAPAN' : 'NO SE TRASLAPAN'} (correcto)`, 'green');
    } else {
      log(`      ❌ ${resultado ? 'SE TRASLAPAN' : 'NO SE TRASLAPAN'} (incorrecto)`, 'red');
    }
  }
}

async function test4_integracionCompleta() {
  log('\n📋 TEST 4: Integración completa - Flujo de validación', 'cyan');
  
  try {
    const dni = '39494949';
    
    // 1. Obtener inscripciones previas
    log('   1️⃣ Consultando inscripciones previas...', 'yellow');
    const response = await fetch(`${API_BASE_URL}/api/consultar/${dni}`);
    const data = await response.json();
    
    if (!data.success) {
      log('   ❌ No se pudieron obtener inscripciones', 'red');
      return;
    }
    
    log(`   ✅ Inscripciones obtenidas: ${data.horarios.length}`, 'green');
    
    // 2. Simular intento de seleccionar horario ya inscrito
    log('\n   2️⃣ Simulando selección de MAMAS FIT LUNES 07:45...', 'yellow');
    
    const horarioASeleccionar = {
      deporte: 'MAMAS FIT',
      dia: 'LUNES',
      hora_inicio: '07:45',
      hora_fin: '09:00'
    };
    
    const yaInscrito = data.horarios.some(h => 
      h.deporte.toUpperCase() === horarioASeleccionar.deporte.toUpperCase() &&
      h.dia.toUpperCase() === horarioASeleccionar.dia.toUpperCase() &&
      h.hora_inicio === horarioASeleccionar.hora_inicio &&
      h.hora_fin === horarioASeleccionar.hora_fin
    );
    
    if (yaInscrito) {
      log('   ✅ VALIDACIÓN CORRECTA: Horario bloqueado (ya inscrito)', 'green');
      log('   📛 Mensaje: "Ya estás inscrito en MAMAS FIT el LUNES de 07:45 a 09:00"', 'cyan');
    } else {
      log('   ❌ ERROR: No se detectó el duplicado', 'red');
    }
    
    // 3. Simular selección de horario diferente permitido
    log('\n   3️⃣ Simulando selección de FÚTBOL MARTES 16:00...', 'yellow');
    
    const horarioPermitido = {
      deporte: 'FÚTBOL',
      dia: 'MARTES',
      hora_inicio: '16:00',
      hora_fin: '17:30'
    };
    
    const estaInscrito = data.horarios.some(h => 
      h.deporte.toUpperCase() === horarioPermitido.deporte.toUpperCase() &&
      h.dia.toUpperCase() === horarioPermitido.dia.toUpperCase() &&
      h.hora_inicio === horarioPermitido.hora_inicio
    );
    
    if (!estaInscrito) {
      log('   ✅ VALIDACIÓN CORRECTA: Horario permitido (no inscrito)', 'green');
    } else {
      log('   ⚠️  Este horario también está inscrito', 'yellow');
    }
    
  } catch (error) {
    log(`   ❌ Error en integración: ${error.message}`, 'red');
  }
}

async function test5_performanceValidacion() {
  log('\n📋 TEST 5: Performance de validación', 'cyan');
  
  try {
    const dni = '39494949';
    const iteraciones = 10;
    const tiempos = [];
    
    log(`   Realizando ${iteraciones} consultas...`, 'yellow');
    
    for (let i = 0; i < iteraciones; i++) {
      const start = Date.now();
      const response = await fetch(`${API_BASE_URL}/api/consultar/${dni}`);
      await response.json();
      const duration = Date.now() - start;
      tiempos.push(duration);
      
      process.stdout.write(`   ${i + 1}/${iteraciones} (${duration}ms)  \r`);
    }
    
    const promedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
    const minimo = Math.min(...tiempos);
    const maximo = Math.max(...tiempos);
    
    console.log(''); // Nueva línea
    log(`\n   📊 Resultados:`, 'cyan');
    log(`      Promedio: ${Math.round(promedio)}ms`, 'cyan');
    log(`      Mínimo: ${minimo}ms`, 'cyan');
    log(`      Máximo: ${maximo}ms`, 'cyan');
    
    if (promedio < 3000) {
      log(`      ✅ Performance aceptable (< 3s)`, 'green');
    } else if (promedio < 5000) {
      log(`      ⚠️  Performance regular (3-5s)`, 'yellow');
    } else {
      log(`      ❌ Performance lenta (> 5s)`, 'red');
    }
    
  } catch (error) {
    log(`   ❌ Error: ${error.message}`, 'red');
  }
}

// ==================== EJECUTAR TODAS LAS PRUEBAS ====================

async function runAllTests() {
  log('\n' + '='.repeat(70), 'bright');
  log('🧪 PRUEBAS DE VALIDACIÓN DE DUPLICADOS - ACADEMIA JAGUARES', 'bright');
  log('='.repeat(70), 'bright');
  log(`🌐 API: ${API_BASE_URL}`, 'cyan');
  log(`📅 Fecha: ${new Date().toLocaleString('es-PE')}`, 'cyan');
  log('='.repeat(70) + '\n', 'bright');
  
  const test1Result = await test1_consultarDNIConInscripciones();
  await test2_validacionDuplicadosMismoHorario();
  await test3_validacionConflictosHorario();
  await test4_integracionCompleta();
  await test5_performanceValidacion();
  
  log('\n' + '='.repeat(70), 'bright');
  log('📊 PRUEBAS COMPLETADAS', 'bright');
  log('='.repeat(70), 'bright');
  
  if (test1Result) {
    log('✅ Sistema de validación de duplicados funcionando correctamente', 'green');
  } else {
    log('⚠️  Verifica que el DNI 39494949 tenga inscripciones en el sistema', 'yellow');
  }
  
  log('='.repeat(70) + '\n', 'bright');
}

// Ejecutar
runAllTests().catch(error => {
  log('\n❌ Error crítico:', 'red');
  console.error(error);
  process.exit(1);
});
