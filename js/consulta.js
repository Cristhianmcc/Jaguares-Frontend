/**
 * Script para la página de consulta de estado
 */

let datosUsuario = null;

document.addEventListener('DOMContentLoaded', () => {
    inicializarConsulta();
});

function inicializarConsulta() {
    const formConsulta = document.getElementById('formConsulta');
    
    // Verificar si viene desde URL con DNI
    const params = new URLSearchParams(window.location.search);
    const dniUrl = params.get('dni');
    
    if (dniUrl) {
        document.getElementById('dniConsulta').value = dniUrl;
        consultarPorDNI(dniUrl);
    }
    
    // Manejar submit del formulario
    formConsulta.addEventListener('submit', async (e) => {
        e.preventDefault();
        const dni = document.getElementById('dniConsulta').value.trim();
        
        if (dni.length !== 8 || !/^\d+$/.test(dni)) {
            mostrarNotificacion('Por favor ingrese un DNI válido de 8 dígitos', 'error');
            return;
        }
        
        await consultarPorDNI(dni);
    });
}

async function consultarPorDNI(dni) {
    const btnSubmit = document.querySelector('#formConsulta button[type="submit"]');
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `
        <div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div>
        <span>Consultando...</span>
    `;
    
    try {
        // Buscar inscripción por DNI
        const resultado = await academiaAPI.consultarInscripcion(dni);
        
        if (resultado.success) {
            // ✅ VALIDACIÓN: Verificar que el pago esté confirmado
            const estadoPago = resultado.pago.estado ? resultado.pago.estado.toLowerCase().trim() : '';
            
            if (estadoPago !== 'confirmado' && estadoPago !== 'activo') {
                // Pago no confirmado - mostrar mensaje y no permitir acceso
                mostrarPagoNoConfirmado(resultado.pago);
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = `
                    <span>Consultar Estado</span>
                    <span class="material-symbols-outlined">search</span>
                `;
                return;
            }
            
            // Pago confirmado - permitir acceso
            datosUsuario = resultado; // El resultado ya contiene alumno, pago, horarios
            mostrarResultados();
        } else {
            mostrarNotificacion(resultado.error || 'No se encontró ninguna inscripción con ese DNI', 'error');
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = `
                <span>Consultar Estado</span>
                <span class="material-symbols-outlined">search</span>
            `;
        }
    } catch (error) {
        console.error('Error al consultar:', error);
        mostrarNotificacion('Error al consultar. Intente nuevamente.', 'error');
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `
            <span>Consultar Estado</span>
            <span class="material-symbols-outlined">search</span>
        `;
    }
}

function mostrarResultados() {
    // Ocultar vista de ingreso
    document.getElementById('vistaIngreso').classList.add('hidden');
    
    // Mostrar vista de resultados
    document.getElementById('vistaResultados').classList.remove('hidden');
    
    // Mostrar info de usuario en header (desktop y móvil)
    const userInfo = document.getElementById('userInfo');
    const userName = document.getElementById('userName');
    const userInfoMobile = document.getElementById('userInfoMobile');
    const userNameMobile = document.getElementById('userNameMobile');
    
    const nombreCompleto = `${datosUsuario.alumno.nombres} ${datosUsuario.alumno.apellidos}`;
    
    userInfo.classList.remove('hidden');
    userInfo.classList.add('flex');
    userName.textContent = nombreCompleto;
    
    // Actualizar móvil también
    if (userInfoMobile && userNameMobile) {
        userInfoMobile.classList.remove('hidden');
        userInfoMobile.classList.add('flex');
        userNameMobile.textContent = nombreCompleto;
    }
    userName.textContent = datosUsuario.alumno.nombres || 'Usuario';
    userInfo.classList.remove('hidden');
    userInfo.classList.add('flex');
    
    // Renderizar estado de inscripción
    renderizarEstado();
    
    // Renderizar datos del alumno
    renderizarDatosAlumno();
    
    // Renderizar horarios
    renderizarHorarios();
}

/**
 * Mostrar mensaje cuando el pago no está confirmado
 */
