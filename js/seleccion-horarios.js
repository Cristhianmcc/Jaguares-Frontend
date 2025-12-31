/**
 * Script para selección de horarios
 */

// Variables globales
let horariosDisponibles = [];
let horariosSeleccionados = [];
let diaFiltroActual = 'Todos';

// Función para normalizar texto (eliminar acentos y convertir a minúsculas)
function normalizarTexto(texto) {
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// Funciones para el modal de notificaciones
function mostrarModal(mensaje, tipo = 'info') {
    const modal = document.getElementById('modalNotificacion');
    const modalMensaje = document.getElementById('modalMensaje');
    const modalTitulo = document.getElementById('modalTitulo');
    const modalIcon = document.getElementById('modalIcon');
    const modalIconSymbol = document.getElementById('modalIconSymbol');
    
    // Configurar según el tipo
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
    
    // Aplicar configuración
    modalTitulo.textContent = config.titulo;
    modalIconSymbol.textContent = config.icono;
    modalMensaje.textContent = mensaje;
    
    // Limpiar clases previas y agregar nuevas
    modalIcon.className = `flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${config.colorIcon}`;
    
    // Mostrar modal con animación
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
}

function cerrarModal() {
    const modal = document.getElementById('modalNotificacion');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    
    // Restaurar scroll del body
    document.body.style.overflow = '';
}

// Cerrar modal al hacer clic fuera de él
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modalNotificacion');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cerrarModal();
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    // Verificar que existan datos del alumno
    const datosInscripcion = LocalStorage.get('datosInscripcion');
    
    if (!datosInscripcion || !datosInscripcion.alumno) {
        Utils.mostrarNotificacion('Debe completar el paso 1 primero', 'warning');
        window.location.href = 'inscripcion.html';
        return;
    }
    
    // Cargar horarios seleccionados previamente si existen
    if (datosInscripcion.horariosSeleccionados) {
        horariosSeleccionados = datosInscripcion.horariosSeleccionados;
    }
    
    // Cargar horarios desde el backend
    await cargarHorarios();
    
    // Mostrar resumen si hay horarios seleccionados
    if (horariosSeleccionados.length > 0) {
        actualizarResumen();
    }
});

async function cargarHorarios() {
    const container = document.getElementById('horariosContainer');
    
    try {
        container.innerHTML = `
            <div class="col-span-full flex justify-center py-12">
                <div class="flex flex-col items-center gap-4">
                    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    <p class="text-text-muted dark:text-gray-400 font-medium">Cargando horarios disponibles...</p>
                </div>
            </div>
        `;
        
        // Obtener horarios desde la API
        horariosDisponibles = await academiaAPI.getHorarios();
        
        console.log('Horarios cargados:', horariosDisponibles);
        console.log('Total horarios:', horariosDisponibles.length);
        
        // Log de días únicos
        const diasUnicos = [...new Set(horariosDisponibles.map(h => h.dia))];
        console.log('Días encontrados:', diasUnicos);
        
        // Log de horarios de miércoles específicamente
        const horariosMiercoles = horariosDisponibles.filter(h => {
            console.log(`Horario: ${h.deporte}, Día: "${h.dia}", Match: ${h.dia === 'Miércoles'}`);
            return h.dia === 'Miércoles';
        });
        console.log('Horarios de Miércoles encontrados:', horariosMiercoles);
        
        // Exponer globalmente para otras funciones
        window.horariosDisponibles = horariosDisponibles;
        
        // Actualizar contadores de días
        actualizarContadoresDias();
        
        // Renderizar horarios
        renderizarHorarios();
        
    } catch (error) {
        console.error('Error al cargar horarios:', error);
        container.innerHTML = `
            <div class="col-span-full flex justify-center py-12">
                <div class="flex flex-col items-center gap-4 text-center">
                    <span class="material-symbols-outlined text-red-500 text-6xl">error</span>
                    <p class="text-red-500 font-bold">Error al cargar horarios</p>
                    <p class="text-text-muted dark:text-gray-400">${error.message}</p>
                    <button onclick="cargarHorarios()" class="px-6 py-2 bg-primary text-black font-bold rounded-lg hover:brightness-110">
                        Reintentar
                    </button>
                </div>
            </div>
        `;
    }
}

