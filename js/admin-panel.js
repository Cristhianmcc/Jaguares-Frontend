/**
 * JavaScript para el Panel de Administración
 */

let inscritosData = [];
let dniAEliminar = null;

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
    
    document.getElementById('adminEmail').textContent = data.admin.email;
}

function inicializarEventos() {
    document.getElementById('btnCerrarSesion').addEventListener('click', cerrarSesion);
    document.getElementById('btnFiltrar').addEventListener('click', aplicarFiltros);
    document.getElementById('btnLimpiarFiltros').addEventListener('click', limpiarFiltros);
    document.getElementById('btnCancelarEliminar').addEventListener('click', cerrarModal);
    document.getElementById('btnConfirmarEliminar').addEventListener('click', confirmarEliminar);
    
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
        
        let url = `${API_BASE}/api/admin/inscritos`;
        const params = new URLSearchParams();
        
        if (dia) params.append('dia', dia);
        if (deporte) params.append('deporte', deporte);
        
        if (params.toString()) {
            url += '?' + params.toString();
        }
        
        const response = await fetch(url);
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
        row.className = 'border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors';
        
        const estadoClass = inscrito.estado === 'activa' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800';
        const estadoTexto = inscrito.estado === 'activa' ? 'Activo' : 'Pendiente';
        
        const horario = inscrito.hora_inicio && inscrito.hora_fin 
            ? `${inscrito.hora_inicio} - ${inscrito.hora_fin}` 
            : '-';
        
        const deporte = inscrito.deporte || inscrito.dia || '-';
        
        row.innerHTML = `
            <td class="px-4 py-3 font-mono text-sm font-semibold">${inscrito.dni}</td>
            <td class="px-4 py-3">${inscrito.nombres}</td>
            <td class="px-4 py-3">${inscrito.apellidos}</td>
            <td class="px-4 py-3 font-mono text-sm">${inscrito.telefono || '-'}</td>
            <td class="px-4 py-3">
                <span class="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-semibold">${deporte}</span>
            </td>
            <td class="px-4 py-3 text-xs">${horario}</td>
            <td class="px-4 py-3">
                <span class="px-2 py-1 ${estadoClass} rounded text-xs font-semibold">${estadoTexto}</span>
            </td>
            <td class="px-4 py-3 text-center">
                <button onclick="eliminarUsuario('${inscrito.dni}')" class="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Eliminar de TODAS las hojas del Sheet">
                    <span class="material-symbols-outlined text-xl">delete</span>
                </button>
            </td>
        `;
        
        tablaBody.appendChild(row);
    });
    
    tablaContainer.classList.remove('hidden');
    sinResultados.classList.add('hidden');
}

function actualizarEstadisticas(inscritos) {
    const total = inscritos.length;
    const activos = inscritos.filter(i => i.estado === 'activa').length;
    const pendientes = inscritos.filter(i => i.estado === 'pendiente_pago').length;
    const ingresos = activos * 50;
    
    document.getElementById('totalInscritos').textContent = total;
    document.getElementById('totalActivos').textContent = activos;
    document.getElementById('totalPendientes').textContent = pendientes;
    document.getElementById('totalIngresos').textContent = 'S/ ' + ingresos.toFixed(2);
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

function eliminarUsuario(dni) {
    dniAEliminar = dni;
    document.getElementById('dniEliminar').textContent = dni;
    document.getElementById('modalEliminar').classList.remove('hidden');
}

function cerrarModal() {
    dniAEliminar = null;
    document.getElementById('modalEliminar').classList.add('hidden');
}

async function confirmarEliminar() {
    if (!dniAEliminar) return;
    
    const btnConfirmar = document.getElementById('btnConfirmarEliminar');
    const textoOriginal = btnConfirmar.innerHTML;
    
    btnConfirmar.disabled = true;
    btnConfirmar.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Eliminando...';
    
    try {
        const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3002'
            : 'https://jaguares-backend.onrender.com';
        
        const response = await fetch(`${API_BASE}/api/eliminar-usuario/${dniAEliminar}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            cerrarModal();
            cargarInscritos();
            mostrarNotificacion('Usuario eliminado correctamente', 'success');
        } else {
            mostrarNotificacion('Error: ' + data.error, 'error');
            btnConfirmar.disabled = false;
            btnConfirmar.innerHTML = textoOriginal;
        }
    } catch (error) {
        console.error('Error al eliminar:', error);
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
        
        const response = await fetch(`${API_BASE}/api/consultar/${dni}`);
        const data = await response.json();
        
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
    // Datos personales
    document.getElementById('detalleDNI').textContent = data.alumno.dni;
    document.getElementById('detalleNombre').textContent = `${data.alumno.nombres} ${data.alumno.apellidos}`;
    document.getElementById('detalleFechaNacimiento').textContent = data.alumno.fecha_nacimiento || '-';
    document.getElementById('detalleEdadSexo').textContent = `${data.alumno.edad || '-'} / ${data.alumno.sexo || '-'}`;
    
    // Contacto
    document.getElementById('detalleTelefono').textContent = data.alumno.telefono || '-';
    document.getElementById('detalleEmail').textContent = data.alumno.email || '-';
    document.getElementById('detalleDireccion').textContent = data.alumno.direccion || '-';
    document.getElementById('detalleApoderado').textContent = data.alumno.apoderado || '-';
    document.getElementById('detalleTelefonoApoderado').textContent = data.alumno.telefono_apoderado || '-';
    
    // Salud
    document.getElementById('detalleSeguroTipo').textContent = data.alumno.seguro_tipo || '-';
    document.getElementById('detalleCondicionMedica').textContent = data.alumno.condicion_medica || '-';
    
    // Pago
    document.getElementById('detalleMonto').textContent = `S/ ${parseFloat(data.pago.monto).toFixed(2)}`;
    document.getElementById('detalleMetodoPago').textContent = data.pago.metodo_pago || '-';
    
    const estadoPago = data.pago.estado;
    const estadoTexto = estadoPago === 'confirmado' ? 'Confirmado' : 'Pendiente';
    const estadoColor = estadoPago === 'confirmado' ? 'text-green-600' : 'text-yellow-600';
    document.getElementById('detalleEstadoPago').innerHTML = `<span class="${estadoColor}">${estadoTexto}</span>`;
    
    // Renderizar horarios
    const horariosContainer = document.getElementById('detalleHorarios');
    horariosContainer.innerHTML = '';
    
    if (data.horarios && data.horarios.length > 0) {
        data.horarios.forEach(horario => {
            const horarioCard = document.createElement('div');
            horarioCard.className = 'border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900';
            horarioCard.innerHTML = `
                <div class="flex items-center gap-3 mb-2">
                    <span class="material-symbols-outlined text-primary">sports</span>
                    <p class="font-bold text-lg">${horario.deporte}</p>
                </div>
                <div class="space-y-1 text-sm">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-xs">calendar_today</span>
                        <p><span class="font-semibold">Día:</span> ${horario.dia}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-xs">schedule</span>
                        <p><span class="font-semibold">Horario:</span> ${horario.hora_inicio} - ${horario.hora_fin}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-xs">tag</span>
                        <p><span class="font-semibold">Código:</span> ${horario.codigo_inscripcion}</p>
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
