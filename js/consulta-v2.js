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
                console.log('📋 Resultado completo:', resultado);
                console.log('🔍 Comprobante URL:', resultado.pago.comprobante_url);
                mostrarPagoNoConfirmado(resultado);
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
            // Verificar si el usuario está inactivo
            if (resultado.inactivo) {
                mostrarModalInactivo(dni);
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = `
                    <span>Consultar Estado</span>
                    <span class="material-symbols-outlined">search</span>
                `;
                return;
            }
            
            mostrarNotificacion(resultado.error || 'No se encontró ninguna inscripción con ese DNI', 'error');
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = `
                <span>Consultar Estado</span>
                <span class="material-symbols-outlined">search</span>
            `;
        }
    } catch (error) {
        // Si es un error 403, es un usuario inactivo (esperado, no es error real)
        if (error.response && error.response.status === 403) {
            mostrarModalInactivo(dni);
            btnSubmit.disabled = false;
            btnSubmit.innerHTML = `
                <span>Consultar Estado</span>
                <span class="material-symbols-outlined">search</span>
            `;
            return;
        }
        
        // Solo mostrar error en consola si NO es 403
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
    
    // Renderizar sección de pago mensual
    renderizarSeccionPagoMensual();
}

/**
 * Mostrar mensaje cuando el pago no está confirmado
 */
function mostrarPagoNoConfirmado(resultado) {
    const vistaIngreso = document.getElementById('vistaIngreso');
    const datosPago = resultado.pago;
    const dni = resultado.alumno.dni;
    
    // Guardar DNI globalmente para el modal de subida tardía
    window.dniUsuarioActual = dni;
    
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
                    ${!datosPago.comprobante_url ? `
                    <button onclick="abrirModalSubirComprobante()" 
                       class="flex items-center justify-center gap-2 h-12 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-black font-bold text-sm uppercase tracking-wider hover:brightness-110 transition-all shadow-lg shadow-primary/20">
                        <span class="material-symbols-outlined">upload</span>
                        <span>Subir Comprobante de Pago</span>
                    </button>
                    ` : datosPago.codigo_operacion ? `
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

/**
 * Mostrar modal para usuario inactivo
 */
function mostrarModalInactivo(dni) {
    const modal = document.getElementById('modalInactivo');
    const modalDni = document.getElementById('modalInactivoDni');
    
    modalDni.textContent = dni;
    
    // Guardar DNI globalmente para usar en la subida de comprobante
    window.dniUsuarioInactivo = dni;
    
    // Actualizar link de WhatsApp con DNI
    const whatsappBtn = document.getElementById('btnWhatsAppInactivo');
    const mensajeWhatsApp = `Hola, acabo de subir mi comprobante de pago para reactivar mi membresía. Mi DNI es: ${dni}`;
    whatsappBtn.href = `https://wa.me/51973324460?text=${encodeURIComponent(mensajeWhatsApp)}`;
    
    // Resetear el formulario de subida si existe
    const inputComprobante = document.getElementById('inputComprobanteInactivo');
    if (inputComprobante) {
        inputComprobante.value = '';
        document.getElementById('iconoSubidaInactivo').classList.remove('hidden');
        document.getElementById('previewComprobanteInactivo').classList.add('hidden');
        document.getElementById('btnSubirComprobanteInactivo').disabled = true;
    }
    
    // Mostrar modal
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    
    // Prevenir scroll del body
    document.body.style.overflow = 'hidden';
}

/**
 * Previsualizar comprobante en modal de usuario inactivo
 */
function previsualizarComprobanteInactivo(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validar tipo
    if (!file.type.startsWith('image/')) {
        mostrarNotificacion('Por favor selecciona una imagen válida', 'error');
        return;
    }
    
    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
        mostrarNotificacion('La imagen no debe superar 5MB', 'error');
        return;
    }
    
    // Mostrar preview
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('imgComprobanteInactivo').src = e.target.result;
        document.getElementById('nombreArchivoInactivo').textContent = file.name;
        document.getElementById('iconoSubidaInactivo').classList.add('hidden');
        document.getElementById('previewComprobanteInactivo').classList.remove('hidden');
        document.getElementById('btnSubirComprobanteInactivo').disabled = false;
    };
    reader.readAsDataURL(file);
}

/**
 * Subir comprobante desde modal de usuario inactivo
 */
