/**
 * Script para el formulario de inscripción
 */

// Variable de control para validación de DNI
let dniValidado = false;

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formInscripcion');
    const btnBuscarDni = document.getElementById('btnBuscarDni');
    const apoderadoSection = document.getElementById('apoderadoSection');
    const fechaNacimientoInput = document.getElementById('fecha_nacimiento');
    
    // Cargar datos guardados si existen
    cargarDatosGuardados();
    
    // Listener para detectar si es menor de edad
    fechaNacimientoInput.addEventListener('change', verificarEdad);
    
    // Buscar DNI (opcional - API RENIEC si está disponible)
    btnBuscarDni.addEventListener('click', buscarDNI);
    
    // Resetear validación cuando el usuario edita el DNI
    const dniInput = document.getElementById('dni');
    dniInput.addEventListener('input', () => {
        dniValidado = false;
        const helper = document.getElementById('dni-helper');
        helper.classList.add('hidden');
        helper.textContent = '';
        helper.className = 'text-sm text-primary hidden';
    });
    
    // Submit del formulario
    form.addEventListener('submit', handleSubmit);
});

function cargarDatosGuardados() {
    const datosGuardados = LocalStorage.get('datosInscripcion');
    
    if (datosGuardados && datosGuardados.alumno) {
        const alumno = datosGuardados.alumno;
        
        // Rellenar campos
        document.getElementById('dni').value = alumno.dni || '';
        document.getElementById('nombres').value = alumno.nombres || '';
        document.getElementById('apellido_paterno').value = alumno.apellido_paterno || '';
        document.getElementById('apellido_materno').value = alumno.apellido_materno || '';
        document.getElementById('fecha_nacimiento').value = alumno.fecha_nacimiento || '';
        document.getElementById('telefono').value = alumno.telefono || '';
        document.getElementById('direccion').value = alumno.direccion || '';
        document.getElementById('email').value = alumno.email || '';
        document.getElementById('seguro_tipo').value = alumno.seguro_tipo || '';
        document.getElementById('condicion_medica').value = alumno.condicion_medica || '';
        
        if (alumno.sexo) {
            const radioSexo = document.querySelector(`input[name="sexo"][value="${alumno.sexo}"]`);
            if (radioSexo) radioSexo.checked = true;
        }
        
        if (alumno.apoderado) {
            document.getElementById('apoderado').value = alumno.apoderado || '';
            document.getElementById('telefono_apoderado').value = alumno.telefono_apoderado || '';
        }
        
        // Verificar edad
        if (alumno.fecha_nacimiento) {
            verificarEdad();
        }
    }
}

function verificarEdad() {
    const fechaNacimiento = document.getElementById('fecha_nacimiento').value;
    const apoderadoSection = document.getElementById('apoderadoSection');
    const apoderadoInput = document.getElementById('apoderado');
    const telefonoApoderadoInput = document.getElementById('telefono_apoderado');
    
    if (!fechaNacimiento) return;
    
    const edad = Utils.calcularEdad(fechaNacimiento);
    
    if (edad < 18) {
        apoderadoSection.classList.remove('hidden');
        apoderadoSection.classList.add('flex');
        apoderadoInput.required = true;
        telefonoApoderadoInput.required = true;
    } else {
        apoderadoSection.classList.add('hidden');
        apoderadoSection.classList.remove('flex');
        apoderadoInput.required = false;
        telefonoApoderadoInput.required = false;
    }
}

