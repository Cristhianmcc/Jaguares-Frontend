/**
 * JavaScript para Tomar Asistencia
 */

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3002'
    : 'https://jaguares-backend.onrender.com';

let profesorData = null;
let deportesDisponibles = [];
let categoriasDisponibles = [];
let horariosDisponibles = [];
let alumnosClase = [];
let horarioSeleccionado = null;

// Verificar autenticación al cargar
document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
    inicializarEventos();
    mostrarFechaActual();
    cargarDeportesProfesor();
    
    // Si viene de un horario específico (desde dashboard)
    const urlParams = new URLSearchParams(window.location.search);
    const horarioId = urlParams.get('horario');
    if (horarioId) {
        cargarClaseDirecta(horarioId);
    }
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
    
    if (data.admin.rol !== 'profesor') {
        alert('Acceso denegado. Esta área es solo para profesores.');
        window.location.href = '../admin-login.html';
        return;
    }
    
    const sessionTime = new Date(data.timestamp).getTime();
    const now = new Date().getTime();
    const hoursElapsed = (now - sessionTime) / (1000 * 60 * 60);
    
    if (hoursElapsed >= 8) {
        alert('Tu sesión ha expirado.');
        localStorage.removeItem('adminSession');
        localStorage.removeItem('admin_token');
        window.location.href = '../admin-login.html';
        return;
    }
    
    profesorData = data.admin;
    document.getElementById('profesorNombre').textContent = profesorData.nombre_completo || profesorData.email;
}

/**
 * Mostrar fecha actual
 */
function mostrarFechaActual() {
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const hoy = new Date();
    const textoFecha = `${dias[hoy.getDay()]}, ${hoy.getDate()} de ${meses[hoy.getMonth()]} de ${hoy.getFullYear()}`;
    
    document.getElementById('fechaActual').textContent = textoFecha;
}

/**
 * Inicializar eventos
 */
function inicializarEventos() {
    document.getElementById('filtroDeporte').addEventListener('change', onDeporteChange);
    document.getElementById('filtroCategoria').addEventListener('change', onCategoriaChange);
    document.getElementById('btnCargarAlumnos').addEventListener('click', cargarAlumnos);
    document.getElementById('btnMarcarTodos').addEventListener('click', marcarTodos);
    document.getElementById('btnDesmarcarTodos').addEventListener('click', desmarcarTodos);
    document.getElementById('btnGuardarAsistencia').addEventListener('click', guardarAsistencia);
    document.getElementById('btnCerrarModal').addEventListener('click', cerrarModal);
}

/**
 * Cargar deportes asignados al profesor
 */
async function cargarDeportesProfesor() {
    try {
        const session = localStorage.getItem('adminSession');
        const { token } = JSON.parse(session);
        
        const response = await fetch(`${API_BASE}/api/profesor/mis-deportes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (data.success && data.deportes) {
            deportesDisponibles = data.deportes;
            
            const select = document.getElementById('filtroDeporte');
            select.innerHTML = '<option value="">Seleccione un deporte...</option>';
            
            data.deportes.forEach(deporte => {
                const option = document.createElement('option');
                option.value = deporte.deporte_id;
                option.textContent = deporte.nombre;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error al cargar deportes:', error);
        mostrarError('Error al cargar deportes asignados');
    }
}

/**
 * Cuando cambia el deporte seleccionado
 */
async function onDeporteChange(e) {
    const deporteId = e.target.value;
    const selectCategoria = document.getElementById('filtroCategoria');
    const selectHorario = document.getElementById('filtroHorario');
    const btnCargar = document.getElementById('btnCargarAlumnos');
    
    // Resetear
    selectCategoria.innerHTML = '<option value="">Cargando...</option>';
    selectCategoria.disabled = true;
    selectHorario.innerHTML = '<option value="">Primero seleccione categoría</option>';
    selectHorario.disabled = true;
    btnCargar.disabled = true;
    
    if (!deporteId) {
        selectCategoria.innerHTML = '<option value="">Primero seleccione deporte</option>';
        return;
    }
    
    try {
        const session = localStorage.getItem('adminSession');
        const { token } = JSON.parse(session);
        
        const response = await fetch(`${API_BASE}/api/profesor/categorias-deporte/${deporteId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (data.success && data.categorias) {
            categoriasDisponibles = data.categorias;
            
            selectCategoria.innerHTML = '<option value="">Seleccione una categoría...</option>';
            
            data.categorias.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat.categoria;
                option.textContent = cat.categoria;
                selectCategoria.appendChild(option);
            });
            
            selectCategoria.disabled = false;
        }
    } catch (error) {
        console.error('Error al cargar categorías:', error);
        selectCategoria.innerHTML = '<option value="">Error al cargar</option>';
    }
}

