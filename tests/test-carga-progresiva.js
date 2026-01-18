/**
 * PRUEBAS DE CARGA PROGRESIVA
 * ============================
 * 
 * Prueba el sistema con cargas crecientes de usuarios
 * 
 * Ejecutar: node test-carga-progresiva.js
 */

const API_BASE_URL = 'http://localhost:3002';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(colors[color] + message + colors.reset);
}

async function pruebaConUsuarios(cantidad, nombre) {
  log(`\n${'═'.repeat(70)}`, 'bright');
  log(`📊 PRUEBA: ${cantidad} Usuarios Simultáneos - ${nombre}`, 'cyan');
  log('═'.repeat(70), 'bright');
  
  const usuarios = Array.from({ length: cantidad }, (_, i) => ({
    id: i + 1,
    dni: `${10000000 + i}`
  }));
  
  log(`\n👥 Generando ${cantidad} requests simultáneos...`, 'yellow');
  
  const inicio = Date.now();
  
  const promesas = usuarios.map(async (usuario) => {
    const start = Date.now();
    try {
      const response = await fetch(`${API_BASE_URL}/api/horarios`);
      const data = await response.json();
      const duration = Date.now() - start;
      
      return {
        id: usuario.id,
        exito: response.ok && data.horarios?.length > 0,
        horarios: data.horarios?.length || 0,
        tiempo: duration,
        status: response.status
      };
    } catch (error) {
      return {
        id: usuario.id,
        exito: false,
        error: error.message,
        tiempo: Date.now() - start
      };
    }
  });
  
  const resultados = await Promise.all(promesas);
  const duracionTotal = Date.now() - inicio;
  
  // Análisis
  const exitosos = resultados.filter(r => r.exito).length;
  const fallidos = resultados.filter(r => !r.exito).length;
  const tiempos = resultados.map(r => r.tiempo);
  const tiempoMin = Math.min(...tiempos);
  const tiempoMax = Math.max(...tiempos);
  const tiempoPromedio = Math.round(tiempos.reduce((a, b) => a + b, 0) / tiempos.length);
  const requestsPorSegundo = (cantidad / (duracionTotal / 1000)).toFixed(2);
  
  // Percentiles
  tiempos.sort((a, b) => a - b);
  const p50 = tiempos[Math.floor(tiempos.length * 0.5)];
  const p90 = tiempos[Math.floor(tiempos.length * 0.9)];
  const p95 = tiempos[Math.floor(tiempos.length * 0.95)];
  const p99 = tiempos[Math.floor(tiempos.length * 0.99)];
  
  log('\n📈 RESULTADOS:', 'cyan');
  log(`   Total requests: ${cantidad}`, 'blue');
  log(`   ✅ Exitosos: ${exitosos} (${Math.round(exitosos/cantidad*100)}%)`, 
    exitosos === cantidad ? 'green' : 'yellow');
  
  if (fallidos > 0) {
    log(`   ❌ Fallidos: ${fallidos} (${Math.round(fallidos/cantidad*100)}%)`, 'red');
  }
  
  log(`\n⏱️  TIEMPOS DE RESPUESTA:`, 'cyan');
  log(`   Duración total: ${duracionTotal}ms`, 'blue');
  log(`   Promedio: ${tiempoPromedio}ms`, 'blue');
  log(`   Mínimo: ${tiempoMin}ms`, 'blue');
  log(`   Máximo: ${tiempoMax}ms`, 'blue');
  log(`   Mediana (P50): ${p50}ms`, 'blue');
  log(`   P90: ${p90}ms`, 'blue');
  log(`   P95: ${p95}ms`, 'blue');
  log(`   P99: ${p99}ms`, 'blue');
  
  log(`\n🚀 THROUGHPUT:`, 'cyan');
  log(`   Requests/segundo: ${requestsPorSegundo}`, 'blue');
  log(`   Usuarios/minuto: ${(requestsPorSegundo * 60).toFixed(0)}`, 'blue');
  
  // Evaluación
  let evaluacion;
  let color;
  if (exitosos === cantidad && tiempoPromedio < 3000) {
    evaluacion = '✅ EXCELENTE - Sistema responde rápido';
    color = 'green';
  } else if (exitosos === cantidad && tiempoPromedio < 6000) {
    evaluacion = '✅ BUENO - Sistema funcional pero puede mejorar';
    color = 'green';
  } else if (exitosos >= cantidad * 0.95 && tiempoPromedio < 10000) {
    evaluacion = '⚠️  ACEPTABLE - Algunos requests lentos';
    color = 'yellow';
  } else if (exitosos >= cantidad * 0.80) {
    evaluacion = '⚠️  LÍMITE - Sistema cerca de saturación';
    color = 'yellow';
  } else {
    evaluacion = '❌ SOBRECARGA - Sistema no puede manejar esta carga';
    color = 'red';
  }
  
  log(`\n${evaluacion}`, color);
  
  return {
    cantidad,
    exitosos,
    fallidos,
    tiempoPromedio,
    tiempoMax,
    requestsPorSegundo: parseFloat(requestsPorSegundo),
    evaluacion: exitosos >= cantidad * 0.95
  };
}