function mostrarPagoNoConfirmado(datosPago) {
    const vistaIngreso = document.getElementById('vistaIngreso');
    
    // Crear HTML del mensaje (sin ocultarlo del DOM, solo reemplazamos el contenido)
    vistaIngreso.innerHTML = `
        <div class="w-full max-w-[600px] flex flex-col gap-8">
            <!-- Icono y título -->
            <div class="flex flex-col gap-6 text-center">
                <div class="flex justify-center">
                    <div class="size-20 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-600 border-2 border-yellow-500/30">
                        <span class="material-symbols-outlined text-[48px]">pending</span>
                    </div>
                </div>
                <div>
                    <h1 class="text-black dark:text-white text-4xl md:text-5xl font-black italic uppercase tracking-tight mb-3">
                        Pago <span class="text-yellow-600">Pendiente</span>
                    </h1>
                    <p class="text-text-muted dark:text-gray-400 text-lg font-medium">
                        Tu inscripción aún no ha sido confirmada
                    </p>
                </div>
            </div>

            <!-- Tarjeta de información -->
            <div class="bg-surface-light dark:bg-surface-dark rounded-xl p-8 shadow-xl border-l-4 border-yellow-500">
                <div class="flex items-start gap-4 mb-6">
                    <div class="size-12 rounded-full bg-yellow-50 dark:bg-yellow-900/10 text-yellow-600 flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-3xl">info</span>
                    </div>
                    <div class="flex-1">
                        <h3 class="text-xl font-black text-black dark:text-white uppercase mb-2">Estado Actual</h3>
                        <span class="inline-block px-3 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/10 text-yellow-600 text-xs font-black uppercase tracking-wider mb-3">
                            ${datosPago.estado || 'PENDIENTE'}
                        </span>
                        <p class="text-text-muted dark:text-gray-400 text-sm leading-relaxed">
                            Tu inscripción ha sido registrada correctamente, pero el pago aún no ha sido confirmado por nuestro equipo administrativo.
                        </p>
                    </div>
                </div>

                <!-- Información del pago -->
                ${datosPago.codigo_operacion ? `
                <div class="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 mb-6">
                    <div class="flex items-center gap-3 mb-3">
                        <span class="material-symbols-outlined text-primary">confirmation_number</span>
                        <p class="text-xs text-text-muted dark:text-gray-400 font-bold uppercase">Código de Operación</p>
                    </div>
                    <p class="text-lg font-black text-black dark:text-white font-mono">${datosPago.codigo_operacion}</p>
                </div>
                ` : ''}

                <!-- Qué hacer -->
                <div class="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-5 border border-blue-200 dark:border-blue-800">
                    <div class="flex items-start gap-3">
                        <span class="material-symbols-outlined text-blue-600 flex-shrink-0">lightbulb</span>
                        <div>
                            <h4 class="text-blue-900 dark:text-blue-300 font-bold text-sm uppercase mb-2">¿Qué puedo hacer?</h4>
                            <ul class="space-y-2 text-text-muted dark:text-gray-400 text-sm">
                                <li class="flex items-start gap-2">
                                    <span class="text-primary">•</span>
                                    <span>Si aún no subiste tu comprobante de pago, hazlo desde el enlace que recibiste al inscribirte.</span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <span class="text-primary">•</span>
                                    <span>Si ya subiste el comprobante, espera a que el administrador verifique tu pago (puede tomar hasta 24 horas).</span>
                                </li>
                                <li class="flex items-start gap-2">
                                    <span class="text-primary">•</span>
                                    <span>Una vez confirmado, podrás ver toda tu información de inscripción aquí.</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <!-- Botones de acción -->
                <div class="flex flex-col gap-3 mt-6">
                    ${datosPago.codigo_operacion ? `
                    <a href="confirmacion.html?codigo=${datosPago.codigo_operacion}" 
                       class="flex items-center justify-center gap-2 h-12 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-black font-bold text-sm uppercase tracking-wider hover:brightness-110 transition-all shadow-lg shadow-primary/20">
                        <span class="material-symbols-outlined">upload</span>
                        <span>Subir Comprobante</span>
                    </a>
                    ` : ''}
                    
                    <button onclick="location.reload()" 
                            class="flex items-center justify-center gap-2 h-12 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-text-main dark:text-white font-bold text-sm uppercase tracking-wider hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
                        <span class="material-symbols-outlined">refresh</span>
                        <span>Volver a Consultar</span>
                    </button>
                    
                    <a href="index.html" 
                       class="text-text-main/60 dark:text-white/60 hover:text-primary dark:hover:text-primary text-sm font-bold flex items-center justify-center gap-2 transition-colors py-2 uppercase tracking-wide">
                        <span class="material-symbols-outlined text-lg">arrow_back</span>
                        Volver al Inicio
                    </a>
                </div>
            </div>
        </div>
    `;
}

