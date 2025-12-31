/**
 * Script principal - index.html
 */

// Función para consultar estado
function consultarEstado() {
    // Redirigir directo a la página de consulta
    window.location.href = 'consulta.html';
}

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    console.log('🐆 JAGUARES - Sistema de Inscripciones Cargado');
    
    // Verificar si hay datos guardados
    const datosGuardados = LocalStorage.get('datosInscripcion');
    if (datosGuardados) {
        console.log('✓ Datos de inscripción encontrados en localStorage');
    }
});
