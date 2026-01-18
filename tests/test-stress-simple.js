import axios from 'axios';
import { performance } from 'perf_hooks';

const BASE_URL = 'http://localhost:3002';

// Configuración de las olas de usuarios
const OLAS = [
    { nombre: 'Ola 1', usuarios: 10, delay: 50 },
    { nombre: 'Ola 2', usuarios: 25, delay: 40 },
    { nombre: 'Ola 3', usuarios: 50, delay: 30 },
    { nombre: 'Ola 4', usuarios: 100, delay: 20 },
    { nombre: 'Ola 5', usuarios: 200, delay: 10 }
];

function generarDNI() {
    return `9${Math.floor(10000000 + Math.random() * 90000000)}`;
}

function generarEmail() {
    return `test${Date.now()}${Math.random().toString(36).substring(7)}@test.com`;
}

function generarTelefono() {
    return `9${Math.floor(10000000 + Math.random() * 90000000)}`;
}

async function inscribirUsuario(userId, olaId) {
    const inicio = performance.now();
    
    try {
        const dni = generarDNI();
        const datosInscripcion = {
            alumno: {
                dni,
                nombres: `Usuario${userId}`,
                apellido_paterno: 'Test',
                apellido_materno: `Ola${olaId}`,
                fecha_nacimiento: '2015-03-10',
                sexo: userId % 2 === 0 ? 'Masculino' : 'Femenino',
                email: generarEmail(),
                telefono: generarTelefono(),
                apoderado: `Tutor${userId}`,
                telefono_apoderado: generarTelefono()
            },
            horarios: [
                { horario_id: (userId % 10) + 1, deporte: 'Futbol', plan: 'Economico', dia: 'Lunes', hora: '08:00 - 09:00' }
            ]
        };
        
        const respuesta = await axios.post(`${BASE_URL}/api/inscribir-multiple`, datosInscripcion, {
            timeout: 30000
        });
        
        const tiempo = performance.now() - inicio;
        
        return {
            exito: true,
            tiempo,
            dni,
            status: respuesta.status
        };
        
    } catch (error) {
        const tiempo = performance.now() - inicio;
        
        return {
            exito: false,
            tiempo,
            error: error.code || error.message,
            status: error.response?.status
        };
    }
}

async function ejecutarOla(olaConfig, numeroOla) {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`>>> ${olaConfig.nombre}: ${olaConfig.usuarios} USUARIOS CONCURRENTES <<<`);
    console.log('='.repeat(70));
    
    const inicioOla = performance.now();
    const promesas = [];
    
    // Crear todas las promesas con pequeño delay escalonado
    for (let i = 0; i < olaConfig.usuarios; i++) {
        promesas.push(inscribirUsuario(i, numeroOla));
        
        if (i % 10 === 0 && i > 0) {
            await new Promise(resolve => setTimeout(resolve, olaConfig.delay));
        }
    }
    
    console.log(`\nEjecutando ${olaConfig.usuarios} inscripciones concurrentes...`);
    const resultados = await Promise.all(promesas);
    const tiempoTotal = performance.now() - inicioOla;
    
    // Calcular estadísticas
    const exitosos = resultados.filter(r => r.exito).length;
    const fallidos = resultados.filter(r => !r.exito).length;
    const tiempos = resultados.filter(r => r.exito).map(r => r.tiempo);
    
    const tiempoPromedio = tiempos.reduce((a, b) => a + b, 0) / tiempos.length || 0;
    const tiempoMin = Math.min(...tiempos) || 0;
    const tiempoMax = Math.max(...tiempos) || 0;
    const throughput = (exitosos / (tiempoTotal / 1000));
    
    // Errores por tipo
    const errores = {};
    resultados.filter(r => !r.exito).forEach(r => {
        const error = r.error || 'Desconocido';
        errores[error] = (errores[error] || 0) + 1;
    });
    
    // Mostrar resultados
    console.log(`\n>>> RESULTADOS ${olaConfig.nombre}:`);
    console.log(`Total:           ${olaConfig.usuarios}`);
    console.log(`Exitosos:        ${exitosos} (${((exitosos/olaConfig.usuarios)*100).toFixed(1)}%)`);
    console.log(`Fallidos:        ${fallidos} (${((fallidos/olaConfig.usuarios)*100).toFixed(1)}%)`);
    console.log(`\nTIEMPOS:`);
    console.log(`Tiempo Total:    ${(tiempoTotal/1000).toFixed(2)}s`);
    console.log(`Promedio:        ${tiempoPromedio.toFixed(2)}ms`);
    console.log(`Minimo:          ${tiempoMin.toFixed(2)}ms`);
    console.log(`Maximo:          ${tiempoMax.toFixed(2)}ms`);
    console.log(`Throughput:      ${throughput.toFixed(2)} req/s`);
    
    if (Object.keys(errores).length > 0) {
        console.log(`\nERRORES:`);
        Object.entries(errores).forEach(([error, cantidad]) => {
            console.log(`  - ${error}: ${cantidad}`);
        });
    }
    
    return {
        ola: olaConfig.nombre,
        usuarios: olaConfig.usuarios,
        exitosos,
        fallidos,
        tasaExito: (exitosos/olaConfig.usuarios)*100,
        tiempoTotal: tiempoTotal/1000,
        tiempoPromedio,
        tiempoMin,
        tiempoMax,
        throughput,
        errores
    };
}

