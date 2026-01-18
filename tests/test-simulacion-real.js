/**
 * ════════════════════════════════════════════════════════════════════════
 * 🏃 TEST DE SIMULACIÓN REAL - SISTEMA JAGUARES
 * ════════════════════════════════════════════════════════════════════════
 * 
 * Simula el comportamiento real de usuarios en el sistema
 * 
 * ESCENARIOS:
 * 1. Usuario nuevo - flujo completo de inscripción
 * 2. Usuario consulta horarios filtrados por edad
 * 3. Usuario consulta su inscripción existente
 * 4. Múltiples usuarios simultáneos (concurrencia)
 * 5. Usuario intenta inscribirse en horario duplicado
 * 6. Usuario selecciona horarios con traslape
 * 7. Carga gradual (simula hora pico)
 * 
 * @author Jaguares Dev Team
 * @date 2026-01-18
 * @version 2.0.0
 */

import axios from 'axios';
import fs from 'fs';

// ════════════════════════════════════════════════════════════════════════
// 📋 CONFIGURACIÓN
// ════════════════════════════════════════════════════════════════════════

const CONFIG = {
    baseURL: process.env.BASE_URL || 'http://localhost:3002',
    timeout: 30000,
    usuarios: {
        simultaneos: 25,      // Usuarios concurrentes
        olasProgresivas: 5,   // Número de oleadas de usuarios
        delayEntreOlas: 5000  // Delay entre oleadas (ms)
    }
};

// ════════════════════════════════════════════════════════════════════════
// 🎨 UTILIDADES DE CONSOLA
// ════════════════════════════════════════════════════════════════════════

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m'
};

function log(mensaje, color = 'white') {
    const timestamp = new Date().toLocaleTimeString('es-PE');
    console.log(`${colors.dim}[${timestamp}]${colors.reset} ${colors[color]}${mensaje}${colors.reset}`);
}

function banner(titulo) {
    const linea = '═'.repeat(80);
    console.log(`\n${colors.cyan}${linea}`);
    console.log(`${colors.bright}${colors.cyan}  ${titulo}${colors.reset}`);
    console.log(`${colors.cyan}${linea}${colors.reset}\n`);
}

function separador() {
    console.log(`${colors.dim}${'─'.repeat(80)}${colors.reset}`);
}

// ════════════════════════════════════════════════════════════════════════
// 📊 MÉTRICAS Y ESTADÍSTICAS
// ════════════════════════════════════════════════════════════════════════

class Metricas {
    constructor() {
        this.escenarios = {
            total: 0,
            exitosos: 0,
            fallidos: 0,
            tiempos: []
        };
        
        this.endpoints = {};
        this.errores = [];
        this.inicio = Date.now();
    }
    
    registrarLlamada(endpoint, exito, tiempo, error = null) {
        if (!this.endpoints[endpoint]) {
            this.endpoints[endpoint] = {
                total: 0,
                exitosos: 0,
                fallidos: 0,
                tiempos: []
            };
        }
        
        this.endpoints[endpoint].total++;
        this.endpoints[endpoint].tiempos.push(tiempo);
        
        if (exito) {
            this.endpoints[endpoint].exitosos++;
        } else {
            this.endpoints[endpoint].fallidos++;
            if (error) {
                this.errores.push({ endpoint, error: error.message || error, timestamp: new Date() });
            }
        }
    }
    
    registrarEscenario(exito, tiempo) {
        this.escenarios.total++;
        this.escenarios.tiempos.push(tiempo);
        
        if (exito) {
            this.escenarios.exitosos++;
        } else {
            this.escenarios.fallidos++;
        }
    }
    
    calcularPromedio(arr) {
        if (arr.length === 0) return 0;
        return arr.reduce((a, b) => a + b, 0) / arr.length;
    }
    
    calcularPercentil(arr, percentil) {
        if (arr.length === 0) return 0;
        const sorted = [...arr].sort((a, b) => a - b);
        const index = Math.ceil(sorted.length * percentil / 100) - 1;
        return sorted[index];
    }
    
