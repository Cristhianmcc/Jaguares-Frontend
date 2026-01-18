/**
 * Script para selección de horarios con cronograma por deportes
 * Nueva versión con restricción de horarios a la misma hora
 */

// Variables globales
let horariosDisponibles = [];
let horariosSeleccionados = [];
let deporteActual = null;
let horariosPorDeporte = {}; // Almacena el bloque horario seleccionado por cada deporte
let añoNacimientoGlobal = null; // Guardar el año para filtrar horarios

// Planes y precios actualizados según la estructura del negocio
const PLANES = {
    'Económico': {
        base: 60, // 2 días/semana = 8 clases/mes (PROMOCIONAL)
        incremento_dia: 20, // +1 día = +20 soles (12 clases/mes = 80 soles)
        precio_por_dias: {
            2: 60,  // 8 clases (mínimo)
            3: 80   // 12 clases
        },
        minimo_dias: 2,
        maximo_dias: 3
    },
    'Estándar': {
        // Sumatoria directa: 2x=80, 3x=120 (MÍNIMO 2 DÍAS)
        precio_por_dias: {
            2: 80,   // 8 clases
            3: 120   // 12 clases
        },
        minimo_dias: 2,
        maximo_dias: 3
    },
    'Premium': {
        // 2 días = 100, 3 días = 150, 3 días + pago 16 clases = 200 (incluye Fútbol 11)
        precio_por_dias: {
            2: 100,  // 8 clases
            3: 150   // 12 clases (si paga 200, incluye cuarto día de Fútbol 11)
        },
        precio_completo: 200, // 16 clases con cuarto día de Fútbol 11 en estadio
        minimo_dias: 2,
        maximo_dias: 3,
        incluye_extra: true, // Cuarto día de Fútbol 11 si paga 200 soles (programado por DT)
        descripcion_extra: 'Si pagas S/.200 (16 clases), incluye cuarto día de Fútbol 11 en estadio'
    },
    'MAMAS FIT': {
        precio_fijo: 60,
        dias_minimo: 2, // Mínimo 2 días
        dias_recomendado: 3, // Recomendado 3 días para asegurar resultados
        clases_mes: 12
    }
};

const MATRICULA_POR_DEPORTE = 20;

// Iconos por deporte
const ICONOS_DEPORTES = {
    'Fútbol': 'sports_soccer',
    'Fútbol Femenino': 'sports_soccer',
    'Vóley': 'sports_volleyball',
    'Básquet': 'sports_basketball',
    'MAMAS FIT': 'fitness_center',
    'Natación': 'pool'
};

// Función para normalizar texto
function normalizarTexto(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// Función para convertir hora a formato comparable
function horaAMinutos(horaStr) {
    if (!horaStr || typeof horaStr !== 'string') return 0;
    const partes = horaStr.split(':');
    if (partes.length !== 2) return 0;
    const horas = parseInt(partes[0]) || 0;
    const minutos = parseInt(partes[1]) || 0;
    return horas * 60 + minutos;
}

// Funciones del modal
function mostrarModal(mensaje, tipo = 'info') {
    const modal = document.getElementById('modalNotificacion');
    const modalMensaje = document.getElementById('modalMensaje');
    const modalTitulo = document.getElementById('modalTitulo');
    const modalIcon = document.getElementById('modalIcon');
    const modalIconSymbol = document.getElementById('modalIconSymbol');
    
    const configuraciones = {
        'success': {
            titulo: '¡Éxito!',
            icono: 'check_circle',
            colorIcon: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
        },
        'error': {
            titulo: 'Error',
            icono: 'error',
            colorIcon: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
        },
        'warning': {
            titulo: 'Atención',
            icono: 'warning',
            colorIcon: 'bg-primary/20 dark:bg-primary/10 text-primary dark:text-primary'
        },
        'info': {
            titulo: 'Información',
            icono: 'info',
            colorIcon: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
        }
    };
    
    const config = configuraciones[tipo] || configuraciones['info'];
    
    modalTitulo.textContent = config.titulo;
    modalIconSymbol.textContent = config.icono;
    modalMensaje.innerHTML = mensaje; // Cambiar a innerHTML para renderizar HTML
    modalIcon.className = `flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${config.colorIcon}`;
    
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
}

function cerrarModal() {
    const modal = document.getElementById('modalNotificacion');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
}

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
    // Verificar datos del paso anterior
    const datosInscripcion = LocalStorage.get('datosInscripcion');
    
    if (!datosInscripcion || !datosInscripcion.alumno) {
        mostrarModal('Debe completar el paso 1 primero', 'warning');
        setTimeout(() => window.location.href = 'inscripcion.html', 2000);
        return;
    }
    
    // Cargar horarios seleccionados previamente si existen
    if (datosInscripcion.horariosSeleccionados) {
        horariosSeleccionados = datosInscripcion.horariosSeleccionados;
    }
    
    // Cargar horarios desde el backend
    await cargarHorarios();
    
    // Actualizar resumen si hay selección previa
    if (horariosSeleccionados.length > 0) {
        actualizarResumen();
    }
    
    // Cerrar modal al hacer clic fuera
    const modal = document.getElementById('modalNotificacion');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) cerrarModal();
        });
    }
});

