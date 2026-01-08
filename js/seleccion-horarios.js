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

// Función para convertir hora "HH:mm" a minutos desde medianoche
function horaAMinutos(horaStr) {
    if (!horaStr || typeof horaStr !== 'string') return 0;
    const partes = horaStr.split(':');
    if (partes.length !== 2) return 0;
    const horas = parseInt(partes[0]) || 0;
    const minutos = parseInt(partes[1]) || 0;
    return horas * 60 + minutos;
}

// Función para verificar si dos horarios se traslapan/cruzan
function horariosSeTraslapan(horario1, horario2) {
    // Convertir horas a minutos para facilitar comparación
    const inicio1 = horaAMinutos(horario1.hora_inicio);
    const fin1 = horaAMinutos(horario1.hora_fin);
    const inicio2 = horaAMinutos(horario2.hora_inicio);
    const fin2 = horaAMinutos(horario2.hora_fin);
    
    // Dos horarios se traslapan si:
    // inicio1 < fin2 Y fin1 > inicio2
    const seTraslapan = inicio1 < fin2 && fin1 > inicio2;
    
    if (seTraslapan) {
        console.log(`⚠️ TRASLAPE DETECTADO:`);
        console.log(`   ${horario1.deporte}: ${horario1.hora_inicio}-${horario1.hora_fin}`);
        console.log(`   ${horario2.deporte}: ${horario2.hora_inicio}-${horario2.hora_fin}`);
    }
    
    return seTraslapan;
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
                    <p class="text-text-muted dark:text-gray-400 font-medium">Cargando horarios disponibles para tu edad...</p>
                </div>
            </div>
        `;
        
        // Obtener datos del alumno para filtrar por edad
        const datosInscripcion = LocalStorage.get('datosInscripcion');
        const fechaNacimiento = datosInscripcion?.alumno?.fecha_nacimiento;
        
        console.log('🔍 Datos completos inscripción:', datosInscripcion);
        console.log('📅 Fecha nacimiento obtenida:', fechaNacimiento);
        
        // Extraer año de nacimiento si existe
        let añoNacimiento = null;
        if (fechaNacimiento) {
            añoNacimiento = new Date(fechaNacimiento).getFullYear();
            console.log('🎯 Año de nacimiento calculado:', añoNacimiento);
            console.log('📞 Llamando API con año:', añoNacimiento);
        } else {
            console.warn('⚠️ NO se encontró fecha de nacimiento - mostrando TODOS los horarios');
        }
        
        // Obtener horarios desde la API (filtrados por edad si se proporciona año)
        horariosDisponibles = await academiaAPI.getHorarios(añoNacimiento);
        
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
    
    // Actualizar UI (versión móvil y desktop)
    let totalTodos = 0;
    dias.forEach(dia => {
        const count = contadores[dia] || 0;
        totalTodos += count;
    });
    
    // Actualizar contadores de "Todos" para móvil y desktop
    const countTodosMobile = document.getElementById('count-Todos-mobile');
    if (countTodosMobile) {
        countTodosMobile.textContent = totalTodos;
    }
    
    const countTodosDesktop = document.getElementById('count-Todos-desktop');
    if (countTodosDesktop) {
        countTodosDesktop.textContent = totalTodos;
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
    const horarioId = horario.id || horario.horario_id;
    // Verificar si está seleccionado comparando como números
    const seleccionado = horariosSeleccionados.some(id => parseInt(id) === parseInt(horarioId));
    const iconoDeporte = obtenerIconoDeporte(horario.deporte);
    const cuposRestantes = horario.cupos_restantes !== undefined ? horario.cupos_restantes : (horario.cupo_maximo || 20) - (horario.cupos_ocupados || 0);
    const lleno = cuposRestantes <= 0;
    
    // Card para horario lleno
    if (lleno) {
        return `
            <div class="relative flex flex-col gap-4 rounded-xl bg-gray-100 dark:bg-gray-900 p-6 border-2 border-gray-300 dark:border-gray-700 opacity-70 cursor-not-allowed select-none overflow-hidden shadow-md">
                <div class="absolute inset-0 z-0 opacity-5" style="background-image: linear-gradient(135deg, #000000 10%, transparent 10%, transparent 50%, #000000 50%, #000000 60%, transparent 60%, transparent 100%); background-size: 8px 8px;"></div>
                <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-12 border-4 border-red-600 dark:border-red-500 text-red-600 dark:text-red-500 px-6 py-2 text-2xl font-black tracking-widest uppercase opacity-30 z-10 whitespace-nowrap rounded-lg bg-white/50 dark:bg-gray-900/50">
                    Agotado
                </div>
                <div class="flex justify-between items-start z-10 grayscale opacity-50">
                    <div class="flex items-center gap-4">
                        <div class="size-12 rounded-lg bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400 flex items-center justify-center border-2 border-gray-300 dark:border-gray-700">
                            <span class="material-symbols-outlined">${iconoDeporte}</span>
                        </div>
                        <div>
                            <h3 class="text-xl font-black text-gray-700 dark:text-gray-300 uppercase italic tracking-tight">${horario.deporte}</h3>
                            <p class="text-xs font-bold text-gray-500 dark:text-gray-500 uppercase tracking-wider">${horario.sede || 'Sede Principal'}</p>
                        </div>
                    </div>
                    <span class="px-2.5 py-1 rounded-md bg-gray-300 text-gray-600 dark:bg-gray-700 dark:text-gray-400 text-[10px] font-black uppercase tracking-wider border-2 border-gray-400 dark:border-gray-600">Lleno</span>
                </div>
                <div class="flex flex-col gap-3 my-2 pl-1 z-10 grayscale opacity-50">
                    <div class="flex items-center gap-3 text-gray-700 dark:text-gray-400">
                        <span class="material-symbols-outlined text-xl text-gray-400">schedule</span>
                        <span class="font-bold text-lg">${horario.hora_inicio} - ${horario.hora_fin}</span>
                    </div>
                    <div class="flex items-center gap-3 text-gray-600 dark:text-gray-500 text-sm">
                        <span class="material-symbols-outlined text-xl">diversity_3</span>
                        <span class="font-medium">${horario.categoria || 'Juveniles'}</span>
                    </div>
                </div>
                <div class="h-px w-full bg-gray-300 dark:bg-gray-700 z-10"></div>
                <div class="flex justify-between items-center mt-auto z-10">
                    <span class="text-xs font-bold text-gray-500 dark:text-gray-500">0 cupos libres</span>
                    <div class="h-9 w-9 flex items-center justify-center text-gray-400">
                        <span class="material-symbols-outlined text-xl">block</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Card para horario seleccionado
    if (seleccionado) {
        return `
            <div onclick="toggleHorario('${horarioId}')" 
                 class="group relative flex flex-col gap-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-6 shadow-2xl transition-all duration-300 border-2 border-primary cursor-pointer ring-2 ring-primary/30 active:scale-[0.98]">
                <div class="absolute -top-3 -right-3 size-9 bg-black text-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/30 z-10 border-2 border-primary">
                    <span class="material-symbols-outlined text-base font-bold">check</span>
                </div>
                <div class="flex justify-between items-start">
                    <div class="flex items-center gap-4">
                        <div class="size-12 rounded-lg bg-black text-primary flex items-center justify-center border-2 border-primary shadow-md">
                            <span class="material-symbols-outlined">${iconoDeporte}</span>
                        </div>
                        <div>
                            <h3 class="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">${horario.deporte}</h3>
                            <p class="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">${horario.sede || 'Sede Principal'}</p>
                        </div>
                    </div>
                    <span class="px-2.5 py-1 rounded-md bg-primary text-black text-[10px] font-black uppercase tracking-wider shadow-sm">Seleccionado</span>
                </div>
                <div class="flex flex-col gap-3 my-2 pl-1">
                    <div class="flex items-center gap-3 text-gray-900 dark:text-gray-100">
                        <span class="material-symbols-outlined text-xl text-primary">schedule</span>
                        <span class="font-bold text-lg">${horario.hora_inicio} - ${horario.hora_fin}</span>
                    </div>
                    <div class="flex items-center gap-3 text-gray-700 dark:text-gray-300 text-sm">
                        <span class="material-symbols-outlined text-xl">diversity_3</span>
                        <span class="font-medium">${horario.categoria || 'Nivel Intermedio'}</span>
                    </div>
                </div>
                <div class="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
                <div class="flex justify-between items-center mt-auto">
                    ${cuposRestantes <= 3 && cuposRestantes > 0 ? `
                    <span class="text-xs font-bold text-primary flex items-center gap-1">
                        <span class="material-symbols-outlined text-[16px]">local_fire_department</span>
                        ¡Últimos ${cuposRestantes} cupos!
                    </span>
                    ` : `
                    <span class="text-xs font-bold text-gray-700 dark:text-gray-400">${cuposRestantes} cupos libres</span>
                    `}
                    <button class="h-8 px-4 rounded-md bg-black text-white text-xs font-bold flex items-center justify-center transition-colors border-2 border-transparent hover:border-primary uppercase tracking-wide shadow-md">
                        QUITAR
                    </button>
                </div>
            </div>
        `;
    }
    
    // Card para horario disponible
    return `
        <div onclick="toggleHorario('${horarioId}')" 
             class="group relative flex flex-col gap-4 rounded-xl bg-white dark:bg-surface-dark p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 dark:border-gray-700 hover:border-primary/60 dark:hover:border-primary/60 cursor-pointer active:scale-[0.98]">
            <div class="flex justify-between items-start">
                <div class="flex items-center gap-4">
                    <div class="size-12 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 text-black dark:from-gray-800 dark:to-gray-700 dark:text-primary flex items-center justify-center border-2 border-gray-300 dark:border-gray-600 shadow-sm">
                        <span class="material-symbols-outlined">${iconoDeporte}</span>
                    </div>
                    <div>
                        <h3 class="text-xl font-black text-gray-900 dark:text-white uppercase italic tracking-tight">${horario.deporte}</h3>
                        <p class="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">${horario.sede || 'Sede Principal'}</p>
                    </div>
                </div>
                <span class="px-2.5 py-1 rounded-md bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400 text-[10px] font-black uppercase tracking-wider border-2 border-green-200 dark:border-green-800">Disponible</span>
            </div>
            <div class="flex flex-col gap-3 my-2 pl-1">
                <div class="flex items-center gap-3 text-gray-900 dark:text-gray-100">
                    <span class="material-symbols-outlined text-xl text-primary">schedule</span>
                    <span class="font-bold text-lg">${horario.hora_inicio} - ${horario.hora_fin}</span>
                </div>
                <div class="flex items-center gap-3 text-gray-700 dark:text-gray-300 text-sm">
                    <span class="material-symbols-outlined text-xl">diversity_3</span>
                    <span class="font-medium">${horario.categoria || horario.dia}</span>
                </div>
            </div>
            <div class="h-px w-full bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
            <div class="flex justify-between items-center mt-auto">
                <span class="text-xs font-bold text-gray-700 dark:text-gray-400">${cuposRestantes} cupos libres</span>
                <button class="h-9 w-9 rounded-full bg-black text-white flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-colors shadow-md group-hover:shadow-lg">
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
    // Convertir a número para comparación (los IDs vienen como números del backend)
    const idNumerico = parseInt(horarioId);
    
    const horario = horariosDisponibles.find(h => {
        const hId = h.id || h.horario_id;
        return parseInt(hId) === idNumerico;
    });
    
    if (!horario) {
        console.error('❌ Horario no encontrado:', horarioId);
        console.log('📋 Horarios disponibles:', horariosDisponibles.map(h => ({id: h.id || h.horario_id, deporte: h.deporte})));
        return;
    }
    
    console.log('✅ Horario encontrado:', horario.deporte, horario.dia);
    
    // Normalizar el ID
    const normalizedId = horario.id || horario.horario_id;
    const index = horariosSeleccionados.findIndex(id => parseInt(id) === parseInt(normalizedId));
    
    if (index > -1) {
        // Deseleccionar
        horariosSeleccionados.splice(index, 1);
        console.log('➖ Horario deseleccionado:', horario.deporte, horario.dia, horario.hora_inicio);
    } else {
        // Validar que no haya traslape de horarios EN EL MISMO DÍA
        const horarioConConflicto = horariosSeleccionados.find(id => {
            const h = horariosDisponibles.find(ho => {
                const hoId = ho.id || ho.horario_id;
                return parseInt(hoId) === parseInt(id);
            });
            
            if (!h) return false;
            
            // Solo verificar si es el mismo día
            const mismoDia = normalizarTexto(h.dia) === normalizarTexto(horario.dia);
            if (!mismoDia) return false;
            
            // Verificar si los horarios se traslapan/cruzan
            return horariosSeTraslapan(h, horario);
        });
        
        if (horarioConConflicto) {
            const horarioConflicto = horariosDisponibles.find(h => {
                const hId = h.id || h.horario_id;
                return parseInt(hId) === parseInt(horarioConConflicto);
            });
            mostrarModal(
                `Los horarios se cruzan y no puedes asistir a ambos.\n\n` +
                `Ya tienes:\n${horarioConflicto.deporte} (${horarioConflicto.hora_inicio} - ${horarioConflicto.hora_fin})\n\n` +
                `Quieres agregar:\n${horario.deporte} (${horario.hora_inicio} - ${horario.hora_fin})\n\n` +
                `Deselecciona el anterior para poder elegir este.`,
                'warning'
            );
            return;
        }
        
        // Validar máximo 2 horarios por día
        const horariosMismoDia = horariosSeleccionados.filter(id => {
            const h = horariosDisponibles.find(ho => {
                const hoId = ho.id || ho.horario_id;
                return parseInt(hoId) === parseInt(id);
            });
            return h && normalizarTexto(h.dia) === normalizarTexto(horario.dia);
        });
        
        if (horariosMismoDia.length >= 2) {
            mostrarModal(
                `Ya tienes 2 horarios seleccionados para ${horario.dia}.\n\n` +
                `Deselecciona uno para agregar otro.`,
                'warning'
            );
            return;
        }
        
        // Seleccionar
        horariosSeleccionados.push(normalizedId);
        console.log('➕ Horario seleccionado:', horario.deporte, horario.dia, horario.hora_inicio);
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
    
    // Actualizar botones activos (ambos: móvil y desktop)
    document.querySelectorAll('.dia-filter-btn').forEach(btn => {
        if (btn.dataset.dia === dia) {
            // Estado activo
            btn.classList.add('active');
            btn.classList.add('bg-black', 'dark:bg-primary', 'text-white', 'dark:text-black', 'border-black', 'dark:border-primary', 'font-bold');
            btn.classList.remove('bg-white', 'dark:bg-surface-dark', 'text-gray-700', 'dark:text-gray-300', 'border-gray-300', 'dark:border-gray-600');
        } else {
            // Estado inactivo
            btn.classList.remove('active', 'font-bold');
            btn.classList.remove('bg-black', 'dark:bg-primary', 'text-white', 'dark:text-black', 'border-black', 'dark:border-primary');
            btn.classList.add('bg-white', 'dark:bg-surface-dark', 'text-gray-700', 'dark:text-gray-300', 'border-gray-300', 'dark:border-gray-600');
        }
    });
    
    // Scroll suave al contenedor de horarios en móvil
    const horariosContainer = document.getElementById('horariosContainer');
    if (horariosContainer && window.innerWidth < 768) {
        setTimeout(() => {
            horariosContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
    
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
