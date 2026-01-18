/**
 * ═══════════════════════════════════════════════════════════════════
 * MONITOR EN TIEMPO REAL - SISTEMA JAGUARES
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Monitorea el sistema en tiempo real mientras se ejecutan las pruebas:
 * - Estado del servidor
 * - Tiempos de respuesta
 * - Uso de caché
 * - Errores en tiempo real
 * - Métricas de rendimiento
 * 
 * @version 1.0.0
 * @date 2026-01-18
 */

import axios from 'axios';
import { performance } from 'perf_hooks';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';
const INTERVALO_MONITOREO = 2000; // 2 segundos
const DURACION_MONITOREO = 120000; // 2 minutos

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000
});

// ═══════════════════════════════════════════════════════════════════
// ESTADO Y MÉTRICAS
// ═══════════════════════════════════════════════════════════════════

const metricas = {
    muestras: [],
    errores: [],
    inicioMonitoreo: null
};

function limpiarConsola() {
    console.clear();
}

function log(mensaje, tipo = 'INFO') {
    const colores = {
        'INFO': '\x1b[36m',     // Cyan
        'SUCCESS': '\x1b[32m',  // Green
        'ERROR': '\x1b[31m',    // Red
        'WARNING': '\x1b[33m',  // Yellow
        'RESET': '\x1b[0m'
    };
    
    const color = colores[tipo] || colores.RESET;
    console.log(`${color}${mensaje}${colores.RESET}`);
}

// ═══════════════════════════════════════════════════════════════════
// RECOLECCIÓN DE MÉTRICAS
// ═══════════════════════════════════════════════════════════════════

async function recolectarMetricas() {
    const muestra = {
        timestamp: new Date(),
        health: null,
        cache: null,
        tiempoRespuesta: null,
        estado: 'DESCONOCIDO'
    };
    
    try {
        // 1. Health Check con medición de tiempo
        const inicioHealth = performance.now();
        const responseHealth = await api.get('/api/health');
        muestra.tiempoRespuesta = performance.now() - inicioHealth;
        muestra.health = responseHealth.data;
        
        // 2. Estadísticas de caché
        try {
            const responseCache = await api.get('/api/cache/stats');
            muestra.cache = responseCache.data;
        } catch (error) {
            muestra.cache = { error: 'No disponible' };
        }
        
        muestra.estado = 'OK';
        
    } catch (error) {
        muestra.estado = 'ERROR';
        muestra.error = error.message;
        metricas.errores.push({
            timestamp: new Date(),
            error: error.message,
            code: error.code
        });
    }
    
    metricas.muestras.push(muestra);
    
    // Mantener solo las últimas 30 muestras en memoria
    if (metricas.muestras.length > 30) {
        metricas.muestras.shift();
    }
    
    return muestra;
}

// ═══════════════════════════════════════════════════════════════════
// VISUALIZACIÓN EN CONSOLA
// ═══════════════════════════════════════════════════════════════════

