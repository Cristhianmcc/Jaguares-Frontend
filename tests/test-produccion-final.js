/**
 * ═══════════════════════════════════════════════════════════════════
 * TEST DE PRODUCCIÓN FINAL - SISTEMA JAGUARES
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Pruebas completas para verificar que el sistema está listo para producción.
 * Incluye pruebas de todos los endpoints, carga intensiva y simulación real.
 * 
 * @author Sistema de Testing Automatizado
 * @version 2.0.0
 * @date 2026-01-18
 */

import axios from 'axios';
import fs from 'fs';
import { performance } from 'perf_hooks';

// ═══════════════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';
const TOTAL_CONCURRENT_USERS = 50; // Usuarios concurrentes para pruebas de carga
const INSCRIPCIONES_POR_USUARIO = 3; // Inscripciones por cada usuario
const TIMEOUT = 30000; // Timeout de 30 segundos

// Configuración de axios
const api = axios.create({
    baseURL: BASE_URL,
    timeout: TIMEOUT,
    headers: {
        'Content-Type': 'application/json'
    }
});

// ═══════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════

const resultados = {
    total: 0,
    exitosos: 0,
    fallidos: 0,
    errores: [],
    tiempos: [],
    endpoints: {},
    carga: {
        usuariosConcurrentes: 0,
        inscripcionesExitosas: 0,
        inscripcionesFallidas: 0,
        tiempoPromedio: 0,
        tiempoMaximo: 0,
        tiempoMinimo: 999999
    }
};

function log(mensaje, tipo = 'INFO') {
    const timestamp = new Date().toISOString();
    const prefijos = {
        'INFO': '✅',
        'ERROR': '❌',
        'WARNING': '⚠️',
        'TEST': '🧪',
        'LOAD': '⚡',
        'SUCCESS': '🎉'
    };
    console.log(`[${timestamp}] ${prefijos[tipo] || '📝'} ${mensaje}`);
}

function generarDNI() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

function generarEmail() {
    const random = Math.random().toString(36).substring(7);
    return `test${random}@jaguares.test`;
}

function generarTelefono() {
    return `9${Math.floor(10000000 + Math.random() * 90000000)}`;
}

async function medirTiempo(fn, nombre) {
    const inicio = performance.now();
    try {
        const resultado = await fn();
        const tiempo = performance.now() - inicio;
        resultados.tiempos.push({ nombre, tiempo, exito: true });
        return { exito: true, resultado, tiempo };
    } catch (error) {
        const tiempo = performance.now() - inicio;
        resultados.tiempos.push({ nombre, tiempo, exito: false });
        return { exito: false, error, tiempo };
    }
}

// ═══════════════════════════════════════════════════════════════════
// TESTS DE ENDPOINTS INDIVIDUALES
// ═══════════════════════════════════════════════════════════════════

async function testEndpoint(nombre, metodo, ruta, datos = null, headers = {}) {
    resultados.total++;
    log(`Testing ${metodo} ${ruta}`, 'TEST');
    
    const resultado = await medirTiempo(async () => {
        const config = { 
            headers: {
                ...headers,
                'User-Agent': 'JaguaresTestSuite/2.0'
            },
            validateStatus: function (status) {
                return status >= 200 && status < 600; // Aceptar cualquier status para testing
            }
        };
        
        if (metodo === 'GET') {
            return await api.get(ruta, config);
        } else if (metodo === 'POST') {
            return await api.post(ruta, datos, config);
        } else if (metodo === 'PUT') {
            return await api.put(ruta, datos, config);
        } else if (metodo === 'DELETE') {
            return await api.delete(ruta, config);
        }
    }, nombre);

    if (resultado.exito) {
        const status = resultado.resultado?.status;
        const isSuccess = status >= 200 && status < 300;
        
        if (isSuccess) {
            resultados.exitosos++;
            resultados.endpoints[nombre] = {
                estado: 'OK',
                tiempo: resultado.tiempo.toFixed(2) + 'ms',
                statusCode: status
            };
            log(`✓ ${nombre} - ${resultado.tiempo.toFixed(2)}ms [${status}]`, 'SUCCESS');
        } else {
            resultados.fallidos++;
            const errorMsg = resultado.resultado?.data?.message || resultado.resultado?.data?.error || `HTTP ${status}`;
            resultados.errores.push({
                endpoint: nombre,
                error: errorMsg,
                statusCode: status,
                tiempo: resultado.tiempo
            });
            resultados.endpoints[nombre] = {
                estado: 'FALLO',
                error: errorMsg,
                statusCode: status
            };
            log(`✗ ${nombre} - ${errorMsg} [${status}]`, 'ERROR');
        }
    } else {
        resultados.fallidos++;
        const errorMsg = resultado.error?.response?.data?.message || resultado.error?.response?.data?.error || resultado.error?.message || 'Error desconocido';
        resultados.errores.push({
            endpoint: nombre,
            error: errorMsg,
            statusCode: resultado.error?.response?.status,
            tiempo: resultado.tiempo
        });
        resultados.endpoints[nombre] = {
            estado: 'FALLO',
            error: errorMsg,
            statusCode: resultado.error?.response?.status
        };
        log(`✗ ${nombre} - ${errorMsg}${resultado.error?.response?.status ? ` [${resultado.error.response.status}]` : ''}`, 'ERROR');
    }

    return resultado;
}

