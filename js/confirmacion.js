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
        window.location.href = 'seleccion-horarios-new.html';
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
            // Validar que exista fecha_inscripcion
            if (!inscripcion.fecha_inscripcion) {
                return; // Skip this inscription
            }
            
            // La fecha viene en formato DD/MM/YYYY
            const fechaPartes = inscripcion.fecha_inscripcion.split('/');
            if (fechaPartes.length !== 3) {
                return; // Skip if format is invalid
            }
            
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
                        ${horarios.map((h, index) => {
                            // Contar cuántos horarios del mismo deporte y plan hay
                            const mismoDeportePlan = horarios.filter(x => x.deporte === h.deporte && x.plan === h.plan);
                            const cantidadDias = mismoDeportePlan.length;
                            const posicionEnDeporte = mismoDeportePlan.findIndex(x => x.horario_id === h.horario_id) + 1;
                            
                            // Calcular precio individual según el plan y posición
                            const planNormalizado = (h.plan || '').toLowerCase().trim();
                            let precioDisplay;
                            
                            if (planNormalizado === 'economico' || planNormalizado === 'económico') {
                                // Plan Económico: 2 días = 30 c/u, 3er día = 20
                                if (cantidadDias === 2) {
                                    precioDisplay = '<span class="text-white font-bold">S/. 30.00</span>';
                                } else if (cantidadDias === 3) {
                                    precioDisplay = posicionEnDeporte <= 2 ? '<span class="text-white font-bold">S/. 30.00</span>' : '<span class="text-white font-bold">S/. 20.00</span>';
                                } else {
                                    precioDisplay = '<span class="text-white font-bold">S/. 30.00</span>';
                                }
                            } else if (planNormalizado === 'estándar' || planNormalizado === 'estandar') {
                                // Plan Estándar: S/. 40 cada día
                                precioDisplay = '<span class="text-white font-bold">S/. 40.00</span>';
                            } else if (planNormalizado === 'premium') {
                                // Plan Premium: 3 días = 150 (50 c/u)
                                precioDisplay = '<span class="text-white font-bold">S/. 50.00</span>';
                            } else {
                                // Otros planes: usar precio de BD
                                precioDisplay = h.precio ? `S/. ${parseFloat(h.precio).toFixed(2)}` : 'Consultar';
                            }
                            
                            return `
                            <div class="bg-white/10 rounded-lg p-3.5 backdrop-blur-sm border border-white/20 hover:bg-white/15 transition-colors">
                                <div class="flex justify-between items-start mb-2">
                                    <div class="flex items-center gap-2.5">
                                        <span class="material-symbols-outlined text-primary text-2xl">${obtenerIconoDeporte(h.deporte)}</span>
                                        <div>
                                            <p class="font-bold text-base leading-tight">${h.deporte}</p>
                                            <p class="text-xs text-zinc-400 mt-0.5">${h.dia}</p>
                                        </div>
                                    </div>
                                    <div class="text-primary font-black text-lg text-right">${precioDisplay}</div>
                                </div>
                                <div class="flex items-center gap-2 text-xs text-zinc-300">
                                    <span class="material-symbols-outlined text-sm">schedule</span>
                                    <span>${h.hora_inicio} - ${h.hora_fin}</span>
                                </div>
                            </div>
                            `;
                        }).join('')}
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
    // Mostrar loader profesional
    mostrarLoaderInscripcion();
    
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
            
            // Limpiar datos temporales para evitar reintentos
            LocalStorage.remove('datosInscripcion');
            LocalStorage.remove('horariosSeleccionados');
            
            // Redirigir a página de éxito
            window.location.href = `exito.html?codigo=${resultado.codigo_operacion}`;
        } else {
            throw new Error(resultado.error || 'Error al procesar inscripción');
        }
        
    } catch (error) {
        // Cerrar loader antes de mostrar error
        cerrarLoaderInscripcion();
        
        console.error('Error al confirmar inscripción:', error);
        
        // Restaurar botón
        btn.disabled = false;
        btn.innerHTML = `
            <span>Confirmar y Finalizar</span>
            <span class="material-symbols-outlined">check_circle</span>
        `;
        
        // Mostrar modal informativo según el tipo de error
        let titulo = '⚠️ Error en la Inscripción';
        let mensaje = error.message;
        let detalles = '';
        
        // Error 409: Inscripción duplicada
        if (error.status === 409 && error.data) {
            titulo = '🚫 Inscripción Duplicada';
            mensaje = error.data.message || 'Ya existe una inscripción activa para este deporte';
            if (error.data.deporte) {
                detalles = `<div class="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p class="font-semibold text-yellow-800 dark:text-yellow-400">Deporte: ${error.data.deporte}</p>
                    ${error.data.inscripcion_existente ? `
                        <p class="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                            Estado: ${error.data.inscripcion_existente.estado === 'activa' ? 'Activa' : 'Pendiente'}<br>
                            Plan: ${error.data.inscripcion_existente.plan}<br>
                            Precio: S/ ${error.data.inscripcion_existente.precio}
                        </p>
                    ` : ''}
                </div>`;
            }
        }
        // Error 400: Horarios sin ID o validación
        else if (error.status === 400 && error.data) {
            titulo = '⚠️ Datos Inválidos';
            mensaje = error.data.message || 'Los datos enviados no son válidos';
            if (error.data.horarios_invalidos) {
                detalles = `<div class="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p class="text-sm text-red-700 dark:text-red-400">
                        Se encontraron ${error.data.horarios_invalidos} horarios sin identificador válido.
                        <br><br>
                        <strong>Solución:</strong> Por favor, vuelve al paso anterior y selecciona los horarios de la lista disponible.
                    </p>
                </div>`;
            }
        }
        // Error 500: Error del servidor (puede ser duplicado en sistema externo)
        else if (error.status === 500 && error.data) {
            titulo = '⚠️ Error al Procesar';
            mensaje = error.data.message || 'No se pudo completar la inscripción';
            
            // Detectar si es un duplicado
            if (error.data.detalles === 'DUPLICADO' || (error.data.message && error.data.message.includes('Ya estás inscrito'))) {
                titulo = '🚫 Inscripción Duplicada';
                mensaje = 'Ya existe una inscripción activa para uno o más de estos horarios.';
                detalles = `<div class="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p class="text-sm text-yellow-700 dark:text-yellow-400">
                        ${error.data.message}
                    </p>
                    <p class="text-xs text-yellow-600 dark:text-yellow-500 mt-2">
                        <strong>Sugerencia:</strong> Si deseas cambiar de horario, primero debes dar de baja tu inscripción actual.
                    </p>
                </div>`;
            }
        }
        else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            titulo = '🌐 Error de Conexión';
            mensaje = 'No se pudo conectar con el servidor';
            detalles = `<div class="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p class="text-sm text-blue-700 dark:text-blue-400">
                    • Verifica tu conexión a internet<br>
                    • El servidor puede estar temporalmente no disponible<br>
                    • Intenta nuevamente en unos momentos
                </p>
            </div>`;
        }
        
        // Crear y mostrar modal personalizado
        const modalHTML = `
            <div id="modalErrorInscripcion" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
                    <div class="flex items-start gap-4 mb-4">
                        <div class="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <span class="material-symbols-outlined text-3xl text-red-600 dark:text-red-400">error</span>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-lg font-bold text-black dark:text-white mb-2">${titulo}</h3>
                            <p class="text-text-muted dark:text-gray-300">${mensaje}</p>
                            ${detalles}
                        </div>
                    </div>
                    <div class="flex gap-3 mt-6">
                        ${error.status === 409 ? `
                            <button onclick="window.location.href='admin-panel.html?dni=${alumno.dni}'" 
                                    class="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
                                Ver Mis Inscripciones
                            </button>
                        ` : (error.status === 400 || (error.status === 500 && error.data?.detalles === 'DUPLICADO')) ? `
                            <button onclick="localStorage.clear(); window.location.href='seleccion-horarios-new.html'" 
                                    class="flex-1 px-4 py-2.5 bg-primary hover:brightness-110 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2">
                                <span class="material-symbols-outlined">refresh</span>
                                Seleccionar Otros Horarios
                            </button>
                        ` : ''}
                        <button onclick="document.getElementById('modalErrorInscripcion').remove()" 
                                class="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-black dark:text-white rounded-lg font-semibold transition-colors">
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Insertar modal en el DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        btn.disabled = false;
        btn.innerHTML = `
            <span>Confirmar y Finalizar</span>
            <span class="material-symbols-outlined">check_circle</span>
        `;
    }
}

function volverHorarios() {
    // Crear modal personalizado en lugar del confirm nativo
    const modalHTML = `
        <div id="modalVolverHorarios" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div class="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all animate-scale-in">
                <div class="flex items-start gap-4 mb-4">
                    <div class="flex-shrink-0 w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                        <span class="material-symbols-outlined text-3xl text-yellow-600 dark:text-yellow-400">warning</span>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-lg font-bold text-black dark:text-white mb-2">¿Volver a seleccionar horarios?</h3>
                        <p class="text-text-muted dark:text-gray-300">Si vuelves, perderás la selección actual y tendrás que elegir tus horarios nuevamente.</p>
                    </div>
                </div>
                <div class="flex gap-3 mt-6">
                    <button onclick="document.getElementById('modalVolverHorarios').remove()" 
                            class="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-black dark:text-white rounded-lg font-semibold transition-colors">
                        Cancelar
                    </button>
                    <button onclick="window.location.href='seleccion-horarios-new.html'" 
                            class="flex-1 px-4 py-2.5 bg-primary hover:brightness-110 text-white rounded-lg font-semibold transition-all flex items-center justify-center gap-2">
                        <span class="material-symbols-outlined">arrow_back</span>
                        Sí, volver
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

