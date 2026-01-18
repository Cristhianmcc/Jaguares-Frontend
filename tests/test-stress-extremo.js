/**
 * ═══════════════════════════════════════════════════════════════════
 * TEST DE ESTRÉS EXTREMO - SISTEMA JAGUARES
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Prueba los límites absolutos del sistema con:
 * - 200+ usuarios concurrentes
 * - Múltiples inscripciones por usuario
 * - Requests sostenidos durante varios minutos
 * - Monitoreo de degradación de rendimiento
 * 
 * @version 1.0.0
 * @date 2026-01-18
 */

import axios from 'axios';
import fs from 'fs';
import { performance } from 'perf_hooks';

// ═══════════════════════════════════════════════════════════════════
// CONFIGURACIÓN DEL TEST DE ESTRÉS
// ═══════════════════════════════════════════════════════════════════

const CONFIG = {
    BASE_URL: process.env.BASE_URL || 'http://localhost:3002',
    
    // Configuración de olas de carga
    OLAS: [
        { usuarios: 10, nombre: 'Ola 1 - Calentamiento' },
        { usuarios: 25, nombre: 'Ola 2 - Carga Moderada' },
        { usuarios: 50, nombre: 'Ola 3 - Carga Alta' },
        { usuarios: 100, nombre: 'Ola 4 - Carga Muy Alta' },
        { usuarios: 200, nombre: 'Ola 5 - ESTRÉS EXTREMO' },
    ],
    
    // Cada usuario hará múltiples inscripciones
    INSCRIPCIONES_POR_USUARIO: 3,
    
    // Tiempo de espera entre olas (ms)
    DELAY_ENTRE_OLAS: 5000,
    
    // Tiempo máximo de espera por request
    TIMEOUT: 60000,
    
    // Guardar resultados detallados
    GUARDAR_LOGS_DETALLADOS: true
};

const api = axios.create({
    baseURL: CONFIG.BASE_URL,
    timeout: CONFIG.TIMEOUT,
    headers: { 'Content-Type': 'application/json' }
});

// ═══════════════════════════════════════════════════════════════════
// ESTADÍSTICAS Y MONITOREO
// ═══════════════════════════════════════════════════════════════════

const estadisticas = {
    global: {
        totalRequests: 0,
        exitosos: 0,
        fallidos: 0,
        timeouts: 0,
        errores5xx: 0,
        errores4xx: 0,
        tiempos: []
    },
    porOla: [],
    degradacion: [],
    erroresDetallados: []
};

// ═══════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════

function log(mensaje, tipo = 'INFO') {
    const timestamp = new Date().toISOString();
    const emojis = {
        'INFO': 'ℹ️',
        'SUCCESS': '✅',
        'ERROR': '❌',
        'WARNING': '⚠️',
        'STRESS': '🔥',
        'WAVE': '🌊'
    };
    console.log(`[${timestamp}] ${emojis[tipo]} ${mensaje}`);
}

function generarDNI() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

function generarEmail() {
    return `stress${Math.random().toString(36).substring(7)}@jaguares.test`;
}

function generarTelefono() {
    return `9${Math.floor(10000000 + Math.random() * 90000000)}`;
}

// ═══════════════════════════════════════════════════════════════════
// SIMULACIÓN DE USUARIO REAL
// ═══════════════════════════════════════════════════════════════════

class UsuarioSimulado {
    constructor(id, olaId) {
        this.id = id;
        this.olaId = olaId;
        this.dni = generarDNI();
        this.resultados = {
            inscripciones: [],
            tiempoTotal: 0,
            exitoso: false
        };
    }
    