function actualizarContadoresDias() {
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const contadores = {};
    
    // Contar horarios activos por día
    horariosDisponibles.forEach(horario => {
        const activo = horario.activo !== false && horario.estado !== 'inactivo';
        const disponible = horario.cupos_restantes > 0;
        
        if (activo && disponible) {
            // Buscar el día normalizado
            const diaNormalizado = dias.find(d => normalizarTexto(d) === normalizarTexto(horario.dia));
            if (diaNormalizado) {
                contadores[diaNormalizado] = (contadores[diaNormalizado] || 0) + 1;
            }
        }
    });
    
    // Actualizar UI
    let totalTodos = 0;
    dias.forEach(dia => {
        const count = contadores[dia] || 0;
        totalTodos += count;
    });
    
    const countTodos = document.getElementById('count-Todos');
    if (countTodos) {
        countTodos.textContent = totalTodos;
    }
}

function renderizarHorarios() {
    const container = document.getElementById('horariosContainer');
    
    console.log('Renderizando horarios para día:', diaFiltroActual);
    
    // Filtrar horarios (mostrar tanto disponibles como llenos)
    let horariosFiltrados = horariosDisponibles.filter(horario => {
        const activo = horario.activo !== false && horario.estado !== 'inactivo';
        const matchDia = diaFiltroActual === 'Todos' || 
                        normalizarTexto(horario.dia) === normalizarTexto(diaFiltroActual);
        
        console.log(`Filtrando: ${horario.deporte} (${horario.dia}) - Activo: ${activo}, Match Día: ${matchDia}`);
        
        return activo && matchDia;
    });
    
    console.log('Horarios filtrados:', horariosFiltrados.length, horariosFiltrados);
    
    if (horariosFiltrados.length === 0) {
        container.innerHTML = `
            <div class="col-span-full flex justify-center py-12">
                <div class="flex flex-col items-center gap-4 text-center">
                    <span class="material-symbols-outlined text-gray-400 text-6xl">calendar_month</span>
                    <p class="text-text-muted dark:text-gray-400 font-medium">No hay horarios disponibles para este día</p>
                </div>
            </div>
        `;
        return;
    }
    
    // Renderizar cards
    container.innerHTML = horariosFiltrados.map(horario => crearCardHorario(horario)).join('');
}