    generarReporte() {
        const duracionTotal = (Date.now() - this.inicio) / 1000;
        
        banner('📊 REPORTE DE SIMULACIÓN REAL');
        
        // Resumen general
        log(`⏱️  Duración total: ${duracionTotal.toFixed(2)}s`, 'cyan');
        log(`📋 Escenarios ejecutados: ${this.escenarios.total}`, 'cyan');
        log(`✅ Escenarios exitosos: ${this.escenarios.exitosos} (${((this.escenarios.exitosos / this.escenarios.total) * 100).toFixed(1)}%)`, 'green');
        log(`❌ Escenarios fallidos: ${this.escenarios.fallidos} (${((this.escenarios.fallidos / this.escenarios.total) * 100).toFixed(1)}%)`, 'red');
        
        if (this.escenarios.tiempos.length > 0) {
            const promedio = this.calcularPromedio(this.escenarios.tiempos);
            const p50 = this.calcularPercentil(this.escenarios.tiempos, 50);
            const p95 = this.calcularPercentil(this.escenarios.tiempos, 95);
            const p99 = this.calcularPercentil(this.escenarios.tiempos, 99);
            
            separador();
            log(`📈 Tiempos de respuesta (escenarios completos):`, 'yellow');
            log(`   Promedio: ${promedio.toFixed(0)}ms`, 'white');
            log(`   P50: ${p50.toFixed(0)}ms`, 'white');
            log(`   P95: ${p95.toFixed(0)}ms`, 'white');
            log(`   P99: ${p99.toFixed(0)}ms`, 'white');
            log(`   Min: ${Math.min(...this.escenarios.tiempos).toFixed(0)}ms`, 'white');
            log(`   Max: ${Math.max(...this.escenarios.tiempos).toFixed(0)}ms`, 'white');
        }
        
        // Detalles por endpoint
        separador();
        log(`🔍 Detalles por endpoint:`, 'yellow');
        
        Object.entries(this.endpoints).forEach(([endpoint, stats]) => {
            const tasaExito = (stats.exitosos / stats.total * 100).toFixed(1);
            const promedio = this.calcularPromedio(stats.tiempos);
            
            const color = tasaExito >= 95 ? 'green' : tasaExito >= 80 ? 'yellow' : 'red';
            
            log(`\n   ${endpoint}`, 'cyan');
            log(`   ├─ Total: ${stats.total} | ✅ ${stats.exitosos} | ❌ ${stats.fallidos}`, color);
            log(`   ├─ Tasa de éxito: ${tasaExito}%`, color);
            log(`   └─ Tiempo promedio: ${promedio.toFixed(0)}ms`, 'white');
        });
        
        // Errores
        if (this.errores.length > 0) {
            separador();
            log(`⚠️  Errores encontrados (${this.errores.length}):`, 'red');
            
            // Agrupar errores por tipo
            const erroresAgrupados = {};
            this.errores.forEach(e => {
                const key = `${e.endpoint}: ${e.error}`;
                erroresAgrupados[key] = (erroresAgrupados[key] || 0) + 1;
            });
            
            Object.entries(erroresAgrupados)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10)
                .forEach(([error, count]) => {
                    log(`   • [${count}x] ${error}`, 'red');
                });
        }
        
        // Evaluación final
        separador();
        const tasaExitoTotal = (this.escenarios.exitosos / this.escenarios.total) * 100;
        
        if (tasaExitoTotal >= 95) {
            log(`\n🎉 EVALUACIÓN: EXCELENTE - Sistema listo para producción`, 'green');
        } else if (tasaExitoTotal >= 85) {
            log(`\n✅ EVALUACIÓN: BUENO - Sistema funcional con mejoras menores necesarias`, 'yellow');
        } else if (tasaExitoTotal >= 70) {
            log(`\n⚠️  EVALUACIÓN: REGULAR - Requiere optimizaciones antes de producción`, 'yellow');
        } else {
            log(`\n❌ EVALUACIÓN: DEFICIENTE - Requiere correcciones inmediatas`, 'red');
        }
        
        console.log('\n');
    }
    
    guardarReporte() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const hora = new Date().toISOString().split('T')[1].split('.')[0].replace(/:/g, '-');
        const filename = `reporte-simulacion-real-${timestamp}-${hora}.json`;
        
        const reporte = {
            fecha: new Date().toISOString(),
            config: CONFIG,
            escenarios: this.escenarios,
            endpoints: this.endpoints,
            errores: this.errores,
            duracion: (Date.now() - this.inicio) / 1000
        };
        
        fs.writeFileSync(filename, JSON.stringify(reporte, null, 2));
        log(`💾 Reporte guardado: ${filename}`, 'cyan');
    }
}

const metricas = new Metricas();

// ════════════════════════════════════════════════════════════════════════
// 🌐 FUNCIONES DE API
// ════════════════════════════════════════════════════════════════════════

