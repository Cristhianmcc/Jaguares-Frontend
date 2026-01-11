/**
 * JavaScript para Dashboard Financiero
 */

let chartDeportes = null;
let chartDistribucion = null;

document.addEventListener('DOMContentLoaded', () => {
    verificarSesion();
    cargarEstadisticas();
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

async function cargarEstadisticas() {
    const loadingContainer = document.getElementById('loadingContainer');
    const dashboardContainer = document.getElementById('dashboardContainer');
    
    loadingContainer.classList.remove('hidden');
    dashboardContainer.classList.add('hidden');
    
    try {
        const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3002'
            : 'https://jaguares-backend.onrender.com';
        
        const response = await fetch(`${API_BASE}/api/admin/estadisticas-financieras`, {
            cache: 'no-store',
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            renderizarEstadisticas(data.estadisticas);
            dashboardContainer.classList.remove('hidden');
        } else {
            mostrarError('Error al cargar estadísticas: ' + data.error);
        }
    } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        mostrarError('Error de conexión. Verifica que el servidor esté activo.');
    } finally {
        loadingContainer.classList.add('hidden');
    }
}

function renderizarEstadisticas(stats) {
    const { resumen, porDeporte, porAlumno, timestamp } = stats;
    
    // Actualizar resumen
    document.getElementById('totalIngresos').textContent = `S/ ${resumen.totalIngresosActivos.toFixed(2)}`;
    document.getElementById('ingresosMes').textContent = `S/ ${resumen.ingresosMes.toFixed(2)}`;
    document.getElementById('ingresosHoy').textContent = `S/ ${resumen.ingresosHoy.toFixed(2)}`;
    document.getElementById('totalMatriculas').textContent = `S/ ${resumen.totalMatriculas.toFixed(2)}`;
    document.getElementById('totalMensualidades').textContent = `S/ ${resumen.totalMensualidades.toFixed(2)}`;
    
    // Timestamp
    const fecha = new Date(timestamp);
    document.getElementById('timestampActualizacion').textContent = fecha.toLocaleString('es-PE');
    
    // Renderizar tablas
    renderizarTablaDeportes(porDeporte);
    renderizarTablaAlumnos(porAlumno);
    
    // Renderizar gráficas
    renderizarGraficas(porDeporte, resumen);
}

function renderizarTablaDeportes(deportes) {
    const tbody = document.getElementById('tablaDeportes');
    tbody.innerHTML = '';
    
    if (deportes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="px-4 py-8 text-center text-text-muted">
                    No hay datos disponibles
                </td>
            </tr>
        `;
        return;
    }
    
    deportes.forEach((deporte, index) => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors';
        
        row.innerHTML = `
            <td class="px-4 py-3 font-semibold text-black dark:text-white">${deporte.deporte}</td>
            <td class="px-4 py-3 text-right font-mono">S/ ${deporte.matriculas.toFixed(2)}</td>
            <td class="px-4 py-3 text-right font-mono">S/ ${deporte.mensualidades.toFixed(2)}</td>
            <td class="px-4 py-3 text-right font-bold font-mono text-primary">S/ ${deporte.total.toFixed(2)}</td>
        `;
        
        tbody.appendChild(row);
    });
}

function renderizarTablaAlumnos(alumnos) {
    const tbody = document.getElementById('tablaAlumnos');
    tbody.innerHTML = '';
    
    if (alumnos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-4 py-8 text-center text-text-muted">
                    No hay datos disponibles
                </td>
            </tr>
        `;
        return;
    }
    
    const top10 = alumnos.slice(0, 10);
    
    top10.forEach((alumno, index) => {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors';
        
        const deportesText = alumno.deportes.length > 0 
            ? alumno.deportes.join(', ') 
            : '-';
        
        row.innerHTML = `
            <td class="px-4 py-3 font-mono text-sm font-semibold">${alumno.dni}</td>
            <td class="px-4 py-3">${alumno.nombres}</td>
            <td class="px-4 py-3 text-xs">${deportesText}</td>
            <td class="px-4 py-3 text-right font-mono">S/ ${alumno.matriculas.toFixed(2)}</td>
            <td class="px-4 py-3 text-right font-mono">S/ ${alumno.mensualidades.toFixed(2)}</td>
            <td class="px-4 py-3 text-right font-bold font-mono text-primary">S/ ${alumno.total.toFixed(2)}</td>
        `;
        
        tbody.appendChild(row);
    });
}

function renderizarGraficas(deportes, resumen) {
    // Destruir gráficas anteriores
    if (chartDeportes) chartDeportes.destroy();
    if (chartDistribucion) chartDistribucion.destroy();
    
    // Colores profesionales
    const colores = [
        '#C59D5F', // Primary gold
        '#16A34A', // Green
        '#2563EB', // Blue
        '#DC2626', // Red
        '#9333EA', // Purple
        '#EA580C', // Orange
        '#0891B2', // Cyan
        '#CA8A04'  // Yellow
    ];
    
    // Gráfica por deporte (Barras horizontales)
    const ctxDeportes = document.getElementById('chartDeportes').getContext('2d');
    chartDeportes = new Chart(ctxDeportes, {
        type: 'bar',
        data: {
            labels: deportes.map(d => d.deporte),
            datasets: [{
                label: 'Total Ingresos (S/)',
                data: deportes.map(d => d.total),
                backgroundColor: colores,
                borderWidth: 0
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return 'S/ ' + context.parsed.x.toFixed(2);
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(197, 157, 95, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return 'S/ ' + value;
                        }
                    }
                },
                y: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    // Gráfica de distribución (Doughnut)
    const ctxDistribucion = document.getElementById('chartDistribucion').getContext('2d');
    chartDistribucion = new Chart(ctxDistribucion, {
        type: 'doughnut',
        data: {
            labels: ['Matrículas', 'Mensualidades'],
            datasets: [{
                data: [resumen.totalMatriculas, resumen.totalMensualidades],
                backgroundColor: ['#F59E0B', '#C59D5F'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 13,
                            family: 'Lexend'
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: S/ ${value.toFixed(2)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

function mostrarError(mensaje) {
    const loadingContainer = document.getElementById('loadingContainer');
    loadingContainer.innerHTML = `
        <div class="text-center py-12">
            <span class="material-symbols-outlined text-6xl text-red-600">error</span>
            <p class="text-red-600 mt-4 font-semibold">${mensaje}</p>
            <button onclick="location.reload()" class="mt-6 px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-semibold transition-colors">
                Reintentar
            </button>
        </div>
    `;
}
