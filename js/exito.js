/**
 * Script para la página de éxito
 */

document.addEventListener('DOMContentLoaded', () => {
    cargarDatosExito();
});

function cargarDatosExito() {
    // Obtener código de operación de la URL
    const params = new URLSearchParams(window.location.search);
    const codigo = params.get('codigo');
    
    if (!codigo) {
        // Intentar desde localStorage
        const ultimaInscripcion = LocalStorage.get('ultimaInscripcion');
        
        if (ultimaInscripcion && ultimaInscripcion.codigo) {
            renderizarExito(ultimaInscripcion.codigo, ultimaInscripcion);
        } else {
            Utils.mostrarNotificacion('No se encontró información de inscripción', 'error');
            window.location.href = 'index.html';
        }
    } else {
        const ultimaInscripcion = LocalStorage.get('ultimaInscripcion');
        renderizarExito(codigo, ultimaInscripcion);
    }
}

function renderizarExito(codigo, datosInscripcion) {
    const container = document.getElementById('contenidoExito');
    
    container.innerHTML = `
        <div class="flex flex-col items-center text-center gap-6">
            <div class="size-24 rounded-full bg-primary/10 flex items-center justify-center text-primary dark:text-primary shadow-sm border border-primary/20">
                <span class="material-symbols-outlined text-[56px]" style="font-variation-settings: 'wght' 600;">check</span>
            </div>
            <div class="space-y-2">
                <h1 class="text-text-main dark:text-white text-3xl md:text-5xl font-black leading-tight tracking-[-0.02em] uppercase">
                    ¡Inscripción Exitosa!
                </h1>
                <p class="text-text-main/70 dark:text-white/70 text-lg font-medium leading-normal max-w-md mx-auto">
                    Tu inscripción ha sido registrada correctamente. Revisa los detalles a continuación.
                </p>
            </div>
        </div>

        <div class="w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl shadow-black/5">
            <div class="h-1.5 w-full bg-primary"></div>
            <div class="p-6 md:p-8 flex flex-col gap-6">
                <div class="flex items-start justify-between">
                    <div>
                        <p class="text-xs font-bold text-primary uppercase tracking-widest mb-1.5">Código de Registro</p>
                        <h3 class="text-2xl font-black text-text-main dark:text-white tracking-tight uppercase font-mono">${codigo}</h3>
                    </div>
                    <div class="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <span class="material-symbols-outlined text-3xl">sports_soccer</span>
                    </div>
                </div>

                <div class="w-full h-px border-t border-dashed border-gray-300 dark:border-white/10"></div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
                    ${datosInscripcion ? `
                    <div>
                        <p class="text-xs text-text-main/50 dark:text-white/50 mb-1 font-medium uppercase tracking-wider">Alumno</p>
                        <p class="text-base font-bold text-text-main dark:text-white">${datosInscripcion.alumno}</p>
                    </div>
                    <div class="md:text-right">
                        <p class="text-xs text-text-main/50 dark:text-white/50 mb-1 font-medium uppercase tracking-wider">DNI</p>
                        <p class="text-base font-bold text-text-main dark:text-white">${datosInscripcion.dni}</p>
                    </div>
                    ` : ''}
                    <div class="col-span-1 md:col-span-2">
                        <p class="text-xs text-text-main/50 dark:text-white/50 mb-1 font-medium uppercase tracking-wider">Fecha de Inscripción</p>
                        <p class="text-base font-bold text-text-main dark:text-white">${Utils.formatearFecha(new Date().toISOString().split('T')[0])}</p>
                    </div>
                </div>
            </div>

            <div class="bg-yellow-50 dark:bg-yellow-900/10 border-t border-yellow-200 dark:border-yellow-900/30 p-4 flex items-start gap-3">
                <span class="material-symbols-outlined text-yellow-600 dark:text-yellow-500 mt-0.5">info</span>
                <div class="flex-1">
                    <p class="text-sm font-bold text-yellow-800 dark:text-yellow-200 mb-1">Importante: Confirmación de Pago</p>
                    <p class="text-xs text-yellow-700 dark:text-yellow-300">
                        Para completar tu inscripción, debes realizar el pago correspondiente y enviar tu comprobante vía WhatsApp al número indicado.
                    </p>
                </div>
            </div>
        </div>

        <!-- SECCIÓN DE PAGO CON QR -->
        <div class="w-full bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl shadow-black/5">
            <div class="h-1.5 w-full bg-gradient-to-r from-purple-600 to-green-600"></div>
            <div class="p-6 md:p-8 flex flex-col gap-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-1.5">💳 DATOS DE PAGO</p>
                        <h3 class="text-xl font-black text-text-main dark:text-white tracking-tight">Yape o Plin</h3>
                    </div>
                    <div class="flex gap-2">
                        <div class="size-12 rounded-2xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                            <span class="text-2xl">📱</span>
                        </div>
                    </div>
                </div>

                <div class="w-full h-px border-t border-dashed border-gray-300 dark:border-white/10"></div>

                <!-- QR CODE SECTION - BOTONES YAPE Y PLIN -->
                <div class="flex flex-col items-center gap-4">
                    <p class="text-sm text-text-main/60 dark:text-white/60 text-center max-w-sm font-medium">
                        Elige tu método de pago preferido:
                    </p>
                    
                    <!-- BOTONES GRANDES PARA ABRIR QR -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                        <!-- BOTÓN YAPE -->
                        <button onclick="abrirModalQR('assets/yape.jpg', 'Yape')" class="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] group">
                            <div class="size-16 bg-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span class="material-symbols-outlined text-purple-600 text-5xl font-bold">account_balance_wallet</span>
                            </div>
                            <div class="text-center">
                                <p class="text-2xl font-black text-white mb-1">YAPE</p>
                                <p class="text-xs text-purple-100 font-medium">Toca para ver QR</p>
                            </div>
                            <div class="flex items-center gap-2 text-white/80 text-xs">
                                <span class="material-symbols-outlined text-base">qr_code_2</span>
                                <span>Escanear código</span>
                            </div>
                        </button>
                        
                        <!-- BOTÓN PLIN -->
                        <button onclick="abrirModalQR('assets/plin.jpg', 'Plin')" class="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] group">
                            <div class="size-16 bg-white rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span class="material-symbols-outlined text-green-600 text-5xl font-bold">account_balance_wallet</span>
                            </div>
                            <div class="text-center">
                                <p class="text-2xl font-black text-white mb-1">PLIN</p>
                                <p class="text-xs text-green-100 font-medium">Toca para ver QR</p>
                            </div>
                            <div class="flex items-center gap-2 text-white/80 text-xs">
                                <span class="material-symbols-outlined text-base">qr_code_2</span>
                                <span>Escanear código</span>
                            </div>
                        </button>
                    </div>

                    <!-- INFORMACIÓN DEL DESTINATARIO -->
                    <div class="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-gray-200 dark:border-white/10 w-full">
                        <div class="flex items-center gap-3">
                            <div class="size-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span class="material-symbols-outlined text-primary text-2xl">person</span>
                            </div>
                            <div class="flex-1 min-w-0">
                                <p class="text-xs text-text-main/50 dark:text-white/50 mb-1 font-medium uppercase tracking-wider">Destinatario del pago</p>
                                <p class="text-sm sm:text-base font-black text-text-main dark:text-white truncate">JAGUARES CENTRO DEPORTIVO</p>
                                <p class="text-xs text-text-main/60 dark:text-white/60 font-medium mt-0.5">RUC: 20123456789</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- NÚMERO PARA COPIAR -->
                <div class="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-gray-200 dark:border-white/10">
                    <div class="flex items-center justify-between gap-4">
                        <div class="flex-1">
                            <p class="text-xs text-text-main/50 dark:text-white/50 mb-1 font-medium uppercase tracking-wider">Número de celular</p>
                            <p class="text-2xl font-black text-text-main dark:text-white font-mono tracking-tight" id="numeroPago">955 195 324</p>
                        </div>
                        <button onclick="copiarNumero(event)" class="flex items-center gap-2 px-4 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                            <span class="material-symbols-outlined text-xl">content_copy</span>
                            Copiar
                        </button>
                    </div>
                </div>

                <!-- MONTO A PAGAR -->
                ${datosInscripcion && datosInscripcion.horarios ? `
                <div class="bg-primary/5 dark:bg-primary/10 rounded-2xl p-4 border border-primary/20">
                    <div class="space-y-3">
                        <div class="flex items-center justify-between text-sm">
                            <span class="text-text-main/70 dark:text-white/70">Deportes:</span>
                            <span class="font-bold text-text-main dark:text-white">S/. ${datosInscripcion.horarios.reduce((sum, h) => sum + parseFloat(h.precio || 0), 0).toFixed(2)}</span>
                        </div>
                        ${datosInscripcion.matricula && datosInscripcion.matricula.monto > 0 ? `
                            <div class="flex items-center justify-between text-sm">
                                <span class="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                    <span class="material-symbols-outlined text-base">card_membership</span>
                                    Matrícula (${datosInscripcion.matricula.cantidad} ${datosInscripcion.matricula.cantidad === 1 ? 'deporte' : 'deportes'}):
                                </span>
                                <span class="font-bold text-amber-600 dark:text-amber-400">S/. ${datosInscripcion.matricula.monto.toFixed(2)}</span>
                            </div>
                            <div class="text-[10px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                                Deportes nuevos: ${datosInscripcion.matricula.deportesNuevos.join(', ')}
                            </div>
                        ` : ''}
                        <div class="flex items-center justify-between pt-2 border-t border-primary/20">
                            <p class="text-xs text-text-main/50 dark:text-white/50 font-medium uppercase tracking-wider">Monto Total</p>
                            <p class="text-3xl font-black text-primary">S/. ${(datosInscripcion.horarios.reduce((sum, h) => sum + parseFloat(h.precio || 0), 0) + (datosInscripcion.matricula ? datosInscripcion.matricula.monto : 0)).toFixed(2)}</p>
                        </div>
                        <div class="text-right">
                            <p class="text-xs text-text-main/50 dark:text-white/50 font-medium uppercase tracking-wider">Clases: ${datosInscripcion.horarios.length}</p>
                        </div>
                    </div>
                </div>
                ` : ''}

                <!-- INSTRUCCIONES -->
                <div class="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-2xl p-4">
                    <div class="flex items-start gap-3">
                        <span class="material-symbols-outlined text-blue-600 dark:text-blue-400 mt-0.5">tips_and_updates</span>
                        <div class="flex-1">
                            <p class="text-sm font-bold text-blue-900 dark:text-blue-200 mb-2">Pasos para completar tu pago:</p>
                            <ol class="text-xs text-blue-800 dark:text-blue-300 space-y-1 list-decimal list-inside">
                                <li>Escanea el QR con Yape o Plin, o copia el número</li>
                                <li>Realiza el pago del monto indicado</li>
                                <li>Toma una captura de pantalla del comprobante</li>
                                <li>Envía la captura por WhatsApp usando el botón de abajo</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex flex-col gap-4 w-full">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <button onclick="descargarComprobante()" class="flex items-center justify-center rounded-xl h-14 px-6 bg-black hover:bg-gray-900 text-primary text-base font-bold uppercase tracking-wide transition-all shadow-lg shadow-black/20 hover:shadow-black/40 hover:-translate-y-0.5 group border border-primary/30">
                    <span class="material-symbols-outlined mr-2 group-hover:animate-bounce">download</span>
                    Descargar Comprobante
                </button>

                <button onclick="enviarWhatsApp()" class="flex items-center justify-center rounded-xl h-14 px-6 bg-green-600 hover:bg-green-700 text-white text-base font-bold uppercase tracking-wide transition-all shadow-lg hover:-translate-y-0.5">
                    <span class="mr-2">📱</span>
                    Enviar por WhatsApp
                </button>
            </div>

            <button onclick="consultarEstado()" class="flex items-center justify-center rounded-xl h-14 px-6 bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 border border-gray-200 dark:border-white/10 text-text-main dark:text-white text-base font-bold uppercase tracking-wide transition-all hover:-translate-y-0.5">
                <span class="material-symbols-outlined mr-2">badge</span>
                Consultar Estado de Inscripción
            </button>

            <a class="text-text-main/60 dark:text-white/60 hover:text-primary dark:hover:text-primary text-sm font-bold flex items-center justify-center gap-2 transition-colors py-2 uppercase tracking-wide" href="index.html">
                <span class="material-symbols-outlined text-lg">arrow_back</span>
                Volver al Inicio
            </a>
        </div>

        <!-- MODAL PARA VER QR GRANDE -->
        <div id="modalQR" class="hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4" onclick="cerrarModalQR()">
            <div class="bg-white dark:bg-[#1a1a1a] rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl max-h-[95vh] overflow-y-auto" onclick="event.stopPropagation()">
                <div class="flex items-center justify-between mb-4 sm:mb-6">
                    <div class="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                        <div id="modalIcono" class="size-10 sm:size-12 rounded-xl flex items-center justify-center flex-shrink-0"></div>
                        <div class="min-w-0 flex-1">
                            <h3 id="modalTitulo" class="text-lg sm:text-2xl font-black text-text-main dark:text-white truncate">QR de Pago</h3>
                            <p class="text-xs text-text-main/60 dark:text-white/60 font-medium">Escanea para pagar</p>
                        </div>
                    </div>
                    <button onclick="cerrarModalQR()" class="size-9 sm:size-10 rounded-xl bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 flex items-center justify-center transition-colors flex-shrink-0 ml-2">
                        <span class="material-symbols-outlined text-gray-600 dark:text-white text-xl">close</span>
                    </button>
                </div>
                
                <div class="flex flex-col items-center gap-3 sm:gap-4">
                    <!-- QR CODE -->
                    <div class="bg-white p-3 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg w-full flex items-center justify-center border-2" id="modalBorder">
                        <img id="modalImagen" src="" alt="QR" class="w-full max-w-[280px] sm:max-w-sm object-contain rounded-lg">
                    </div>
                    
                    <!-- INFORMACIÓN DESTINATARIO EN MODAL -->
                    <div class="bg-gray-50 dark:bg-white/5 rounded-xl p-3 sm:p-4 w-full">
                        <div class="flex items-center gap-2 sm:gap-3">
                            <span class="material-symbols-outlined text-primary text-lg sm:text-xl flex-shrink-0">account_balance</span>
                            <div class="flex-1 min-w-0">
                                <p class="text-xs text-text-main/50 dark:text-white/50 font-medium">Destinatario</p>
                                <p class="text-xs sm:text-sm font-bold text-text-main dark:text-white truncate">JAGUARES CENTRO DEPORTIVO</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- SECCIÓN PARA SUBIR COMPROBANTE -->
                    <div class="w-full border-t border-gray-200 dark:border-white/10 pt-4 mt-2">
                        <div class="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-4 mb-3">
                            <div class="flex items-start gap-2">
                                <span class="material-symbols-outlined text-blue-600 dark:text-blue-400 text-lg flex-shrink-0 mt-0.5">upload_file</span>
                                <div>
                                    <p class="text-xs font-bold text-blue-900 dark:text-blue-200 mb-1">¿Ya realizaste el pago?</p>
                                    <p class="text-[10px] text-blue-700 dark:text-blue-300">Sube tu captura de pantalla aquí para acelerar la validación</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Input de archivo (oculto) -->
                        <input type="file" id="inputCapturaPago" accept="image/*" class="hidden" onchange="handleCapturaPago(event)">
                        
                        <!-- Botón para subir captura -->
                        <button id="btnSubirCaptura" onclick="document.getElementById('inputCapturaPago').click()" class="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold text-sm transition-all shadow-lg hover:scale-[1.02]">
                            <span class="material-symbols-outlined text-xl">add_photo_alternate</span>
                            <span>Subir Captura de Pago</span>
                        </button>
                        
                        <!-- Preview de la imagen subida -->
                        <div id="previewCaptura" class="hidden mt-3 bg-white dark:bg-white/5 rounded-xl p-3 border border-gray-200 dark:border-white/10">
                            <div class="flex items-center justify-between mb-2">
                                <p class="text-xs font-bold text-text-main dark:text-white flex items-center gap-1">
                                    <span class="material-symbols-outlined text-green-600 text-base">check_circle</span>
                                    Captura cargada
                                </p>
                                <button onclick="eliminarCaptura()" class="text-red-600 hover:text-red-700 text-xs font-bold">
                                    <span class="material-symbols-outlined text-base">delete</span>
                                </button>
                            </div>
                            <img id="imagenPreview" src="" alt="Preview" class="w-full max-h-40 object-contain rounded-lg">
                            <p class="text-[10px] text-text-main/50 dark:text-white/50 mt-2 text-center" id="nombreArchivo"></p>
                        </div>
                    </div>

                    <!-- BOTONES -->
                    <div class="grid grid-cols-2 gap-2 sm:gap-3 w-full">
                        <button id="modalDescargar" onclick="" class="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 bg-primary hover:bg-primary-dark text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all shadow-lg hover:scale-[1.02]">
                            <span class="material-symbols-outlined text-lg sm:text-xl">download</span>
                            <span class="hidden xs:inline">Descargar</span>
                            <span class="xs:hidden">QR</span>
                        </button>
                        <button onclick="cerrarModalQR()" class="flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3 bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 text-gray-700 dark:text-white rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm transition-all hover:scale-[1.02]">
                            <span class="material-symbols-outlined text-lg sm:text-xl">close</span>
                            Cerrar
                        </button>
                    </div>
                    
                    <p class="text-[10px] sm:text-xs text-text-main/50 dark:text-white/50 text-center px-2">
                        💡 Descarga el QR si estás en el mismo dispositivo
                    </p>
                </div>
            </div>
        </div>
    `;
}

