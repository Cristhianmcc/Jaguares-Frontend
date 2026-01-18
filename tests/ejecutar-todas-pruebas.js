/**
 * ═══════════════════════════════════════════════════════════════════
 * EJECUTOR MAESTRO DE PRUEBAS - SISTEMA JAGUARES
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Script principal que ejecuta todas las pruebas en secuencia:
 * 1. Verificación de prerequisitos
 * 2. Tests de endpoints
 * 3. Pruebas de carga
 * 4. Test de estrés (opcional)
 * 5. Generación de reporte consolidado
 * 
 * @version 1.0.0
 * @date 2026-01-18
 */

import { spawn } from 'child_process';
import fs from 'fs';
import axios from 'axios';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';

// ═══════════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════

const CONFIG = {
    ejecutarTestsBasicos: true,
    ejecutarTestsCarga: true,
    ejecutarTestsEstres: false, // Cambiar a true para tests extremos
    ejecutarMonitoreo: false,    // Cambiar a true para monitoreo en paralelo
    
    scripts: {
        basicos: 'test-produccion-final.js',
        estres: 'test-stress-extremo.js',
        monitor: 'monitor-tiempo-real.js'
    }
};

// ═══════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════

function log(mensaje, tipo = 'INFO') {
    const timestamp = new Date().toISOString();
    const prefijos = {
        'INFO': 'ℹ️',
        'SUCCESS': '✅',
        'ERROR': '❌',
        'WARNING': '⚠️',
        'STEP': '📍'
    };
    console.log(`[${timestamp}] ${prefijos[tipo]} ${mensaje}`);
}

function ejecutarScript(scriptPath, nombre) {
    return new Promise((resolve, reject) => {
        log(`Iniciando: ${nombre}`, 'STEP');
        
        const proceso = spawn('node', [scriptPath], {
            stdio: 'inherit',
            env: { ...process.env, BASE_URL }
        });
        
        proceso.on('close', (code) => {
            if (code === 0) {
                log(`✓ ${nombre} completado exitosamente`, 'SUCCESS');
                resolve({ exito: true, code });
            } else {
                log(`✗ ${nombre} finalizó con errores (código: ${code})`, 'WARNING');
                resolve({ exito: false, code });
            }
        });
        
        proceso.on('error', (error) => {
            log(`✗ Error al ejecutar ${nombre}: ${error.message}`, 'ERROR');
            reject(error);
        });
    });
}

// ═══════════════════════════════════════════════════════════════════
// VERIFICACIÓN DE PREREQUISITOS
// ═══════════════════════════════════════════════════════════════════

async function verificarPrerequisitos() {
    log('Verificando prerequisitos...', 'STEP');
    
    const problemas = [];
    
    // 1. Verificar que los scripts existan
    const scriptsRequeridos = [
        CONFIG.scripts.basicos,
        CONFIG.scripts.estres,
        CONFIG.scripts.monitor
    ];
    
    for (const script of scriptsRequeridos) {
        if (!fs.existsSync(script)) {
            problemas.push(`Script no encontrado: ${script}`);
        }
    }
    
    // 2. Verificar que el servidor esté disponible
    try {
        log(`Verificando servidor en ${BASE_URL}...`, 'INFO');
        const response = await axios.get(`${BASE_URL}/health`, { timeout: 5000 });
        log('✓ Servidor disponible y respondiendo', 'SUCCESS');
    } catch (error) {
        problemas.push(`Servidor no disponible en ${BASE_URL}: ${error.message}`);
    }
    
    // 3. Verificar dependencias de Node.js
    try {
        await import('axios');
        log('✓ Dependencia axios disponible', 'SUCCESS');
    } catch (error) {
        problemas.push('Dependencia axios no encontrada. Ejecuta: npm install axios');
    }
    
    if (problemas.length > 0) {
        log('❌ Se encontraron problemas:', 'ERROR');
        problemas.forEach(p => console.log(`   - ${p}`));
        return false;
    }
    
    log('✅ Todos los prerequisitos están OK', 'SUCCESS');
    return true;
}

// ═══════════════════════════════════════════════════════════════════
// EJECUCIÓN PRINCIPAL
// ═══════════════════════════════════════════════════════════════════