/**
 * Cuando cambia la categoría seleccionada
 */
async function onCategoriaChange(e) {
    const deporteId = document.getElementById('filtroDeporte').value;
    const categoria = e.target.value;
    const selectHorario = document.getElementById('filtroHorario');
    const btnCargar = document.getElementById('btnCargarAlumnos');
    
    selectHorario.innerHTML = '<option value="">Cargando...</option>';
    selectHorario.disabled = true;
    btnCargar.disabled = true;
    
    if (!categoria) {
        selectHorario.innerHTML = '<option value="">Primero seleccione categoría</option>';
        return;
    }
    
    try {
        const session = localStorage.getItem('adminSession');
        const { token } = JSON.parse(session);
        
        // Obtener día actual
        const dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
        const hoy = dias[new Date().getDay()];
        
        const response = await fetch(
            `${API_BASE}/api/profesor/horarios-categoria?deporte_id=${deporteId}&categoria=${encodeURIComponent(categoria)}&dia=${hoy}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        
        const data = await response.json();
        
        if (data.success && data.horarios) {
            horariosDisponibles = data.horarios;
            
            selectHorario.innerHTML = '<option value="">Seleccione un horario...</option>';
            
            data.horarios.forEach(horario => {
                const option = document.createElement('option');
                option.value = horario.horario_id;
                option.textContent = `${horario.hora_inicio} - ${horario.hora_fin}`;
                selectHorario.appendChild(option);
            });
            
            selectHorario.disabled = false;
            selectHorario.addEventListener('change', () => {
                btnCargar.disabled = !selectHorario.value;
            });
        } else {
            selectHorario.innerHTML = '<option value="">No hay horarios hoy</option>';
        }
    } catch (error) {
        console.error('Error al cargar horarios:', error);
        selectHorario.innerHTML = '<option value="">Error al cargar</option>';
    }
}

/**
 * Cargar alumnos de la clase seleccionada
 */
async function cargarAlumnos() {
    const horarioId = document.getElementById('filtroHorario').value;
    
    if (!horarioId) {
        alert('Por favor seleccione un horario');
        return;
    }
    
    const loadingContainer = document.getElementById('loadingContainer');
    const alumnosContainer = document.getElementById('alumnosContainer');
    const sinAlumnos = document.getElementById('sinAlumnos');
    const infoClase = document.getElementById('infoClase');
    
    loadingContainer.classList.remove('hidden');
    alumnosContainer.classList.add('hidden');
    sinAlumnos.classList.add('hidden');
    infoClase.classList.add('hidden');
    
    try {
        const session = localStorage.getItem('adminSession');
        const { token } = JSON.parse(session);
        
        const response = await fetch(`${API_BASE}/api/profesor/alumnos-clase/${horarioId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        loadingContainer.classList.add('hidden');
        
        if (data.success && data.alumnos && data.alumnos.length > 0) {
            alumnosClase = data.alumnos;
            horarioSeleccionado = data.horario;
            
            // Mostrar info de la clase
            document.getElementById('claseNombre').textContent = `${horarioSeleccionado.deporte} - ${horarioSeleccionado.categoria}`;
            document.getElementById('claseDetalle').textContent = `${horarioSeleccionado.dia} | ${horarioSeleccionado.hora_inicio} - ${horarioSeleccionado.hora_fin}`;
            infoClase.classList.remove('hidden');
            
            // Mostrar alumnos
            renderizarAlumnos();
            alumnosContainer.classList.remove('hidden');
        } else {
            sinAlumnos.classList.remove('hidden');
        }
        
    } catch (error) {
        console.error('Error al cargar alumnos:', error);
        loadingContainer.classList.add('hidden');
        alert('Error al cargar alumnos. Por favor, intenta nuevamente.');
    }
}

/**
 * Renderizar lista de alumnos
 */
function renderizarAlumnos() {
    const lista = document.getElementById('listaAlumnos');
    const contador = document.getElementById('contadorAlumnos');
    
    lista.innerHTML = '';
    contador.textContent = `(${alumnosClase.length})`;
    
    alumnosClase.forEach((alumno, index) => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors';
        
        const presente = alumno.asistencia_registrada ? alumno.presente : true; // Por defecto marcar presente
        
        div.innerHTML = `
            <div class="flex items-center gap-4">
                <span class="w-8 h-8 flex items-center justify-center bg-primary text-white font-bold rounded-full text-sm">
                    ${index + 1}
                </span>
                <div>
                    <p class="font-semibold text-black dark:text-white">${alumno.nombre_completo}</p>
                    <p class="text-sm text-text-muted dark:text-gray-400">DNI: ${alumno.dni}</p>
                </div>
            </div>
            
            <label class="flex items-center gap-3 cursor-pointer">
                <span class="text-sm font-semibold ${presente ? 'text-green-600' : 'text-red-600'}">
                    ${presente ? 'Presente' : 'Ausente'}
                </span>
                <input type="checkbox" 
                       data-alumno-id="${alumno.alumno_id}"
                       ${presente ? 'checked' : ''}
                       class="w-6 h-6 rounded border-gray-300 text-green-600 focus:ring-green-500">
            </label>
        `;
        
        const checkbox = div.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', (e) => {
            const span = div.querySelector('span.text-sm');
            if (e.target.checked) {
                span.textContent = 'Presente';
                span.className = 'text-sm font-semibold text-green-600';
            } else {
                span.textContent = 'Ausente';
                span.className = 'text-sm font-semibold text-red-600';
            }
        });
        
        lista.appendChild(div);
    });
}

