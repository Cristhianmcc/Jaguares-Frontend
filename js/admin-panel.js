/**
 * JavaScript para el Panel de Administración
 */

let inscritosData = [];
let dniSeleccionado = null;
let accionModal = null; // 'desactivar' o 'reactivar'

/**
 * Convierte URLs de Google Drive al formato de thumbnail/visualización
 */
function convertirURLDrive(url) {
    if (!url) return '';
    
    console.log('🔄 Convirtiendo URL:', url);
    
    // Si ya es una URL de thumbnail, devolverla tal cual
    if (url.includes('thumbnail?id=')) {
        return url;
    }
    
    // Extraer fileId de URLs de Drive
    let fileId = null;
    
    // Formato: https://drive.google.com/uc?export=view&id=FILEID
    if (url.includes('uc?export=view&id=') || url.includes('uc?id=')) {
        const match = url.match(/[?&]id=([^&]+)/);
        if (match) fileId = match[1];
    }
    
    // Formato: https://drive.google.com/file/d/FILEID/view
    if (url.includes('/file/d/')) {
        const match = url.match(/\/file\/d\/([^\/\?]+)/);
        if (match) fileId = match[1];
    }
    
    // Formato: https://drive.google.com/open?id=FILEID
    if (!fileId && url.includes('open?id=')) {
        const match = url.match(/[?&]id=([^&]+)/);
        if (match) fileId = match[1];
    }
    
    // Si encontramos el fileId, devolver URL de thumbnail para visualización directa
    if (fileId) {
        // Usar formato thumbnail que funciona mejor para <img src="">
        const urlConvertida = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
        console.log('✅ URL convertida:', urlConvertida);
        return urlConvertida;
    }
    
    // Si no pudimos convertir, devolver la URL original
    console.log('⚠️ No se pudo convertir, usando URL original');
    return url;
}

/**
 * Convierte URLs de Google Drive al formato de visualización estándar /file/d/ID/view
 * Para usar en onclick y enlaces que abren en nueva pestaña
 */