function descargarComprobante() {
    const ultimaInscripcion = LocalStorage.get('ultimaInscripcion');
    
    if (!ultimaInscripcion) {
        Utils.mostrarNotificacion('No se encontró información de inscripción', 'error');
        return;
    }
    
    // Calcular totales
    let totalDeportes = 0;
    let horariosDetalle = '';
    if (ultimaInscripcion.horarios && ultimaInscripcion.horarios.length > 0) {
        horariosDetalle = '\n\nHORARIOS SELECCIONADOS:\n';
        ultimaInscripcion.horarios.forEach((horario, index) => {
            horariosDetalle += `${index + 1}. ${horario.deporte} - ${horario.dia} ${horario.hora_inicio} - S/. ${parseFloat(horario.precio).toFixed(2)}\n`;
            totalDeportes += parseFloat(horario.precio || 0);
        });
    }
    
    // Agregar matrícula si existe
    let matriculaDetalle = '';
    let montoMatricula = 0;
    if (ultimaInscripcion.matricula && ultimaInscripcion.matricula.monto > 0) {
        montoMatricula = ultimaInscripcion.matricula.monto;
        matriculaDetalle = `\n\nMATRÍCULA (${ultimaInscripcion.matricula.cantidad} ${ultimaInscripcion.matricula.cantidad === 1 ? 'deporte' : 'deportes'}): S/. ${montoMatricula.toFixed(2)}\nDeportes nuevos: ${ultimaInscripcion.matricula.deportesNuevos.join(', ')}\n`;
    }
    
    const total = totalDeportes + montoMatricula;
    
    // Crear contenido del comprobante
    const contenido = `
JAGUARES - CENTRO DE ALTO RENDIMIENTO
======================================

COMPROBANTE DE INSCRIPCIÓN

Código: ${ultimaInscripcion.codigo}
Fecha: ${Utils.formatearFecha(new Date().toISOString().split('T')[0])}

Alumno: ${ultimaInscripcion.alumno}
DNI: ${ultimaInscripcion.dni}${horariosDetalle}${matriculaDetalle}

SUBTOTALES:
- Deportes: S/. ${totalDeportes.toFixed(2)}
${montoMatricula > 0 ? `- Matrícula: S/. ${montoMatricula.toFixed(2)}\n` : ''}
Total a Pagar: S/. ${total.toFixed(2)}
Clases: ${ultimaInscripcion.horarios ? ultimaInscripcion.horarios.length : 0}

Estado: PENDIENTE DE PAGO

IMPORTANTE:
Para activar tu inscripción, debes:
1. Realizar el pago correspondiente
2. Enviar el comprobante vía WhatsApp
3. Esperar la confirmación del equipo

Contacto: +51 955 195 324

¡Gracias por confiar en JAGUARES!
    `;
    
    // Crear archivo y descargar
    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `JAGUARES-${ultimaInscripcion.codigo}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function enviarWhatsApp() {
    const ultimaInscripcion = LocalStorage.get('ultimaInscripcion');
    
    if (!ultimaInscripcion) {
        Utils.mostrarNotificacion('No se encontró información de inscripción', 'error');
        return;
    }
    
    // Construir lista de horarios
    let horariosTexto = '';
    let totalDeportes = 0;
    if (ultimaInscripcion.horarios && ultimaInscripcion.horarios.length > 0) {
        horariosTexto = '\n⚽ *Clases Seleccionadas:*\n';
        ultimaInscripcion.horarios.forEach((horario, index) => {
            horariosTexto += `${index + 1}. ${horario.deporte} - ${horario.dia} ${horario.hora_inicio}hs\n`;
            totalDeportes += parseFloat(horario.precio || 0);
        });
    }
    
    // Agregar matrícula si existe
    let matriculaTexto = '';
    let montoMatricula = 0;
    if (ultimaInscripcion.matricula && ultimaInscripcion.matricula.monto > 0) {
        montoMatricula = ultimaInscripcion.matricula.monto;
        matriculaTexto = `\n🎓 *Matrícula:* S/. ${montoMatricula.toFixed(2)}\n(${ultimaInscripcion.matricula.deportesNuevos.join(', ')})\n`;
    }
    
    const total = totalDeportes + montoMatricula;
    
    const whatsappNumero = '51955195324'; // Cambiar por el número real
    const mensaje = `🐆 *JAGUARES - Inscripción*\n\n` +
        `📋 *Código:* ${ultimaInscripcion.codigo}\n\n` +
        `👤 *Alumno:* ${ultimaInscripcion.alumno}\n` +
        `DNI: ${ultimaInscripcion.dni}` +
        horariosTexto +
        matriculaTexto +
        `\n💰 *Total a Pagar:* S/. ${total.toFixed(2)}\n` +
        `${montoMatricula > 0 ? `(Deportes: S/. ${totalDeportes.toFixed(2)} + Matrícula: S/. ${montoMatricula.toFixed(2)})\n` : ''}\n` +
        `Hola, he completado mi inscripción y estoy listo para enviar mi comprobante de pago.`;
    
    const url = `https://wa.me/${whatsappNumero}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}

function consultarEstado() {
    const ultimaInscripcion = LocalStorage.get('ultimaInscripcion');
    
    if (ultimaInscripcion && ultimaInscripcion.dni) {
        window.location.href = `consulta.html?dni=${ultimaInscripcion.dni}`;
    } else {
        const dni = prompt('Ingrese su DNI para consultar:');
        if (dni && Utils.validarDNI(dni)) {
            window.location.href = `consulta.html?dni=${dni}`;
        }
    }
}

function copiarNumero(event) {
    const numero = '955195324'; // Sin espacios para copiar
    
    navigator.clipboard.writeText(numero).then(() => {
        Utils.mostrarNotificacion('Número copiado: 955 195 324', 'success');
        
        // Cambiar temporalmente el texto del botón si existe el evento
        if (event) {
            const btn = event.target.closest('button');
            if (btn) {
                const originalHTML = btn.innerHTML;
                btn.innerHTML = '<span class="material-symbols-outlined text-xl">check</span> Copiado';
                btn.classList.add('bg-green-600');
                btn.classList.remove('bg-primary');
                
                setTimeout(() => {
                    btn.innerHTML = originalHTML;
                    btn.classList.remove('bg-green-600');
                    btn.classList.add('bg-primary');
                }, 2000);
            }
        }
    }).catch(err => {
        console.error('Error al copiar:', err);
        Utils.mostrarNotificacion('No se pudo copiar. Usa: 955 195 324', 'warning');
    });
}

function abrirModalQR(urlImagen, tipo) {
    const modal = document.getElementById('modalQR');
    const imagen = document.getElementById('modalImagen');
    const titulo = document.getElementById('modalTitulo');
    const icono = document.getElementById('modalIcono');
    const border = document.getElementById('modalBorder');
    const btnDescargar = document.getElementById('modalDescargar');
    
    // Configurar contenido
    imagen.src = urlImagen;
    titulo.textContent = `Pagar con ${tipo}`;
    btnDescargar.onclick = () => descargarQR(urlImagen, `QR-${tipo}.jpg`);
    
    // Configurar colores según el tipo
    if (tipo === 'Yape') {
        icono.innerHTML = '<span class="material-symbols-outlined text-purple-600 text-3xl sm:text-4xl">account_balance_wallet</span>';
        icono.style.backgroundColor = '#f3e8ff';
        border.style.borderColor = '#a855f7';
    } else if (tipo === 'Plin') {
        icono.innerHTML = '<span class="material-symbols-outlined text-green-600 text-3xl sm:text-4xl">account_balance_wallet</span>';
        icono.style.backgroundColor = '#dcfce7';
        border.style.borderColor = '#22c55e';
    }
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function cerrarModalQR() {
    const modal = document.getElementById('modalQR');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function descargarQR(urlImagen, nombreArchivo) {
    fetch(urlImagen)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = nombreArchivo;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            Utils.mostrarNotificacion(`QR descargado: ${nombreArchivo}`, 'success');
        })
        .catch(err => {
            console.error('Error al descargar QR:', err);
            Utils.mostrarNotificacion('Error al descargar el QR', 'error');
        });
}

// Cerrar modal con tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        cerrarModalQR();
    }
});