// ═══════════════════════════════════════════════════════════════════
// SUITE DE TESTS - ENDPOINTS PÚBLICOS
// ═══════════════════════════════════════════════════════════════════

async function testEndpointsPublicos() {
    log('═══ INICIANDO TESTS DE ENDPOINTS PÚBLICOS ═══', 'TEST');
    
    // 1. Health Check
    await testEndpoint('Health Check', 'GET', '/health');
    await testEndpoint('API Health', 'GET', '/api/health');
    
    // 2. Cache
    await testEndpoint('Cache Stats', 'GET', '/api/cache/stats');
    
    // 3. Horarios
    await testEndpoint('Obtener Horarios', 'GET', '/api/horarios');
    await testEndpoint('Debug Horarios', 'GET', '/api/debug/horarios');
    
    // 4. Validaciones
    const dniTest = generarDNI();
    await testEndpoint('Validar DNI', 'GET', `/api/validar-dni/${dniTest}`);
    await testEndpoint('Verificar DNI', 'GET', `/api/verificar-dni/${dniTest}`);
    await testEndpoint('Verificar Pago', 'GET', `/api/verificar-pago/${dniTest}`);
    await testEndpoint('Verificar Taller', 'GET', `/api/verificar-taller/${dniTest}`);
    
    // 5. Consultas
    await testEndpoint('Consultar DNI', 'GET', `/api/consultar/${dniTest}`);
    await testEndpoint('Mis Inscripciones', 'GET', `/api/mis-inscripciones/${dniTest}`);
    
    // 6. Cupos
    await testEndpoint('Cupos Talleres', 'GET', '/api/cupos-talleres');
    await testEndpoint('Estadísticas Talleres', 'GET', '/api/estadisticas-talleres');
    
    log('═══ TESTS DE ENDPOINTS PÚBLICOS COMPLETADOS ═══', 'SUCCESS');
}

// ═══════════════════════════════════════════════════════════════════
// SUITE DE TESTS - INSCRIPCIONES
// ═══════════════════════════════════════════════════════════════════