function convertirURLDriveView(url) {
    if (!url) return '';
    
    // Extraer fileId de URLs de Drive
    let fileId = null;
    
    // Formato: https://drive.google.com/uc?export=view&id=FILEID
    if (url.includes('uc?export=view&id=') || url.includes('uc?id=')) {
        const match = url.match(/[?&]id=([^&]+)/);
        if (match) fileId = match[1];
    }
    
    // Formato: https://drive.google.com/file/d/FILEID/view
    if (!fileId && url.includes('/file/d/')) {
        const match = url.match(/\/file\/d\/([^\/\?]+)/);
        if (match) fileId = match[1];
    }
    
    // Formato: https://drive.google.com/open?id=FILEID
    if (!fileId && url.includes('open?id=')) {
        const match = url.match(/[?&]id=([^&]+)/);
        if (match) fileId = match[1];
    }
    
    // Si encontramos el fileId, devolver URL de visualización estándar
    if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/view`;
    }
    
    // Si no pudimos convertir, devolver la URL original
    return url;
}

// Verificar autenticación al cargar
document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
    inicializarEventos();
    cargarInscritos();
});

function verificarSesion() {
    const session = localStorage.getItem('adminSession');
    
    if (!session) {
        window.location.href = 'admin-login.html';
        return;
    }
    
    const data = JSON.parse(session);
    const sessionTime = new Date(data.timestamp).getTime();
    const now = new Date().getTime();
    const hoursElapsed = (now - sessionTime) / (1000 * 60 * 60);
    
    if (hoursElapsed >= 8) {
        localStorage.removeItem('adminSession');
        window.location.href = 'admin-login.html';
        return;
    }
    
    // Actualizar email en desktop y móvil
    document.getElementById('adminEmail').textContent = data.admin.email;
    const adminEmailMobile = document.getElementById('adminEmailMobile');
    if (adminEmailMobile) {
        adminEmailMobile.textContent = data.admin.email;
    }
}

function inicializarEventos() {
    document.getElementById('btnCerrarSesion').addEventListener('click', cerrarSesion);
    
    // Botón cerrar sesión móvil
    const btnCerrarSesionMobile = document.getElementById('btnCerrarSesionMobile');
    if (btnCerrarSesionMobile) {
        btnCerrarSesionMobile.addEventListener('click', cerrarSesion);
    }
    
    document.getElementById('btnFiltrar').addEventListener('click', aplicarFiltros);
    document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);
    
    // Eventos para desactivar
    document.getElementById('btnCancelarDesactivar').addEventListener('click', cerrarModales);
    document.getElementById('btnConfirmarDesactivar').addEventListener('click', confirmarDesactivar);
    
    // Eventos para reactivar
    document.getElementById('btnCancelarReactivar').addEventListener('click', cerrarModales);
    document.getElementById('btnConfirmarReactivar').addEventListener('click', confirmarReactivar);
    
    // Evento para buscar por DNI al presionar Enter (solo si el elemento existe)
    const filtroDNI = document.getElementById('filtroDNI');
    if (filtroDNI) {
        filtroDNI.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const dni = e.target.value.trim();
                if (dni.length === 8) {
                    buscarPorDNI(dni);
                }
            }
        });
        
        // Limpiar búsqueda por DNI cuando se vacía el input
        filtroDNI.addEventListener('input', (e) => {
            if (e.target.value.length === 0) {
                cerrarDetalleUsuario();
            }
        });
    }
}

function cerrarSesion() {
    localStorage.removeItem('adminSession');
    window.location.href = 'admin-login.html';
}

async function cargarInscritos(dia = null, deporte = null) {
    const loadingContainer = document.getElementById('loadingContainer');
    const tablaContainer = document.getElementById('tablaContainer');
    const sinResultados = document.getElementById('sinResultados');
    
    loadingContainer.classList.remove('hidden');
    tablaContainer.classList.add('hidden');
    sinResultados.classList.add('hidden');
    
    try {
        const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3002'
            : 'https://jaguares-backend.onrender.com';
        
        // Obtener token de la sesión
        const session = localStorage.getItem('adminSession');
        if (!session) {
            window.location.href = 'admin-login.html';
            return;
        }
        const { token } = JSON.parse(session);
        
        let url = `${API_BASE}/api/admin/inscritos`;
        const params = new URLSearchParams();
        
        if (dia) params.append('dia', dia);
        if (deporte) params.append('deporte', deporte);
        
        // ✅ Agregar timestamp para forzar actualización
        params.append('t', new Date().getTime());
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        const response = await fetch(url, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Authorization': `Bearer ${token}` // ✅ Agregar token JWT
            }
        });
        const data = await response.json();
        
        if (data.success) {
            inscritosData = data.inscritos;
            renderizarTabla(inscritosData);
            actualizarEstadisticas(inscritosData);
        } else {
            mostrarError('Error al cargar datos: ' + data.error);
        }
    } catch (error) {
        console.error('Error al cargar inscritos:', error);
        mostrarError('Error de conexión. Verifica que el servidor esté activo.');
    } finally {
        loadingContainer.classList.add('hidden');
    }
}

function renderizarTabla(inscritos) {
    const tablaBody = document.getElementById('tablaBody');
    const tablaContainer = document.getElementById('tablaContainer');
    const sinResultados = document.getElementById('sinResultados');
    
    if (!inscritos || inscritos.length === 0) {
        tablaContainer.classList.add('hidden');
        sinResultados.classList.remove('hidden');
        return;
    }
    
    tablaBody.innerHTML = '';
    
    inscritos.forEach(inscrito => {
        const row = document.createElement('tr');
        
        // Verificar estado del usuario (activo/inactivo)
        const estadoUsuario = inscrito.estado_usuario ? inscrito.estado_usuario.toLowerCase() : 'activo';
        const esInactivo = estadoUsuario === 'inactivo';
        
        // Aplicar estilo especial si está inactivo
        row.className = `border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${esInactivo ? 'opacity-60 bg-gray-50 dark:bg-gray-900/50' : ''}`;
        
        const estadoClass = inscrito.estado === 'activa' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
        const estadoTexto = inscrito.estado === 'activa' ? 'Activo' : 'Pendiente';
        
        const horario = inscrito.hora_inicio && inscrito.hora_fin 
            ? `${inscrito.hora_inicio} - ${inscrito.hora_fin}` 
            : '-';
        
        const deporte = inscrito.deporte || inscrito.dia || '-';
        
        // Botón según estado del usuario
        const botonAccion = esInactivo 
            ? `<button onclick="reactivarUsuario('${inscrito.dni}')" class="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors" title="Reactivar todas las inscripciones de este usuario">
                    <span class="material-symbols-outlined text-xl">check_circle</span>
               </button>`
            : `<button onclick="desactivarUsuario('${inscrito.dni}')" class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Desactivar todas las inscripciones de este usuario">
                    <span class="material-symbols-outlined text-xl">person_off</span>
               </button>`;
        
        // Badge de usuario inactivo
        const badgeInactivo = esInactivo 
            ? `<span class="px-2 py-1 bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded text-[10px] font-black uppercase tracking-wider ml-2">INACTIVO</span>`
            : '';
        
        row.innerHTML = `
            <td class="px-4 py-3 font-mono text-sm font-semibold">${inscrito.dni}${badgeInactivo}</td>
            <td class="px-4 py-3 ${esInactivo ? 'line-through' : ''}">${inscrito.nombres}</td>
            <td class="px-4 py-3 ${esInactivo ? 'line-through' : ''}">${inscrito.apellidos}</td>
            <td class="px-4 py-3 font-mono text-sm">${inscrito.telefono || '-'}</td>
            <td class="px-4 py-3">
                <span class="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-semibold">${deporte}</span>
            </td>
            <td class="px-4 py-3 text-xs">${horario}</td>
            <td class="px-4 py-3">
                <span class="px-2 py-1 ${estadoClass} rounded text-xs font-semibold">${estadoTexto}</span>
            </td>
            <td class="px-4 py-3 text-center">
                ${botonAccion}
            </td>
        `;
        
        tablaBody.appendChild(row);
    });
    
    tablaContainer.classList.remove('hidden');
    sinResultados.classList.add('hidden');
}

function actualizarEstadisticas(inscritos) {
    const total = inscritos.length;
    const activos = inscritos.filter(i => i.estado === 'activa' && (!i.estado_usuario || i.estado_usuario.toLowerCase() === 'activo')).length;
    const pendientes = inscritos.filter(i => i.estado === 'pendiente_pago' && (!i.estado_usuario || i.estado_usuario.toLowerCase() === 'activo')).length;
    const inactivos = inscritos.filter(i => i.estado_usuario && i.estado_usuario.toLowerCase() === 'inactivo').length;
    
    document.getElementById('totalInscritos').textContent = total;
    document.getElementById('totalActivos').textContent = activos;
    document.getElementById('totalPendientes').textContent = pendientes;
    document.getElementById('totalInactivos').textContent = inactivos;
}

function aplicarFiltros() {
    const dni = document.getElementById('filtroDNI').value.trim();
    
    // Si hay DNI, buscar por DNI (tiene prioridad)
    if (dni.length === 8) {
        buscarPorDNI(dni);
        return;
    }
    
    // Si no hay DNI, filtrar por día/deporte
    const dia = document.getElementById('filtroDia').value;
    const deporte = document.getElementById('filtroDeporte').value;
    
    cerrarDetalleUsuario();
    cargarInscritos(dia || null, deporte || null);
}

function limpiarFiltros() {
    document.getElementById('filtroDNI').value = '';
    document.getElementById('filtroDia').value = '';
    document.getElementById('filtroDeporte').value = '';
    cerrarDetalleUsuario();
    cargarInscritos();
}

function desactivarUsuario(dni) {
    dniSeleccionado = dni;
    accionModal = 'desactivar';
    document.getElementById('dniDesactivar').textContent = dni;
    document.getElementById('modalDesactivar').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function reactivarUsuario(dni) {
    dniSeleccionado = dni;
    accionModal = 'reactivar';
    document.getElementById('dniReactivar').textContent = dni;
    document.getElementById('modalReactivar').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function cerrarModales() {
    dniSeleccionado = null;
    accionModal = null;
    document.getElementById('modalDesactivar').classList.add('hidden');
    document.getElementById('modalReactivar').classList.add('hidden');
    document.body.style.overflow = '';
}

async function confirmarDesactivar() {
    if (!dniSeleccionado) return;
    
    const btnConfirmar = document.getElementById('btnConfirmarDesactivar');
    const textoOriginal = btnConfirmar.innerHTML;
    
    btnConfirmar.disabled = true;
    btnConfirmar.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Procesando...';
    
    try {
        const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3002'
            : 'https://jaguares-backend.onrender.com';
        
        const response = await fetch(`${API_BASE}/api/desactivar-usuario`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ dni: dniSeleccionado })
        });
        
        const data = await response.json();
        
        if (data.success) {
            cerrarModales();
            cargarInscritos();
            mostrarNotificacion('Usuario desactivado correctamente', 'success');
        } else {
            mostrarNotificacion('Error: ' + data.error, 'error');
            btnConfirmar.disabled = false;
            btnConfirmar.innerHTML = textoOriginal;
        }
    } catch (error) {
        console.error('Error al desactivar:', error);
        mostrarNotificacion('Error de conexión', 'error');
        btnConfirmar.disabled = false;
        btnConfirmar.innerHTML = textoOriginal;
    }
}

async function confirmarReactivar() {
    if (!dniSeleccionado) return;
    
    const btnConfirmar = document.getElementById('btnConfirmarReactivar');
    const textoOriginal = btnConfirmar.innerHTML;
    
    btnConfirmar.disabled = true;
    btnConfirmar.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Procesando...';
    
    try {
        const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3002'
            : 'https://jaguares-backend.onrender.com';
        
        const response = await fetch(`${API_BASE}/api/reactivar-usuario`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ dni: dniSeleccionado })
        });
        
        const data = await response.json();
        
        if (data.success) {
            cerrarModales();
            cargarInscritos();
            mostrarNotificacion('Usuario reactivado correctamente', 'success');
        } else {
            mostrarNotificacion('Error: ' + data.error, 'error');
            btnConfirmar.disabled = false;
            btnConfirmar.innerHTML = textoOriginal;
        }
    } catch (error) {
        console.error('Error al reactivar:', error);
        mostrarNotificacion('Error de conexión', 'error');
        btnConfirmar.disabled = false;
        btnConfirmar.innerHTML = textoOriginal;
    }
}

function mostrarError(mensaje) {
    const tablaContainer = document.getElementById('tablaContainer');
    const sinResultados = document.getElementById('sinResultados');
    
    tablaContainer.classList.add('hidden');
    sinResultados.classList.remove('hidden');
    sinResultados.querySelector('p').textContent = mensaje;
}

function mostrarNotificacion(mensaje, tipo) {
    const colores = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };
    
    const notif = document.createElement('div');
    notif.className = `fixed top-4 right-4 ${colores[tipo] || colores.info} text-white px-6 py-3 rounded-lg shadow-lg font-semibold z-50 animate-fade-in`;
    notif.textContent = mensaje;
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.remove();
    }, 3000);
}

// Función para buscar usuario por DNI
async function buscarPorDNI(dni) {
    const detalleUsuario = document.getElementById('detalleUsuario');
    const tablaContainer = document.getElementById('tablaContainer');
    const sinResultados = document.getElementById('sinResultados');
    const loadingContainer = document.getElementById('loadingContainer');
    
    loadingContainer.classList.remove('hidden');
    detalleUsuario.classList.add('hidden');
    tablaContainer.classList.add('hidden');
    sinResultados.classList.add('hidden');
    
    try {
        const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3002'
            : 'https://jaguares-backend.onrender.com';
        
        // ✅ Agregar timestamp para evitar caché y forzar actualización
        const timestamp = new Date().getTime();
        const response = await fetch(`${API_BASE}/api/consultar/${dni}?t=${timestamp}`, {
            cache: 'no-store', // Forzar no usar caché del navegador
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
            }
        });
        const data = await response.json();
        
        console.log('📊 Respuesta completa del backend:', data);
        console.log('🏐 Horarios recibidos:', data.horarios);
        console.log('💳 Pago recibido:', data.pago);
        
        if (data.success) {
            mostrarDetalleUsuario(data);
            loadingContainer.classList.add('hidden');
            detalleUsuario.classList.remove('hidden');
        } else {
            mostrarError(data.error || 'No se encontró usuario con ese DNI o el pago no está confirmado');
            loadingContainer.classList.add('hidden');
        }
    } catch (error) {
        console.error('Error al buscar usuario:', error);
        mostrarError('Error de conexión al buscar usuario');
        loadingContainer.classList.add('hidden');
    }
}

// Función para mostrar detalle del usuario
function mostrarDetalleUsuario(data) {
    console.log('========== DEBUG COMPLETO ==========');
    console.log('👤 Objeto data completo:', JSON.stringify(data, null, 2));
    console.log('👤 data.alumno:', data.alumno);
    console.log('📄 URL DNI Frontal:', data.alumno.dni_frontal_url);
    console.log('📄 URL DNI Reverso:', data.alumno.dni_reverso_url);
    console.log('📸 URL Foto Carnet:', data.alumno.foto_carnet_url);
    console.log('📄 Tipo de dni_frontal_url:', typeof data.alumno.dni_frontal_url);
    console.log('📄 Longitud dni_frontal_url:', data.alumno.dni_frontal_url ? data.alumno.dni_frontal_url.length : 0);
    console.log('====================================');
    
    // Datos personales
    document.getElementById('detalleDNI').textContent = data.alumno.dni;
    document.getElementById('detalleNombre').textContent = `${data.alumno.nombres} ${data.alumno.apellidos}`;
    
    // Formatear fecha de nacimiento
    const fechaNac = data.alumno.fecha_nacimiento ? new Date(data.alumno.fecha_nacimiento).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'No registrado';
    document.getElementById('detalleFechaNacimiento').textContent = fechaNac;
    
    document.getElementById('detalleEdadSexo').textContent = `${data.alumno.edad || 'N/A'} / ${data.alumno.sexo || 'N/A'}`;
    
    // Contacto
    document.getElementById('detalleTelefono').textContent = data.alumno.telefono || 'No registrado';
    document.getElementById('detalleEmail').textContent = data.alumno.email || 'No registrado';
    document.getElementById('detalleDireccion').textContent = data.alumno.direccion || 'No registrado';
    document.getElementById('detalleApoderado').textContent = data.alumno.apoderado || 'No registrado';
    document.getElementById('detalleTelefonoApoderado').textContent = data.alumno.telefono_apoderado || 'No registrado';
    
    // Salud
    document.getElementById('detalleSeguroTipo').textContent = data.alumno.seguro_tipo || 'No registrado';
    document.getElementById('detalleCondicionMedica').textContent = data.alumno.condicion_medica || 'No registrado';
    
    // Pago
    document.getElementById('detalleMonto').textContent = `S/ ${parseFloat(data.pago.monto).toFixed(2)}`;
    document.getElementById('detalleMetodoPago').textContent = data.pago.metodo_pago || '-';
    
    const estadoPago = data.pago.estado;
    const estadoTexto = estadoPago === 'confirmado' ? 'Confirmado' : 'Pendiente';
    const estadoColor = estadoPago === 'confirmado' ? 'text-green-600' : 'text-yellow-600';
    document.getElementById('detalleEstadoPago').innerHTML = `<span class="${estadoColor}">${estadoTexto}</span>`;
    
    // Generar grid 2x2 con todas las imágenes (Comprobante + 3 Documentos)
    const seccionImagenes = document.getElementById('seccionImagenes');
    if (seccionImagenes) {
        let imagenesHTML = '';
        
        // 1. Comprobante de Pago
        if (data.pago.comprobante_url) {
            const urlComprobante = convertirURLDrive(data.pago.comprobante_url);
            const urlComprobanteView = convertirURLDriveView(data.pago.comprobante_url);
            imagenesHTML += `
                <div class="bg-blue-50 dark:bg-blue-900/10 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                    <p class="text-xs font-bold text-blue-900 dark:text-blue-200 mb-2 flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm">receipt_long</span>
                        Comprobante de Pago
                    </p>
                    <div class="w-full overflow-hidden rounded-lg border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-800" style="height: 220px;">
                        <img src="${urlComprobante}" 
                             alt="Comprobante" 
                             class="w-full h-full cursor-pointer hover:opacity-90 transition-opacity" style="object-fit: contain;"
                             onclick="window.open('${urlComprobanteView}', '_blank')"
                             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22600%22%3E%3Crect fill=%22%23e3f2fd%22 width=%22400%22 height=%22600%22/%3E%3Ctext fill=%22%231976d2%22 x=%2250%25%22 y=%2250%25%22 font-family=%22Arial%22 font-size=%2218%22 text-anchor=%22middle%22 dy=%22.3em%22%3ESin comprobante%3C/text%3E%3C/svg%3E';">
                    </div>
                    <a href="${urlComprobanteView}" target="_blank" class="block text-xs text-center text-blue-600 hover:text-blue-700 mt-2">
                        <span class="material-symbols-outlined text-xs">open_in_new</span> Abrir en Drive
                    </a>
                </div>
            `;
        }
        
        // 2. DNI Frontal
        if (data.alumno.dni_frontal_url) {
            const urlDNIFrontal = convertirURLDrive(data.alumno.dni_frontal_url);
            const urlDNIFrontalView = convertirURLDriveView(data.alumno.dni_frontal_url);
            imagenesHTML += `
                <div class="bg-green-50 dark:bg-green-900/10 rounded-lg p-3 border border-green-200 dark:border-green-800">
                    <p class="text-xs font-bold text-green-900 dark:text-green-200 mb-2 flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm">credit_card</span>
                        DNI Frontal
                    </p>
                    <div class="w-full overflow-hidden rounded-lg border border-green-200 dark:border-green-700 bg-white dark:bg-gray-800" style="height: 220px;">
                        <img src="${urlDNIFrontal}" 
                             alt="DNI Frontal" 
                             class="w-full h-full cursor-pointer hover:opacity-90 transition-opacity" style="object-fit: contain;"
                             onclick="window.open('${urlDNIFrontalView}', '_blank')"
                             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22250%22%3E%3Crect fill=%22%23dcfce7%22 width=%22400%22 height=%22250%22/%3E%3Ctext fill=%22%2316a34a%22 x=%2250%25%22 y=%2250%25%22 font-family=%22Arial%22 font-size=%2216%22 text-anchor=%22middle%22 dy=%22.3em%22%3ESin DNI frontal%3C/text%3E%3C/svg%3E';">
                    </div>
                    <a href="${urlDNIFrontalView}" target="_blank" class="block text-xs text-center text-green-600 hover:text-green-700 mt-2">
                        <span class="material-symbols-outlined text-xs">open_in_new</span> Abrir en Drive
                    </a>
                </div>
            `;
        }
        
        // 3. DNI Reverso
        if (data.alumno.dni_reverso_url) {
            const urlDNIReverso = convertirURLDrive(data.alumno.dni_reverso_url);
            const urlDNIReversoView = convertirURLDriveView(data.alumno.dni_reverso_url);
            imagenesHTML += `
                <div class="bg-green-50 dark:bg-green-900/10 rounded-lg p-3 border border-green-200 dark:border-green-800">
                    <p class="text-xs font-bold text-green-900 dark:text-green-200 mb-2 flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm">credit_card</span>
                        DNI Reverso
                    </p>
                    <div class="w-full overflow-hidden rounded-lg border border-green-200 dark:border-green-700 bg-white dark:bg-gray-800" style="height: 220px;">
                        <img src="${urlDNIReverso}" 
                             alt="DNI Reverso" 
                             class="w-full h-full cursor-pointer hover:opacity-90 transition-opacity" style="object-fit: contain;"
                             onclick="window.open('${urlDNIReversoView}', '_blank')"
                             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22250%22%3E%3Crect fill=%22%23dcfce7%22 width=%22400%22 height=%22250%22/%3E%3Ctext fill=%22%2316a34a%22 x=%2250%25%22 y=%2250%25%22 font-family=%22Arial%22 font-size=%2216%22 text-anchor=%22middle%22 dy=%22.3em%22%3ESin DNI reverso%3C/text%3E%3C/svg%3E';">
                    </div>
                    <a href="${urlDNIReversoView}" target="_blank" class="block text-xs text-center text-green-600 hover:text-green-700 mt-2">
                        <span class="material-symbols-outlined text-xs">open_in_new</span> Abrir en Drive
                    </a>
                </div>
            `;
        }
        
        // 4. Foto Carnet
        if (data.alumno.foto_carnet_url) {
            const urlFotoCarnet = convertirURLDrive(data.alumno.foto_carnet_url);
            const urlFotoCarnetView = convertirURLDriveView(data.alumno.foto_carnet_url);
            imagenesHTML += `
                <div class="bg-green-50 dark:bg-green-900/10 rounded-lg p-3 border border-green-200 dark:border-green-800">
                    <p class="text-xs font-bold text-green-900 dark:text-green-200 mb-2 flex items-center gap-1">
                        <span class="material-symbols-outlined text-sm">portrait</span>
                        Foto Tamaño Carnet
                    </p>
                    <div class="w-full overflow-hidden rounded-lg border border-green-200 dark:border-green-700 bg-white dark:bg-gray-800" style="height: 220px;">
                        <img src="${urlFotoCarnet}" 
                             alt="Foto Carnet" 
                             class="w-full h-full cursor-pointer hover:opacity-90 transition-opacity" style="object-fit: contain;"
                             onclick="window.open('${urlFotoCarnetView}', '_blank')"
                             onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22400%22 height=%22500%22%3E%3Crect fill=%22%23dcfce7%22 width=%22400%22 height=%22500%22/%3E%3Ctext fill=%22%2316a34a%22 x=%2250%25%22 y=%2250%25%22 font-family=%22Arial%22 font-size=%2216%22 text-anchor=%22middle%22 dy=%22.3em%22%3ESin foto carnet%3C/text%3E%3C/svg%3E';">
                    </div>
                    <a href="${urlFotoCarnetView}" target="_blank" class="block text-xs text-center text-green-600 hover:text-green-700 mt-2">
                        <span class="material-symbols-outlined text-xs">open_in_new</span> Abrir en Drive
                    </a>
                </div>
            `;
        }
        
        if (imagenesHTML) {
            seccionImagenes.innerHTML = imagenesHTML;
        } else {
            seccionImagenes.innerHTML = `
                <div class="col-span-2 bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700 text-center">
                    <span class="material-symbols-outlined text-gray-400 text-4xl">image_not_supported</span>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-2">No se han subido documentos</p>
                </div>
            `;
        }
    }
    
    // ✅ Eliminar las secciones antiguas de comprobante y documentos separadas (si existen)
    const comprobanteContainer = document.getElementById('detalleComprobante');
    if (comprobanteContainer) comprobanteContainer.remove();
    
    const documentosContainer = document.getElementById('detalleDocumentos');
    if (documentosContainer) documentosContainer.remove();
    
    // Renderizar horarios
    const horariosContainer = document.getElementById('detalleHorarios');
    horariosContainer.innerHTML = '';
    
    if (data.horarios && data.horarios.length > 0) {
        data.horarios.forEach(horario => {
            const horarioCard = document.createElement('div');
            horarioCard.className = 'border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900';
            
            // Determinar color del estado basado en el estado de pago, no en el estado de la inscripción
            const estadoPago = data.pago.estado === 'confirmado';
            const estadoColor = estadoPago ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400';
            const estadoTexto = estadoPago ? 'Pago Confirmado' : 'Pendiente de Pago';
            
            horarioCard.innerHTML = `
                <div class="flex items-center gap-3 mb-2">
                    <span class="material-symbols-outlined text-primary">sports</span>
                    <p class="font-bold text-lg">${horario.deporte || '-'}</p>
                </div>
                <div class="space-y-1 text-sm">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-xs">calendar_today</span>
                        <p><span class="font-semibold">Día:</span> ${horario.dia || '-'}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-xs">schedule</span>
                        <p><span class="font-semibold">Horario:</span> ${horario.hora_inicio || '-'} - ${horario.hora_fin || '-'}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-xs">check_circle</span>
                        <p><span class="font-semibold">Estado:</span> <span class="${estadoColor} font-semibold">${estadoTexto}</span></p>
                    </div>
                </div>
            `;
            horariosContainer.appendChild(horarioCard);
        });
    } else {
        horariosContainer.innerHTML = '<p class="text-text-muted">No hay horarios registrados</p>';
    }
}

// Función para cerrar detalle del usuario
function cerrarDetalleUsuario() {
    document.getElementById('detalleUsuario').classList.add('hidden');
    document.getElementById('filtroDNI').value = '';
    cargarInscritos();
}