// Cargar horarios desde el API
async function cargarHorarios() {
    const container = document.getElementById('deportesContainer');
    
    try {
        container.innerHTML = `
            <div class="col-span-full flex justify-center py-12">
                <div class="flex flex-col items-center gap-4">
                    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    <p class="text-text-muted dark:text-gray-400 font-medium">Cargando deportes disponibles...</p>
                </div>
            </div>
        `;
        
        // Obtener datos del alumno para filtrar por edad
        const datosInscripcion = LocalStorage.get('datosInscripcion');
        const fechaNacimiento = datosInscripcion?.alumno?.fecha_nacimiento;
        
        console.log('🔍 Datos completos inscripción:', datosInscripcion);
        console.log('📅 Fecha nacimiento obtenida:', fechaNacimiento);
        
        let edadCalculada = null;
        
        // Extraer año de nacimiento si existe
        if (fechaNacimiento) {
            añoNacimientoGlobal = new Date(fechaNacimiento).getFullYear();
            edadCalculada = new Date().getFullYear() - añoNacimientoGlobal;
            console.log('🎯 Año de nacimiento calculado:', añoNacimientoGlobal);
            console.log('🎂 Edad calculada:', edadCalculada);
            console.log('📞 Llamando API con año:', añoNacimientoGlobal);
            
            // Mostrar edad calculada al usuario
            const edadInfo = document.createElement('div');
            edadInfo.className = 'mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg';
            edadInfo.innerHTML = `
                <div class="flex items-center gap-3">
                    <span class="material-symbols-outlined text-blue-600 dark:text-blue-400">cake</span>
                    <div>
                        <p class="text-sm font-semibold text-blue-900 dark:text-blue-100">Edad calculada: ${edadCalculada} años</p>
                        <p class="text-xs text-blue-700 dark:text-blue-300">Fecha de nacimiento: ${new Date(fechaNacimiento).toLocaleDateString('es-PE')}</p>
                    </div>
                </div>
            `;
            container.insertAdjacentElement('afterbegin', edadInfo);
        } else {
            añoNacimientoGlobal = null;
            console.warn('⚠️ NO se encontró fecha de nacimiento - mostrando TODOS los horarios');
        }
        
        const horarios = await academiaAPI.getHorarios(añoNacimientoGlobal, true); // Forzar refresh para obtener datos frescos siempre
        
        if (!horarios || horarios.length === 0) {
            const mensajeEdad = edadCalculada ? 
                `<p class="text-gray-600 dark:text-gray-400 mb-2">Edad detectada: <strong>${edadCalculada} años</strong></p>
                 <p class="text-sm text-gray-500 dark:text-gray-500 mb-4">Si esta edad es incorrecta, por favor regresa y corrige tu fecha de nacimiento.</p>` : 
                '';
            
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <span class="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-700 mb-4">sports</span>
                    <p class="text-xl font-bold text-text-main dark:text-white mb-3">No hay horarios disponibles</p>
                    ${mensajeEdad}
                    <button onclick="window.location.href='inscripcion.html'" class="mt-4 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors inline-flex items-center gap-2">
                        <span class="material-symbols-outlined">edit</span>
                        Corregir Fecha de Nacimiento
                    </button>
                </div>
            `;
            return;
        }
        
        horariosDisponibles = horarios;
        
        // Agrupar por deporte
        const deportesMap = new Map();
        horariosDisponibles.forEach(horario => {
            if (!deportesMap.has(horario.deporte)) {
                deportesMap.set(horario.deporte, {
                    nombre: horario.deporte,
                    horarios: []
                });
            }
            deportesMap.get(horario.deporte).horarios.push(horario);
        });
        
        // Renderizar cards de deportes
        renderizarDeportes(Array.from(deportesMap.values()));
        
    } catch (error) {
        console.error('Error al cargar horarios:', error);
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <span class="material-symbols-outlined text-6xl text-red-400 mb-4">error</span>
                <p class="text-red-600 dark:text-red-400 font-semibold mb-2">Error al cargar horarios</p>
                <p class="text-text-muted dark:text-gray-400 text-sm">${error.message || 'Por favor, intenta nuevamente'}</p>
                <button onclick="cargarHorarios()" class="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:brightness-110 transition-all">
                    Reintentar
                </button>
            </div>
        `;
    }
}

// Renderizar cards de deportes
function renderizarDeportes(deportes) {
    const container = document.getElementById('deportesContainer');
    
    container.innerHTML = deportes.map(deporte => {
        const icono = ICONOS_DEPORTES[deporte.nombre] || 'sports';
        const totalHorarios = deporte.horarios.length;
        
        return `
            <div onclick="seleccionarDeporte('${deporte.nombre}')" 
                 class="sport-card cursor-pointer bg-white dark:bg-surface-dark rounded-xl border-2 border-border-light dark:border-border-dark p-5 shadow-card hover:shadow-card-hover hover:border-primary transition-all"
                 data-deporte="${deporte.nombre}">
                <div class="flex flex-col items-center gap-3 text-center">
                    <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <span class="material-symbols-outlined text-4xl text-primary">${icono}</span>
                    </div>
                    <div>
                        <h3 class="font-black text-base uppercase text-text-main dark:text-white tracking-tight">${deporte.nombre}</h3>
                        <p class="text-xs text-text-muted dark:text-gray-400 mt-1">${totalHorarios} horarios disponibles</p>
                    </div>
                    <button class="w-full px-4 py-2 bg-black dark:bg-primary text-white dark:text-black rounded-lg font-bold text-sm uppercase tracking-wide hover:brightness-110 transition-all">
                        Ver Cronograma
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Seleccionar deporte y mostrar cronograma
function seleccionarDeporte(nombreDeporte) {
    deporteActual = nombreDeporte;
    
    // Marcar card como activa
    document.querySelectorAll('.sport-card').forEach(card => {
        card.classList.remove('active', 'border-primary');
        card.classList.add('border-border-light', 'dark:border-border-dark');
    });
    
    const cardActiva = document.querySelector(`[data-deporte="${nombreDeporte}"]`);
    if (cardActiva) {
        cardActiva.classList.add('active', 'border-primary');
        cardActiva.classList.remove('border-border-light', 'dark:border-border-dark');
    }
    
    // Mostrar sección de cronograma
    document.getElementById('cronogramaSection').classList.remove('hidden');
    document.getElementById('deporteNombre').textContent = nombreDeporte;
    
    // Generar cronograma
    generarCronograma(nombreDeporte);
    
    // Scroll suave al cronograma
    setTimeout(() => {
        document.getElementById('cronogramaSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}

// Generar cronograma semanal
function generarCronograma(nombreDeporte) {
    const horarios = horariosDisponibles.filter(h => h.deporte === nombreDeporte);
    
    // Agrupar por horario (hora_inicio - hora_fin)
    const horariosMap = new Map();
    
    horarios.forEach(horario => {
        const key = `${horario.hora_inicio}-${horario.hora_fin}`;
        if (!horariosMap.has(key)) {
            horariosMap.set(key, {
                inicio: horario.hora_inicio,
                fin: horario.hora_fin,
                dias: {}
            });
        }
        
        const diaKey = horario.dia.toUpperCase();
        // Cambiar a array para soportar múltiples categorías en mismo día/hora
        if (!horariosMap.get(key).dias[diaKey]) {
            horariosMap.get(key).dias[diaKey] = [];
        }
        horariosMap.get(key).dias[diaKey].push(horario);
    });
    
    // Ordenar por hora de inicio
    const horariosOrdenados = Array.from(horariosMap.entries())
        .sort((a, b) => horaAMinutos(a[1].inicio) - horaAMinutos(b[1].inicio));
    
    // Renderizar tabla
    const tbody = document.getElementById('cronogramaBody');
    const diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];
    
    tbody.innerHTML = horariosOrdenados.map(([key, horarioData]) => {
        const { inicio, fin, dias } = horarioData;
        
        return `
            <tr class="border-t border-border-light dark:border-border-dark hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <td class="px-4 py-3 font-bold text-sm text-text-main dark:text-white sticky left-0 bg-white dark:bg-surface-dark border-r border-border-light dark:border-border-dark z-10">
                    ${inicio} - ${fin}
                </td>
                ${diasSemana.map(dia => {
                    const horariosDelDia = dias[dia];
                    if (!horariosDelDia || horariosDelDia.length === 0) {
                        return '<td class="px-2 py-2 text-center"><div class="cronograma-cell h-20 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 flex items-center justify-center"><span class="text-xs text-gray-400">-</span></div></td>';
                    }
                    
                    // Si hay múltiples horarios, mostrarlos en una celda con scroll
                    if (horariosDelDia.length > 1) {
                        return `
                            <td class="px-2 py-2">
                                <div class="h-20 overflow-y-auto space-y-1">
                                    ${horariosDelDia.map(horario => {
                                        const disponible = horario.cupos_ocupados < horario.cupo_maximo;
                                        const cuposRestantes = horario.cupo_maximo - horario.cupos_ocupados;
                                        const estaSeleccionado = horariosSeleccionados.some(h => h.horario_id === horario.horario_id);
                                        
                                        const plan = horario.plan || 'Económico';
                                        const esEstandar = plan === 'Estándar' || plan === 'Estandar';
                                        const esSabado = horario.dia === 'SABADO' || horario.dia === 'SÁBADO';
                                        
                                        const bloqueActualDeporte = horariosPorDeporte[nombreDeporte];
                                        const horariosEsteDeporte = horariosSeleccionados.filter(h => h.deporte === nombreDeporte).length;
                                        // Para Estándar: permitir sábado como 3er día aunque sea diferente bloque
                                        const estaDeshabilitadoPorBloque = bloqueActualDeporte && bloqueActualDeporte !== key && !estaSeleccionado && !(esEstandar && esSabado && horariosEsteDeporte === 2);
                                        
                                        const chocaConOtroDeporte = horariosSeleccionados.some(h => 
                                            h.deporte !== nombreDeporte && 
                                            h.dia === horario.dia && 
                                            h.hora_inicio === horario.hora_inicio && 
                                            h.hora_fin === horario.hora_fin
                                        );
                                        let iconoPlan = '';
                                        let colorPlan = '';
                                        
                                        if (plan === 'Premium') {
                                            iconoPlan = 'workspace_premium';
                                            colorPlan = 'text-yellow-600 dark:text-yellow-400';
                                        } else if (plan === 'Estándar' || plan === 'Estandar') {
                                            iconoPlan = 'star';
                                            colorPlan = 'text-blue-600 dark:text-blue-400';
                                        } else {
                                            iconoPlan = 'local_offer';
                                            colorPlan = 'text-green-600 dark:text-green-400';
                                        }
                                        
                                        let clases = 'cronograma-cell cursor-pointer rounded-lg border-2 flex flex-col items-center justify-center p-1 text-center transition-all relative min-h-[60px]';
                                        let tituloTooltip = '';
                                        
                                        if (estaSeleccionado) {
                                            clases += ' selected border-primary bg-primary/20 dark:bg-primary/10';
                                        } else if (chocaConOtroDeporte) {
                                            clases += ' disabled border-orange-400 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/20';
                                            tituloTooltip = 'title="Choca con otro deporte"';
                                        } else if (estaDeshabilitadoPorBloque) {
                                            clases += ' disabled border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20';
                                            tituloTooltip = `title="Solo puedes seleccionar del bloque ${bloqueActualDeporte}"`;
                                        } else if (!disponible) {
                                            clases += ' disabled border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20';
                                            tituloTooltip = 'title="Sin cupos disponibles"';
                                        } else {
                                            clases += ' border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30';
                                        }
                                        
                                        const onclick = (!estaDeshabilitadoPorBloque && !chocaConOtroDeporte && disponible) ? `onclick="toggleHorario('${horario.horario_id}', '${key}')"` : '';
                                        
                                        return `
                                            <div class="${clases}" ${onclick} ${tituloTooltip}>
                                                <span class="material-symbols-outlined ${colorPlan} text-xs absolute top-0.5 right-0.5" title="${plan}">${iconoPlan}</span>
                                                ${estaSeleccionado ? '<span class="material-symbols-outlined text-primary text-base">check_circle</span>' : ''}
                                                ${chocaConOtroDeporte ? '<span class="material-symbols-outlined text-orange-600 text-xs absolute top-0.5 left-0.5">warning</span>' : ''}
                                                <span class="text-[9px] font-bold text-text-main dark:text-white">${horario.categoria || ''}</span>
                                                <span class="text-[8px] text-text-muted dark:text-gray-400">${cuposRestantes} cupos</span>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </td>
                        `;
                    }
                    
                    // Si solo hay un horario, renderizar como antes
                    const horario = horariosDelDia[0];
                    const disponible = horario.cupos_ocupados < horario.cupo_maximo;
                    const cuposRestantes = horario.cupo_maximo - horario.cupos_ocupados;
                    const estaSeleccionado = horariosSeleccionados.some(h => h.horario_id === horario.horario_id);
                    
                    // Obtener icono y color según el plan
                    const plan = horario.plan || 'Económico';
                    const esEstandar = plan === 'Estándar' || plan === 'Estandar';
                    const esSabado = horario.dia === 'SABADO' || horario.dia === 'SÁBADO';
                    
                    // Verificar si está deshabilitado por restricción de bloque horario DENTRO del mismo deporte
                    const bloqueActualDeporte = horariosPorDeporte[nombreDeporte];
                    const horariosEsteDeporte = horariosSeleccionados.filter(h => h.deporte === nombreDeporte).length;
                    // Para Estándar: permitir sábado como 3er día aunque sea diferente bloque
                    const estaDeshabilitadoPorBloque = bloqueActualDeporte && bloqueActualDeporte !== key && !estaSeleccionado && !(esEstandar && esSabado && horariosEsteDeporte === 2);
                    
                    // Verificar si choca con otro deporte (mismo día y hora)
                    const chocaConOtroDeporte = horariosSeleccionados.some(h => 
                        h.deporte !== nombreDeporte && 
                        h.dia === horario.dia && 
                        h.hora_inicio === horario.hora_inicio && 
                        h.hora_fin === horario.hora_fin
                    );
                    let iconoPlan = '';
                    let colorPlan = '';
                    
                    if (plan === 'Premium') {
                        iconoPlan = 'workspace_premium';
                        colorPlan = 'text-yellow-600 dark:text-yellow-400';
                    } else if (plan === 'Estándar' || plan === 'Estandar') {
                        iconoPlan = 'star';
                        colorPlan = 'text-blue-600 dark:text-blue-400';
                    } else {
                        iconoPlan = 'local_offer';
                        colorPlan = 'text-green-600 dark:text-green-400';
                    }
                    
                    let clases = 'cronograma-cell cursor-pointer h-20 rounded-lg border-2 flex flex-col items-center justify-center p-2 text-center transition-all relative';
                    let tituloTooltip = '';
                    
                    if (estaSeleccionado) {
                        clases += ' selected border-primary bg-primary/20 dark:bg-primary/10';
                    } else if (chocaConOtroDeporte) {
                        clases += ' disabled border-orange-400 dark:border-orange-600 bg-orange-50 dark:bg-orange-900/20';
                        tituloTooltip = 'title="Choca con otro deporte"';
                    } else if (estaDeshabilitadoPorBloque) {
                        clases += ' disabled border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20';
                        tituloTooltip = `title="Solo puedes seleccionar del bloque ${bloqueActualDeporte}"`;
                    } else if (!disponible) {
                        clases += ' disabled border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-900/20';
                        tituloTooltip = 'title="Sin cupos disponibles"';
                    } else {
                        clases += ' border-green-500 dark:border-green-600 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 hover:scale-105';
                    }
                    
                    const onclick = (!estaDeshabilitadoPorBloque && !chocaConOtroDeporte && disponible) ? `onclick="toggleHorario('${horario.horario_id}', '${key}')"` : '';
                    
                    return `
                        <td class="px-2 py-2">
                            <div class="${clases}" ${onclick} ${tituloTooltip}>
                                <span class="material-symbols-outlined ${colorPlan} text-xs absolute top-1 right-1" title="${plan}">${iconoPlan}</span>
                                ${estaSeleccionado ? '<span class="material-symbols-outlined text-primary text-xl">check_circle</span>' : ''}
                                ${chocaConOtroDeporte ? '<span class="material-symbols-outlined text-orange-600 text-xs absolute top-1 left-1">warning</span>' : ''}
                                <span class="text-[10px] font-bold text-text-main dark:text-white">${horario.categoria || ''}</span>
                                <span class="text-[9px] text-text-muted dark:text-gray-400">${cuposRestantes} cupos</span>
                            </div>
                        </td>
                    `;
                }).join('')}
            </tr>
        `;
    }).join('');
}

// Toggle horario (seleccionar/deseleccionar)
function toggleHorario(horarioId, rangoHorario) {
    const horario = horariosDisponibles.find(h => h.horario_id == horarioId);
    if (!horario) return;
    
    const index = horariosSeleccionados.findIndex(h => h.horario_id == horarioId);
    
    if (index > -1) {
        // Deseleccionar
        horariosSeleccionados.splice(index, 1);
        
        // Verificar si quedan horarios del mismo deporte en este bloque
        const hayOtrosEnDeporte = horariosSeleccionados.some(h => 
            h.deporte === deporteActual && `${h.hora_inicio}-${h.hora_fin}` === rangoHorario
        );
        
        if (!hayOtrosEnDeporte) {
            delete horariosPorDeporte[deporteActual];
            document.getElementById('horarioActual').textContent = 'No seleccionado';
        }
    } else {
        // Seleccionar - Validaciones por deporte
        const plan = horario.plan || 'Económico';
        const esMamasFit = deporteActual === 'MAMAS FIT';
        
        // Contar cuántos horarios ya seleccionados de ESTE deporte
        const horariosEsteDeporte = horariosSeleccionados.filter(h => h.deporte === deporteActual);
        const cantidadEsteDeporte = horariosEsteDeporte.length;
        
        // Validar que NO se mezclen planes diferentes del MISMO deporte
        if (cantidadEsteDeporte > 0) {
            const planExistente = horariosEsteDeporte[0].plan || 'Económico';
            if (plan !== planExistente) {
                mostrarModal(`No puedes mezclar planes diferentes del mismo deporte. Ya tienes horarios del plan ${planExistente} en ${deporteActual}.`, 'warning');
                return;
            }
        }
        
        // Validar choque de horarios con OTROS deportes
        const hayChoqueHorario = horariosSeleccionados.some(h => {
            if (h.deporte === deporteActual) return false; // Mismo deporte, no validar
            // Verificar si el día y hora chocan
            return h.dia === horario.dia && 
                   h.hora_inicio === horario.hora_inicio && 
                   h.hora_fin === horario.hora_fin;
        });
        
        if (hayChoqueHorario) {
            mostrarModal('Este horario choca con otro deporte que ya seleccionaste. No puedes tener dos deportes al mismo tiempo.', 'warning');
            return;
        }
        
        // MAMAS FIT: Máximo 3 días del mismo deporte
        if (esMamasFit && cantidadEsteDeporte >= 3) {
            mostrarModal('MAMAS FIT permite máximo 3 clases por semana (S/.60).', 'warning');
            return;
        }
        
        // Premium: Máximo 3 días del mismo deporte
        if (plan === 'Premium' && cantidadEsteDeporte >= 3) {
            mostrarModal('El plan Premium permite máximo 3 clases por semana. Para el paquete completo de S/.200 con Fútbol 11, contacta al administrador.', 'warning');
            return;
        }
        
        // Modal Premium upgrade al seleccionar 3er día
        if (plan === 'Premium' && cantidadEsteDeporte === 2) {
            mostrarModal(
                '🏆 <strong>Plan Premium - Alto Rendimiento</strong><br><br>' +
                '📌 <strong>Obligatorio:</strong> 3 días a la semana = <strong>S/. 150</strong><br><br>' +
                '⚽ <strong>¿Quieres más?</strong><br>' +
                '✅ Upgrade a <strong>S/. 200</strong> incluye:<br>' +
                '• 4to día de <strong>Fútbol 11 en estadio</strong><br>' +
                '• Programado por el Director Técnico<br>' +
                '• 16 clases al mes<br><br>' +
                '<small>💡 El 4to día NO se selecciona aquí, será programado por el DT</small>',
                'info'
            );
        }
        
        // Económico: Máximo 3 días del mismo deporte
        if (plan === 'Económico' && cantidadEsteDeporte >= 3) {
            mostrarModal('El plan Económico permite máximo 3 clases por semana.', 'warning');
            return;
        }
        
        // Modal informativo al seleccionar 3er día en Plan Económico
        if (plan === 'Económico' && cantidadEsteDeporte === 2) {
            mostrarModal(
                '✨ <strong>Plan Económico</strong><br><br>' +
                '📌 2 días a la semana: <strong>S/. 60</strong><br>' +
                '📌 Al agregar un <strong>3er día</strong>: <strong>+S/. 20</strong><br><br>' +
                '💰 <strong>Total con 3 días: S/. 80</strong>',
                'info'
            );
        }
        
        // Estándar: Máximo 3 días del mismo deporte
        if ((plan === 'Estándar' || plan === 'Estandar') && cantidadEsteDeporte >= 3) {
            mostrarModal('El plan Estándar permite máximo 3 clases por semana.', 'warning');
            return;
        }
        
        // Modal informativo al seleccionar 3er día en Plan Estándar
        if ((plan === 'Estándar' || plan === 'Estandar') && cantidadEsteDeporte === 2) {
            mostrarModal(
                '⭐ <strong>Plan Estándar</strong><br><br>' +
                '📌 Cada día: <strong>S/. 40</strong><br>' +
                '📌 2 días: <strong>S/. 80</strong><br>' +
                '📌 3 días: <strong>S/. 120</strong>',
                'info'
            );
        }
        
        // Restricción de bloque horario: solo dentro del MISMO deporte
        const bloqueActualDeporte = horariosPorDeporte[deporteActual];
        const esSabado = horario.dia === 'SABADO' || horario.dia === 'SÁBADO';
        const esEstandar = plan === 'Estándar' || plan === 'Estandar';
        
        // Para plan Estándar: permitir sábado como tercer día (diferente bloque)
        if (esEstandar && esSabado && cantidadEsteDeporte === 2) {
            // Permitir sábado como 3er día sin validar bloque horario
            console.log('Plan Estándar: Permitiendo sábado como 3er día');
        } else if (!bloqueActualDeporte) {
            // Primera selección de este deporte, establecer su bloque horario
            horariosPorDeporte[deporteActual] = rangoHorario;
            document.getElementById('horarioActual').textContent = rangoHorario.replace('-', ' - ');
        } else if (bloqueActualDeporte !== rangoHorario) {
            // Para Estándar: si ya tiene 2 días entre semana y está seleccionando sábado, permitir
            if (esEstandar && esSabado && cantidadEsteDeporte < 3) {
                console.log('Plan Estándar: Permitiendo sábado como día adicional');
            } else {
                // Intentando seleccionar otro bloque horario del mismo deporte
                mostrarModal(`En ${deporteActual}, solo puedes seleccionar turnos del mismo bloque horario (${bloqueActualDeporte.replace('-', ' - ')}). ${esEstandar ? 'Para plan Estándar, puedes agregar un día el sábado como 3er día.' : 'Desmarca los horarios actuales de este deporte si quieres cambiar de bloque.'}`, 'warning');
                return;
            }
        }
        
        horariosSeleccionados.push(horario);
    }
    
    // Guardar en localStorage
    const datosInscripcion = LocalStorage.get('datosInscripcion') || {};
    datosInscripcion.horariosSeleccionados = horariosSeleccionados;
    LocalStorage.set('datosInscripcion', datosInscripcion);
    
    // Actualizar UI
    generarCronograma(deporteActual);
    actualizarResumen();
}

// Cerrar cronograma
function cerrarCronograma() {
    document.getElementById('cronogramaSection').classList.add('hidden');
    deporteActual = null;
    
    // Limpiar selección de card
    document.querySelectorAll('.sport-card').forEach(card => {
        card.classList.remove('active', 'border-primary');
        card.classList.add('border-border-light', 'dark:border-border-dark');
    });
}

// Actualizar resumen
function actualizarResumen() {
    const cantidad = horariosSeleccionados.length;
    const resumen = document.getElementById('resumenSeleccion');
    const precioEstimado = document.getElementById('precioEstimado');
    const btnContinuar = document.getElementById('btnContinuar');
    
    if (cantidad === 0) {
        resumen.textContent = '0 horarios seleccionados';
        precioEstimado.textContent = '';
        btnContinuar.disabled = true;
        btnContinuar.className = 'flex-1 sm:flex-initial h-12 px-8 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-black uppercase tracking-wide cursor-not-allowed transition-all';
    } else {
        // Agrupar horarios por deporte
        const horariosPorDeporteAgrupados = {};
        horariosSeleccionados.forEach(h => {
            const deporte = h.deporte || 'Fútbol';
            if (!horariosPorDeporteAgrupados[deporte]) {
                horariosPorDeporteAgrupados[deporte] = [];
            }
            horariosPorDeporteAgrupados[deporte].push(h);
        });
        
        // Calcular precio total sumando todos los deportes
        let precioTotal = 0;
        let mensajesValidacion = [];
        let todosValidos = true;
        const cantidadDeportes = Object.keys(horariosPorDeporteAgrupados).length;
        
        Object.keys(horariosPorDeporteAgrupados).forEach(deporte => {
            const horariosDeporte = horariosPorDeporteAgrupados[deporte];
            const cantidadDias = horariosDeporte.length;
            const esMamasFit = deporte === 'MAMAS FIT';
            const primerHorario = horariosDeporte[0];
            const plan = primerHorario?.plan || 'Económico';
            
            const { precio, mensaje, valido } = calcularPrecio(cantidadDias, esMamasFit, plan);
            precioTotal += precio;
            
            if (mensaje) {
                mensajesValidacion.push(`${deporte}: ${mensaje}`);
            }
            if (!valido) {
                todosValidos = false;
            }
        });
        
        resumen.textContent = `${cantidad} ${cantidad === 1 ? 'horario seleccionado' : 'horarios seleccionados'} (${cantidadDeportes} ${cantidadDeportes === 1 ? 'deporte' : 'deportes'})`;
        
        // Mostrar precio total con matrícula por deporte
        const matriculaTotal = cantidadDeportes * MATRICULA_POR_DEPORTE;
        
        if (mensajesValidacion.length > 0) {
            precioEstimado.innerHTML = `
                <div class="space-y-1">
                    ${mensajesValidacion.map(msg => `<div class="text-sm text-yellow-600 dark:text-yellow-400">${msg}</div>`).join('')}
                    <div class="font-semibold">Precio estimado: S/.${precioTotal}/mes + S/.${matriculaTotal} matrícula</div>
                </div>
            `;
        } else {
            precioEstimado.textContent = `Precio estimado: S/.${precioTotal}/mes + S/.${matriculaTotal} matrícula`;
        }
        
        // Habilitar botón solo si todas las selecciones son válidas
        btnContinuar.disabled = !todosValidos;
        btnContinuar.className = todosValidos 
            ? 'flex-1 sm:flex-initial h-12 px-8 rounded-lg bg-black dark:bg-primary text-white dark:text-black font-black uppercase tracking-wide hover:-translate-y-0.5 active:translate-y-0 cursor-pointer transition-all shadow-lg'
            : 'flex-1 sm:flex-initial h-12 px-8 rounded-lg bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-black uppercase tracking-wide cursor-not-allowed transition-all';
    }
}

// Calcular precio según cantidad de clases, deporte y plan
function calcularPrecio(cantidadDias, esMamasFit, plan) {
    // MAMAS FIT: 60 soles, mínimo 2 días (recomendado 3 para resultados)
    if (esMamasFit) {
        if (cantidadDias < 2) {
            return {
                precio: 60,
                mensaje: '⚠️ MAMAS FIT requiere mínimo 2 clases por semana (recomendado 3 para mejores resultados)',
                valido: false
            };
        }
        if (cantidadDias === 2) {
            return {
                precio: 60,
                mensaje: '💡 Se recomienda 3 clases por semana para asegurar resultados',
                valido: true
            };
        }
        return {
            precio: 60,
            mensaje: null,
            valido: true
        };
    }
    
    // Premium: 2 días = 100, 3 días = 150 (o 200 con Fútbol 11)
    if (plan === 'Premium') {
        if (cantidadDias < 2) {
            return {
                precio: 100,
                mensaje: '⚠️ Plan Premium requiere mínimo 2 clases por semana',
                valido: false
            };
        }
        if (cantidadDias === 2) {
            return {
                precio: 100,
                mensaje: '💡 8 clases/mes. Puedes agregar un tercer día por S/.150',
                valido: true
            };
        }
        if (cantidadDias === 3) {
            return {
                precio: 150,
                mensaje: '⚠️ OBLIGATORIO: Debes asistir 3 días/semana. Opción: S/.200 (16 clases + Fútbol 11)',
                valido: true
            };
        }
    }
    
    // Obtener configuración del plan
    const configPlan = PLANES[plan] || PLANES['Económico'];
    
    // Validar mínimo de días según el plan
    const minimoRequerido = configPlan.minimo_dias || 1;
    
    if (cantidadDias < minimoRequerido) {
        const precioBase = configPlan.precio_por_dias?.[minimoRequerido] || configPlan.base;
        return {
            precio: precioBase,
            mensaje: `⚠️ El plan ${plan} requiere mínimo ${minimoRequerido} ${minimoRequerido === 1 ? 'clase' : 'clases'} por semana`,
            valido: false
        };
    }
    
    // Calcular precio según días seleccionados
    if (configPlan.precio_por_dias && configPlan.precio_por_dias[cantidadDias]) {
        return {
            precio: configPlan.precio_por_dias[cantidadDias],
            mensaje: null,
            valido: true
        };
    }
    
    // Si no hay precio exacto, usar el último disponible
    const precioMaximo = configPlan.precio_por_dias?.[configPlan.maximo_dias] || configPlan.base;
    return {
        precio: precioMaximo,
        mensaje: null,
        valido: true
    };
}

// Continuar a confirmación
function continuarConfirmacion() {
    if (horariosSeleccionados.length === 0) {
        mostrarModal('Debes seleccionar al menos un horario', 'warning');
        return;
    }
    
    // Agrupar horarios por deporte para validación individual
    const horariosPorDeporteAgrupados = {};
    horariosSeleccionados.forEach(h => {
        const deporte = h.deporte || 'Fútbol';
        if (!horariosPorDeporteAgrupados[deporte]) {
            horariosPorDeporteAgrupados[deporte] = [];
        }
        horariosPorDeporteAgrupados[deporte].push(h);
    });
    
    // Validar cada deporte individualmente
    for (const deporte in horariosPorDeporteAgrupados) {
        const horariosDeporte = horariosPorDeporteAgrupados[deporte];
        const esMamasFit = deporte === 'MAMAS FIT';
        const primerHorario = horariosDeporte[0];
        const plan = primerHorario?.plan || 'Económico';
        const cantidad = horariosDeporte.length;
        
        // MAMAS FIT: Mínimo 2 días
        if (esMamasFit && cantidad < 2) {
            mostrarModal(`${deporte} requiere mínimo 2 clases por semana (recomendado 3 para mejores resultados)`, 'warning');
            return;
        }
        
        // Premium: Mínimo 2 días, permite hasta 3
        if (plan === 'Premium' && cantidad < 2) {
            mostrarModal(`${deporte} con plan Premium requiere mínimo 2 clases por semana`, 'warning');
            return;
        }
        
        // Económico: Mínimo 2 días
        if (plan === 'Económico' && cantidad < 2) {
            mostrarModal(`${deporte} con plan Económico requiere mínimo 2 clases por semana`, 'warning');
            return;
        }
        
        // Estándar: Mínimo 2 días
        if ((plan === 'Estándar' || plan === 'Estándar') && cantidad < 2) {
            mostrarModal(`${deporte} con plan Estándar requiere mínimo 2 clases por semana`, 'warning');
            return;
        }
    }
    
    // Preparar horarios completos con precios calculados por deporte
    const horariosCompletos = [];
    
    Object.keys(horariosPorDeporteAgrupados).forEach(deporte => {
        const horariosDeporte = horariosPorDeporteAgrupados[deporte];
        const cantidadDias = horariosDeporte.length;
        const esMamasFit = deporte === 'MAMAS FIT';
        const primerHorario = horariosDeporte[0];
        const plan = primerHorario?.plan || 'Económico';
        
        // Calcular precio para este deporte
        const { precio } = calcularPrecio(cantidadDias, esMamasFit, plan);
        
        // Calcular precio por horario (dividir el precio total entre los días)
        const precioPorHorario = precio / cantidadDias;
        
        // Agregar precio a cada horario de este deporte
        horariosDeporte.forEach(h => {
            horariosCompletos.push({
                ...h,
                precio: precioPorHorario
            });
        });
    });
    
    // Guardar en localStorage
    const datosInscripcion = LocalStorage.get('datosInscripcion') || {};
    datosInscripcion.horariosCompletos = horariosCompletos;
    datosInscripcion.horariosSeleccionados = horariosSeleccionados;
    LocalStorage.set('datosInscripcion', datosInscripcion);
    
    window.location.href = 'confirmacion.html';
}

// Volver al paso anterior
function volverPasoAnterior() {
    window.location.href = 'inscripcion.html';
}