async function testInscripciones() {
    log('═══ INICIANDO TESTS DE INSCRIPCIONES ═══', 'TEST');
    
    // Datos de prueba para inscripción
    const datosInscripcion = {
        dni: generarDNI(),
        nombre: 'Juan',
        apellidos: 'Pérez García',
        fechaNacimiento: '2015-05-15',
        edad: 11,
        sexo: 'M',
        correo: generarEmail(),
        telefono: generarTelefono(),
        nombreTutor: 'María Pérez',
        telefonoTutor: generarTelefono(),
        horarios: [
            { horario_id: 1, deporte: 'Fútbol', plan: 'Económico', dia: 'Lunes', hora: '08:00 - 09:00' }
        ]
    };
    
    // Test de inscripción (usando el endpoint correcto)
    const resultadoInscripcion = await testEndpoint(
        'Inscripción Simple',
        'POST',
        '/api/inscribir-multiple',
        {
            alumno: {
                dni: datosInscripcion.dni,
                nombres: datosInscripcion.nombre,
                apellidoPaterno: datosInscripcion.apellidos.split(' ')[0],
                apellidoMaterno: datosInscripcion.apellidos.split(' ')[1] || '',
                fechaNacimiento: datosInscripcion.fechaNacimiento,
                edad: datosInscripcion.edad,
                sexo: datosInscripcion.sexo,
                correo: datosInscripcion.correo,
                telefono: datosInscripcion.telefono,
                nombreTutor: datosInscripcion.nombreTutor,
                telefonoTutor: datosInscripcion.telefonoTutor
            },
            horarios: datosInscripcion.horarios
        }
    );
    
    if (resultadoInscripcion.exito) {
        const dni = datosInscripcion.dni;
        
        // Verificar la inscripción
        await testEndpoint('Verificar DNI Post-Inscripción', 'GET', `/api/verificar-dni/${dni}`);
        await testEndpoint('Consultar Post-Inscripción', 'GET', `/api/consultar/${dni}`);
        await testEndpoint('Mis Inscripciones Post-Inscripción', 'GET', `/api/mis-inscripciones/${dni}`);
    }
    
    // Test de inscripción múltiple
    const datosMultiple = {
        ...datosInscripcion,
        dni: generarDNI(),
        correo: generarEmail(),
        horarios: [
            { horario_id: 1, deporte: 'Fútbol', plan: 'Económico', dia: 'Lunes', hora: '08:00 - 09:00' },
            { horario_id: 2, deporte: 'Básquet', plan: 'Económico', dia: 'Martes', hora: '08:00 - 09:00' }
        ]
    };
    
    await testEndpoint(
        'Inscripción Múltiple',
        'POST',
        '/api/inscribir-multiple',
        {
            alumno: {
                dni: datosMultiple.dni,
                nombres: datosMultiple.nombre,
                apellidoPaterno: datosMultiple.apellidos.split(' ')[0],
                apellidoMaterno: datosMultiple.apellidos.split(' ')[1] || '',
                fechaNacimiento: datosMultiple.fechaNacimiento,
                edad: datosMultiple.edad,
                sexo: datosMultiple.sexo,
                correo: datosMultiple.correo,
                telefono: datosMultiple.telefono,
                nombreTutor: datosMultiple.nombreTutor,
                telefonoTutor: datosMultiple.telefonoTutor
            },
            horarios: datosMultiple.horarios
        }
    );
    
    log('═══ TESTS DE INSCRIPCIONES COMPLETADOS ═══', 'SUCCESS');
}

// ═══════════════════════════════════════════════════════════════════
// SUITE DE TESTS - ADMIN (requiere autenticación)
// ═══════════════════════════════════════════════════════════════════

async function testEndpointsAdmin() {
    log('═══ INICIANDO TESTS DE ENDPOINTS ADMIN ═══', 'TEST');
    
    // Intentar login
    const resultadoLogin = await testEndpoint(
        'Admin Login',
        'POST',
        '/api/admin/login',
        {
            username: 'admin',
            password: 'password123' // Cambiar por la contraseña real
        }
    );
    
    if (resultadoLogin.exito) {
        const token = resultadoLogin.resultado?.data?.token;
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Tests con autenticación
        await testEndpoint('Admin - Lista de Inscritos', 'GET', '/api/admin/inscritos', null, headers);
        await testEndpoint('Admin - Usuarios', 'GET', '/api/admin/usuarios', null, headers);
        await testEndpoint('Admin - Estadísticas Financieras', 'GET', '/api/admin/estadisticas-financieras', null, headers);
        await testEndpoint('Admin - Deportes', 'GET', '/api/admin/deportes', null, headers);
        await testEndpoint('Admin - Horarios', 'GET', '/api/admin/horarios', null, headers);
        await testEndpoint('Admin - Categorías', 'GET', '/api/admin/categorias', null, headers);
        
        log('Tests admin ejecutados con autenticación', 'SUCCESS');
    } else {
        log('No se pudo autenticar - Tests admin omitidos (configura credenciales válidas)', 'WARNING');
    }
    
    log('═══ TESTS DE ENDPOINTS ADMIN COMPLETADOS ═══', 'SUCCESS');
}

// ═══════════════════════════════════════════════════════════════════
// PRUEBAS DE CARGA - INSCRIPCIONES CONCURRENTES
// ═══════════════════════════════════════════════════════════════════