async function ejecutarPruebasExtremass() {
    console.log('\n' + '='.repeat(70));
    console.log(' '.repeat(15) + 'PRUEBAS DE ESTRES EXTREMO');
    console.log(' '.repeat(20) + 'Sistema Jaguares');
    console.log('='.repeat(70));
    
    const inicioTotal = performance.now();
    const resultadosOlas = [];
    
    for (let i = 0; i < OLAS.length; i++) {
        const resultado = await ejecutarOla(OLAS[i], i + 1);
        resultadosOlas.push(resultado);
        
        // Pausa entre olas
        if (i < OLAS.length - 1) {
            console.log(`\nEsperando 3 segundos antes de la siguiente ola...`);
            await new Promise(resolve => setTimeout(resolve, 3000));
        }
    }
    
    const tiempoTotalPruebas = (performance.now() - inicioTotal) / 1000;
    
    // REPORTE FINAL
    console.log('\n' + '='.repeat(70));
    console.log(' '.repeat(25) + 'REPORTE FINAL');
    console.log('='.repeat(70));
    
    console.log(`\nTiempo Total de Pruebas: ${tiempoTotalPruebas.toFixed(2)}s`);
    console.log(`\nRESUMEN POR OLA:\n`);
    
    resultadosOlas.forEach(r => {
        console.log(`${r.ola.padEnd(8)} | ${r.usuarios.toString().padStart(3)} usuarios | ` +
                    `${r.exitosos.toString().padStart(3)}/${r.usuarios} exitosos (${r.tasaExito.toFixed(1)}%) | ` +
                    `${r.throughput.toFixed(1)} req/s | ` +
                    `Prom: ${r.tiempoPromedio.toFixed(0)}ms`);
    });
    
    // Análisis de degradación
    console.log(`\nANALISIS DE DEGRADACION:`);
    const degradacion = [];
    for (let i = 1; i < resultadosOlas.length; i++) {
        const anterior = resultadosOlas[i-1];
        const actual = resultadosOlas[i];
        const cambioThroughput = ((actual.throughput - anterior.throughput) / anterior.throughput) * 100;
        const cambioTiempo = ((actual.tiempoPromedio - anterior.tiempoPromedio) / anterior.tiempoPromedio) * 100;
        
        degradacion.push({
            de: anterior.ola,
            a: actual.ola,
            cambioThroughput: cambioThroughput.toFixed(1),
            cambioTiempo: cambioTiempo.toFixed(1)
        });
        
        console.log(`${anterior.ola} -> ${actual.ola}: ` +
                    `Throughput ${cambioThroughput > 0 ? '+' : ''}${cambioThroughput.toFixed(1)}%, ` +
                    `Tiempo ${cambioTiempo > 0 ? '+' : ''}${cambioTiempo.toFixed(1)}%`);
    }
    
    // Conclusiones
    console.log(`\nCONCLUSIONES:`);
    const tasaExitoTotal = resultadosOlas.reduce((sum, r) => sum + r.exitosos, 0) / 
                           resultadosOlas.reduce((sum, r) => sum + r.usuarios, 0) * 100;
    
    console.log(`Tasa de exito general: ${tasaExitoTotal.toFixed(1)}%`);
    
    const throughputPromedio = resultadosOlas.reduce((sum, r) => sum + r.throughput, 0) / resultadosOlas.length;
    console.log(`Throughput promedio: ${throughputPromedio.toFixed(2)} req/s`);
    
    const mejorOla = resultadosOlas.reduce((max, r) => r.throughput > max.throughput ? r : max);
    console.log(`Mejor rendimiento: ${mejorOla.ola} con ${mejorOla.throughput.toFixed(2)} req/s`);
    
    const peorOla = resultadosOlas.reduce((min, r) => r.throughput < min.throughput ? r : min);
    console.log(`Peor rendimiento: ${peorOla.ola} con ${peorOla.throughput.toFixed(2)} req/s`);
    
    if (tasaExitoTotal >= 95) {
        console.log(`\nVEREDICTO: EXCELENTE - Sistema maneja cargas extremas sin problemas`);
    } else if (tasaExitoTotal >= 80) {
        console.log(`\nVEREDICTO: BUENO - Sistema estable bajo carga, algunas optimizaciones posibles`);
    } else if (tasaExitoTotal >= 60) {
        console.log(`\nVEREDICTO: ACEPTABLE - Sistema funcional pero requiere optimizaciones`);
    } else {
        console.log(`\nVEREDICTO: CRITICO - Sistema no soporta la carga, requiere mejoras urgentes`);
    }
    
    console.log('\n' + '='.repeat(70));
    console.log(' '.repeat(25) + 'FIN DE PRUEBAS');
    console.log('='.repeat(70) + '\n');
}

ejecutarPruebasExtremass().catch(err => {
    console.error('Error en las pruebas:', err);
    process.exit(1);
});
