/**
 * Script para la página de confirmación
 */

// Variable global para almacenar los deportes con matrícula
let deportesConMatriculaGlobal = [];

document.addEventListener('DOMContentLoaded', () => {
    cargarDatosConfirmacion();
});

async function cargarDatosConfirmacion() {
    const datosInscripcion = LocalStorage.get('datosInscripcion');
    
    if (!datosInscripcion || !datosInscripcion.alumno || !datosInscripcion.horariosCompletos) {
        Utils.mostrarNotificacion('No hay datos de inscripción', 'error');
        window.location.href = 'inscripcion.html';
        return;
    }
    
    const { alumno, horariosCompletos } = datosInscripcion;
    
    if (horariosCompletos.length === 0) {
        Utils.mostrarNotificacion('No hay horarios seleccionados', 'error');
        window.location.href = 'seleccion-horarios.html';
        return;
    }
    
    // Verificar qué deportes son nuevos para el alumno en el año actual
    const deportesConMatricula = await verificarDeportesNuevos(alumno.dni, horariosCompletos);
    
    // Guardar en variable global para usar en confirmarInscripcion
    deportesConMatriculaGlobal = deportesConMatricula;
    
    // Renderizar
    renderizarConfirmacion(alumno, horariosCompletos, deportesConMatricula);
}

/**
 * Verifica qué deportes del alumno son nuevos en el año actual
 * Retorna array de deportes que requieren pago de matrícula
 */
async function verificarDeportesNuevos(dni, horariosSeleccionados) {
    try {
        const api = new AcademiaAPI();
        const resultado = await api.getMisInscripciones(dni);
        
        if (!resultado.success || !resultado.inscripciones) {
            // No hay inscripciones previas, todos los deportes son nuevos
            const deportesUnicos = [...new Set(horariosSeleccionados.map(h => h.deporte))];
            return deportesUnicos;
        }
        
        const añoActual = new Date().getFullYear(); // 2026
        
        // Obtener deportes en los que ya se inscribió este año
        const deportesYaInscritos = new Set();
        resultado.inscripciones.forEach(inscripcion => {
            // La fecha viene en formato DD/MM/YYYY
            const fechaPartes = inscripcion.fecha_inscripcion.split('/');
            const añoInscripcion = parseInt(fechaPartes[2]);
            
            if (añoInscripcion === añoActual) {
                deportesYaInscritos.add(inscripcion.deporte);
            }
        });
        
        // Deportes seleccionados únicos
        const deportesSeleccionados = [...new Set(horariosSeleccionados.map(h => h.deporte))];
        
        // Filtrar solo los deportes nuevos (que no están en deportesYaInscritos)
        const deportesNuevos = deportesSeleccionados.filter(deporte => !deportesYaInscritos.has(deporte));
        
        return deportesNuevos;
    } catch (error) {
        console.error('Error al verificar deportes:', error);
        // En caso de error, asumir que todos son nuevos por seguridad
        const deportesUnicos = [...new Set(horariosSeleccionados.map(h => h.deporte))];
        return deportesUnicos;
    }
}

