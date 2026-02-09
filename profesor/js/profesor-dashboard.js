/**
 * JavaScript para el Dashboard del Profesor
 */

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3002'
    : 'http://api.187.77.6.232.nip.io';

let profesorData = null;

// Verificar autenticación al cargar
document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
    inicializarEventos();
    cargarClasesHoy();
});

/**
 * Verifica que el usuario tenga sesión activa y sea profesor
 */
function verificarSesion() {
    const session = localStorage.getItem('adminSession');
    
    if (!session) {
        window.location.href = '../admin-login.html';
        return;
    }
    
    const data = JSON.parse(session);
    
    // Verificar que sea profesor
    if (data.admin.rol !== 'profesor') {
        alert('Acceso denegado. Esta área es solo para profesores.');
        localStorage.removeItem('adminSession');
        localStorage.removeItem('admin_token');
        window.location.href = '../admin-login.html';
        return;
    }
    
    // Verificar tiempo de sesión (8 horas)
    const sessionTime = new Date(data.timestamp).getTime();
    const now = new Date().getTime();
    const hoursElapsed = (now - sessionTime) / (1000 * 60 * 60);
    
    if (hoursElapsed >= 8) {
        alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        localStorage.removeItem('adminSession');
        localStorage.removeItem('admin_token');
        window.location.href = '../admin-login.html';
        return;
    }
    
    profesorData = data.admin;
    
    // Actualizar nombre del profesor en el header
    const nombreCompleto = profesorData.nombre_completo || profesorData.email;
    document.getElementById('profesorNombre').textContent = nombreCompleto;
    
    const nombreMobile = document.getElementById('profesorNombreMobile');
    if (nombreMobile) {
        nombreMobile.textContent = nombreCompleto;
    }
}

/**
 * Inicializar eventos de la interfaz
 */
function inicializarEventos() {
    // Cerrar sesión
    document.getElementById('btnCerrarSesion').addEventListener('click', cerrarSesion);
    
    const btnCerrarSesionMobile = document.getElementById('btnCerrarSesionMobile');
    if (btnCerrarSesionMobile) {
        btnCerrarSesionMobile.addEventListener('click', cerrarSesion);
    }
    
    // Menú móvil
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
}

/**
 * Cerrar sesión del profesor
 */
function cerrarSesion() {
    localStorage.removeItem('adminSession');
    localStorage.removeItem('admin_token');
    window.location.href = '../admin-login.html';
}

/**
 * Cargar clases del día actual
 */
async function cargarClasesHoy() {
    const loadingContainer = document.getElementById('loadingContainer');
    const clasesContainer = document.getElementById('clasesContainer');
    const sinClases = document.getElementById('sinClases');
    const listaClases = document.getElementById('listaClases');
    
    loadingContainer.classList.remove('hidden');
    clasesContainer.classList.add('hidden');
    
    try {
        const session = localStorage.getItem('adminSession');
        if (!session) {
            window.location.href = '../admin-login.html';
            return;
        }
        const { token } = JSON.parse(session);
        
        // Obtener día actual en español
        const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
        const hoy = dias[new Date().getDay()];
        
        const response = await fetch(`${API_BASE}/api/profesor/mis-clases?dia=${hoy}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        loadingContainer.classList.add('hidden');
        clasesContainer.classList.remove('hidden');
        
        if (data.success && data.clases && data.clases.length > 0) {
            sinClases.classList.add('hidden');
            listaClases.innerHTML = '';
            
            data.clases.forEach(clase => {
                const claseCard = crearTarjetaClase(clase);
                listaClases.appendChild(claseCard);
            });
        } else {
            sinClases.classList.remove('hidden');
        }
        
    } catch (error) {
        console.error('Error al cargar clases:', error);
        loadingContainer.classList.add('hidden');
        clasesContainer.classList.remove('hidden');
        sinClases.classList.remove('hidden');
        sinClases.innerHTML = `
            <span class="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
            <p class="text-red-800 dark:text-red-300 font-semibold">Error al cargar las clases. Por favor, intenta nuevamente.</p>
        `;
    }
}

/**
 * Crear tarjeta HTML para una clase
 */
function crearTarjetaClase(clase) {
    const div = document.createElement('div');
    div.className = 'bg-white dark:bg-surface-dark p-6 rounded-xl shadow-md border-l-4 border-primary hover:shadow-lg transition-shadow';
    
    div.innerHTML = `
        <div class="flex items-start justify-between mb-4">
            <div>
                <h3 class="text-xl font-bold text-black dark:text-white">${clase.deporte}</h3>
                <p class="text-sm text-text-muted dark:text-gray-400">${clase.categoria || 'Todas las categorías'}</p>
            </div>
            <span class="material-symbols-outlined text-4xl text-primary">sports</span>
        </div>
        
        <div class="space-y-2 text-sm">
            <div class="flex items-center gap-2 text-text-main dark:text-gray-300">
                <span class="material-symbols-outlined text-lg">schedule</span>
                <span>${clase.hora_inicio} - ${clase.hora_fin}</span>
            </div>
            <div class="flex items-center gap-2 text-text-main dark:text-gray-300">
                <span class="material-symbols-outlined text-lg">groups</span>
                <span>${clase.total_alumnos || 0} alumnos inscritos</span>
            </div>
        </div>
        
        <a href="asistencias.html?horario=${clase.horario_id}" 
           class="mt-4 w-full px-4 py-2 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
            <span class="material-symbols-outlined">fact_check</span>
            Tomar Asistencia
        </a>
    `;
    
    return div;
}