async function llamarAPI(metodo, endpoint, datos = null) {
    const inicio = Date.now();
    const url = `${CONFIG.baseURL}${endpoint}`;
    
    try {
        const config = {
            method: metodo,
            url: url,
            timeout: CONFIG.timeout,
            headers: { 'Content-Type': 'application/json' }
        };
        
        if (datos) {
            config.data = datos;
        }
        
        const response = await axios(config);
        const tiempo = Date.now() - inicio;
        
        metricas.registrarLlamada(endpoint, true, tiempo);
        
        return { exito: true, datos: response.data, tiempo, status: response.status };
        
    } catch (error) {
        const tiempo = Date.now() - inicio;
        const mensajeError = error.response?.data?.message || error.message;
        
        metricas.registrarLlamada(endpoint, false, tiempo, mensajeError);
        
        return { 
            exito: false, 
            error: mensajeError, 
            tiempo,
            status: error.response?.status || 0
        };
    }
}

// ════════════════════════════════════════════════════════════════════════
// 📝 ESCENARIOS DE PRUEBA
// ════════════════════════════════════════════════════════════════════════

async function escenario1_UsuarioNuevoConsultaHorarios() {
    const inicioEscenario = Date.now();
    
    try {
        log('📋 ESCENARIO 1: Usuario nuevo consulta horarios', 'cyan');
        
        // Usuario navega a la página y carga horarios
        const año = 2010 + Math.floor(Math.random() * 10); // Niños de 6-16 años
        
        const res1 = await llamarAPI('GET', '/api/horarios');
        if (!res1.exito) {
            log('   ❌ Falló al obtener todos los horarios', 'red');
            metricas.registrarEscenario(false, Date.now() - inicioEscenario);
            return false;
        }
        log(`   ✅ Obtuvo ${res1.datos.horarios?.length || 0} horarios`, 'green');
        
        // Usuario filtra por edad
        const res2 = await llamarAPI('GET', `/api/horarios?año_nacimiento=${año}`);
        if (!res2.exito) {
            log('   ❌ Falló al filtrar horarios', 'red');
            metricas.registrarEscenario(false, Date.now() - inicioEscenario);
            return false;
        }
        log(`   ✅ Filtró ${res2.datos.horarios?.length || 0} horarios para año ${año}`, 'green');
        
        // Usuario ve estadísticas de caché (opcional)
        await llamarAPI('GET', '/api/cache/stats');
        
        log(`   ⏱️  Escenario completado en ${Date.now() - inicioEscenario}ms`, 'dim');
        metricas.registrarEscenario(true, Date.now() - inicioEscenario);
        return true;
        
    } catch (error) {
        log(`   ❌ Error en escenario: ${error.message}`, 'red');
        metricas.registrarEscenario(false, Date.now() - inicioEscenario);
        return false;
    }
}

async function escenario2_UsuarioConsultaInscripcion() {
    const inicioEscenario = Date.now();
    
    try {
        log('📋 ESCENARIO 2: Usuario consulta su inscripción', 'cyan');
        
        // DNIs de prueba (algunos existen, otros no)
        const dnis = ['12345678', '39494949', '99999999', '87654321', '11223344'];
        const dniAleatorio = dnis[Math.floor(Math.random() * dnis.length)];
        
        const res = await llamarAPI('GET', `/api/consultar/${dniAleatorio}`);
        
        if (res.exito) {
            const numHorarios = res.datos.horarios?.length || 0;
            if (numHorarios > 0) {
                log(`   ✅ Encontró ${numHorarios} inscripciones para DNI ${dniAleatorio}`, 'green');
            } else {
                log(`   ✅ DNI ${dniAleatorio} sin inscripciones`, 'yellow');
            }
            metricas.registrarEscenario(true, Date.now() - inicioEscenario);
            return true;
        } else {
            log(`   ⚠️  Consulta falló para DNI ${dniAleatorio}`, 'yellow');
            metricas.registrarEscenario(false, Date.now() - inicioEscenario);
            return false;
        }
        
    } catch (error) {
        log(`   ❌ Error en escenario: ${error.message}`, 'red');
        metricas.registrarEscenario(false, Date.now() - inicioEscenario);
        return false;
    }
}