function renderizarEstado() {
    const container = document.getElementById('estadoInscripcion');
    const estado = datosUsuario.pago.estado || 'pendiente';
    
    let colorBorde = 'border-yellow-500';
    let colorFondo = 'bg-yellow-50 dark:bg-yellow-900/10';
    let colorTexto = 'text-yellow-800 dark:text-yellow-200';
    let icono = 'pending';
    let mensaje = 'Tu inscripción está pendiente de confirmación. Recuerda enviar tu comprobante de pago.';
    
    if (estado.toLowerCase() === 'confirmado' || estado.toLowerCase() === 'activo') {
        colorBorde = 'border-green-500';
        colorFondo = 'bg-green-50 dark:bg-green-900/10';
        colorTexto = 'text-green-800 dark:text-green-200';
        icono = 'check_circle';
        mensaje = '¡Tu inscripción ha sido confirmada! Ya puedes asistir a tus clases.';
    } else if (estado.toLowerCase() === 'rechazado' || estado.toLowerCase() === 'cancelado') {
        colorBorde = 'border-red-500';
        colorFondo = 'bg-red-50 dark:bg-red-900/10';
        colorTexto = 'text-red-800 dark:text-red-200';
        icono = 'cancel';
        mensaje = 'Tu inscripción no pudo ser procesada. Contacta con administración.';
    }
    
    container.className = `bg-surface-light dark:bg-surface-dark rounded-xl p-6 md:p-8 shadow-xl border-l-4 ${colorBorde}`;
    container.innerHTML = `
        <div class="flex items-start gap-4">
            <div class="size-12 rounded-full ${colorFondo} ${colorTexto} flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined text-3xl">${icono}</span>
            </div>
            <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                    <h3 class="text-xl font-black text-black dark:text-white uppercase">Estado de Inscripción</h3>
                    <span class="px-3 py-1 rounded-full ${colorFondo} ${colorTexto} text-xs font-black uppercase tracking-wider">${estado}</span>
                </div>
                <p class="text-text-muted dark:text-gray-400 text-sm mb-3">${mensaje}</p>
                ${datosUsuario.pago.codigo ? `
                <div class="flex items-center gap-2 mt-4 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <span class="material-symbols-outlined text-primary">confirmation_number</span>
                    <div>
                        <p class="text-xs text-text-muted dark:text-gray-400 font-bold uppercase">Código de Operación</p>
                        <p class="text-sm font-black text-black dark:text-white font-mono">${datosUsuario.pago.codigo}</p>
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

function renderizarDatosAlumno() {
    const container = document.getElementById('datosAlumno');
    
    container.innerHTML = `
        <div class="flex items-center gap-4 mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
            <div class="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <span class="material-symbols-outlined text-2xl">person</span>
            </div>
            <h3 class="text-2xl font-bold text-black dark:text-white uppercase tracking-tight">Datos Personales</h3>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <p class="text-primary text-xs font-black uppercase tracking-widest mb-1">Nombre Completo</p>
                <p class="text-text-main dark:text-white text-lg font-bold">${datosUsuario.alumno.nombres} ${datosUsuario.alumno.apellidos}</p>
            </div>
            
            <div>
                <p class="text-primary text-xs font-black uppercase tracking-widest mb-1">DNI</p>
                <p class="text-text-main dark:text-white text-lg font-bold font-mono">${datosUsuario.alumno.dni}</p>
            </div>
            
            <div>
                <p class="text-primary text-xs font-black uppercase tracking-widest mb-1">Teléfono</p>
                <p class="text-text-main dark:text-white text-base font-bold">${datosUsuario.alumno.telefono}</p>
            </div>
            
            <div>
                <p class="text-primary text-xs font-black uppercase tracking-widest mb-1">Monto Total</p>
                <p class="text-text-main dark:text-white text-base font-bold">S/ ${datosUsuario.pago.monto.toFixed(2)}</p>
            </div>
            
            <div>
                <p class="text-primary text-xs font-black uppercase tracking-widest mb-1">Método de Pago</p>
                <p class="text-text-main dark:text-white text-base font-bold">${datosUsuario.pago.metodo_pago}</p>
            </div>
            
            <div>
                <p class="text-primary text-xs font-black uppercase tracking-widest mb-1">Fecha de Registro</p>
                <p class="text-text-main dark:text-white text-base font-bold">${Utils.formatearFecha(datosUsuario.pago.fecha_registro)}</p>
            </div>
        </div>
    `;
}

function renderizarHorarios() {
    const container = document.getElementById('horariosInscritos');
    
    if (!datosUsuario.horarios || datosUsuario.horarios.length === 0) {
        container.innerHTML = `
            <div class="col-span-2 text-center py-8">
                <span class="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-700 mb-3">event_busy</span>
                <p class="text-text-muted dark:text-gray-400">No hay horarios registrados</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = datosUsuario.horarios.map(horario => {
        const icono = obtenerIconoDeporte(horario.deporte);
        return `
            <div class="bg-white dark:bg-[#222] rounded-lg p-5 shadow-md border border-gray-100 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-all">
                <div class="flex items-start gap-4 mb-3">
                    <div class="size-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-2xl">${icono}</span>
                    </div>
                    <div class="flex-1">
                        <h4 class="text-lg font-black text-black dark:text-white uppercase tracking-tight">${horario.deporte}</h4>
                        <p class="text-xs text-primary font-bold uppercase">${horario.sede || 'Sede Principal'}</p>
                    </div>
                </div>
                
                <div class="space-y-2">
                    <div class="flex items-center gap-2 text-text-muted dark:text-gray-400 text-sm">
                        <span class="material-symbols-outlined text-lg text-primary">calendar_today</span>
                        <span class="font-medium">${horario.dia}</span>
                    </div>
                    <div class="flex items-center gap-2 text-text-muted dark:text-gray-400 text-sm">
                        <span class="material-symbols-outlined text-lg text-primary">schedule</span>
                        <span class="font-medium">${formatearHora(horario.hora_inicio)} - ${formatearHora(horario.hora_fin)}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
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

function formatearHora(horaString) {
    // Si ya es un formato de hora simple (HH:MM), devolverlo tal cual
    if (horaString && /^\d{1,2}:\d{2}$/.test(horaString)) {
        return horaString;
    }
    
    // Si es un timestamp ISO, convertirlo a hora de Lima
    try {
        const fecha = new Date(horaString);
        if (!isNaN(fecha.getTime())) {
            return fecha.toLocaleTimeString('es-PE', {
                timeZone: 'America/Lima',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        }
    } catch (e) {
        console.error('Error al formatear hora:', e);
    }
    
    // Si no se puede parsear, devolver el string original
    return horaString || '';
}

function cerrarSesion() {
    datosUsuario = null;
    
    // Ocultar vista de resultados
    document.getElementById('vistaResultados').classList.add('hidden');
    
    // Mostrar vista de ingreso
    document.getElementById('vistaIngreso').classList.remove('hidden');
    
    // Ocultar info de usuario
    document.getElementById('userInfo').classList.add('hidden');
    document.getElementById('userInfo').classList.remove('flex');
    
    // Limpiar formulario
    document.getElementById('dniConsulta').value = '';
    
    // Restaurar botón
    const btnSubmit = document.querySelector('#formConsulta button[type="submit"]');
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = `
        <span>Consultar Estado</span>
        <span class="material-symbols-outlined">search</span>
    `;
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    // Usar siempre el sistema de notificaciones de Utils
    Utils.mostrarNotificacion(mensaje, tipo);
}