function crearCardHorario(horario) {
    const seleccionado = horariosSeleccionados.includes(horario.id);
    const iconoDeporte = obtenerIconoDeporte(horario.deporte);
    const lleno = horario.cupos_restantes === 0;
    
    // Card para horario lleno
    if (lleno) {
        return `
            <div class="relative flex flex-col gap-4 rounded-xl bg-surface-light dark:bg-surface-dark p-6 border border-border-light dark:border-border-dark opacity-70 cursor-not-allowed select-none overflow-hidden">
                <div class="absolute inset-0 z-0 opacity-5" style="background-image: linear-gradient(135deg, #000000 10%, transparent 10%, transparent 50%, #000000 50%, #000000 60%, transparent 60%, transparent 100%); background-size: 8px 8px;"></div>
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 border-4 border-black dark:border-white text-black dark:text-white px-6 py-2 text-2xl font-black tracking-widest uppercase opacity-20 z-10 whitespace-nowrap mix-blend-multiply dark:mix-blend-overlay">
                    Agotado
                </div>
                <div class="flex justify-between items-start z-10 grayscale opacity-50">
                    <div class="flex items-center gap-4">
                        <div class="size-12 rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 flex items-center justify-center border border-gray-200 dark:border-gray-700">
                            <span class="material-symbols-outlined">${iconoDeporte}</span>
                        </div>
                        <div>
                            <h3 class="text-xl font-black text-text-main dark:text-white uppercase italic tracking-tight">${horario.deporte}</h3>
                            <p class="text-xs font-bold text-text-muted dark:text-gray-500 uppercase tracking-wider">${horario.sede || 'Sede Principal'}</p>
                        </div>
                    </div>
                    <span class="px-2.5 py-1 rounded-md bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400 text-[10px] font-black uppercase tracking-wider">Lleno</span>
                </div>
                <div class="flex flex-col gap-3 my-2 pl-1 z-10 grayscale opacity-50">
                    <div class="flex items-center gap-3 text-text-main dark:text-gray-200">
                        <span class="material-symbols-outlined text-xl text-gray-400">schedule</span>
                        <span class="font-bold text-lg">${horario.hora_inicio} - ${horario.hora_fin}</span>
                    </div>
                    <div class="flex items-center gap-3 text-text-muted dark:text-gray-400 text-sm">
                        <span class="material-symbols-outlined text-xl">diversity_3</span>
                        <span class="font-medium">${horario.categoria || 'Juveniles'}</span>
                    </div>
                </div>
                <div class="h-px w-full bg-border-light dark:bg-border-dark z-10"></div>
                <div class="flex justify-between items-center mt-auto z-10">
                    <span class="text-xs font-bold text-gray-400">0 cupos libres</span>
                    <div class="h-9 w-9 flex items-center justify-center text-gray-300">
                        <span class="material-symbols-outlined text-xl">block</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Card para horario seleccionado
    if (seleccionado) {
        return `
            <div onclick="toggleHorario('${horario.id}')" 
                 class="group relative flex flex-col gap-4 rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-selected transition-all duration-300 border-2 border-primary cursor-pointer">
                <div class="absolute -top-3 -right-3 size-8 bg-black text-primary rounded-full flex items-center justify-center shadow-lg shadow-black/30 z-10 border-2 border-primary">
                    <span class="material-symbols-outlined text-base font-bold">check</span>
                </div>
                <div class="flex justify-between items-start">
                    <div class="flex items-center gap-4">
                        <div class="size-12 rounded-lg bg-black text-primary flex items-center justify-center border border-primary/30">
                            <span class="material-symbols-outlined">${iconoDeporte}</span>
                        </div>
                        <div>
                            <h3 class="text-xl font-black text-text-main dark:text-white uppercase italic tracking-tight">${horario.deporte}</h3>
                            <p class="text-xs font-bold text-text-muted dark:text-gray-500 uppercase tracking-wider">${horario.sede || 'Sede Principal'}</p>
                        </div>
                    </div>
                    <span class="px-2.5 py-1 rounded-md bg-primary text-black text-[10px] font-black uppercase tracking-wider">Seleccionado</span>
                </div>
                <div class="flex flex-col gap-3 my-2 pl-1">
                    <div class="flex items-center gap-3 text-text-main dark:text-gray-200">
                        <span class="material-symbols-outlined text-xl text-primary">schedule</span>
                        <span class="font-bold text-lg">${horario.hora_inicio} - ${horario.hora_fin}</span>
                    </div>
                    <div class="flex items-center gap-3 text-text-muted dark:text-gray-400 text-sm">
                        <span class="material-symbols-outlined text-xl">diversity_3</span>
                        <span class="font-medium">${horario.categoria || 'Nivel Intermedio'}</span>
                    </div>
                </div>
                <div class="h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
                <div class="flex justify-between items-center mt-auto">
                    ${horario.cupos_restantes <= 3 ? `
                    <span class="text-xs font-bold text-primary dark:text-primary flex items-center gap-1">
                        <span class="material-symbols-outlined text-[16px]">local_fire_department</span>
                        ¡Últimos ${horario.cupos_restantes} cupos!
                    </span>
                    ` : `
                    <span class="text-xs font-bold text-text-muted dark:text-gray-500">${horario.cupos_restantes} cupos libres</span>
                    `}
                    <button class="h-8 px-4 rounded-md bg-black text-white text-xs font-bold flex items-center justify-center transition-colors border border-transparent hover:border-primary uppercase tracking-wide">
                        QUITAR
                    </button>
                </div>
            </div>
        `;
    }
    
    // Card para horario disponible
    return `
        <div onclick="toggleHorario('${horario.id}')" 
             class="group relative flex flex-col gap-4 rounded-xl bg-surface-light dark:bg-surface-dark p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-transparent hover:border-primary/40 cursor-pointer">
            <div class="flex justify-between items-start">
                <div class="flex items-center gap-4">
                    <div class="size-12 rounded-lg bg-gray-100 text-black dark:bg-gray-800 dark:text-primary flex items-center justify-center border border-gray-200 dark:border-gray-700">
                        <span class="material-symbols-outlined">${iconoDeporte}</span>
                    </div>
                    <div>
                        <h3 class="text-xl font-black text-text-main dark:text-white uppercase italic tracking-tight">${horario.deporte}</h3>
                        <p class="text-xs font-bold text-text-muted dark:text-gray-500 uppercase tracking-wider">${horario.sede || 'Sede Principal'}</p>
                    </div>
                </div>
                <span class="px-2.5 py-1 rounded-md bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400 text-[10px] font-black uppercase tracking-wider border border-green-200 dark:border-green-800">Disponible</span>
            </div>
            <div class="flex flex-col gap-3 my-2 pl-1">
                <div class="flex items-center gap-3 text-text-main dark:text-gray-200">
                    <span class="material-symbols-outlined text-xl text-primary">schedule</span>
                    <span class="font-bold text-lg">${horario.hora_inicio} - ${horario.hora_fin}</span>
                </div>
                <div class="flex items-center gap-3 text-text-muted dark:text-gray-400 text-sm">
                    <span class="material-symbols-outlined text-xl">diversity_3</span>
                    <span class="font-medium">${horario.categoria || horario.dia}</span>
                </div>
            </div>
            <div class="h-px w-full bg-gradient-to-r from-transparent via-border-light dark:via-border-dark to-transparent"></div>
            <div class="flex justify-between items-center mt-auto">
                <span class="text-xs font-bold text-text-muted dark:text-gray-500">${horario.cupos_restantes} cupos libres</span>
                <button class="h-9 w-9 rounded-full bg-black text-white flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors shadow-md">
                    <span class="material-symbols-outlined text-xl">add</span>
                </button>
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
        'Tenis': 'sports_tennis',
        'Natación': 'pool',
        'Atletismo': 'sprint',
        'Entrenamiento Funcional Adultos': 'fitness_center',
        'Entrenamiento Funcional Menores': 'fitness_center',
        'Entrenamiento de Fuerza y Tonificación Muscular': 'exercise'
    };
    
    return iconos[deporte] || 'sports';
}