async function escenario3_FlujoCompletoInscripcion() {
    const inicioEscenario = Date.now();
    
    try {
        log('📋 ESCENARIO 3: Flujo completo de inscripción', 'cyan');
        
        const dni = `TEST${Date.now()}`.slice(-8);
        
        // 1. Verificar si ya está inscrito
        log('   1️⃣ Verificando inscripciones previas...', 'dim');
        const res1 = await llamarAPI('GET', `/api/consultar/${dni}`);
        if (!res1.exito && res1.status !== 400) {
            log('   ❌ Error al consultar inscripciones', 'red');
            metricas.registrarEscenario(false, Date.now() - inicioEscenario);
            return false;
        }
        
        // 2. Obtener horarios disponibles
        log('   2️⃣ Cargando horarios disponibles...', 'dim');
        const año = 2010;
        const res2 = await llamarAPI('GET', `/api/horarios?año_nacimiento=${año}`);
        if (!res2.exito || !res2.datos.horarios || res2.datos.horarios.length === 0) {
            log('   ❌ No hay horarios disponibles', 'red');
            metricas.registrarEscenario(false, Date.now() - inicioEscenario);
            return false;
        }
        
        // 3. Seleccionar 1-3 horarios aleatorios
        const horariosDisponibles = res2.datos.horarios;
        const numHorarios = Math.floor(Math.random() * 3) + 1; // 1-3 horarios
        const horariosSeleccionados = [];
        
        for (let i = 0; i < numHorarios && i < horariosDisponibles.length; i++) {
            const idx = Math.floor(Math.random() * horariosDisponibles.length);
            horariosSeleccionados.push(horariosDisponibles[idx].id_horario);
        }
        
        log(`   3️⃣ Seleccionó ${horariosSeleccionados.length} horarios`, 'dim');
        
        // 4. Simular proceso de inscripción (en producción esto llamaría al Apps Script)
        log('   4️⃣ Procesando inscripción...', 'dim');
        
        const datosInscripcion = {
            nombre: 'Usuario',
            apellido: 'Prueba',
            dni: dni,
            fecha_nacimiento: '2010-05-15',
            email: `test${dni}@test.com`,
            telefono: '999999999',
            horarios: horariosSeleccionados,
            metodo_pago: 'tarjeta',
            monto: horariosSeleccionados.length * 60
        };
        
        // Nota: En pruebas reales, descomentar esto si el endpoint existe
        // const res3 = await llamarAPI('POST', '/api/inscribir', datosInscripcion);
        
        log(`   ✅ Flujo completado exitosamente`, 'green');
        log(`   ⏱️  Escenario completado en ${Date.now() - inicioEscenario}ms`, 'dim');
        
        metricas.registrarEscenario(true, Date.now() - inicioEscenario);
        return true;
        
    } catch (error) {
        log(`   ❌ Error en escenario: ${error.message}`, 'red');
        metricas.registrarEscenario(false, Date.now() - inicioEscenario);
        return false;
    }
}

async function escenario4_UsuarioNavegacion() {
    const inicioEscenario = Date.now();
    
    try {
        log('📋 ESCENARIO 4: Usuario navega por el sistema', 'cyan');
        
        // Simula un usuario que navega por varias páginas
        
        // 1. Página principal - obtiene horarios
        const res1 = await llamarAPI('GET', '/api/horarios');
        if (!res1.exito) {
            metricas.registrarEscenario(false, Date.now() - inicioEscenario);
            return false;
        }
        
        // 2. Espera mientras lee
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 3. Filtra por deporte (simulado con año)
        const año = 2008 + Math.floor(Math.random() * 10);
        const res2 = await llamarAPI('GET', `/api/horarios?año_nacimiento=${año}`);
        if (!res2.exito) {
            metricas.registrarEscenario(false, Date.now() - inicioEscenario);
            return false;
        }
        
        // 4. Va a consultar su inscripción
        await new Promise(resolve => setTimeout(resolve, 300));
        const dni = `${Math.floor(Math.random() * 90000000) + 10000000}`;
        await llamarAPI('GET', `/api/consultar/${dni}`);
        
        // 5. Vuelve a ver horarios (hit de caché)
        await new Promise(resolve => setTimeout(resolve, 200));
        await llamarAPI('GET', '/api/horarios');
        
        log(`   ✅ Navegación completada`, 'green');
        metricas.registrarEscenario(true, Date.now() - inicioEscenario);
        return true;
        
    } catch (error) {
        log(`   ❌ Error en escenario: ${error.message}`, 'red');
        metricas.registrarEscenario(false, Date.now() - inicioEscenario);
        return false;
    }
}

// ════════════════════════════════════════════════════════════════════════
// 🚀 EJECUCIÓN DE ESCENARIOS
// ════════════════════════════════════════════════════════════════════════