/**
 * Marcar todos como presentes
 */
function marcarTodos() {
    const checkboxes = document.querySelectorAll('#listaAlumnos input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = true;
        cb.dispatchEvent(new Event('change'));
    });
}

/**
 * Desmarcar todos (marcar ausentes)
 */
function desmarcarTodos() {
    const checkboxes = document.querySelectorAll('#listaAlumnos input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = false;
        cb.dispatchEvent(new Event('change'));
    });
}

/**
 * Guardar asistencia en la base de datos
 */
async function guardarAsistencia() {
    const checkboxes = document.querySelectorAll('#listaAlumnos input[type="checkbox"]');
    
    const asistencias = Array.from(checkboxes).map(cb => ({
        alumno_id: parseInt(cb.dataset.alumnoId),
        presente: cb.checked
    }));
    
    const btnGuardar = document.getElementById('btnGuardarAsistencia');
    const textoOriginal = btnGuardar.innerHTML;
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Guardando...';
    
    try {
        const session = localStorage.getItem('adminSession');
        const { token } = JSON.parse(session);
        
        const response = await fetch(`${API_BASE}/api/profesor/guardar-asistencia`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                horario_id: horarioSeleccionado.horario_id,
                fecha: new Date().toISOString().split('T')[0],
                asistencias: asistencias
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('modalConfirmacion').classList.remove('hidden');
        } else {
            alert(data.error || 'Error al guardar asistencia');
            btnGuardar.disabled = false;
            btnGuardar.innerHTML = textoOriginal;
        }
        
    } catch (error) {
        console.error('Error al guardar asistencia:', error);
        alert('Error al guardar asistencia. Por favor, intenta nuevamente.');
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = textoOriginal;
    }
}

/**
 * Cerrar modal y recargar
 */
function cerrarModal() {
    document.getElementById('modalConfirmacion').classList.add('hidden');
    window.location.href = 'index.html';
}

/**
 * Cargar clase directa desde URL
 */
async function cargarClaseDirecta(horarioId) {
    // Implementar carga directa si es necesario
    console.log('Cargando clase directa:', horarioId);
}

/**
 * Mostrar mensaje de error
 */
function mostrarError(mensaje) {
    alert(mensaje);
}
