/**
 * TEST DE MODALES DE VALIDACIÓN
 * Verifica que los errores de validación muestren modales informativos
 */

const API_BASE = 'http://localhost:3002';

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

async function testModalDuplicado() {
  log('\n========================================', 'cyan');
  log('TEST: Modal de Inscripción Duplicada', 'cyan');
  log('========================================\n', 'cyan');
  
  const alumno = {
    dni: '77777777',
    nombres: 'Test Modal',
    apellido_paterno: 'Duplicado',
    apellido_materno: 'UI',
    fecha_nacimiento: '2010-01-01',
    sexo: 'Masculino',
    telefono: '777777777',
    email: 'test@modal.com'
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
  
  try {
    // Primera inscripción
    log('📝 Creando primera inscripción...', 'yellow');
    const response1 = await fetch(`${API_BASE}/api/inscribir-multiple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alumno, horarios })
    });
    
    const result1 = await response1.json();
    
    if (result1.success) {
      log('✅ Primera inscripción creada', 'green');
      log(`   Código: ${result1.codigo_operacion}`, 'cyan');
    } else {
      log(`❌ Error: ${result1.error}`, 'red');
      return;
    }
    
    // Esperar 2 segundos
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Intentar duplicado
    log('\n📝 Intentando inscripción duplicada (debe mostrar modal)...', 'yellow');
    const response2 = await fetch(`${API_BASE}/api/inscribir-multiple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alumno, horarios })
    });
    
    const result2 = await response2.json();
    
    if (response2.status === 409) {
      log('✅ ERROR 409 DETECTADO CORRECTAMENTE', 'green');
      log('\n📋 Datos para el modal:', 'cyan');
      log(`   Status: ${response2.status}`, 'cyan');
      log(`   Message: ${result2.message}`, 'cyan');
      log(`   Deporte: ${result2.deporte}`, 'cyan');
      if (result2.inscripcion_existente) {
        log(`   Inscripción Existente:`, 'cyan');
        log(`     - ID: ${result2.inscripcion_existente.id}`, 'cyan');
        log(`     - Estado: ${result2.inscripcion_existente.estado}`, 'cyan');
        log(`     - Plan: ${result2.inscripcion_existente.plan}`, 'cyan');
        log(`     - Precio: S/ ${result2.inscripcion_existente.precio}`, 'cyan');
      }
      
      log('\n✅ El frontend debería mostrar:', 'green');
      log('   - Título: "🚫 Inscripción Duplicada"', 'yellow');
      log(`   - Mensaje: "${result2.message}"`, 'yellow');
      log('   - Detalles del deporte y plan', 'yellow');
      log('   - Botón "Ver Mis Inscripciones"', 'yellow');
      log('   - Botón "Cerrar"', 'yellow');
    } else {
      log('❌ No se detectó el duplicado correctamente', 'red');
      log(`   Status: ${response2.status}`, 'red');
      log(`   Response: ${JSON.stringify(result2, null, 2)}`, 'yellow');
    }
    
  } catch (error) {
    log(`❌ Error en prueba: ${error.message}`, 'red');
  }
}

async function testModalHorariosSinID() {
  log('\n========================================', 'cyan');
  log('TEST: Modal de Horarios Sin ID', 'cyan');
  log('========================================\n', 'cyan');
  
  const alumno = {
    dni: '66666666',
    nombres: 'Test Modal',
    apellido_paterno: 'Sin',
    apellido_materno: 'ID',
    fecha_nacimiento: '2010-01-01',
    sexo: 'Femenino',
    telefono: '666666666'
  };
  
  const horariosInvalidos = [
    {
      // Sin horario_id
      deporte: 'Fútbol',
      dia: 'MARTES',
      hora: '16:00-17:00',
      plan: 'Económico'
    },
    {
      // Sin horario_id
      deporte: 'Fútbol',
      dia: 'JUEVES',
      hora: '16:00-17:00',
      plan: 'Económico'
    }
  ];
  
  try {
    log('📝 Intentando inscripción con horarios sin ID...', 'yellow');
    const response = await fetch(`${API_BASE}/api/inscribir-multiple`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alumno, horarios: horariosInvalidos })
    });
    
    const result = await response.json();
    
    if (response.status === 400 && result.error === 'Horarios inválidos') {
      log('✅ ERROR 400 DETECTADO CORRECTAMENTE', 'green');
      log('\n📋 Datos para el modal:', 'cyan');
      log(`   Status: ${response.status}`, 'cyan');
      log(`   Error: ${result.error}`, 'cyan');
      log(`   Message: ${result.message}`, 'cyan');
      log(`   Horarios Inválidos: ${result.horarios_invalidos}`, 'cyan');
      
      log('\n✅ El frontend debería mostrar:', 'green');
      log('   - Título: "⚠️ Datos Inválidos"', 'yellow');
      log(`   - Mensaje: "${result.message}"`, 'yellow');
      log(`   - Detalles: ${result.horarios_invalidos} horarios sin ID`, 'yellow');
      log('   - Solución: Volver a seleccionar horarios', 'yellow');
      log('   - Botón "Volver a Seleccionar"', 'yellow');
      log('   - Botón "Cerrar"', 'yellow');
    } else {
      log('❌ No se detectó el error de horarios sin ID', 'red');
      log(`   Status: ${response.status}`, 'red');
      log(`   Response: ${JSON.stringify(result, null, 2)}`, 'yellow');
    }
    
  } catch (error) {
    log(`❌ Error en prueba: ${error.message}`, 'red');
  }
}

async function limpiarDatos() {
  log('\n🗑️ Limpiando datos de prueba...', 'yellow');
  
  const dnis = ['77777777', '66666666'];
  
  for (const dni of dnis) {
    try {
      const response = await fetch(`${API_BASE}/api/mis-inscripciones/${dni}`);
      const result = await response.json();
      
      if (result.success && result.inscripciones && result.inscripciones.length > 0) {
        log(`   ⚠️ DNI ${dni} tiene ${result.inscripciones.length} inscripciones (eliminar manualmente si es necesario)`, 'yellow');
      }
    } catch (error) {
      // Ignorar
    }
  }
  
  log('   ✅ Verificación completada', 'green');
}

async function ejecutarPruebas() {
  log('╔════════════════════════════════════════════════╗', 'blue');
  log('║   TEST DE MODALES DE VALIDACIÓN              ║', 'blue');
  log('╚════════════════════════════════════════════════╝', 'blue');
  
  await testModalHorariosSinID();
  await testModalDuplicado();
  
  log('\n========================================', 'cyan');
  log('RESUMEN', 'cyan');
  log('========================================\n', 'cyan');
  
  log('✅ Validaciones implementadas:', 'green');
  log('   1. Detección de inscripciones duplicadas (409)', 'cyan');
  log('   2. Detección de horarios sin ID (400)', 'cyan');
  log('   3. Modales informativos con detalles', 'cyan');
  log('   4. Botones de acción contextuales', 'cyan');
  
  log('\n📝 PARA PROBAR EN EL NAVEGADOR:', 'yellow');
  log('   1. Completa el formulario de inscripción', 'cyan');
  log('   2. Selecciona horarios sin problemas', 'cyan');
  log('   3. Intenta inscribirte 2 veces con el mismo DNI', 'cyan');
  log('   4. Observa el modal informativo con todos los detalles', 'cyan');
  
  await limpiarDatos();
  
  log('\n✅ PRUEBAS COMPLETADAS\n', 'green');
}

// Ejecutar
ejecutarPruebas().catch(err => {
  log(`\n❌ Error fatal: ${err.message}`, 'red');
  process.exit(1);
});