async function subirComprobanteInactivo() {
    const input = document.getElementById('inputComprobanteInactivo');
    const file = input.files[0];
    
    if (!file) {
        mostrarNotificacion('Por favor selecciona un comprobante', 'error');
        return;
    }
    
    const dni = window.dniUsuarioInactivo;
    if (!dni) {
        mostrarNotificacion('Error: No se pudo identificar el DNI', 'error');
        return;
    }
    
    const btn = document.getElementById('btnSubirComprobanteInactivo');
    btn.disabled = true;
    btn.innerHTML = '<div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div><span>Subiendo...</span>';
    
    try {
        // Convertir imagen a Base64
        const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
        
        // Usar el endpoint de pago mensual (que es el que usa el modal de inactivo para regularizar)
        const resultado = await academiaAPI.subirPagoMensual({
            dni: dni,
            alumno: `Usuario DNI ${dni}`, // No tenemos el nombre completo aquí
            imagen: base64,
            nombre_archivo: `REGULARIZACION_${dni}_${file.name}`,
            mes: 'Regularización',
            monto: 0, // El admin verificará el monto correcto
            esRegularizacion: true
        });
        
        if (resultado.success) {
            mostrarModalExitoComprobanteInactivo();
        } else {
            throw new Error(resultado.error || 'Error al subir comprobante');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        mostrarNotificacion(error.message || 'Error al subir comprobante. Intenta nuevamente.', 'error');
        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-outlined">send</span><span>Enviar Comprobante</span>';
    }
}

/**
 * Modal de éxito después de subir comprobante desde inactivo
 */
function mostrarModalExitoComprobanteInactivo() {
    // Cerrar modal de inactivo primero
    cerrarModalInactivo();
    
    const modal = document.createElement('div');
    modal.id = 'modalExitoComprobanteInactivo';
    modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in';
    modal.innerHTML = `
        <div class="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <!-- Icono de éxito -->
            <div class="flex justify-center mb-6">
                <div class="size-24 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <span class="material-symbols-outlined text-green-600 dark:text-green-400" style="font-size: 64px;">check_circle</span>
                </div>
            </div>
            
            <!-- Título -->
            <h2 class="text-3xl font-black text-center text-text-main dark:text-white mb-4">
                ¡Comprobante Recibido!
            </h2>
            
            <!-- Mensaje -->
            <div class="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
                <p class="text-sm text-green-900 dark:text-green-100 text-center leading-relaxed">
                    Tu comprobante ha sido enviado correctamente. 
                    <strong class="block mt-2">El administrador verificará tu pago y reactivará tu cuenta en breve.</strong>
                </p>
            </div>
            
            <!-- Info adicional -->
            <div class="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                <div class="flex items-start gap-3">
                    <span class="material-symbols-outlined text-blue-600 dark:text-blue-400 flex-shrink-0">schedule</span>
                    <div>
                        <p class="text-xs font-bold text-blue-900 dark:text-blue-100 mb-1">Tiempo de verificación</p>
                        <p class="text-xs text-blue-800 dark:text-blue-200">
                            La verificación suele tomar entre 2 a 24 horas. Te notificaremos una vez que tu cuenta esté activa.
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- Botón Cerrar -->
            <button onclick="cerrarModalExitoComprobanteInactivo()" class="w-full py-4 bg-primary hover:bg-primary-dark text-black rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl">
                Entendido
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function cerrarModalExitoComprobanteInactivo() {
    const modal = document.getElementById('modalExitoComprobanteInactivo');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
        
        // Redirigir al inicio después de cerrar
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500);
    }
}

/**
 * Cerrar modal de usuario inactivo
 */
function cerrarModalInactivo() {
    const modal = document.getElementById('modalInactivo');
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    
    // Restaurar scroll del body
    document.body.style.overflow = '';
}

// Cerrar modal al hacer clic fuera de él
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modalInactivo');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cerrarModalInactivo();
            }
        });
    }
});

function mostrarNotificacion(mensaje, tipo = 'info') {
    // Usar siempre el sistema de notificaciones de Utils
    Utils.mostrarNotificacion(mensaje, tipo);
}

/**
 * Modal para subir comprobante de forma tardía
 */
function abrirModalSubirComprobante() {
    const dni = window.dniUsuarioActual;
    if (!dni) {
        mostrarNotificacion('Error: No se pudo identificar el DNI', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.id = 'modalSubirComprobante';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
            <button onclick="cerrarModalSubirComprobante()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <span class="material-symbols-outlined">close</span>
            </button>
            
            <h3 class="text-2xl font-black text-black dark:text-white mb-4">
                Subir Comprobante
            </h3>
            
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
                Sube tu comprobante de pago (Plin o transferencia bancaria) si cambiaste de opinión sobre el pago en efectivo.
            </p>
            
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                        Selecciona tu comprobante (imagen)
                    </label>
                    <input type="file" 
                           id="inputComprobanteTardio" 
                           accept="image/*"
                           onchange="previsualizarComprobante(event)"
                           class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-primary file:text-black hover:file:brightness-110 cursor-pointer">
                </div>
                
                <div id="previsualizacionComprobante" class="hidden">
                    <img id="imgPreview" src="" alt="Vista previa" class="w-full h-48 object-contain rounded-lg border-2 border-gray-200 dark:border-gray-700">
                </div>
                
                <button onclick="subirComprobanteTardio()" 
                        id="btnSubirComprobante"
                        class="w-full flex items-center justify-center gap-2 h-12 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-black font-bold text-sm uppercase tracking-wider hover:brightness-110 transition-all shadow-lg">
                    <span class="material-symbols-outlined">cloud_upload</span>
                    <span>Enviar Comprobante</span>
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function cerrarModalSubirComprobante() {
    const modal = document.getElementById('modalSubirComprobante');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
    }
}

function previsualizarComprobante(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validar tipo
    if (!file.type.startsWith('image/')) {
        mostrarNotificacion('Por favor selecciona una imagen válida', 'error');
        return;
    }
    
    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
        mostrarNotificacion('La imagen no debe superar 5MB', 'error');
        return;
    }
    
    // Mostrar preview
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('imgPreview').src = e.target.result;
        document.getElementById('previsualizacionComprobante').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

async function subirComprobanteTardio() {
    const input = document.getElementById('inputComprobanteTardio');
    const file = input.files[0];
    
    if (!file) {
        mostrarNotificacion('Por favor selecciona un comprobante', 'error');
        return;
    }
    
    const dni = window.dniUsuarioActual;
    const btn = document.getElementById('btnSubirComprobante');
    btn.disabled = true;
    btn.innerHTML = '<div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-black"></div><span>Subiendo...</span>';
    
    try {
        // Convertir imagen a Base64
        const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
        
        // Usar la API igual que en exito.js
        const resultado = await academiaAPI.subirComprobanteTardio(dni, {
            imagen: base64,
            nombre_archivo: file.name,
            metodo_pago: 'Transferencia/Plin'
        });
        
        if (resultado.success) {
            mostrarNotificacion('✅ Comprobante subido exitosamente. El administrador lo revisará pronto.', 'success');
            cerrarModalSubirComprobante();
            
            // Recargar después de 2 segundos
            setTimeout(() => {
                location.reload();
            }, 2000);
        } else {
            throw new Error(resultado.error || 'Error al subir comprobante');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        mostrarNotificacion(error.message || 'Error al subir comprobante', 'error');
        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-outlined">cloud_upload</span><span>Enviar Comprobante</span>';
    }
}

// ==================== PAGO MENSUAL ====================

/**
 * Renderizar sección de pago mensual
 */
function renderizarSeccionPagoMensual() {
    // Obtener el contenedor
    const container = document.getElementById('seccionPagoMensual');
    
    if (!container) {
        console.error('❌ No se encontró el contenedor seccionPagoMensual');
        return;
    }
    
    // Calcular próximo mes de pago
    const hoy = new Date();
    const mesActual = hoy.toLocaleString('es-PE', { month: 'long' });
    const proximoMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 1);
    const nombreProximoMes = proximoMes.toLocaleString('es-PE', { month: 'long', year: 'numeric' });
    
    container.innerHTML = `
        <!-- Aviso importante -->
        <div class="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-300 dark:border-amber-700 rounded-xl p-5 mb-6">
            <div class="flex items-start gap-4">
                <div class="size-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <span class="material-symbols-outlined text-amber-600 dark:text-amber-400 text-2xl">warning</span>
                </div>
                <div class="flex-1">
                    <h4 class="text-amber-900 dark:text-amber-200 font-black text-lg uppercase mb-2">⚠️ Recordatorio de Pago</h4>
                    <p class="text-amber-800 dark:text-amber-300 text-sm leading-relaxed">
                        El pago de tu mensualidad debe realizarse <strong>antes del día 5</strong> de cada mes. 
                        Si no se registra el pago correspondiente, <strong class="text-red-600 dark:text-red-400">tu acceso a las clases será suspendido</strong> 
                        hasta que regularices tu situación.
                    </p>
                </div>
            </div>
        </div>
        
        <!-- Sección subir comprobante mensual -->
        <div class="flex items-center gap-4 mb-6 border-b border-gray-200 dark:border-gray-800 pb-4">
            <div class="size-12 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center">
                <span class="material-symbols-outlined text-2xl">payments</span>
            </div>
            <div>
                <h3 class="text-2xl font-bold text-black dark:text-white uppercase tracking-tight">Pago Mensual</h3>
                <p class="text-sm text-text-muted dark:text-gray-400">Sube tu comprobante de pago del mes</p>
            </div>
        </div>
        
        <div class="grid md:grid-cols-2 gap-6">
            <!-- Info del pago -->
            <div class="space-y-4">
                <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p class="text-xs text-text-muted dark:text-gray-400 font-bold uppercase mb-1">Mes a pagar</p>
                    <p class="text-lg font-black text-black dark:text-white capitalize">${nombreProximoMes}</p>
                </div>
                
                <div class="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <p class="text-xs text-text-muted dark:text-gray-400 font-bold uppercase mb-1">Monto según tu plan</p>
                    <p class="text-lg font-black text-primary">S/ ${datosUsuario.pago.monto?.toFixed(2) || '---'}</p>
                    <p class="text-xs text-text-muted dark:text-gray-400 mt-1">Basado en tu inscripción actual</p>
                </div>
                
                <div class="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <div class="flex items-start gap-2">
                        <span class="material-symbols-outlined text-blue-600 text-lg flex-shrink-0">info</span>
                        <p class="text-xs text-blue-800 dark:text-blue-200">
                            Puedes pagar por <strong>Plin, Yape, transferencia BCP o BBVA</strong>. 
                            Sube la captura de tu pago aquí.
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- Zona de subida -->
            <div class="flex flex-col">
                <div id="zonaPagoMensual" class="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-primary dark:hover:border-primary transition-colors cursor-pointer"
                     onclick="document.getElementById('inputPagoMensual').click()">
                    <input type="file" id="inputPagoMensual" accept="image/*" class="hidden" onchange="previsualizarPagoMensual(event)">
                    
                    <div id="iconoSubidaMensual">
                        <span class="material-symbols-outlined text-5xl text-gray-400 dark:text-gray-500 mb-3">cloud_upload</span>
                        <p class="text-sm font-bold text-gray-600 dark:text-gray-400 mb-1">Haz clic para seleccionar</p>
                        <p class="text-xs text-gray-400 dark:text-gray-500">o arrastra tu comprobante aquí</p>
                    </div>
                    
                    <div id="previewPagoMensual" class="hidden w-full">
                        <img id="imgPagoMensual" src="" alt="Vista previa" class="w-full h-40 object-contain rounded-lg mb-3">
                        <p id="nombreArchivoPago" class="text-xs text-gray-500 truncate"></p>
                    </div>
                </div>
                
                <button onclick="subirPagoMensual()" 
                        id="btnSubirPagoMensual"
                        class="mt-4 w-full flex items-center justify-center gap-2 h-14 rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-sm uppercase tracking-wider transition-all shadow-lg shadow-green-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled>
                    <span class="material-symbols-outlined">send</span>
                    <span>Enviar Comprobante del Mes</span>
                </button>
            </div>
        </div>
    `;
}

/**
 * Previsualizar comprobante de pago mensual
 */
function previsualizarPagoMensual(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validar tipo
    if (!file.type.startsWith('image/')) {
        mostrarNotificacion('Por favor selecciona una imagen válida', 'error');
        return;
    }
    
    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
        mostrarNotificacion('La imagen no debe superar 5MB', 'error');
        return;
    }
    
    // Mostrar preview
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('imgPagoMensual').src = e.target.result;
        document.getElementById('nombreArchivoPago').textContent = file.name;
        document.getElementById('iconoSubidaMensual').classList.add('hidden');
        document.getElementById('previewPagoMensual').classList.remove('hidden');
        document.getElementById('btnSubirPagoMensual').disabled = false;
    };
    reader.readAsDataURL(file);
}

/**
 * Subir comprobante de pago mensual al servidor (Drive)
 */
async function subirPagoMensual() {
    const input = document.getElementById('inputPagoMensual');
    const file = input.files[0];
    
    if (!file) {
        mostrarNotificacion('Por favor selecciona un comprobante', 'error');
        return;
    }
    
    const btn = document.getElementById('btnSubirPagoMensual');
    btn.disabled = true;
    btn.innerHTML = '<div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div><span>Subiendo a Drive...</span>';
    
    try {
        // Convertir imagen a Base64
        const base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
        
        // Obtener mes actual para el nombre
        const hoy = new Date();
        const mesAnio = hoy.toLocaleString('es-PE', { month: 'long', year: 'numeric' }).replace(' ', '-');
        
        // Subir usando el endpoint de pago mensual
        const resultado = await academiaAPI.subirPagoMensual({
            dni: datosUsuario.alumno.dni,
            alumno: `${datosUsuario.alumno.nombres} ${datosUsuario.alumno.apellidos}`,
            imagen: base64,
            nombre_archivo: `PAGO_${mesAnio}_${file.name}`,
            mes: mesAnio,
            monto: datosUsuario.pago.monto
        });
        
        if (resultado.success) {
            mostrarModalExitoPagoMensual(resultado.driveUrl);
        } else {
            throw new Error(resultado.error || 'Error al subir comprobante');
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
        mostrarNotificacion(error.message || 'Error al subir comprobante', 'error');
        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-outlined">send</span><span>Enviar Comprobante del Mes</span>';
    }
}

/**
 * Modal de éxito después de subir pago mensual
 */
function mostrarModalExitoPagoMensual(driveUrl) {
    const modal = document.createElement('div');
    modal.id = 'modalExitoPagoMensual';
    modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-fade-in';
    modal.innerHTML = `
        <div class="bg-white dark:bg-[#1a1a1a] rounded-3xl p-8 max-w-md w-full shadow-2xl animate-scale-in">
            <!-- Icono de éxito -->
            <div class="flex justify-center mb-6">
                <div class="size-24 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <span class="material-symbols-outlined text-green-600 dark:text-green-400" style="font-size: 64px;">check_circle</span>
                </div>
            </div>
            
            <!-- Título -->
            <h2 class="text-3xl font-black text-center text-text-main dark:text-white mb-4">
                ¡Pago Registrado!
            </h2>
            
            <!-- Mensaje -->
            <div class="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6">
                <p class="text-sm text-green-900 dark:text-green-100 text-center leading-relaxed">
                    Tu comprobante de pago mensual ha sido enviado correctamente. 
                    <strong class="block mt-2">El administrador verificará tu pago en las próximas horas.</strong>
                </p>
            </div>
            
            <!-- Info adicional -->
            <div class="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                <div class="flex items-start gap-3">
                    <span class="material-symbols-outlined text-blue-600 dark:text-blue-400 flex-shrink-0">cloud_done</span>
                    <div>
                        <p class="text-xs font-bold text-blue-900 dark:text-blue-100 mb-1">Guardado en la nube</p>
                        <p class="text-xs text-blue-800 dark:text-blue-200">
                            Tu comprobante ha sido guardado de forma segura en Google Drive.
                        </p>
                    </div>
                </div>
            </div>
            
            <!-- Botón Cerrar -->
            <button onclick="cerrarModalExitoPagoMensual()" class="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl">
                Entendido
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';
}

function cerrarModalExitoPagoMensual() {
    const modal = document.getElementById('modalExitoPagoMensual');
    if (modal) {
        modal.remove();
        document.body.style.overflow = '';
        
        // Resetear el formulario
        document.getElementById('inputPagoMensual').value = '';
        document.getElementById('iconoSubidaMensual').classList.remove('hidden');
        document.getElementById('previewPagoMensual').classList.add('hidden');
        document.getElementById('btnSubirPagoMensual').disabled = true;
        document.getElementById('btnSubirPagoMensual').innerHTML = '<span class="material-symbols-outlined">send</span><span>Enviar Comprobante del Mes</span>';
    }
}