async function buscarDNI() {
    const dniInput = document.getElementById('dni');
    const dni = dniInput.value.trim();
    const helper = document.getElementById('dni-helper');
    
    if (!Utils.validarDNI(dni)) {
        Utils.mostrarNotificacion('El DNI debe tener 8 dígitos', 'error');
        return;
    }
    
    // Mostrar indicador de carga
    helper.classList.remove('hidden');
    helper.textContent = 'Verificando DNI...';
    helper.className = 'text-sm text-blue-600 mt-1';
    
    try {
        // Validar si el DNI ya está registrado
        const response = await academiaAPI.validarDNI(dni);
        
        if (!response.valido) {
            // DNI duplicado o inválido
            helper.textContent = response.error;
            helper.className = 'text-sm text-red-600 mt-1 font-semibold';
            dniInput.value = '';
            dniInput.focus();
            Utils.mostrarNotificacion(response.error, 'error');
            return;
        }
        
        // DNI válido y disponible
        dniValidado = true; // Marcar como validado
        helper.textContent = '✓ DNI disponible para registro';
        helper.className = 'text-sm text-green-600 mt-1 font-semibold';
        Utils.mostrarNotificacion('DNI válido, continúa con el registro', 'success');
        
        // Opcional: Aquí se puede integrar con API RENIEC si está disponible
        // Por ahora, solo validamos disponibilidad
        
        // Simular respuesta (en producción vendría de la API)
        // const response = await fetch(`https://api-reniec/consulta/${dni}`);
        // const data = await response.json();
        
        helper.textContent = 'Datos no encontrados. Complete manualmente.';
        setTimeout(() => {
            helper.classList.add('hidden');
        }, 3000);
        
    } catch (error) {
        helper.textContent = 'Error al buscar. Complete manualmente.';
        helper.classList.add('text-red-500');
        setTimeout(() => {
            helper.classList.add('hidden');
            helper.classList.remove('text-red-500');
        }, 3000);
    }
}

async function handleSubmit(e) {
    e.preventDefault();
    
    const dni = document.getElementById('dni').value.trim();
    
    // Si el DNI no fue validado aún, validarlo ahora automáticamente
    if (!dniValidado) {
        // Validar formato primero
        if (!Utils.validarDNI(dni)) {
            Utils.mostrarNotificacion('El DNI debe tener 8 dígitos', 'error');
            document.getElementById('dni').focus();
            return;
        }
        
        // Mostrar loading
        const btnSubmit = e.target.querySelector('button[type="submit"]');
        const textoOriginal = btnSubmit.innerHTML;
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = '<span class="material-symbols-outlined animate-spin">progress_activity</span> Verificando DNI...';
        
        // Validar si el DNI ya está registrado
        const response = await academiaAPI.validarDNI(dni);
        
        // Restaurar botón
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = textoOriginal;
        
        if (!response.valido) {
            // DNI duplicado o inválido
            Utils.mostrarNotificacion(`❌ ${response.error}`, 'error');
            document.getElementById('dni').value = '';
            document.getElementById('dni').focus();
            return;
        }
        
        // DNI válido, continuar con el proceso
        dniValidado = true;
    }
    
    const formData = new FormData(e.target);
    const alumno = {
        dni: formData.get('dni'),
        nombres: formData.get('nombres'),
        apellido_paterno: formData.get('apellido_paterno'),
        apellido_materno: formData.get('apellido_materno'),
        apellidos: `${formData.get('apellido_paterno')} ${formData.get('apellido_materno')}`,
        fecha_nacimiento: formData.get('fecha_nacimiento'),
        sexo: formData.get('sexo'),
        telefono: formData.get('telefono'),
        direccion: formData.get('direccion'),
        email: formData.get('email'),
        seguro_tipo: formData.get('seguro_tipo'),
        condicion_medica: formData.get('condicion_medica'),
        apoderado: formData.get('apoderado'),
        telefono_apoderado: formData.get('telefono_apoderado')
    };
    
    // Calcular edad
    alumno.edad = Utils.calcularEdad(alumno.fecha_nacimiento);
    
    // Validar
    const validacion = Validaciones.validarAlumno(alumno);
    
    if (!validacion.valido) {
        Utils.mostrarNotificacion(validacion.errores.join('\n'), 'error');
        return;
    }
    
    // Guardar en localStorage
    LocalStorage.set('datosInscripcion', {
        alumno,
        paso: 1,
        fecha: new Date().toISOString()
    });
    
    // Ir al siguiente paso
    window.location.href = 'seleccion-horarios.html';
}
