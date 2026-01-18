/**
 * TEST DE VALIDACIONES DE INSCRIPCIÓN
 * - Validar duplicados (mismo alumno + mismo deporte activo)
 * - Validar horarios sin horario_id
 */

const API_BASE = 'http://localhost:3002';

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testValidacionDuplicados() {
  log('\n========================================', 'cyan');
  log('TEST 1: Validación de Duplicados', 'cyan');
  log('========================================\n', 'cyan');
  
  // Datos de prueba para intentar duplicado
  const alumno = {
    dni: '99999999',
    nombres: 'Test Duplicado',
    apellido_paterno: 'Prueba',
    apellido_materno: 'Sistema',
    fecha_nacimiento: '2010-01-01',
    sexo: 'Masculino',
    telefono: '999999999',
    email: 'test@test.com'
  };
  
  const horarios = [
    {
      horario_id: 1,
      deporte: 'Fútbol',
      dia: 'LUNES',
      hora: '15:00-16:00',
      plan: 'Económico'
    }
  ];
  
  try {
    // Primera inscripción (debe funcionar)
    log('📝 Intentando primera inscripción...', 'yellow');
    const response1 = await fetch(`${API_BASE}/api/inscribir-multiple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alumno, horarios })
    });
    
    const result1 = await response1.json();
    
    if (result1.success) {
      log('✅ Primera inscripción exitosa', 'green');
    } else {
      log(`❌ Error en primera inscripción: ${result1.error}`, 'red');
      return;
    }
    
    // Esperar 2 segundos
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Segunda inscripción (debe ser rechazada por duplicado)
    log('\n📝 Intentando inscripción duplicada...', 'yellow');
    const response2 = await fetch(`${API_BASE}/api/inscribir-multiple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alumno, horarios })
    });
    
    const result2 = await response2.json();
    
    if (response2.status === 409 && !result2.success) {
      log('✅ DUPLICADO DETECTADO CORRECTAMENTE', 'green');
      log(`   Mensaje: ${result2.message}`, 'cyan');
      log(`   Deporte: ${result2.deporte}`, 'cyan');
      log(`   Inscripción existente ID: ${result2.inscripcion_existente.id}`, 'cyan');
    } else {
      log('❌ ERROR: El sistema permitió inscripción duplicada', 'red');
      log(`   Respuesta: ${JSON.stringify(result2, null, 2)}`, 'yellow');
    }
    
  } catch (error) {
    log(`❌ Error en prueba: ${error.message}`, 'red');
  }
}

async function testValidacionHorariosSinID() {
  log('\n========================================', 'cyan');
  log('TEST 2: Validación de Horarios sin ID', 'cyan');
  log('========================================\n', 'cyan');
  
  const alumno = {
    dni: '88888888',
    nombres: 'Test Sin Horario',
    apellido_paterno: 'Prueba',
    apellido_materno: 'ID',
    fecha_nacimiento: '2010-01-01',
    sexo: 'Femenino',
    telefono: '888888888'
  };
  
  const horariosInvalidos = [
    {
      // Sin horario_id
      deporte: 'Fútbol',
      dia: 'MARTES',
      hora: '16:00-17:00',
      plan: 'Económico'
    }
  ];
  
  try {
    log('📝 Intentando inscripción sin horario_id...', 'yellow');
    const response = await fetch(`${API_BASE}/api/inscribir-multiple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alumno, horarios: horariosInvalidos })
    });
    
    const result = await response.json();
    
    if (response.status === 400 && !result.success && result.error === 'Horarios inválidos') {
      log('✅ VALIDACIÓN DE HORARIOS FUNCIONANDO', 'green');
      log(`   Mensaje: ${result.message}`, 'cyan');
      log(`   Horarios inválidos: ${result.horarios_invalidos}`, 'cyan');
    } else {
      log('❌ ERROR: El sistema permitió inscripción sin horario_id', 'red');
      log(`   Respuesta: ${JSON.stringify(result, null, 2)}`, 'yellow');
    }
    
  } catch (error) {
    log(`❌ Error en prueba: ${error.message}`, 'red');
  }
}

async function verificarInscripcionesDNI(dni) {
  log(`\n📊 Verificando inscripciones de DNI ${dni}...`, 'blue');
  
  try {
    const response = await fetch(`${API_BASE}/api/mis-inscripciones/${dni}`);
    const result = await response.json();
    
    if (result.success && result.inscripciones) {
      log(`   Total inscripciones: ${result.inscripciones.length}`, 'cyan');
      result.inscripciones.forEach((ins, index) => {
        log(`   ${index + 1}. ${ins.deporte} - ${ins.estado} - ${ins.plan}`, 'cyan');
      });
    } else {
      log(`   No se encontraron inscripciones`, 'yellow');
    }
  } catch (error) {
    log(`   Error: ${error.message}`, 'red');
  }
}

async function limpiarDatosPrueba() {
  log('\n🗑️ Limpiando datos de prueba...', 'yellow');
  
  const dnisLimpiar = ['99999999', '88888888'];
  
  for (const dni of dnisLimpiar) {
    try {
      // Aquí necesitarías un endpoint para eliminar o cambiar estado a cancelada
      log(`   Limpieza de DNI ${dni} (manual en MySQL si es necesario)`, 'cyan');
    } catch (error) {
      log(`   Error limpiando ${dni}: ${error.message}`, 'red');
    }
  }
}

async function ejecutarPruebas() {
  log('╔════════════════════════════════════════════════╗', 'blue');
  log('║  TEST DE VALIDACIONES - SISTEMA JAGUARES      ║', 'blue');
  log('╚════════════════════════════════════════════════╝', 'blue');
  
  await testValidacionHorariosSinID();
  await testValidacionDuplicados();
  
  log('\n========================================', 'cyan');
  log('VERIFICACIÓN FINAL', 'cyan');
  log('========================================\n', 'cyan');
  
  await verificarInscripcionesDNI('99999999');
  await verificarInscripcionesDNI('88888888');
  
  log('\n✅ PRUEBAS COMPLETADAS\n', 'green');
  log('📝 NOTA: Revisa los logs del servidor para más detalles\n', 'yellow');
}

// Ejecutar
ejecutarPruebas().catch(err => {
  log(`\n❌ Error fatal: ${err.message}`, 'red');
  process.exit(1);
});