    generarDatosInscripcion(numeroInscripcion) {
        const deportes = ['Fútbol', 'Básquet', 'Natación', 'Voleibol', 'Atletismo'];
        const planes = ['Económico', 'Estándar', 'Premium'];
        const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
        const horas = ['08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '16:00 - 17:00'];
        
        return {
            alumno: {
                dni: this.dni,
                nombres: `Usuario${this.id}`,
                apellido_paterno: 'Stress',
                apellido_materno: `TestOla${this.olaId}`,
                fecha_nacimiento: '2015-03-10',
                sexo: this.id % 2 === 0 ? 'Masculino' : 'Femenino',
                email: generarEmail(),
                telefono: generarTelefono(),
                apoderado: `Tutor${this.id}`,
                telefono_apoderado: generarTelefono()
            },
            horarios: [
                {
                    horario_id: ((this.id * 100 + numeroInscripcion) % 10) + 1,
                    deporte: deportes[numeroInscripcion % deportes.length],
                    plan: planes[numeroInscripcion % planes.length],
                    dia: dias[numeroInscripcion % dias.length],
                    hora: horas[numeroInscripcion % horas.length]
                }
            ]
        };
    }
    
    async ejecutarFlujoCompleto() {
        const inicio = performance.now();
        
        try {
            // Paso 1: Verificar DNI antes de inscribir
            await api.get(`/api/verificar-dni/${this.dni}`);
            
            // Paso 2: Múltiples inscripciones
            for (let i = 0; i < CONFIG.INSCRIPCIONES_POR_USUARIO; i++) {
                const inicioInscripcion = performance.now();
                
                try {
                    const datos = this.generarDatosInscripcion(i);
                    const response = await api.post('/api/inscribir-multiple', datos);
                    
                    const tiempoInscripcion = performance.now() - inicioInscripcion;
                    
                    this.resultados.inscripciones.push({
                        exito: true,
                        tiempo: tiempoInscripcion,
                        statusCode: response.status
                    });
                    
                    estadisticas.global.exitosos++;
                    estadisticas.global.tiempos.push(tiempoInscripcion);
                    
                } catch (error) {
                    const tiempoInscripcion = performance.now() - inicioInscripcion;
                    
                    this.resultados.inscripciones.push({
                        exito: false,
                        tiempo: tiempoInscripcion,
                        error: error.message,
                        statusCode: error.response?.status
                    });
                    
                    estadisticas.global.fallidos++;
                    
                    // Categorizar error
                    if (error.code === 'ECONNABORTED') {
                        estadisticas.global.timeouts++;
                    } else if (error.response?.status >= 500) {
                        estadisticas.global.errores5xx++;
                    } else if (error.response?.status >= 400) {
                        estadisticas.global.errores4xx++;
                    }
                    
                    if (CONFIG.GUARDAR_LOGS_DETALLADOS) {
                        estadisticas.erroresDetallados.push({
                            olaId: this.olaId,
                            usuarioId: this.id,
                            inscripcionNumero: i,
                            error: error.message,
                            statusCode: error.response?.status,
                            tiempo: tiempoInscripcion
                        });
                    }
                }
                
                estadisticas.global.totalRequests++;
                
                // Pequeño delay entre inscripciones del mismo usuario
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // Paso 3: Consultar inscripciones realizadas
            await api.get(`/api/mis-inscripciones/${this.dni}`);
            
            this.resultados.tiempoTotal = performance.now() - inicio;
            this.resultados.exitoso = this.resultados.inscripciones.every(i => i.exito);
            
            return this.resultados;
            
        } catch (error) {
            this.resultados.tiempoTotal = performance.now() - inicio;
            this.resultados.error = error.message;
            return this.resultados;
        }
    }
}

// ═══════════════════════════════════════════════════════════════════
// EJECUCIÓN DE OLAS DE CARGA
// ═══════════════════════════════════════════════════════════════════

async function ejecutarOla(numeroOla, configuracionOla) {
    log(`${configuracionOla.nombre} - ${configuracionOla.usuarios} usuarios`, 'WAVE');
    
    const inicioOla = performance.now();
    const usuarios = [];
    
    // Crear usuarios
    for (let i = 0; i < configuracionOla.usuarios; i++) {
        usuarios.push(new UsuarioSimulado(i, numeroOla));
    }
    
    // Ejecutar flujo completo de todos los usuarios en paralelo
    log(`Lanzando ${configuracionOla.usuarios} usuarios concurrentes...`, 'STRESS');
    const promesas = usuarios.map(usuario => usuario.ejecutarFlujoCompleto());
    const resultadosUsuarios = await Promise.allSettled(promesas);
    
    const tiempoOla = performance.now() - inicioOla;
    
    // Analizar resultados
    const exitosos = resultadosUsuarios.filter(r => r.status === 'fulfilled' && r.value.exitoso).length;
    const fallidos = configuracionOla.usuarios - exitosos;
    
    const tiemposUsuarios = resultadosUsuarios
        .filter(r => r.status === 'fulfilled')
        .map(r => r.value.tiempoTotal);
    
    const tiempoPromedio = tiemposUsuarios.reduce((a, b) => a + b, 0) / tiemposUsuarios.length || 0;
    const tiempoMin = Math.min(...tiemposUsuarios);
    const tiempoMax = Math.max(...tiemposUsuarios);
    
    const estadisticasOla = {
        numeroOla,
        nombre: configuracionOla.nombre,
        usuarios: configuracionOla.usuarios,
        exitosos,
        fallidos,
        tiempoTotal: tiempoOla,
        tiempoPromedioPorUsuario: tiempoPromedio,
        tiempoMinimo: tiempoMin,
        tiempoMaximo: tiempoMax,
        throughput: (configuracionOla.usuarios / (tiempoOla / 1000)).toFixed(2),
        requestsPorSegundo: (configuracionOla.usuarios * CONFIG.INSCRIPCIONES_POR_USUARIO / (tiempoOla / 1000)).toFixed(2)
    };
    
    estadisticas.porOla.push(estadisticasOla);
    
    // Detectar degradación
    if (numeroOla > 0) {
        const olaAnterior = estadisticas.porOla[numeroOla - 1];
        const degradacion = ((tiempoPromedio - olaAnterior.tiempoPromedioPorUsuario) / olaAnterior.tiempoPromedioPorUsuario) * 100;
        
        estadisticas.degradacion.push({
            deOla: numeroOla - 1,
            aOla: numeroOla,
            degradacion: degradacion.toFixed(2) + '%',
            tiempoAnterior: olaAnterior.tiempoPromedioPorUsuario.toFixed(2),
            tiempoActual: tiempoPromedio.toFixed(2)
        });
        
        if (degradacion > 50) {
            log(`⚠️  DEGRADACIÓN SIGNIFICATIVA DETECTADA: ${degradacion.toFixed(2)}%`, 'WARNING');
        }
    }
    
    // Mostrar resultados de la ola
    log(`Ola ${numeroOla} completada:`, 'SUCCESS');
    log(`  ✓ Exitosos: ${exitosos}/${configuracionOla.usuarios}`, 'INFO');
    log(`  ✗ Fallidos: ${fallidos}/${configuracionOla.usuarios}`, fallidos > 0 ? 'WARNING' : 'INFO');
    log(`  ⏱️  Tiempo total: ${(tiempoOla / 1000).toFixed(2)}s`, 'INFO');
    log(`  📊 Tiempo promedio/usuario: ${tiempoPromedio.toFixed(2)}ms`, 'INFO');
    log(`  🚀 Throughput: ${estadisticasOla.requestsPorSegundo} req/s`, 'INFO');
    
    return estadisticasOla;
}

// ═══════════════════════════════════════════════════════════════════
// GENERACIÓN DE REPORTE
// ═══════════════════════════════════════════════════════════════════

function generarReporte() {
    const fecha = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    
    const reporte = {
        fecha: new Date().toISOString(),
        configuracion: CONFIG,
        estadisticas: estadisticas,
        analisis: {
            tasaExitoGlobal: ((estadisticas.global.exitosos / estadisticas.global.totalRequests) * 100).toFixed(2) + '%',
            tiempoPromedioGlobal: (estadisticas.global.tiempos.reduce((a, b) => a + b, 0) / estadisticas.global.tiempos.length).toFixed(2) + 'ms',
            tiempoMinimo: Math.min(...estadisticas.global.tiempos).toFixed(2) + 'ms',
            tiempoMaximo: Math.max(...estadisticas.global.tiempos).toFixed(2) + 'ms',
            degradacionMaxima: estadisticas.degradacion.length > 0 
                ? Math.max(...estadisticas.degradacion.map(d => parseFloat(d.degradacion))) + '%'
                : '0%'
        },
        conclusiones: generarConclusiones()
    };
    
    // Guardar reportes
    const nombreJSON = `reporte-stress-${fecha}.json`;
    fs.writeFileSync(nombreJSON, JSON.stringify(reporte, null, 2));
    log(`Reporte JSON guardado: ${nombreJSON}`, 'SUCCESS');
    
    const reporteTexto = generarReporteTexto(reporte);
    const nombreTXT = `reporte-stress-${fecha}.txt`;
    fs.writeFileSync(nombreTXT, reporteTexto);
    log(`Reporte TXT guardado: ${nombreTXT}`, 'SUCCESS');
    
    return reporte;
}

function generarConclusiones() {
    const conclusiones = [];
    
    // Tasa de éxito
    const tasaExito = (estadisticas.global.exitosos / estadisticas.global.totalRequests) * 100;
    if (tasaExito >= 95) {
        conclusiones.push('✅ EXCELENTE: El sistema mantiene >95% de éxito bajo carga extrema');
    } else if (tasaExito >= 80) {
        conclusiones.push('⚠️  ACEPTABLE: Tasa de éxito del ' + tasaExito.toFixed(2) + '% - Considerar optimizaciones');
    } else {
        conclusiones.push('❌ CRÍTICO: Tasa de éxito muy baja (' + tasaExito.toFixed(2) + '%) - Requiere optimización urgente');
    }
    
    // Degradación
    if (estadisticas.degradacion.length > 0) {
        const degradacionMaxima = Math.max(...estadisticas.degradacion.map(d => parseFloat(d.degradacion)));
        if (degradacionMaxima < 30) {
            conclusiones.push('✅ El sistema escala bien - Degradación máxima: ' + degradacionMaxima.toFixed(2) + '%');
        } else if (degradacionMaxima < 100) {
            conclusiones.push('⚠️  Degradación moderada bajo alta carga: ' + degradacionMaxima.toFixed(2) + '%');
        } else {
            conclusiones.push('❌ Degradación severa: ' + degradacionMaxima.toFixed(2) + '% - Requiere optimización');
        }
    }
    
    // Errores
    if (estadisticas.global.errores5xx > 0) {
        conclusiones.push(`❌ Se detectaron ${estadisticas.global.errores5xx} errores del servidor (5xx)`);
    }
    
    if (estadisticas.global.timeouts > 0) {
        conclusiones.push(`⚠️  Se detectaron ${estadisticas.global.timeouts} timeouts - Considerar aumentar recursos`);
    }
    
    // Capacidad máxima
    const olaMaximaExitosa = estadisticas.porOla.findLast(ola => (ola.exitosos / ola.usuarios) >= 0.8);
    if (olaMaximaExitosa) {
        conclusiones.push(`🎯 Capacidad máxima recomendada: ~${olaMaximaExitosa.usuarios} usuarios concurrentes`);
    }
    
    return conclusiones;
}

function generarReporteTexto(reporte) {
    return `
╔══════════════════════════════════════════════════════════════════╗
║           TEST DE ESTRÉS EXTREMO - SISTEMA JAGUARES              ║
╚══════════════════════════════════════════════════════════════════╝

📅 Fecha: ${reporte.fecha}
🌐 URL: ${reporte.configuracion.BASE_URL}
🔥 Inscripciones por usuario: ${reporte.configuracion.INSCRIPCIONES_POR_USUARIO}

═══════════════════════════════════════════════════════════════════
📊 ESTADÍSTICAS GLOBALES
═══════════════════════════════════════════════════════════════════

Total de Requests:        ${reporte.estadisticas.global.totalRequests}
✅ Exitosos:              ${reporte.estadisticas.global.exitosos}
❌ Fallidos:              ${reporte.estadisticas.global.fallidos}
⏱️  Timeouts:             ${reporte.estadisticas.global.timeouts}
🔴 Errores 5xx:           ${reporte.estadisticas.global.errores5xx}
🟡 Errores 4xx:           ${reporte.estadisticas.global.errores4xx}

Tasa de Éxito:           ${reporte.analisis.tasaExitoGlobal}
Tiempo Promedio:         ${reporte.analisis.tiempoPromedioGlobal}
Tiempo Mínimo:           ${reporte.analisis.tiempoMinimo}
Tiempo Máximo:           ${reporte.analisis.tiempoMaximo}

═══════════════════════════════════════════════════════════════════
🌊 RESULTADOS POR OLA
═══════════════════════════════════════════════════════════════════

${reporte.estadisticas.porOla.map((ola, idx) => `
Ola ${idx + 1}: ${ola.nombre}
${'─'.repeat(60)}
👥 Usuarios:              ${ola.usuarios}
✅ Exitosos:              ${ola.exitosos}
❌ Fallidos:              ${ola.fallidos}
⏱️  Tiempo Total:          ${(ola.tiempoTotal / 1000).toFixed(2)}s
📊 Tiempo Prom/Usuario:   ${ola.tiempoPromedioPorUsuario.toFixed(2)}ms
🚀 Throughput:            ${ola.requestsPorSegundo} req/s
`).join('\n')}

═══════════════════════════════════════════════════════════════════
📉 ANÁLISIS DE DEGRADACIÓN
═══════════════════════════════════════════════════════════════════

${reporte.estadisticas.degradacion.length > 0 ? 
reporte.estadisticas.degradacion.map(d => 
`Ola ${d.deOla} → Ola ${d.aOla}: ${d.degradacion} (${d.tiempoAnterior}ms → ${d.tiempoActual}ms)`
).join('\n') : 'No hay datos de degradación'}

Degradación Máxima:      ${reporte.analisis.degradacionMaxima}

═══════════════════════════════════════════════════════════════════
🎯 CONCLUSIONES Y RECOMENDACIONES
═══════════════════════════════════════════════════════════════════

${reporte.conclusiones.map((c, idx) => `${idx + 1}. ${c}`).join('\n')}

═══════════════════════════════════════════════════════════════════
📋 RECOMENDACIONES TÉCNICAS
═══════════════════════════════════════════════════════════════════

${reporte.estadisticas.global.errores5xx > 0 ? 
'⚠️  Errores del servidor detectados - Revisar logs y recursos del servidor' : 
'✅ Sin errores críticos del servidor'}

${reporte.estadisticas.global.timeouts > 0 ?
'⚠️  Timeouts detectados - Considerar:
   • Aumentar timeout del cliente
   • Optimizar queries de base de datos
   • Implementar cache adicional
   • Escalar horizontalmente' :
'✅ Sin problemas de timeout'}

${parseFloat(reporte.analisis.degradacionMaxima) > 100 ?
'⚠️  Degradación significativa - Considerar:
   • Implementar rate limiting más agresivo
   • Optimizar operaciones pesadas
   • Implementar cola de procesamiento
   • Añadir más recursos al servidor' :
'✅ Rendimiento estable bajo carga'}

═══════════════════════════════════════════════════════════════════

Generado por: Sistema de Testing de Estrés Automatizado
`;
}

// ═══════════════════════════════════════════════════════════════════
// FUNCIÓN PRINCIPAL
// ═══════════════════════════════════════════════════════════════════

async function ejecutarTestDeEstres() {
    console.log(`
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║            🔥 TEST DE ESTRÉS EXTREMO 🔥                          ║
║                  SISTEMA JAGUARES                                ║
║                                                                  ║
║   Preparate para ver los límites de tu sistema...               ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
    `);
    
    log(`Target: ${CONFIG.BASE_URL}`, 'INFO');
    log(`Olas configuradas: ${CONFIG.OLAS.length}`, 'INFO');
    log(`Total usuarios a simular: ${CONFIG.OLAS.reduce((a, b) => a + b.usuarios, 0)}`, 'STRESS');
    
    const inicioTotal = performance.now();
    
    try {
        // Verificar que el servidor está disponible
        log('Verificando disponibilidad del servidor...', 'INFO');
        await api.get('/health');
        log('✓ Servidor disponible', 'SUCCESS');
        
        // Ejecutar cada ola
        for (let i = 0; i < CONFIG.OLAS.length; i++) {
            log(`\n${'='.repeat(60)}`, 'WAVE');
            await ejecutarOla(i, CONFIG.OLAS[i]);
            
            // Esperar entre olas (excepto la última)
            if (i < CONFIG.OLAS.length - 1) {
                log(`Esperando ${CONFIG.DELAY_ENTRE_OLAS / 1000}s antes de la siguiente ola...`, 'INFO');
                await new Promise(resolve => setTimeout(resolve, CONFIG.DELAY_ENTRE_OLAS));
            }
        }
        
    } catch (error) {
        log(`Error crítico durante el test: ${error.message}`, 'ERROR');
        console.error(error);
    }
    
    const tiempoTotal = (performance.now() - inicioTotal) / 1000;
    
    log(`\n${'='.repeat(60)}`, 'SUCCESS');
    log(`TEST DE ESTRÉS COMPLETADO EN ${tiempoTotal.toFixed(2)}s`, 'SUCCESS');
    log(`${'='.repeat(60)}\n`, 'SUCCESS');
    
    // Generar y mostrar reporte
    const reporte = generarReporte();
    console.log(generarReporteTexto(reporte));
    
    // Determinar exit code
    const tasaExito = (estadisticas.global.exitosos / estadisticas.global.totalRequests) * 100;
    if (tasaExito < 80) {
        log('⚠️  ALERTA: Tasa de éxito menor al 80%', 'WARNING');
        process.exit(1);
    } else {
        log('🎉 TEST DE ESTRÉS COMPLETADO EXITOSAMENTE', 'SUCCESS');
        process.exit(0);
    }
}

// Ejecutar test
ejecutarTestDeEstres().catch(error => {
    log(`Error fatal: ${error.message}`, 'ERROR');
    console.error(error);
    process.exit(1);
});