// Variable global para almacenar la captura
let capturaSeleccionada = null;

/**
 * Manejar la selección de archivo de captura
 */
function handleCapturaPago(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Validar que sea una imagen
    if (!file.type.startsWith('image/')) {
        Utils.mostrarNotificacion('Por favor selecciona una imagen válida', 'error');
        return;
    }
    
    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
        Utils.mostrarNotificacion('La imagen no debe superar 5MB', 'error');
        return;
    }
    
    // Leer archivo y convertir a Base64
    const reader = new FileReader();
    reader.onload = function(e) {
        capturaSeleccionada = {
            nombre: file.name,
            tipo: file.type,
            base64: e.target.result
        };
        
        mostrarPreviewCaptura(e.target.result, file.name);
        
        // Intentar subir automáticamente
        subirCapturaAlServidor();
    };
    
    reader.onerror = function() {
        Utils.mostrarNotificacion('Error al leer la imagen', 'error');
    };
    
    reader.readAsDataURL(file);
}

/**
 * Mostrar preview de la captura seleccionada
 */
function mostrarPreviewCaptura(base64, nombreArchivo) {
    const preview = document.getElementById('previewCaptura');
    const imagen = document.getElementById('imagenPreview');
    const nombre = document.getElementById('nombreArchivo');
    const btnSubir = document.getElementById('btnSubirCaptura');
    
    if (preview && imagen && nombre) {
        imagen.src = base64;
        nombre.textContent = nombreArchivo;
        preview.classList.remove('hidden');
        
        // Cambiar texto del botón
        btnSubir.innerHTML = `
            <span class="material-symbols-outlined text-xl">check_circle</span>
            <span>Captura Agregada</span>
        `;
        btnSubir.classList.remove('from-blue-600', 'to-blue-700');
        btnSubir.classList.add('from-green-600', 'to-green-700');
    }
}