function toggleHorario(horarioId) {
    const horario = horariosDisponibles.find(h => h.id === horarioId);
    
    if (!horario) return;
    
    const index = horariosSeleccionados.indexOf(horarioId);
    
    if (index > -1) {
        // Deseleccionar
        horariosSeleccionados.splice(index, 1);
    } else {
        // Validar que no haya otro horario a la misma hora EN EL MISMO DÍA
        const horarioMismaHoraMismoDia = horariosSeleccionados.find(id => {
            const h = horariosDisponibles.find(ho => ho.id === id);
            return h && 
                   h.hora_inicio === horario.hora_inicio && 
                   normalizarTexto(h.dia) === normalizarTexto(horario.dia);
        });
        
        if (horarioMismaHoraMismoDia) {
            const horarioConflicto = horariosDisponibles.find(h => h.id === horarioMismaHoraMismoDia);
            mostrarModal(`No puedes estar en dos lugares al mismo tiempo. Ya tienes ${horarioConflicto.deporte} a las ${horarioConflicto.hora_inicio}hs el ${horario.dia}`, 'warning');
            return;
        }
        
        // Validar máximo 2 horarios por día
        const horariosMismoDia = horariosSeleccionados.filter(id => {
            const h = horariosDisponibles.find(ho => ho.id === id);
            return h && normalizarTexto(h.dia) === normalizarTexto(horario.dia);
        });
        
        if (horariosMismoDia.length >= 2) {
            mostrarModal(`Ya tienes 2 horarios seleccionados para ${horario.dia}. Deselecciona uno para agregar otro.`, 'warning');
            return;
        }
        
        // Seleccionar
        horariosSeleccionados.push(horarioId);
    }
    
    // Actualizar UI
    renderizarHorarios();
    actualizarResumen();
}