async function ejecutarSuitePruebas() {
    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║           SUITE COMPLETA DE PRUEBAS - SISTEMA JAGUARES           ║
║                                                                  ║
║   Ejecución automática de todas las pruebas de producción       ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

🎯 Target: ${BASE_URL}
📋 Configuración:
   • Tests Básicos: ${CONFIG.ejecutarTestsBasicos ? 'SÍ' : 'NO'}
   • Tests de Carga: ${CONFIG.ejecutarTestsCarga ? 'SÍ (incluido en básicos)' : 'NO'}
   • Tests de Estrés: ${CONFIG.ejecutarTestsEstres ? 'SÍ' : 'NO'}
   • Monitoreo: ${CONFIG.ejecutarMonitoreo ? 'SÍ' : 'NO'}

    `);
    
    const inicioTotal = Date.now();
    const resultados = {
        prerequisitos: false,
        testsBasicos: null,
        testsEstres: null,
        monitoreo: null
    };
    
    try {
        // Paso 1: Verificar prerequisitos
        log('═══════════════════════════════════════════════════════', 'STEP');
        log('PASO 1: Verificación de Prerequisitos', 'STEP');
        log('═══════════════════════════════════════════════════════', 'STEP');
        
        resultados.prerequisitos = await verificarPrerequisitos();
        
        if (!resultados.prerequisitos) {
            log('❌ No se puede continuar sin cumplir los prerequisitos', 'ERROR');
            process.exit(1);
        }
        
        await esperar(2000);
        
        // Paso 2: Tests básicos (incluye tests de endpoints y carga moderada)
        if (CONFIG.ejecutarTestsBasicos) {
            log('\n═══════════════════════════════════════════════════════', 'STEP');
            log('PASO 2: Tests de Producción Básicos', 'STEP');
            log('═══════════════════════════════════════════════════════', 'STEP');
            
            resultados.testsBasicos = await ejecutarScript(
                CONFIG.scripts.basicos,
                'Tests de Producción'
            );
            
            await esperar(3000);
        }
        
        // Paso 3: Tests de estrés extremo (opcional)
        if (CONFIG.ejecutarTestsEstres) {
            log('\n═══════════════════════════════════════════════════════', 'STEP');
            log('PASO 3: Tests de Estrés Extremo', 'STEP');
            log('═══════════════════════════════════════════════════════', 'STEP');
            log('⚠️  ADVERTENCIA: Esto someterá al sistema a carga extrema', 'WARNING');
            
            await esperar(5000);
            
            resultados.testsEstres = await ejecutarScript(
                CONFIG.scripts.estres,
                'Tests de Estrés'
            );
        }
        
    } catch (error) {
        log(`Error durante la ejecución: ${error.message}`, 'ERROR');
        console.error(error);
    }
    
    const tiempoTotal = ((Date.now() - inicioTotal) / 1000 / 60).toFixed(2);
    
    // Generar resumen final
    generarResumenFinal(resultados, tiempoTotal);
}

function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ═══════════════════════════════════════════════════════════════════
// RESUMEN FINAL
// ═══════════════════════════════════════════════════════════════════

function generarResumenFinal(resultados, tiempoTotal) {
    console.log(`
    
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║                    RESUMEN FINAL DE PRUEBAS                      ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

⏱️  Tiempo Total: ${tiempoTotal} minutos

═══════════════════════════════════════════════════════════════════
📊 RESULTADOS
═══════════════════════════════════════════════════════════════════

${resultados.prerequisitos ? '✅' : '❌'} Prerequisitos: ${resultados.prerequisitos ? 'OK' : 'FALLO'}
${resultados.testsBasicos ? (resultados.testsBasicos.exito ? '✅' : '⚠️') : '⊝'} Tests Básicos: ${
    resultados.testsBasicos 
        ? (resultados.testsBasicos.exito ? 'EXITOSO' : 'CON ADVERTENCIAS')
        : 'NO EJECUTADO'
}
${resultados.testsEstres ? (resultados.testsEstres.exito ? '✅' : '⚠️') : '⊝'} Tests de Estrés: ${
    resultados.testsEstres 
        ? (resultados.testsEstres.exito ? 'EXITOSO' : 'CON ADVERTENCIAS')
        : 'NO EJECUTADO'
}

═══════════════════════════════════════════════════════════════════
🎯 CONCLUSIÓN GENERAL
═══════════════════════════════════════════════════════════════════
    `);
    
    const todosExitosos = 
        resultados.prerequisitos &&
        (!resultados.testsBasicos || resultados.testsBasicos.exito) &&
        (!resultados.testsEstres || resultados.testsEstres.exito);
    
    if (todosExitosos) {
        log(`
🎉 ¡EXCELENTE! TODOS LOS TESTS PASARON EXITOSAMENTE

Tu sistema está listo para producción. Revisa los reportes generados
para ver detalles específicos de rendimiento y capacidad.

Archivos de reporte generados:
  • reporte-produccion-[fecha].json
  • reporte-produccion-[fecha].txt
  ${resultados.testsEstres ? '• reporte-stress-[fecha].json\n  • reporte-stress-[fecha].txt' : ''}

        `, 'SUCCESS');
    } else {
        log(`
⚠️  ALGUNOS TESTS PRESENTARON PROBLEMAS

Revisa los reportes generados para identificar áreas de mejora.
El sistema puede funcionar pero podría beneficiarse de optimizaciones.

Recomendaciones:
  1. Revisa los archivos de reporte generados
  2. Identifica los endpoints más lentos
  3. Considera optimizar consultas a la base de datos
  4. Evalúa incrementar recursos del servidor si es necesario

        `, 'WARNING');
    }
    
    console.log(`
═══════════════════════════════════════════════════════════════════

📚 PRÓXIMOS PASOS SUGERIDOS:

1. Revisar los reportes JSON generados para análisis detallado
2. Si los tests básicos pasaron: el sistema está listo para producción
3. Si los tests de estrés fallaron: considera optimizaciones o más recursos
4. Ejecuta el monitor en tiempo real durante el uso real para validar

Para ejecutar el monitor en tiempo real:
  node monitor-tiempo-real.js

Para ajustar la configuración de pruebas, edita este archivo:
  - Línea ~30: CONFIG object

═══════════════════════════════════════════════════════════════════
    `);
    
    process.exit(todosExitosos ? 0 : 1);
}

// ═══════════════════════════════════════════════════════════════════
// EJECUCIÓN
// ═══════════════════════════════════════════════════════════════════

// Manejar interrupción
process.on('SIGINT', () => {
    console.log('\n\n🛑 Ejecución interrumpida por el usuario.\n');
    process.exit(130);
});

// Iniciar
ejecutarSuitePruebas().catch(error => {
    log(`Error fatal: ${error.message}`, 'ERROR');
    console.error(error);
    process.exit(1);
});
