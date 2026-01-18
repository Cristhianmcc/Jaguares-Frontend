#!/usr/bin/env node

/**
 * Script helper para ejecutar test de producción
 * Espera 1 minuto para que el rate limiting se resetee
 */

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

log('\n═════════════════════════════════════════════════════', 'cyan');
log('  PREPARANDO TEST DE PRODUCCIÓN', 'cyan');
log('═════════════════════════════════════════════════════\n', 'cyan');

log('⏱️  Esperando 60 segundos para resetear rate limiting...', 'yellow');
log('   (Esto asegura que todos los tests puedan ejecutarse)\n', 'yellow');

let countdown = 60;
const interval = setInterval(() => {
  process.stdout.write(`\r   ⏳ ${countdown}s restantes...`);
  countdown--;
  
  if (countdown < 0) {
    clearInterval(interval);
    console.log('\n');
    log('✅ Listo! Ejecutando test de producción...', 'green');
    log('═════════════════════════════════════════════════════\n', 'cyan');
    
    // Ejecutar el test
    const { spawn } = require('child_process');
    const test = spawn('node', ['test-produccion-completo.js'], {
      stdio: 'inherit',
      shell: true
    });
    
    test.on('close', (code) => {
      process.exit(code);
    });
  }
}, 1000);