async function crearUsuarioYInscribir(userId) {
    const inicio = performance.now();
    
    try {
        const dni = generarDNI();
        const datosInscripcion = {
            alumno: {
                dni,
                nombres: `Usuario${userId}`,
                apellido_paterno: 'Test',
                apellido_materno: 'Carga',
                fecha_nacimiento: '2015-03-10',
                sexo: userId % 2 === 0 ? 'Masculino' : 'Femenino',
                email: generarEmail(),
                telefono: generarTelefono(),
                apoderado: `Tutor${userId}`,
                telefono_apoderado: generarTelefono()
            },
            horarios: [
                { horario_id: (userId % 10) + 1, deporte: 'Fútbol', plan: 'Económico', dia: 'Lunes', hora: '08:00 - 09:00' }
            ]
        };
        
        const respuesta = await api.post('/api/inscribir-multiple', datosInscripcion);
        const tiempo = performance.now() - inicio;
        
        // Actualizar estadísticas
        resultados.carga.inscripcionesExitosas++;
        resultados.carga.tiempoMaximo = Math.max(resultados.carga.tiempoMaximo, tiempo);
        resultados.carga.tiempoMinimo = Math.min(resultados.carga.tiempoMinimo, tiempo);
        
        return { exito: true, tiempo, dni };
    } catch (error) {
        const tiempo = performance.now() - inicio;
        resultados.carga.inscripcionesFallidas++;
        return { exito: false, tiempo, error: error.message };
    }
}