function renderizarConfirmacion(alumno, horarios, deportesConMatricula = []) {
    const container = document.getElementById('contenidoConfirmacion');
    
    // Calcular precio de deportes
    const precioDeportes = horarios.reduce((sum, h) => sum + parseFloat(h.precio || 0), 0);
    
    // Matrícula: S/ 20 por cada deporte nuevo
    const MATRICULA_POR_DEPORTE = 20;
    const cantidadDeportesNuevos = deportesConMatricula.length;
    const montoMatricula = cantidadDeportesNuevos * MATRICULA_POR_DEPORTE;
    const cobraMatricula = cantidadDeportesNuevos > 0;
    
    // Precio total = deportes + matrícula (por deportes nuevos)
    const precioTotal = precioDeportes + montoMatricula;
    
    const edad = Utils.calcularEdad(alumno.fecha_nacimiento);
    
    container.innerHTML = `
        <div class="lg:col-span-2 flex flex-col gap-6">
            <!-- Datos del Alumno -->
            <div class="bg-white dark:bg-[#222] rounded-lg p-8 shadow-md border-l-4 border-primary shadow-zinc-200/50 dark:shadow-none">
                <div class="flex items-center gap-4 mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4">
                    <div class="bg-secondary p-2.5 rounded text-primary shadow-lg">
                        <span class="material-symbols-outlined text-2xl">person</span>
                    </div>
                    <h2 class="text-secondary dark:text-white text-xl font-bold uppercase tracking-wide">Datos del Alumno</h2>
                    <button onclick="window.location.href='inscripcion.html'" class="ml-auto text-xs text-primary hover:text-primary-dark font-bold uppercase tracking-wider flex items-center gap-1 transition-colors border border-primary/30 px-3 py-1.5 rounded hover:bg-primary/5">
                        <span class="material-symbols-outlined text-sm">edit</span> Editar
                    </button>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-8">
                    <div class="flex flex-col gap-1.5">
                        <p class="text-primary-dark dark:text-primary text-[10px] font-black uppercase tracking-widest">Nombre Completo</p>
                        <p class="text-secondary dark:text-gray-100 text-lg font-bold">${alumno.nombres} ${alumno.apellidos}</p>
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <p class="text-primary-dark dark:text-primary text-[10px] font-black uppercase tracking-widest">DNI / Documento</p>
                        <p class="text-secondary dark:text-gray-100 text-lg font-bold">${alumno.dni}</p>
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <p class="text-primary-dark dark:text-primary text-[10px] font-black uppercase tracking-widest">Fecha de Nacimiento</p>
                        <p class="text-secondary dark:text-gray-100 text-lg font-bold">${Utils.formatearFecha(alumno.fecha_nacimiento)}</p>
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <p class="text-primary-dark dark:text-primary text-[10px] font-black uppercase tracking-widest">Edad</p>
                        <div class="flex items-center gap-2">
                            <span class="bg-secondary text-primary px-3 py-1 rounded text-xs font-black uppercase tracking-wider shadow-sm">${edad} años</span>
                        </div>
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <p class="text-primary-dark dark:text-primary text-[10px] font-black uppercase tracking-widest">Teléfono</p>
                        <p class="text-secondary dark:text-gray-100 text-base font-bold">${alumno.telefono}</p>
                    </div>
                    <div class="flex flex-col gap-1.5">
                        <p class="text-primary-dark dark:text-primary text-[10px] font-black uppercase tracking-widest">Seguro</p>
                        <p class="text-secondary dark:text-gray-100 text-base font-bold">${alumno.seguro_tipo}</p>
                    </div>
                    ${edad < 18 && alumno.apoderado ? `
                    <div class="flex flex-col gap-2 md:col-span-2 bg-zinc-50 dark:bg-[#2a2a2a] p-4 rounded border border-zinc-100 dark:border-zinc-700 mt-2">
                        <p class="text-primary-dark dark:text-primary text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                            <span class="material-symbols-outlined text-sm">emergency</span> Contacto de Apoderado
                        </p>
                        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-1 gap-2">
                            <p class="text-secondary dark:text-gray-100 text-base font-bold">${alumno.apoderado}</p>
                            <p class="text-secondary dark:text-gray-100 text-base font-bold font-mono bg-white dark:bg-black px-2 py-1 rounded border border-zinc-200 dark:border-zinc-600">${alumno.telefono_apoderado}</p>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>

        <!-- Resumen de Horarios -->
        <div class="flex flex-col gap-6">
            <div class="bg-secondary dark:bg-[#111] rounded-lg overflow-hidden shadow-xl shadow-zinc-300/50 dark:shadow-none flex flex-col max-h-[550px] text-white relative group">
                <div class="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-bl-full -mr-8 -mt-8 z-0"></div>
                <div class="p-6 flex flex-col gap-4 flex-1 min-h-0 relative z-10">
                    <div class="flex flex-col gap-1 pb-3 border-b border-white/10">
                        <div class="flex items-center gap-2 text-primary mb-1">
                            <span class="material-symbols-outlined text-lg">schedule</span>
                            <span class="text-[9px] font-black uppercase tracking-[0.2em]">Horarios Seleccionados</span>
                        </div>
                        <p class="text-xl font-black italic uppercase tracking-tight">Resumen de Inscripción</p>
                    </div>

                    <div class="space-y-2.5 overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-white/5">
                        ${horarios.map(h => `
                            <div class="bg-white/10 rounded-lg p-3.5 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-colors">
                                <div class="flex justify-between items-start mb-2">
                                    <div class="flex items-center gap-2.5">
                                        <span class="material-symbols-outlined text-primary text-2xl">${obtenerIconoDeporte(h.deporte)}</span>
                                        <div>
                                            <p class="font-bold text-base leading-tight">${h.deporte}</p>
                                            <p class="text-xs text-zinc-400 mt-0.5">${h.dia}</p>
                                        </div>
                                    </div>
                                    <span class="text-primary font-black text-lg">${Utils.formatearPrecio(h.precio)}</span>
                                </div>
                                <div class="flex items-center gap-2 text-xs text-zinc-300">
                                    <span class="material-symbols-outlined text-sm">schedule</span>
                                    <span>${h.hora_inicio} - ${h.hora_fin}</span>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="border-t border-white/20 pt-3 mt-auto flex-shrink-0">
                        <!-- Resumen de precios -->
                        <div class="space-y-2 mb-3">
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-zinc-300">Deportes:</span>
                                <span class="font-bold text-base text-white">${Utils.formatearPrecio(precioDeportes)}</span>
                            </div>
                            
                            ${cobraMatricula ? `
                                <div class="flex justify-between items-center">
                                    <span class="flex items-center gap-1.5 text-sm">
                                        <span class="material-symbols-outlined text-base text-amber-400">card_membership</span>
                                        <span class="text-amber-300 font-medium">Matrícula (${cantidadDeportesNuevos} ${cantidadDeportesNuevos === 1 ? 'deporte' : 'deportes'}):</span>
                                    </span>
                                    <span class="font-bold text-base text-amber-400">${Utils.formatearPrecio(montoMatricula)}</span>
                                </div>
                            ` : ''}
                        </div>
                        
                        <!-- Mensaje informativo sobre matrícula (compacto) -->
                        ${cobraMatricula ? `
                            <div class="bg-amber-500/10 border border-amber-500/30 rounded-md p-2 mb-3">
                                <div class="flex items-start gap-1.5">
                                    <span class="material-symbols-outlined text-amber-400 text-sm mt-0.5 flex-shrink-0">info</span>
                                    <div class="text-[10px] text-amber-200 leading-snug">
                                        <p class="font-semibold">Deportes con matrícula: <span class="font-normal">${deportesConMatricula.join(', ')}</span></p>
                                        <p class="text-amber-100/80 mt-0.5">S/ 20 por deporte nuevo. Si regresas al mismo deporte en el año, no pagas nuevamente.</p>
                                    </div>
                                </div>
                            </div>
                        ` : `
                            <div class="bg-green-500/10 border border-green-500/30 rounded-md p-2 mb-3">
                                <div class="flex items-center gap-1.5">
                                    <span class="material-symbols-outlined text-green-400 text-sm flex-shrink-0">check_circle</span>
                                    <p class="text-[10px] text-green-200 leading-snug">
                                        <strong>Matrícula pagada:</strong> Ya te inscribiste en estos deportes este año.
                                    </p>
                                </div>
                            </div>
                        `}
                        
                        <div class="flex justify-between items-center border-t border-white/10 pt-2.5">
                            <span class="text-zinc-400 text-sm uppercase font-bold tracking-wide">Total</span>
                            <span class="text-3xl font-black text-primary">${Utils.formatearPrecio(precioTotal)}</span>
                        </div>
                        <p class="text-[10px] text-zinc-500 text-right mt-1">${cobraMatricula ? 'Mensualidad + matrícula de deportes nuevos' : 'Pago mensual'}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function obtenerIconoDeporte(deporte) {
    const iconos = {
        'Fútbol': 'sports_soccer',
        'Fútbol Femenino': 'sports_soccer',
        'Vóley': 'sports_volleyball',
        'Básquet': 'sports_basketball',
        'Entrenamiento Funcional Adultos': 'fitness_center',
        'Entrenamiento Funcional Menores': 'fitness_center',
        'Entrenamiento de Fuerza y Tonificación Muscular': 'exercise'
    };
    return iconos[deporte] || 'sports';
}

async function confirmarInscripcion() {
    const btn = document.getElementById('btnConfirmarInscripcion');
    btn.disabled = true;
    btn.innerHTML = `
        <div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
        <span>Procesando...</span>
    `;
    
    try {
        const datosInscripcion = LocalStorage.get('datosInscripcion');
        const { alumno, horariosCompletos } = datosInscripcion;
        
        console.log('📋 Enviando inscripción con horarios completos:', horariosCompletos);
        
        // Enviar inscripción al backend con los horarios completos (no solo IDs)
        const resultado = await academiaAPI.inscribirMultiple(alumno, horariosCompletos);
        
        if (resultado.success) {
            // Guardar código de operación con todos los datos necesarios
            LocalStorage.set('ultimaInscripcion', {
                codigo: resultado.codigo_operacion,
                fecha: new Date().toISOString(),
                alumno: `${alumno.nombres} ${alumno.apellidos}`,
                dni: alumno.dni,
                horarios: horariosCompletos, // Guardar horarios completos para el WhatsApp
                matricula: {
                    deportesNuevos: deportesConMatriculaGlobal,
                    cantidad: deportesConMatriculaGlobal.length,
                    monto: deportesConMatriculaGlobal.length * 20
                }
            });
            
            // Limpiar datos temporales
            LocalStorage.remove('datosInscripcion');
            
            // Redirigir a página de éxito
            window.location.href = `exito.html?codigo=${resultado.codigo_operacion}`;
        } else {
            throw new Error(resultado.error || 'Error al procesar inscripción');
        }
        
    } catch (error) {
        console.error('Error al confirmar inscripción:', error);
        Utils.mostrarNotificacion(`Error: ${error.message}`, 'error');
        
        btn.disabled = false;
        btn.innerHTML = `
            <span>Confirmar y Finalizar</span>
            <span class="material-symbols-outlined">check_circle</span>
        `;
    }
}

function volverHorarios() {
    if (confirm('¿Deseas volver a seleccionar horarios?')) {
        window.location.href = 'seleccion-horarios.html';
    }
}