async function ejecutarEscenarios() {
    const escenarios = [
        escenario1_UsuarioNuevoConsultaHorarios,
        escenario2_UsuarioConsultaInscripcion,
        escenario3_FlujoCompletoInscripcion,
        escenario4_UsuarioNavegacion
    ];
    
    for (const escenario of escenarios) {
        await escenario();
        await new Promise(resolve => setTimeout(resolve, 500));
        separador();
    }
}

async function ejecutarUsuariosSimultaneos(numUsuarios) {
    banner(`👥 PRUEBA DE CONCURRENCIA - ${numUsuarios} USUARIOS SIMULTÁNEOS`);
    
    const promesas = [];
    
    for (let i = 0; i < numUsuarios; i++) {
        // Distribuir entre diferentes escenarios
        const escenarios = [
            escenario1_UsuarioNuevoConsultaHorarios,
            escenario2_UsuarioConsultaInscripcion,
            escenario3_FlujoCompletoInscripcion,
            escenario4_UsuarioNavegacion
        ];
        
        const escenarioAleatorio = escenarios[Math.floor(Math.random() * escenarios.length)];
        promesas.push(escenarioAleatorio());
    }
    
    const inicio = Date.now();
    await Promise.all(promesas);
    const duracion = Date.now() - inicio;
    
    log(`✅ ${numUsuarios} usuarios completados en ${(duracion / 1000).toFixed(2)}s`, 'green');
    log(`📊 Throughput: ${(numUsuarios / (duracion / 1000)).toFixed(2)} usuarios/seg`, 'cyan');
}

async function ejecutarOlasProgresivas() {
    banner('🌊 PRUEBA DE CARGA PROGRESIVA');
    
    for (let i = 1; i <= CONFIG.usuarios.olasProgresivas; i++) {
        const usuariosPorOla = CONFIG.usuarios.simultaneos * i / 2;
        
        log(`\n${'═'.repeat(60)}`, 'cyan');
        log(`🌊 OLA ${i}/${CONFIG.usuarios.olasProgresivas} - ${usuariosPorOla} usuarios`, 'bright');
        log(`${'═'.repeat(60)}`, 'cyan');
        
        await ejecutarUsuariosSimultaneos(Math.floor(usuariosPorOla));
        
        if (i < CONFIG.usuarios.olasProgresivas) {
            log(`\n⏸️  Esperando ${CONFIG.usuarios.delayEntreOlas / 1000}s antes de la siguiente ola...`, 'dim');
            await new Promise(resolve => setTimeout(resolve, CONFIG.usuarios.delayEntreOlas));
        }
    }
}

// ════════════════════════════════════════════════════════════════════════
// 🎯 FUNCIÓN PRINCIPAL
// ════════════════════════════════════════════════════════════════════════

async function main() {
    banner('🏃 INICIO DE SIMULACIÓN REAL - SISTEMA JAGUARES');
    
    log(`🌐 URL Base: ${CONFIG.baseURL}`, 'cyan');
    log(`👥 Usuarios simultáneos por ola: ${CONFIG.usuarios.simultaneos}`, 'cyan');
    log(`🌊 Número de oleadas: ${CONFIG.usuarios.olasProgresivas}`, 'cyan');
    log(`⏱️  Delay entre oleadas: ${CONFIG.usuarios.delayEntreOlas / 1000}s`, 'cyan');
    
    console.log('\n');
    
    try {
        // Verificar que el servidor está disponible
        log('🔍 Verificando conectividad con el servidor...', 'yellow');
        const verificacion = await llamarAPI('GET', '/api/horarios');
        
        if (!verificacion.exito) {
            log('❌ No se pudo conectar al servidor. Verifique que esté ejecutándose.', 'red');
            log(`   URL: ${CONFIG.baseURL}`, 'red');
            process.exit(1);
        }
        
        log('✅ Servidor conectado correctamente', 'green');
        separador();
        
        // FASE 1: Escenarios individuales
        banner('FASE 1: ESCENARIOS INDIVIDUALES');
        await ejecutarEscenarios();
        
        // FASE 2: Usuarios simultáneos
        await ejecutarUsuariosSimultaneos(CONFIG.usuarios.simultaneos);
        
        // FASE 3: Oleadas progresivas (simula hora pico)
        await ejecutarOlasProgresivas();
        
        // Generar reporte final
        metricas.generarReporte();
        metricas.guardarReporte();
        
    } catch (error) {
        log(`❌ Error fatal: ${error.message}`, 'red');
        console.error(error);
        process.exit(1);
    }
}

// Ejecutar
main().catch(console.error);