function renderizarDashboard(muestra) {
    limpiarConsola();
    
    const ahora = new Date();
    const tiempoTranscurrido = metricas.inicioMonitoreo 
        ? ((ahora - metricas.inicioMonitoreo) / 1000).toFixed(0)
        : 0;
    
    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║            MONITOR EN TIEMPO REAL - SISTEMA JAGUARES             ║
╚══════════════════════════════════════════════════════════════════╝

🕐 ${ahora.toLocaleString()}
⏱️  Tiempo de monitoreo: ${tiempoTranscurrido}s

═══════════════════════════════════════════════════════════════════
📊 ESTADO ACTUAL
═══════════════════════════════════════════════════════════════════
    `);
    
    if (muestra.estado === 'OK') {
        log(`✅ SERVIDOR: OPERATIVO`, 'SUCCESS');
        log(`⚡ TIEMPO DE RESPUESTA: ${muestra.tiempoRespuesta.toFixed(2)}ms`, 'INFO');
        
        if (muestra.health) {
            log(`\n📈 Health Check:`, 'INFO');
            console.log(`   Estado: ${muestra.health.status || 'N/A'}`);
            console.log(`   Uptime: ${muestra.health.uptime || 'N/A'}`);
            if (muestra.health.database) {
                console.log(`   Base de Datos: ${muestra.health.database.status || 'N/A'}`);
            }
        }
        
        if (muestra.cache && !muestra.cache.error) {
            log(`\n💾 Estadísticas de Caché:`, 'INFO');
            console.log(`   Keys: ${muestra.cache.keys || 0}`);
            console.log(`   Hits: ${muestra.cache.hits || 0}`);
            console.log(`   Misses: ${muestra.cache.misses || 0}`);
            if (muestra.cache.hits > 0 || muestra.cache.misses > 0) {
                const hitRate = (muestra.cache.hits / (muestra.cache.hits + muestra.cache.misses)) * 100;
                console.log(`   Hit Rate: ${hitRate.toFixed(2)}%`);
            }
        }
        
    } else {
        log(`❌ SERVIDOR: ERROR`, 'ERROR');
        log(`   ${muestra.error}`, 'ERROR');
    }
    
    // ═══════════════════════════════════════════════════════════════
    // ESTADÍSTICAS DE LAS ÚLTIMAS MUESTRAS
    // ═══════════════════════════════════════════════════════════════
    
    console.log(`
═══════════════════════════════════════════════════════════════════
📊 ESTADÍSTICAS (últimos ${metricas.muestras.length} samples)
═══════════════════════════════════════════════════════════════════
    `);
    
    const muestrasOK = metricas.muestras.filter(m => m.estado === 'OK');
    const muestrasError = metricas.muestras.filter(m => m.estado === 'ERROR');
    
    log(`✅ Muestras Exitosas: ${muestrasOK.length}/${metricas.muestras.length}`, 'SUCCESS');
    log(`❌ Muestras con Error: ${muestrasError.length}/${metricas.muestras.length}`, muestrasError.length > 0 ? 'ERROR' : 'SUCCESS');
    
    if (muestrasOK.length > 0) {
        const tiempos = muestrasOK.map(m => m.tiempoRespuesta);
        const promedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
        const minimo = Math.min(...tiempos);
        const maximo = Math.max(...tiempos);
        
        console.log(`
⏱️  Tiempos de Respuesta:
   Promedio: ${promedio.toFixed(2)}ms
   Mínimo:   ${minimo.toFixed(2)}ms
   Máximo:   ${maximo.toFixed(2)}ms
        `);
        
        // Alerta si el tiempo promedio es muy alto
        if (promedio > 1000) {
            log(`⚠️  ALERTA: Tiempo de respuesta promedio muy alto (>1s)`, 'WARNING');
        }
        
        if (maximo > 5000) {
            log(`⚠️  ALERTA: Tiempo de respuesta máximo crítico (>5s)`, 'WARNING');
        }
    }
    
    // ═══════════════════════════════════════════════════════════════
    // GRÁFICO DE TIEMPOS DE RESPUESTA
    // ═══════════════════════════════════════════════════════════════
    
    if (muestrasOK.length >= 10) {
        console.log(`
═══════════════════════════════════════════════════════════════════
📈 GRÁFICO DE TIEMPOS (últimos 10 samples)
═══════════════════════════════════════════════════════════════════
        `);
        
        const ultimas10 = muestrasOK.slice(-10);
        const maxTiempo = Math.max(...ultimas10.map(m => m.tiempoRespuesta));
        
        ultimas10.forEach((m, idx) => {
            const barWidth = Math.floor((m.tiempoRespuesta / maxTiempo) * 50);
            const barra = '█'.repeat(barWidth);
            const tiempo = m.tiempoRespuesta.toFixed(0).padStart(5);
            console.log(`${(idx + 1).toString().padStart(2)}. ${barra} ${tiempo}ms`);
        });
    }
    
    // ═══════════════════════════════════════════════════════════════
    // ERRORES RECIENTES
    // ═══════════════════════════════════════════════════════════════
    
    if (metricas.errores.length > 0) {
        console.log(`
═══════════════════════════════════════════════════════════════════
❌ ERRORES RECIENTES
═══════════════════════════════════════════════════════════════════
        `);
        
        const ultimosErrores = metricas.errores.slice(-5);
        ultimosErrores.forEach((err, idx) => {
            console.log(`${idx + 1}. [${err.timestamp.toLocaleTimeString()}] ${err.error}`);
        });
    }
    
    console.log(`
═══════════════════════════════════════════════════════════════════
    `);
    log(`🔄 Próxima actualización en ${INTERVALO_MONITOREO / 1000}s...`, 'INFO');
}

// ═══════════════════════════════════════════════════════════════════
// FUNCIÓN PRINCIPAL
// ═══════════════════════════════════════════════════════════════════

async function iniciarMonitoreo() {
    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║              INICIANDO MONITOREO EN TIEMPO REAL                  ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

🎯 Target: ${BASE_URL}
⏱️  Intervalo: ${INTERVALO_MONITOREO / 1000}s
🕐 Duración: ${DURACION_MONITOREO / 1000}s

Presiona Ctrl+C para detener el monitoreo en cualquier momento.
    `);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    metricas.inicioMonitoreo = new Date();
    let tiempoTranscurrido = 0;
    
    // Bucle principal de monitoreo
    const intervalo = setInterval(async () => {
        const muestra = await recolectarMetricas();
        renderizarDashboard(muestra);
        
        tiempoTranscurrido += INTERVALO_MONITOREO;
        
        // Detener después de la duración especificada
        if (tiempoTranscurrido >= DURACION_MONITOREO) {
            clearInterval(intervalo);
            
            console.log(`
╔══════════════════════════════════════════════════════════════════╗
║              MONITOREO COMPLETADO                                ║
╚══════════════════════════════════════════════════════════════════╝
            `);
            
            generarResumen();
            process.exit(0);
        }
    }, INTERVALO_MONITOREO);
    
    // Manejar interrupción manual
    process.on('SIGINT', () => {
        clearInterval(intervalo);
        console.log(`\n\n🛑 Monitoreo detenido por el usuario.\n`);
        generarResumen();
        process.exit(0);
    });
}

