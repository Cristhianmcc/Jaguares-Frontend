/**
 * Servicio de API para comunicación con el backend de JAGUARES
 * Conecta con el backend Express que se comunica con Google Sheets via Apps Script
 */

// Configuración de la API
const API_CONFIG = {
    // Detectar automáticamente el entorno
    baseUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3002' // Desarrollo local
        : 'https://jaguares-backend.onrender.com', // Producción en Render
    endpoints: {
        horarios: '/api/horarios',
        inscribirMultiple: '/api/inscribir-multiple',
        misInscripciones: '/api/mis-inscripciones',
        registrarPago: '/api/registrar-pago',
        verificarPago: '/api/verificar-pago',
        validarDni: '/api/validar-dni'
    }
};

// Clase para manejar la API
class AcademiaAPI {
    constructor() {
        this.baseUrl = API_CONFIG.baseUrl;
    }

    /**
     * Realiza una petición HTTP
     */
    async request(url, options = {}) {
        try {
            const response = await fetch(`${this.baseUrl}${url}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error en la petición');
            }

            return data;
        } catch (error) {
            console.error('Error en petición:', error);
            throw error;
        }
    }

    /**
     * Obtiene todos los horarios disponibles
     */
    async getHorarios() {
        try {
            const data = await this.request(API_CONFIG.endpoints.horarios);
            
            if (!data.success || !data.horarios) {
                throw new Error('Respuesta inválida del servidor');
            }

            return data.horarios;
        } catch (error) {
            console.error('Error al obtener horarios:', error);
            throw error;
        }
    }

    /**
     * Inscribe a un alumno en múltiples horarios
     */
    async inscribirMultiple(alumno, horarios) {
        try {
            if (!alumno || !horarios || horarios.length === 0) {
                throw new Error('Datos de inscripción incompletos');
            }

            const data = await this.request(API_CONFIG.endpoints.inscribirMultiple, {
                method: 'POST',
                body: JSON.stringify({
                    alumno,
                    horarios
                })
            });

            return data;
        } catch (error) {
            console.error('Error al inscribir:', error);
            throw error;
        }
    }

    /**
     * Obtiene las inscripciones de un alumno por DNI
     */
    async getMisInscripciones(dni) {
        try {
            if (!dni || dni.length < 8) {
                throw new Error('DNI inválido');
            }

            const data = await this.request(`${API_CONFIG.endpoints.misInscripciones}/${dni}`);
            
            return data;
        } catch (error) {
            console.error('Error al obtener inscripciones:', error);
            throw error;
        }
    }

    /**
     * Consulta el estado de inscripción por DNI
     */
    async consultarInscripcion(dni) {
        try {
            if (!dni || dni.length < 8) {
                throw new Error('DNI inválido');
            }

            const data = await this.request(`/api/consultar/${dni}`);
            
            return data;
        } catch (error) {
            console.error('Error al consultar inscripción:', error);
            throw error;
        }
    }

    /**
     * Registra un pago pendiente
     */
    async registrarPago(alumno, metodoPago, horariosSeleccionados = []) {
        try {
            const data = await this.request(API_CONFIG.endpoints.registrarPago, {
                method: 'POST',
                body: JSON.stringify({
                    alumno,
                    metodo_pago: metodoPago,
                    horarios_seleccionados: horariosSeleccionados
                })
            });

            return data;
        } catch (error) {
            console.error('Error al registrar pago:', error);
            throw error;
        }
    }

    /**
     * Valida si un DNI está disponible (no duplicado) y tiene formato correcto
     */
    async validarDNI(dni) {
        try {
            if (!dni || dni.toString().length !== 8) {
                return {
                    success: false,
                    valido: false,
                    error: 'DNI debe tener 8 dígitos'
                };
            }

            const data = await this.request(`${API_CONFIG.endpoints.validarDni}/${dni}`);
            
            return data;
        } catch (error) {
            console.error('Error al validar DNI:', error);
            return {
                success: false,
                valido: false,
                error: error.message || 'Error de conexión al validar DNI'
            };
        }
    }

    /**
     * Verifica el estado de pago de un alumno
     */
    async verificarPago(dni) {
        try {
            if (!dni || dni.length < 8) {
                throw new Error('DNI inválido');
            }

            const data = await this.request(`${API_CONFIG.endpoints.verificarPago}/${dni}`);
            
            return data;
        } catch (error) {
            console.error('Error al verificar pago:', error);
            throw error;
        }
    }
}

// Exportar instancia única
const academiaAPI = new AcademiaAPI();

// Sistema de almacenamiento local
class LocalStorage {
    static set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Error al guardar en localStorage:', error);
        }
    }

    static get(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Error al leer de localStorage:', error);
            return null;
        }
    }

    static remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error al eliminar de localStorage:', error);
        }
    }

    static clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Error al limpiar localStorage:', error);
        }
    }
}

// Utilidades
const Utils = {
    /**
     * Calcula la edad a partir de una fecha de nacimiento
     */
    calcularEdad(fechaNacimiento) {
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();
        
        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        
        return edad;
    },

    /**
     * Formatea un precio
     */
    formatearPrecio(precio) {
        return `S/ ${parseFloat(precio).toFixed(2)}`;
    },

    /**
     * Valida un DNI peruano
     */
    validarDNI(dni) {
        return /^\d{8}$/.test(dni);
    },

    /**
     * Valida un email
     */
    validarEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    /**
     * Formatea una fecha
     */
    formatearFecha(fecha) {
        const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(fecha).toLocaleDateString('es-PE', opciones);
    },

    /**
     * Muestra una notificación/toast estilizada
     */
    mostrarNotificacion(mensaje, tipo = 'info') {
        // Crear contenedor de notificaciones si no existe
        let container = document.getElementById('notificaciones-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notificaciones-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 99999;
                display: flex;
                flex-direction: column;
                gap: 12px;
                max-width: 400px;
                pointer-events: none;
            `;
            document.body.appendChild(container);
        }

        // Configuración por tipo
        const config = {
            'success': {
                icono: 'check_circle',
                color: '#10b981',
                bgColor: '#d1fae5',
                borderColor: '#34d399'
            },
            'error': {
                icono: 'cancel',
                color: '#ef4444',
                bgColor: '#fee2e2',
                borderColor: '#f87171'
            },
            'warning': {
                icono: 'warning',
                color: '#f59e0b',
                bgColor: '#fef3c7',
                borderColor: '#fbbf24'
            },
            'info': {
                icono: 'info',
                color: '#3b82f6',
                bgColor: '#dbeafe',
                borderColor: '#60a5fa'
            }
        };

        const settings = config[tipo] || config.info;

        // Crear notificación
        const notificacion = document.createElement('div');
        notificacion.style.cssText = `
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px 20px;
            background: ${settings.bgColor};
            border-left: 4px solid ${settings.borderColor};
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            min-width: 300px;
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
            pointer-events: auto;
            cursor: pointer;
        `;

        notificacion.innerHTML = `
            <span class="material-symbols-outlined" style="color: ${settings.color}; font-size: 24px; flex-shrink: 0;">
                ${settings.icono}
            </span>
            <span style="color: #1f2937; font-weight: 600; font-size: 14px; flex: 1; line-height: 1.4;">
                ${mensaje}
            </span>
            <button style="
                background: none;
                border: none;
                color: ${settings.color};
                cursor: pointer;
                padding: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 6px;
                transition: background 0.2s;
            " onmouseover="this.style.background='rgba(0,0,0,0.1)'" onmouseout="this.style.background='none'">
                <span class="material-symbols-outlined" style="font-size: 20px;">close</span>
            </button>
        `;

        // Agregar estilos de animación si no existen
        if (!document.getElementById('toast-animations')) {
            const style = document.createElement('style');
            style.id = 'toast-animations';
            style.textContent = `
                @keyframes slideIn {
                    from {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOut {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(400px);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Función para cerrar notificación
        const cerrar = () => {
            notificacion.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notificacion.parentNode) {
                    container.removeChild(notificacion);
                }
                // Eliminar contenedor si está vacío
                if (container.children.length === 0) {
                    document.body.removeChild(container);
                }
            }, 300);
        };

        // Click en cerrar o en la notificación para cerrar
        const closeBtn = notificacion.querySelector('button');
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            cerrar();
        });
        notificacion.addEventListener('click', cerrar);

        // Agregar al contenedor
        container.appendChild(notificacion);

        // Auto-cerrar después de 5 segundos
        setTimeout(cerrar, 5000);
    },

    /**
     * Genera un código de operación único
     */
    generarCodigoOperacion() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 7);
        return `JAG-${timestamp}-${random}`.toUpperCase();
    },

    /**
     * Debounce para optimizar búsquedas
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Validaciones de formulario
const Validaciones = {
    /**
     * Valida los datos del alumno
     */
    validarAlumno(alumno) {
        const errores = [];

        if (!alumno.dni || !Utils.validarDNI(alumno.dni)) {
            errores.push('DNI inválido (debe tener 8 dígitos)');
        }

        if (!alumno.nombres || alumno.nombres.trim().length < 2) {
            errores.push('Nombres inválidos');
        }

        if (!alumno.apellido_paterno || alumno.apellido_paterno.trim().length < 2) {
            errores.push('Apellido paterno inválido');
        }

        if (!alumno.apellido_materno || alumno.apellido_materno.trim().length < 2) {
            errores.push('Apellido materno inválido');
        }

        if (!alumno.fecha_nacimiento) {
            errores.push('Fecha de nacimiento requerida');
        }

        if (!alumno.sexo) {
            errores.push('Sexo requerido');
        }

        if (!alumno.telefono || alumno.telefono.length < 9) {
            errores.push('Teléfono inválido');
        }

        if (!alumno.direccion || alumno.direccion.trim().length < 5) {
            errores.push('Dirección inválida');
        }

        if (!alumno.seguro_tipo) {
            errores.push('Tipo de seguro requerido');
        }

        if (alumno.email && !Utils.validarEmail(alumno.email)) {
            errores.push('Email inválido');
        }

        // Validar apoderado si es menor de edad
        if (alumno.fecha_nacimiento) {
            const edad = Utils.calcularEdad(alumno.fecha_nacimiento);
            if (edad < 18) {
                if (!alumno.apoderado || alumno.apoderado.trim().length < 3) {
                    errores.push('Nombre del apoderado requerido para menores de edad');
                }
                if (!alumno.telefono_apoderado || alumno.telefono_apoderado.length < 9) {
                    errores.push('Teléfono del apoderado requerido para menores de edad');
                }
            }
        }

        return {
            valido: errores.length === 0,
            errores
        };
    },

    /**
     * Valida la selección de horarios
     */
    validarHorarios(horariosSeleccionados) {
        if (!horariosSeleccionados || horariosSeleccionados.length === 0) {
            return {
                valido: false,
                errores: ['Debe seleccionar al menos un horario']
            };
        }

        // Validar máximo 2 horarios por día
        const horariosPorDia = {};
        horariosSeleccionados.forEach(id => {
            const horario = window.horariosDisponibles?.find(h => h.id === id);
            if (horario) {
                horariosPorDia[horario.dia] = (horariosPorDia[horario.dia] || 0) + 1;
            }
        });

        const errores = [];
        Object.entries(horariosPorDia).forEach(([dia, cantidad]) => {
            if (cantidad > 2) {
                errores.push(`Máximo 2 horarios por día. Tienes ${cantidad} en ${dia}`);
            }
        });

        return {
            valido: errores.length === 0,
            errores
        };
    }
};

// Exportar para uso global
window.academiaAPI = academiaAPI;
window.LocalStorage = LocalStorage;
window.Utils = Utils;
window.Validaciones = Validaciones;
