/**
 * SUITE COMPLETA DE PRUEBAS - ACADEMIA JAGUARES
 * ==============================================
 * 
 * Ejecuta todas las pruebas del sistema en orden
 * 
 * Ejecutar: node test-suite-completa.js
 */

const { spawn } = require('child_process');
const fs = require('fs');

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

function runTest(scriptName, description) {
  return new Promise((resolve) => {
    log(`\n${'='.repeat(80)}`, 'bright');
    log(`🧪 EJECUTANDO: ${description}`, 'bright');
    log(`📄 Script: ${scriptName}`, 'cyan');
    log('='.repeat(80) + '\n', 'bright');
    
    const test = spawn('node', [scriptName], {
      stdio: 'inherit',
      shell: true
    });
    
    test.on('close', (code) => {
      if (code === 0) {
        log(`\n✅ ${description} - COMPLETADO`, 'green');
        resolve({ name: description, success: true });
      } else {
        log(`\n❌ ${description} - FALLÓ (código: ${code})`, 'red');
        resolve({ name: description, success: false });
      }
    });
    
    test.on('error', (error) => {
      log(`\n❌ Error ejecutando ${description}: ${error.message}`, 'red');
      resolve({ name: description, success: false });
    });
  });
}

async function runAllTests() {
  const startTime = Date.now();
  
  log('\n' + '█'.repeat(80), 'bright');
  log('🏆 SUITE COMPLETA DE PRUEBAS - ACADEMIA JAGUARES', 'bright');
  log('█'.repeat(80), 'bright');
  log(`📅 Inicio: ${new Date().toLocaleString('es-PE')}`, 'cyan');
  log('█'.repeat(80) + '\n', 'bright');
  
  const tests = [
    {
      script: 'test-sistema-completo.js',
      description: 'Pruebas del Sistema Completo'
    },
    {
      script: 'test-validacion-duplicados.js',
      description: 'Pruebas de Validación de Duplicados'
    }
  ];
  
  const results = [];
  
  for (const test of tests) {
    // Verificar que el archivo existe
    if (!fs.existsSync(test.script)) {
      log(`⚠️  Archivo no encontrado: ${test.script}`, 'yellow');
      results.push({ name: test.description, success: false, skipped: true });
      continue;
    }
    
    const result = await runTest(test.script, test.description);
    results.push(result);
    
    // Esperar 2 segundos entre tests
    if (test !== tests[tests.length - 1]) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  // Resumen final
  log('\n' + '█'.repeat(80), 'bright');
  log('📊 RESUMEN FINAL DE PRUEBAS', 'bright');
  log('█'.repeat(80), 'bright');
  
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success && !r.skipped).length;
  const skipped = results.filter(r => r.skipped).length;
  const total = results.length;
  
  log(`\n📈 Estadísticas:`, 'cyan');
  log(`   ✅ Exitosas: ${passed}/${total}`, passed === total ? 'green' : 'yellow');
  log(`   ❌ Fallidas: ${failed}/${total}`, failed === 0 ? 'green' : 'red');
  if (skipped > 0) {
    log(`   ⏭️  Omitidas: ${skipped}/${total}`, 'yellow');
  }
  log(`   ⏱️  Duración total: ${duration}s`, 'blue');
  
  log(`\n📋 Detalle por prueba:`, 'cyan');
  results.forEach((result, index) => {
    const icon = result.skipped ? '⏭️ ' : (result.success ? '✅' : '❌');
    const color = result.skipped ? 'yellow' : (result.success ? 'green' : 'red');
    const status = result.skipped ? 'OMITIDA' : (result.success ? 'ÉXITO' : 'FALLO');
    log(`   ${index + 1}. ${icon} ${result.name} - ${status}`, color);
  });
  
  log('\n' + '█'.repeat(80), 'bright');
  
  if (failed === 0 && skipped === 0) {
    log('🎉 ¡TODAS LAS PRUEBAS PASARON!', 'green');
    log('✅ El sistema está listo para producción', 'green');
  } else if (failed === 0) {
    log('⚠️  Algunas pruebas fueron omitidas', 'yellow');
  } else {
    log('❌ ALGUNAS PRUEBAS FALLARON', 'red');
    log('⚠️  Revisa los errores antes de desplegar', 'yellow');
  }
  
  log('█'.repeat(80) + '\n', 'bright');
  
  log('📄 Documentos de referencia:', 'cyan');
  log('   - CHECKLIST-DESPLIEGUE.md', 'blue');
  log('   - MANUAL-CLIENTE-JAGUARES.md', 'blue');
  log('   - GUIA-CONFIGURACION-CLIENTE.md', 'blue');
  log('');
  
  // Exit code
  process.exit(failed > 0 ? 1 : 0);
}

// Ejecutar
runAllTests().catch(error => {
  log('\n❌ Error crítico en la suite de pruebas:', 'red');
  console.error(error);
  process.exit(1);
});