function generarResumen() {
    console.log(`
═══════════════════════════════════════════════════════════════════
📊 RESUMEN DEL MONITOREO
═══════════════════════════════════════════════════════════════════
    `);
    
    const muestrasOK = metricas.muestras.filter(m => m.estado === 'OK');
    const muestrasError = metricas.muestras.filter(m => m.estado === 'ERROR');
    
    console.log(`Total de Muestras: ${metricas.muestras.length}`);
    console.log(`Exitosas: ${muestrasOK.length} (${((muestrasOK.length / metricas.muestras.length) * 100).toFixed(2)}%)`);
    console.log(`Errores: ${muestrasError.length} (${((muestrasError.length / metricas.muestras.length) * 100).toFixed(2)}%)`);
    
    if (muestrasOK.length > 0) {
        const tiempos = muestrasOK.map(m => m.tiempoRespuesta);
        const promedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
        const minimo = Math.min(...tiempos);
        const maximo = Math.max(...tiempos);
        
        console.log(`\nTiempos de Respuesta:`);
        console.log(`  Promedio: ${promedio.toFixed(2)}ms`);
        console.log(`  Mínimo: ${minimo.toFixed(2)}ms`);
        console.log(`  Máximo: ${maximo.toFixed(2)}ms`);
    }
    
    console.log(`\nTotal de Errores Registrados: ${metricas.errores.length}`);
    console.log(`═══════════════════════════════════════════════════════════════════\n`);
}

// Iniciar monitoreo
iniciarMonitoreo().catch(error => {
    console.error(`\n❌ Error fatal en el monitor: ${error.message}`);
    process.exit(1);
});