async function testCargaConcurrente() {
    log(`═══ INICIANDO PRUEBA DE CARGA - ${TOTAL_CONCURRENT_USERS} USUARIOS CONCURRENTES ═══`, 'LOAD');
    
    resultados.carga.usuariosConcurrentes = TOTAL_CONCURRENT_USERS;
    const inicioTotal = performance.now();
    
    // Crear promesas para todos los usuarios concurrentes
    const promesas = [];
    for (let i = 0; i < TOTAL_CONCURRENT_USERS; i++) {
        promesas.push(crearUsuarioYInscribir(i));
        
        // Añadir pequeño delay escalonado para simular usuarios reales
        if (i % 5 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    log(`Ejecutando ${TOTAL_CONCURRENT_USERS} inscripciones concurrentes...`, 'LOAD');
    const resultadosUsuarios = await Promise.all(promesas);
    
    const tiempoTotal = performance.now() - inicioTotal;
    
    // Calcular estadísticas
    const tiempos = resultadosUsuarios.filter(r => r.exito).map(r => r.tiempo);
    resultados.carga.tiempoPromedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length || 0;
    
    log(`═══ PRUEBA DE CARGA COMPLETADA ═══`, 'SUCCESS');
    log(`Total de usuarios: ${TOTAL_CONCURRENT_USERS}`, 'INFO');
    log(`Inscripciones exitosas: ${resultados.carga.inscripcionesExitosas}`, 'SUCCESS');
    log(`Inscripciones fallidas: ${resultados.carga.inscripcionesFallidas}`, 'ERROR');
    log(`Tiempo total: ${(tiempoTotal / 1000).toFixed(2)}s`, 'INFO');
    log(`Tiempo promedio por inscripción: ${resultados.carga.tiempoPromedio.toFixed(2)}ms`, 'INFO');
    log(`Tiempo mínimo: ${resultados.carga.tiempoMinimo.toFixed(2)}ms`, 'INFO');
    log(`Tiempo máximo: ${resultados.carga.tiempoMaximo.toFixed(2)}ms`, 'INFO');
    log(`Throughput: ${(TOTAL_CONCURRENT_USERS / (tiempoTotal / 1000)).toFixed(2)} inscripciones/segundo`, 'INFO');
}

// ═══════════════════════════════════════════════════════════════════
// PRUEBAS DE RESISTENCIA - INSCRIPCIONES SECUENCIALES
// ═══════════════════════════════════════════════════════════════════

async function testResistencia() {
    log('═══ INICIANDO PRUEBA DE RESISTENCIA ═══', 'LOAD');
    
    const INSCRIPCIONES_SECUENCIALES = 100;
    let exitosas = 0;
    let fallidas = 0;
    const tiempos = [];
    
    for (let i = 0; i < INSCRIPCIONES_SECUENCIALES; i++) {
        const resultado = await crearUsuarioYInscribir(1000 + i);
        
        if (resultado.exito) {
            exitosas++;
        } else {
            fallidas++;
        }
        
        tiempos.push(resultado.tiempo);
        
        // Log cada 20 inscripciones
        if ((i + 1) % 20 === 0) {
            log(`Progreso: ${i + 1}/${INSCRIPCIONES_SECUENCIALES} inscripciones`, 'INFO');
        }
    }
    
    const tiempoPromedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length;
    
    log('═══ PRUEBA DE RESISTENCIA COMPLETADA ═══', 'SUCCESS');
    log(`Total: ${INSCRIPCIONES_SECUENCIALES}`, 'INFO');
    log(`Exitosas: ${exitosas}`, 'SUCCESS');
    log(`Fallidas: ${fallidas}`, fallidas > 0 ? 'ERROR' : 'SUCCESS');
    log(`Tiempo promedio: ${tiempoPromedio.toFixed(2)}ms`, 'INFO');
}

// ═══════════════════════════════════════════════════════════════════
// REPORTE FINAL
// ═══════════════════════════════════════════════════════════════════

function generarReporte() {
    const fecha = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    const nombreArchivo = `reporte-produccion-${fecha}.json`;
    
    const reporte = {
        fecha: new Date().toISOString(),
        configuracion: {
            baseURL: BASE_URL,
            usuariosConcurrentes: TOTAL_CONCURRENT_USERS,
            timeout: TIMEOUT
        },
        resumen: {
            totalTests: resultados.total,
            exitosos: resultados.exitosos,
            fallidos: resultados.fallidos,
            tasaExito: ((resultados.exitosos / resultados.total) * 100).toFixed(2) + '%'
        },
        endpoints: resultados.endpoints,
        carga: resultados.carga,
        errores: resultados.errores,
        tiempos: {
            promedio: (resultados.tiempos.reduce((a, b) => a + b.tiempo, 0) / resultados.tiempos.length).toFixed(2) + 'ms',
            minimo: Math.min(...resultados.tiempos.map(t => t.tiempo)).toFixed(2) + 'ms',
            maximo: Math.max(...resultados.tiempos.map(t => t.tiempo)).toFixed(2) + 'ms'
        }
    };
    
    // Guardar reporte JSON
    fs.writeFileSync(nombreArchivo, JSON.stringify(reporte, null, 2));
    log(`Reporte guardado en: ${nombreArchivo}`, 'SUCCESS');
    
    // Generar reporte en texto plano
    const reporteTexto = generarReporteTexto(reporte);
    const nombreArchivoTexto = `reporte-produccion-${fecha}.txt`;
    fs.writeFileSync(nombreArchivoTexto, reporteTexto);
    log(`Reporte de texto guardado en: ${nombreArchivoTexto}`, 'SUCCESS');
    
    return reporte;
}

function generarReporteTexto(reporte) {
    return `
╔════════════════════════════════════════════════════════════════╗
║        REPORTE DE PRUEBAS DE PRODUCCIÓN - SISTEMA JAGUARES        ║
╚════════════════════════════════════════════════════════════════╝

📅 Fecha: ${reporte.fecha}
🌐 URL Base: ${reporte.configuracion.baseURL}

═══════════════════════════════════════════════════════════════════
📊 RESUMEN GENERAL
═══════════════════════════════════════════════════════════════════

✓ Tests Totales:      ${reporte.resumen.totalTests}
✓ Tests Exitosos:     ${reporte.resumen.exitosos}
✗ Tests Fallidos:     ${reporte.resumen.fallidos}
📈 Tasa de Éxito:     ${reporte.resumen.tasaExito}

═══════════════════════════════════════════════════════════════════
⚡ PRUEBAS DE CARGA
═══════════════════════════════════════════════════════════════════

👥 Usuarios Concurrentes:           ${reporte.carga.usuariosConcurrentes}
✅ Inscripciones Exitosas:          ${reporte.carga.inscripcionesExitosas}
❌ Inscripciones Fallidas:          ${reporte.carga.inscripcionesFallidas}
⏱️  Tiempo Promedio por Inscripción: ${reporte.carga.tiempoPromedio.toFixed(2)}ms
📊 Tiempo Mínimo:                   ${reporte.carga.tiempoMinimo.toFixed(2)}ms
📊 Tiempo Máximo:                   ${reporte.carga.tiempoMaximo.toFixed(2)}ms
🚀 Throughput:                      ${(reporte.carga.inscripcionesExitosas / (reporte.carga.tiempoPromedio / 1000)).toFixed(2)} req/s

═══════════════════════════════════════════════════════════════════
⏱️  TIEMPOS DE RESPUESTA
═══════════════════════════════════════════════════════════════════

⌀ Promedio:  ${reporte.tiempos.promedio}
↓ Mínimo:    ${reporte.tiempos.minimo}
↑ Máximo:    ${reporte.tiempos.maximo}

═══════════════════════════════════════════════════════════════════
🔍 DETALLE DE ENDPOINTS
═══════════════════════════════════════════════════════════════════

${Object.entries(reporte.endpoints).map(([nombre, info]) => 
    `${info.estado === 'OK' ? '✅' : '❌'} ${nombre.padEnd(40)} ${info.estado.padEnd(10)} ${info.tiempo || 'N/A'}`
).join('\n')}

═══════════════════════════════════════════════════════════════════
❌ ERRORES ENCONTRADOS
═══════════════════════════════════════════════════════════════════

${reporte.errores.length === 0 ? '✅ No se encontraron errores' : 
reporte.errores.map((error, idx) => 
    `${idx + 1}. ${error.endpoint}\n   Error: ${error.error}\n   Tiempo: ${error.tiempo.toFixed(2)}ms`
).join('\n\n')}

═══════════════════════════════════════════════════════════════════
🎯 CONCLUSIONES
═══════════════════════════════════════════════════════════════════

${reporte.resumen.fallidos === 0 
    ? '✅ SISTEMA LISTO PARA PRODUCCIÓN\n   Todos los tests pasaron exitosamente.'
    : `⚠️  SE ENCONTRARON ${reporte.resumen.fallidos} ERRORES\n   Revisa los detalles arriba antes de desplegar.`}

${reporte.carga.inscripcionesFallidas === 0
    ? '✅ SISTEMA SOPORTA CARGA CONCURRENTE\n   Todas las inscripciones concurrentes fueron exitosas.'
    : `⚠️  ${reporte.carga.inscripcionesFallidas} inscripciones fallaron bajo carga.\n   Considera optimizar el sistema.`}

═══════════════════════════════════════════════════════════════════

Generado por: Sistema de Testing Automatizado Jaguares
Versión: 2.0.0
`;
}

// ═══════════════════════════════════════════════════════════════════
// FUNCIÓN PRINCIPAL
// ═══════════════════════════════════════════════════════════════════

async function ejecutarTestsCompletos() {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║       SISTEMA DE PRUEBAS DE PRODUCCIÓN - JAGUARES              ║
║                                                                ║
║   Tests Completos de Endpoints, Carga y Resistencia           ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
    `);
    
    log(`Iniciando tests contra: ${BASE_URL}`, 'INFO');
    log(`Usuarios concurrentes configurados: ${TOTAL_CONCURRENT_USERS}`, 'INFO');
    
    const inicioTotal = performance.now();
    
    try {
        // 1. Tests de endpoints públicos
        await testEndpointsPublicos();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 2. Tests de inscripciones
        await testInscripciones();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 3. Tests de endpoints admin
        await testEndpointsAdmin();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 4. Pruebas de carga concurrente
        await testCargaConcurrente();
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 5. Pruebas de resistencia (opcional, descomentar si quieres ejecutar)
        // await testResistencia();
        
    } catch (error) {
        log(`Error durante las pruebas: ${error.message}`, 'ERROR');
        console.error(error);
    }
    
    const tiempoTotal = ((performance.now() - inicioTotal) / 1000).toFixed(2);
    
    log(`═══════════════════════════════════════════════════`, 'SUCCESS');
    log(`TESTS COMPLETADOS EN ${tiempoTotal}s`, 'SUCCESS');
    log(`═══════════════════════════════════════════════════`, 'SUCCESS');
    
    // Generar y mostrar reporte
    const reporte = generarReporte();
    
    console.log('\n' + generarReporteTexto(reporte));
    
    // Exit code basado en resultados
    if (resultados.fallidos > 0 || resultados.carga.inscripcionesFallidas > 0) {
        log('⚠️  ALGUNOS TESTS FALLARON - Revisa el reporte', 'WARNING');
        process.exit(1);
    } else {
        log('🎉 TODOS LOS TESTS PASARON EXITOSAMENTE', 'SUCCESS');
        process.exit(0);
    }
}

// Ejecutar tests
ejecutarTestsCompletos().catch(error => {
    log(`Error fatal: ${error.message}`, 'ERROR');
    console.error(error);
    process.exit(1);
});