function actualizarResumen() {
    const selectionCount = document.getElementById('selectionCount');
    const selectionText = document.getElementById('selectionText');
    const progressCircle = document.getElementById('progressCircle');
    const btnContinuar = document.getElementById('btnContinuar');
    
    const cantidad = horariosSeleccionados.length;
    
    // Actualizar contador (ahora sin límite fijo)
    if (selectionCount) {
        selectionCount.textContent = `${cantidad}`;
    }
    
    // Actualizar texto
    if (selectionText) {
        if (cantidad === 0) {
            selectionText.textContent = 'Ningún horario seleccionado';
        } else if (cantidad === 1) {
            const horario = horariosDisponibles.find(h => h.id === horariosSeleccionados[0]);
            selectionText.textContent = horario ? `${horario.deporte} ${horario.hora_inicio}hs` : '1 horario seleccionado';
        } else {
            const horarios = horariosSeleccionados.map(id => {
                const h = horariosDisponibles.find(ho => ho.id === id);
                return h ? `${h.deporte} ${h.hora_inicio}hs` : '';
            }).filter(Boolean).join(', ');
            selectionText.textContent = horarios;
        }
    }
    
    // Actualizar círculo de progreso (basado en múltiplos de 2)
    if (progressCircle) {
        const progreso = Math.min((cantidad / 14) * 100, 100); // Máximo 14 horarios (2 por día x 7 días)
        progressCircle.setAttribute('stroke-dasharray', `${progreso}, 100`);
    }
    
    // Actualizar botón continuar
    if (btnContinuar) {
        if (cantidad > 0) {
            btnContinuar.disabled = false;
            btnContinuar.classList.remove('bg-gray-300', 'dark:bg-gray-700', 'text-gray-500', 'dark:text-gray-400', 'cursor-not-allowed');
            btnContinuar.classList.add('bg-black', 'dark:bg-primary', 'text-white', 'dark:text-black', 'hover:-translate-y-0.5', 'active:translate-y-0', 'cursor-pointer');
        } else {
            btnContinuar.disabled = true;
            btnContinuar.classList.add('bg-gray-300', 'dark:bg-gray-700', 'text-gray-500', 'dark:text-gray-400', 'cursor-not-allowed');
            btnContinuar.classList.remove('bg-black', 'dark:bg-primary', 'text-white', 'dark:text-black', 'hover:-translate-y-0.5', 'active:translate-y-0', 'cursor-pointer');
        }
    }
}

function filtrarPorDia(dia) {
    diaFiltroActual = dia;
    
    // Actualizar botones activos
    document.querySelectorAll('.dia-filter-btn').forEach(btn => {
        if (btn.dataset.dia === dia) {
            btn.classList.add('active', 'bg-black', 'text-white', 'border-black');
            btn.classList.remove('bg-surface-light', 'dark:bg-surface-dark', 'text-text-main', 'dark:text-gray-300');
        } else {
            btn.classList.remove('active', 'bg-black', 'text-white', 'border-black');
            btn.classList.add('bg-surface-light', 'dark:bg-surface-dark', 'text-text-main', 'dark:text-gray-300');
        }
    });
    
    renderizarHorarios();
}

function continuarConfirmacion() {
    // Validar que hay horarios seleccionados
    if (horariosSeleccionados.length === 0) {
        mostrarModal('Debes seleccionar al menos un horario', 'warning');
        return;
    }
    
    // Obtener los horarios completos
    const horariosCompletos = horariosSeleccionados.map(id => {
        return horariosDisponibles.find(h => h.id === id);
    }).filter(h => h);
    
    if (horariosCompletos.length === 0) {
        mostrarModal('Error al obtener los horarios seleccionados', 'error');
        return;
    }
    
    // Guardar en localStorage
    const datosInscripcion = LocalStorage.get('datosInscripcion') || {};
    datosInscripcion.horariosSeleccionados = horariosSeleccionados;
    datosInscripcion.horariosCompletos = horariosCompletos; // Guardar los objetos completos
    datosInscripcion.paso = 2;
    
    LocalStorage.set('datosInscripcion', datosInscripcion);
    
    // Ir a confirmación
    window.location.href = 'confirmacion.html';
}

function volverPasoAnterior() {
    if (confirm('¿Deseas volver al paso anterior? Los horarios seleccionados se guardarán.')) {
        // Guardar antes de salir
        const datosInscripcion = LocalStorage.get('datosInscripcion') || {};
        datosInscripcion.horariosSeleccionados = horariosSeleccionados;
        LocalStorage.set('datosInscripcion', datosInscripcion);
        
        window.location.href = 'inscripcion.html';
    }
}