/**
 * Eliminar captura seleccionada
 */
function eliminarCaptura() {
    capturaSeleccionada = null;
    
    const preview = document.getElementById('previewCaptura');
    const input = document.getElementById('inputCapturaPago');
    const btnSubir = document.getElementById('btnSubirCaptura');
    
    if (preview) preview.classList.add('hidden');
    if (input) input.value = '';
    
    // Restaurar botón original
    if (btnSubir) {
        btnSubir.innerHTML = `
            <span class="material-symbols-outlined text-xl">add_photo_alternate</span>
            <span>Subir Captura de Pago</span>
        `;
        btnSubir.classList.remove('from-green-600', 'to-green-700');
        btnSubir.classList.add('from-blue-600', 'to-blue-700');
    }
}

/**
 * Subir captura al servidor (Google Drive vía Apps Script)
 */
async function subirCapturaAlServidor() {
    if (!capturaSeleccionada) return;
    
    const ultimaInscripcion = LocalStorage.get('ultimaInscripcion');
    
    if (!ultimaInscripcion || !ultimaInscripcion.codigo) {
        Utils.mostrarNotificacion('No se encontró información de inscripción', 'error');
        return;
    }
    
    try {
        // Mostrar loading
        const btnSubir = document.getElementById('btnSubirCaptura');
        const textoOriginal = btnSubir.innerHTML;
        btnSubir.disabled = true;
        btnSubir.innerHTML = `
            <div class="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            <span>Subiendo...</span>
        `;
        
        // Enviar al servidor
        const resultado = await academiaAPI.subirComprobante({
            codigo_operacion: ultimaInscripcion.codigo,
            dni: ultimaInscripcion.dni,
            alumno: ultimaInscripcion.alumno,
            imagen: capturaSeleccionada.base64,
            nombre_archivo: capturaSeleccionada.nombre
        });
        
        if (resultado.success) {
            Utils.mostrarNotificacion('✅ Comprobante subido correctamente', 'success');
            
            // Actualizar botón con éxito
            btnSubir.innerHTML = `
                <span class="material-symbols-outlined text-xl">cloud_done</span>
                <span>Comprobante Guardado</span>
            `;
            btnSubir.classList.remove('from-blue-600', 'to-blue-700', 'from-green-600', 'to-green-700');
            btnSubir.classList.add('from-emerald-600', 'to-emerald-700');
        } else {
            throw new Error(resultado.error || 'Error al subir comprobante');
        }
        
    } catch (error) {
        console.error('Error al subir captura:', error);
        Utils.mostrarNotificacion(`Error: ${error.message}`, 'error');
        
        // Restaurar botón
        const btnSubir = document.getElementById('btnSubirCaptura');
        btnSubir.disabled = false;
        btnSubir.innerHTML = `
            <span class="material-symbols-outlined text-xl">check_circle</span>
            <span>Captura Agregada</span>
        `;
    }
}