async function main() {
  log('\n' + '█'.repeat(70), 'bright');
  log('🔥 PRUEBAS DE CARGA PROGRESIVA - ACADEMIA JAGUARES', 'bright');
  log('█'.repeat(70), 'bright');
  log('🎯 Objetivo: Determinar capacidad máxima del sistema', 'cyan');
  log('🌐 API: ' + API_BASE_URL, 'cyan');
  log('█'.repeat(70) + '\n', 'bright');
  
  const pruebas = [
    { cantidad: 5, nombre: 'Carga Baja' },
    { cantidad: 10, nombre: 'Carga Normal' },
    { cantidad: 25, nombre: 'Carga Media' },
    { cantidad: 50, nombre: 'Carga Alta' },
    { cantidad: 100, nombre: 'Stress Test' }
  ];
  
  const resultados = [];
  
  for (const prueba of pruebas) {
    const resultado = await pruebaConUsuarios(prueba.cantidad, prueba.nombre);
    resultados.push(resultado);
    
    // Esperar entre pruebas para no saturar
    if (prueba !== pruebas[pruebas.length - 1]) {
      log('\n⏸️  Esperando 5 segundos antes de la siguiente prueba...', 'yellow');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  // Resumen final
  log('\n' + '█'.repeat(70), 'bright');
  log('📊 RESUMEN GENERAL', 'bright');
  log('█'.repeat(70), 'bright');
  
  log('\n📈 Capacidad del sistema:', 'cyan');
  resultados.forEach((r, i) => {
    const icon = r.evaluacion ? '✅' : '❌';
    const color = r.evaluacion ? 'green' : 'red';
    log(`   ${icon} ${r.cantidad} usuarios: ${r.exitosos}/${r.cantidad} exitosos | ` +
        `Promedio: ${r.tiempoPromedio}ms | ${r.requestsPorSegundo} req/s`, color);
  });
  
  // Determinar capacidad máxima
  const maxCapacidad = resultados.filter(r => r.evaluacion).pop();
  
  if (maxCapacidad) {
    log(`\n✅ CAPACIDAD MÁXIMA CONFIRMADA: ${maxCapacidad.cantidad} usuarios simultáneos`, 'green');
    log(`   Throughput: ${maxCapacidad.requestsPorSegundo} requests/segundo`, 'green');
    log(`   Capacidad estimada: ~${Math.floor(maxCapacidad.requestsPorSegundo * 60)} usuarios/minuto`, 'green');
  } else {
    log(`\n⚠️  Sistema no puede manejar estas cargas`, 'yellow');
  }
  
  log('\n💡 RECOMENDACIONES:', 'cyan');
  if (maxCapacidad && maxCapacidad.cantidad >= 50) {
    log('   ✅ Sistema robusto, puede manejar tráfico real sin problemas', 'green');
    log('   ✅ Caché funcionando efectivamente', 'green');
  } else if (maxCapacidad && maxCapacidad.cantidad >= 25) {
    log('   ⚠️  Suficiente para tráfico normal', 'yellow');
    log('   💡 Considerar optimizaciones si el tráfico aumenta', 'yellow');
  } else {
    log('   ⚠️  Capacidad limitada', 'yellow');
    log('   💡 Recomendaciones:', 'cyan');
    log('      - Aumentar TTL del caché', 'blue');
    log('      - Considerar CDN para frontend', 'blue');
    log('      - Escalar backend (más instancias)', 'blue');
  }
  
  log('\n' + '█'.repeat(70) + '\n', 'bright');
  
  const todasPasaron = resultados.every(r => r.evaluacion);
  process.exit(todasPasaron ? 0 : 1);
}

main().catch(error => {
  log('\n❌ Error crítico:', 'red');
  console.error(error);
  process.exit(1);
});
