/**
 * VERIFICACIÓN PRE-DESPLIEGUE
 * ============================
 * 
 * Script que verifica que todo esté listo antes de desplegar a producción
 * 
 * Ejecutar: node verificacion-pre-despliegue.js
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

function check(name, passed, detail = '') {
  if (passed) {
    log(`✅ ${name}${detail ? ' - ' + detail : ''}`, 'green');
    return true;
  } else {
    log(`❌ ${name}${detail ? ' - ' + detail : ''}`, 'red');
    return false;
  }
}

let totalChecks = 0;
let passedChecks = 0;

function addCheck(result) {
  totalChecks++;
  if (result) passedChecks++;
  return result;
}

// ==================== VERIFICACIONES ====================

function verificarArchivosEsenciales() {
  log('\n📁 Verificando archivos esenciales...', 'cyan');
  
  const archivosRequeridos = [
    'index.html',
    'inscripcion.html',
    'seleccion-horarios.html',
    'confirmacion.html',
    'exito.html',
    'consulta.html',
    'index.js',
    'js/api-service.js',
    'js/inscripcion.js',
    'js/seleccion-horarios.js',
    'js/confirmacion.js',
    'js/exito.js',
    'js/consulta.js',
    'css/main.css',
    '.env.example',
    'APPS-SCRIPT-GOOGLE-SHEETS.gs'
  ];
  
  for (const archivo of archivosRequeridos) {
    const existe = fs.existsSync(archivo);
    addCheck(check(archivo, existe));
  }
}

function verificarVariablesEntorno() {
  log('\n🔐 Verificando variables de entorno...', 'cyan');
  
  const envExiste = fs.existsSync('.env');
  addCheck(check('.env existe', envExiste));
  
  if (envExiste) {
    const envContent = fs.readFileSync('.env', 'utf-8');
    addCheck(check('PORT definido', envContent.includes('PORT=')));
    addCheck(check('APPS_SCRIPT_URL definido', envContent.includes('APPS_SCRIPT_URL=')));
    addCheck(check('APPS_SCRIPT_TOKEN definido', envContent.includes('APPS_SCRIPT_TOKEN=')));
    
    // Verificar que no haya valores de ejemplo
    const tieneValoresReales = !envContent.includes('tu_token_aqui') && 
                                !envContent.includes('example.com');
    addCheck(check('Variables tienen valores reales', tieneValoresReales));
  }
  
  // Verificar .env.example
  const envExampleExiste = fs.existsSync('.env.example');
  addCheck(check('.env.example existe', envExampleExiste));
}

function verificarGitignore() {
  log('\n📝 Verificando .gitignore...', 'cyan');
  
  const gitignoreExiste = fs.existsSync('.gitignore');
  addCheck(check('.gitignore existe', gitignoreExiste));
  
  if (gitignoreExiste) {
    const gitignoreContent = fs.readFileSync('.gitignore', 'utf-8');
    addCheck(check('.env en .gitignore', gitignoreContent.includes('.env')));
    addCheck(check('node_modules en .gitignore', gitignoreContent.includes('node_modules')));
  }
}

function verificarPackageJson() {
  log('\n📦 Verificando package.json...', 'cyan');
  
  const packageJsonExiste = fs.existsSync('package.json');
  addCheck(check('package.json existe', packageJsonExiste));
  
  if (packageJsonExiste) {
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
      
      addCheck(check('Tiene nombre', !!packageJson.name));
      addCheck(check('Tiene version', !!packageJson.version));
      addCheck(check('Tiene scripts', !!packageJson.scripts));
      addCheck(check('Script "start" definido', !!packageJson.scripts?.start));
      
      // Verificar dependencias críticas
      const deps = packageJson.dependencies || {};
      addCheck(check('express instalado', !!deps.express));
      addCheck(check('cors instalado', !!deps.cors));
      addCheck(check('dotenv instalado', !!deps.dotenv));
      addCheck(check('node-cache instalado', !!deps['node-cache']));
      
    } catch (error) {
      addCheck(check('package.json válido', false, 'JSON inválido'));
    }
  }
}

function verificarConfiguracionBackend() {
  log('\n⚙️  Verificando configuración del backend...', 'cyan');
  
  const indexJsExiste = fs.existsSync('index.js');
  addCheck(check('index.js existe', indexJsExiste));
  
  if (indexJsExiste) {
    const content = fs.readFileSync('index.js', 'utf-8');
    
    addCheck(check('Importa express', content.includes("from 'express'")));
    addCheck(check('Importa cors', content.includes("from 'cors'")));
    addCheck(check('Usa dotenv', content.includes('dotenv')));
    addCheck(check('Configura CORS', content.includes('app.use(cors')));
    addCheck(check('Health endpoint', content.includes('/api/health')));
    addCheck(check('Horarios endpoint', content.includes('/api/horarios')));
    addCheck(check('Consultar endpoint', content.includes('/api/consultar')));
    addCheck(check('Sistema de caché', content.includes('NodeCache') || content.includes('new Map')));
  }
}

function verificarFrontend() {
  log('\n🎨 Verificando frontend...', 'cyan');
  
  // Verificar JS crítico
  const apiServiceExiste = fs.existsSync('js/api-service.js');
  addCheck(check('api-service.js existe', apiServiceExiste));
  
  if (apiServiceExiste) {
    const content = fs.readFileSync('js/api-service.js', 'utf-8');
    addCheck(check('Define academiaAPI', content.includes('academiaAPI')));
    addCheck(check('Función getHorarios', content.includes('getHorarios')));
    addCheck(check('Función consultarInscripcion', content.includes('consultarInscripcion')));
  }
  
  // Verificar seleccion-horarios.js (con nueva validación)
  const seleccionExiste = fs.existsSync('js/seleccion-horarios.js');
  addCheck(check('seleccion-horarios.js existe', seleccionExiste));
  
  if (seleccionExiste) {
    const content = fs.readFileSync('js/seleccion-horarios.js', 'utf-8');
    addCheck(check('Validación de duplicados', 
      content.includes('Ya estás inscrito en') || content.includes('yaInscrito')));
    addCheck(check('Validación de conflictos', 
      content.includes('horariosSeTraslapan') || content.includes('traslape')));
    addCheck(check('Función async toggleHorario', 
      content.includes('async function toggleHorario')));
  }
}

function verificarDocumentacion() {
  log('\n📚 Verificando documentación...', 'cyan');
  
  const docs = [
    'CHECKLIST-DESPLIEGUE.md',
    'MANUAL-CLIENTE-JAGUARES.md',
    'GUIA-CONFIGURACION-CLIENTE.md',
    'README.md'
  ];
  
  for (const doc of docs) {
    const existe = fs.existsSync(doc);
    addCheck(check(doc, existe));
  }
}

function verificarAppsScript() {
  log('\n📜 Verificando Apps Script...', 'cyan');
  
  const gsExiste = fs.existsSync('APPS-SCRIPT-GOOGLE-SHEETS.gs');
  addCheck(check('APPS-SCRIPT-GOOGLE-SHEETS.gs existe', gsExiste));
  
  if (gsExiste) {
    const content = fs.readFileSync('APPS-SCRIPT-GOOGLE-SHEETS.gs', 'utf-8');
    
    addCheck(check('Función doGet', content.includes('function doGet')));
    addCheck(check('Función obtenerHorarios', content.includes('function obtenerHorarios')));
    addCheck(check('Función guardarInscripcion', content.includes('function guardarInscripcion')));
    addCheck(check('Función validarHorariosInscripcion', 
      content.includes('function validarHorariosInscripcion')));
    addCheck(check('Función consultarInscripcion', 
      content.includes('function consultarInscripcion')));
    addCheck(check('Validación de token', 
      content.includes('TOKEN_SECRETO') || content.includes('validarToken')));
  }
}

function verificarTestsExisten() {
  log('\n🧪 Verificando archivos de pruebas...', 'cyan');
  
  const tests = [
    'test-sistema-completo.js',
    'test-validacion-duplicados.js',
    'test-suite-completa.js'
  ];
  
  for (const test of tests) {
    const existe = fs.existsSync(test);
    addCheck(check(test, existe));
  }
}

// ==================== RESUMEN FINAL ====================

async function main() {
  log('\n' + '='.repeat(70), 'bright');
  log('🔍 VERIFICACIÓN PRE-DESPLIEGUE - ACADEMIA JAGUARES', 'bright');
  log('='.repeat(70), 'bright');
  log(`📅 ${new Date().toLocaleString('es-PE')}`, 'cyan');
  log('='.repeat(70) + '\n', 'bright');
  
  verificarArchivosEsenciales();
  verificarVariablesEntorno();
  verificarGitignore();
  verificarPackageJson();
  verificarConfiguracionBackend();
  verificarFrontend();
  verificarDocumentacion();
  verificarAppsScript();
  verificarTestsExisten();
  
  // Resumen
  log('\n' + '='.repeat(70), 'bright');
  log('📊 RESUMEN DE VERIFICACIÓN', 'bright');
  log('='.repeat(70), 'bright');
  
  const porcentaje = Math.round((passedChecks / totalChecks) * 100);
  
  log(`\n✅ Verificaciones exitosas: ${passedChecks}/${totalChecks} (${porcentaje}%)`, 
    passedChecks === totalChecks ? 'green' : 'yellow');
  
  if (totalChecks > passedChecks) {
    log(`❌ Verificaciones fallidas: ${totalChecks - passedChecks}`, 'red');
  }
  
  log('\n' + '='.repeat(70), 'bright');
  
  if (passedChecks === totalChecks) {
    log('🎉 ¡TODO LISTO PARA DESPLEGAR!', 'green');
    log('✅ Todas las verificaciones han pasado', 'green');
    log('\n📋 Próximos pasos:', 'cyan');
    log('   1. Ejecutar: node test-suite-completa.js', 'cyan');
    log('   2. Verificar .env con credenciales reales', 'cyan');
    log('   3. Hacer commit y push a GitHub', 'cyan');
    log('   4. Configurar variables en Render.com', 'cyan');
    log('   5. Desplegar backend', 'cyan');
    log('   6. Desplegar frontend a GitHub Pages', 'cyan');
    log('   7. Probar en producción', 'cyan');
  } else if (porcentaje >= 90) {
    log('⚠️  Casi listo, pero hay algunos problemas menores', 'yellow');
    log('Revisa las verificaciones fallidas arriba', 'yellow');
  } else if (porcentaje >= 75) {
    log('⚠️  Faltan algunas verificaciones importantes', 'yellow');
    log('Corrige los errores antes de desplegar', 'yellow');
  } else {
    log('❌ NO LISTO PARA DESPLEGAR', 'red');
    log('Hay problemas críticos que deben corregirse', 'red');
  }
  
  log('='.repeat(70) + '\n', 'bright');
  
  process.exit(passedChecks === totalChecks ? 0 : 1);
}

main().catch(error => {
  log('\n❌ Error en verificación:', 'red');
  console.error(error);
  process.exit(1);
});