/**
 * Mostrar loader profesional durante la inscripción
 */
function mostrarLoaderInscripcion() {
    const loader = document.createElement('div');
    loader.id = 'loaderInscripcion';
    loader.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm';
    loader.innerHTML = `
        <div class="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4 border border-primary/20">
            <div class="flex flex-col items-center gap-6">
                <!-- Spinner animado -->
                <div class="relative">
                    <div class="size-24 rounded-full border-4 border-primary/20"></div>
                    <div class="absolute inset-0 size-24 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                    <div class="absolute inset-0 flex items-center justify-center">
                        <span class="material-symbols-outlined text-primary text-4xl animate-pulse">rocket_launch</span>
                    </div>
                </div>
                
                <!-- Texto animado -->
                <div class="text-center">
                    <h3 class="text-2xl font-black text-text-main dark:text-white mb-2">Procesando Inscripción</h3>
                    <p class="text-sm text-text-main/70 dark:text-white/70 mb-3">Por favor espera mientras procesamos tu inscripción...</p>
                    
                    <!-- Pasos -->
                    <div class="space-y-2 text-left bg-gray-50 dark:bg-white/5 rounded-xl p-4">
                        <div class="flex items-center gap-2 text-xs">
                            <div class="size-2 rounded-full bg-primary animate-pulse"></div>
                            <span class="text-text-main/60 dark:text-white/60">Guardando datos del alumno</span>
                        </div>
                        <div class="flex items-center gap-2 text-xs">
                            <div class="size-2 rounded-full bg-primary/50 animate-pulse" style="animation-delay: 0.2s"></div>
                            <span class="text-text-main/60 dark:text-white/60">Registrando horarios seleccionados</span>
                        </div>
                        <div class="flex items-center gap-2 text-xs">
                            <div class="size-2 rounded-full bg-primary/50 animate-pulse" style="animation-delay: 0.4s"></div>
                            <span class="text-text-main/60 dark:text-white/60">Procesando inscripción</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(loader);
    document.body.style.overflow = 'hidden';
}

/**
 * Cerrar loader de inscripción
 */
function cerrarLoaderInscripcion() {
    const loader = document.getElementById('loaderInscripcion');
    if (loader) {
        loader.remove();
        document.body.style.overflow = '';
    }
}

