/**
 * APPS SCRIPT PARA GOOGLE SHEETS - JAGUARES
 * Este código debe ir en Tools > Script Editor de tu Google Sheet
 * 
 * IMPORTANTE: Después de pegar el código:
 * 1. Deploy > New deployment > Web app
 * 2. Execute as: Me
 * 3. Who has access: Anyone
 * 4. Copia la URL y pégala en .env como APPS_SCRIPT_URL
 */

// Token de seguridad (DEBE COINCIDIR con APPS_SCRIPT_TOKEN del .env del backend)
const SECURITY_TOKEN = "academia_2025_TOKEN_8f7s9dF!23xL";

// Nombres de las hojas
const SHEET_NAMES = {
  INSCRIPCIONES: 'INSCRIPCIONES',
  PAGOS: 'PAGOS',
  HORARIOS: 'HORARIOS',
  FUTBOL: 'FUTBOL',
  VOLEY: 'VOLEY',
  BASQUET: 'Básquet'
};

/**
 * Trigger automático: Se ejecuta cuando se edita cualquier celda del Sheet
 * Detecta cambios en la columna H (estado_pago) de la hoja PAGOS
 * Si cambia a "confirmado", activa automáticamente las inscripciones
 * Si cambia a "pendiente", desactiva las inscripciones (vuelve a pendiente_pago)
 */
function onEdit(e) {
  try {
    // Validar que existe el objeto e (solo existe cuando es disparado por edición real)
    if (!e || !e.source || !e.range) {
      Logger.log('⚠️ onEdit ejecutado sin evento válido (posiblemente manual). Esta función solo debe ejecutarse automáticamente al editar celdas.');
      return;
    }
    
    const sheet = e.source.getActiveSheet();
    const range = e.range;
    
    // Solo actuar si es la hoja PAGOS y la columna H (estado_pago)
    if (sheet.getName() !== SHEET_NAMES.PAGOS || range.getColumn() !== 8) {
      return;
    }
    
    const nuevoValor = range.getValue().toString().toLowerCase().trim();
    
    // Obtener el DNI de la misma fila, columna B (2)
    const fila = range.getRow();
    const dni = sheet.getRange(fila, 2).getValue().toString().trim();
    
    if (!dni) {
      Logger.log('❌ No se encontró DNI en la fila ' + fila);
      return;
    }
    
    const ui = SpreadsheetApp.getUi();
    
    // ACTIVAR: Si cambia a "confirmado"
    if (nuevoValor === 'confirmado' || nuevoValor === 'confir') {
      Logger.log('✅ Pago confirmado para DNI: ' + dni + '. Activando inscripciones...');
      const resultado = activarInscripcionesPorDNI(dni);
      
      if (resultado.success) {
        ui.alert(
          '✅ Inscripciones Activadas',
          `Se activaron ${resultado.activadas} inscripciones para DNI ${dni}\n\n` +
          `Hojas actualizadas:\n${resultado.hojasAfectadas.join(', ')}`,
          ui.ButtonSet.OK
        );
      } else {
        ui.alert('⚠️ Atención', resultado.error, ui.ButtonSet.OK);
      }
    }
    // DESACTIVAR: Si cambia a "pendiente"
    else if (nuevoValor === 'pendiente' || nuevoValor === 'pendiente de pago' || nuevoValor === 'pendiente_pago') {
      Logger.log('⚠️ Pago vuelto a pendiente para DNI: ' + dni + '. Desactivando inscripciones...');
      const resultado = desactivarInscripcionesPorDNI(dni);
      
      if (resultado.success) {
        ui.alert(
          '⚠️ Inscripciones Desactivadas',
          `Se desactivaron ${resultado.desactivadas} inscripciones para DNI ${dni}\n\n` +
          `Hojas actualizadas:\n${resultado.hojasAfectadas.join(', ')}`,
          ui.ButtonSet.OK
        );
      } else {
        ui.alert('ℹ️ Información', resultado.error, ui.ButtonSet.OK);
      }
    }
    
  } catch (error) {
    Logger.log('❌ Error en onEdit: ' + error.toString());
    SpreadsheetApp.getUi().alert('❌ Error', 'Error al procesar cambio: ' + error.toString(), SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Activar inscripciones cuando el pago es confirmado
 */
function activarInscripcionesPorDNI(dni) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let activadas = 0;
    const hojasAfectadas = [];
    
    // ⚠️ IMPORTANTE: Mantener sincronizado con la lista de deportes en consultarInscripcion()
    // Lista de hojas donde buscar inscripciones (DÍAS + DEPORTES)
    const hojasParaRevisar = [
      'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO',
      'FÚTBOL', 'VÓLEY', 'BÁSQUET', 'FÚTBOL FEMENINO',
      'ENTRENAMIENTO FUNCIONAL ADULTOS', 'ENTRENAMIENTO FUNCIONAL MENORES',
      'ENTRENAMIENTO DE FUERZA Y TONIFICACIÓN MUSCULAR',
      'MAMAS FIT', 'GYM JUVENIL', 'ENTRENAMIENTO FUNCIONAL MIXTO'
    ];
    
    Logger.log('🔍 Buscando inscripciones para DNI: ' + dni);
    
    // Buscar y activar en cada hoja
    for (const nombreHoja of hojasParaRevisar) {
      const sheet = ss.getSheetByName(nombreHoja);
      
      if (sheet) {
        const activadosEnHoja = activarEnHoja(sheet, dni);
        if (activadosEnHoja > 0) {
          Logger.log('✅ Activado en hoja ' + nombreHoja + ': ' + activadosEnHoja + ' registros');
          activadas += activadosEnHoja;
          hojasAfectadas.push(nombreHoja);
        }
      } else {
        Logger.log('⚠️ Hoja ' + nombreHoja + ' no existe');
      }
    }
    
    if (activadas === 0) {
      Logger.log('⚠️ No se encontraron inscripciones para activar con DNI: ' + dni);
      return { 
        success: false, 
        error: 'No se encontraron inscripciones en las hojas de días/deportes' 
      };
    }
    
    Logger.log('🎉 Total de inscripciones activadas: ' + activadas);
    
    return { 
      success: true, 
      mensaje: 'Inscripciones activadas correctamente',
      activadas: activadas,
      hojasAfectadas: hojasAfectadas
    };
    
  } catch (error) {
    Logger.log('❌ Error al activar inscripciones: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Activar inscripciones en una hoja específica (DIA o DEPORTE)
 */
function activarEnHoja(sheet, dni) {
  try {
    const data = sheet.getDataRange().getValues();
    let activados = 0;
    const headers = data[0];
    
    Logger.log('📊 Hoja: ' + sheet.getName() + ' - Total filas: ' + (data.length - 1));
    Logger.log('📋 Headers: ' + headers.join(', '));
    
    // Buscar columna de DNI (puede ser B, C, u otra)
    let colDNI = -1;
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j].toString().toLowerCase().trim();
      if (header === 'dni' || header.includes('dni')) {
        colDNI = j;
        Logger.log('✅ Columna DNI encontrada en índice: ' + colDNI + ' (' + headers[colDNI] + ')');
        break;
      }
    }
    
    if (colDNI === -1) {
      Logger.log('⚠️ No se encontró columna DNI en hoja ' + sheet.getName());
      return 0;
    }
    
    // Buscar columna de estado
    let colEstado = -1;
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j].toString().toLowerCase().trim();
      if (header === 'estado' || header.includes('estado')) {
        colEstado = j;
        Logger.log('✅ Columna estado encontrada en índice: ' + colEstado + ' (' + headers[colEstado] + ')');
        break;
      }
    }
    
    if (colEstado === -1) {
      Logger.log('⚠️ No se encontró columna estado en hoja ' + sheet.getName());
      return 0;
    }
    
    // Buscar todas las filas con ese DNI
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const dniEnFila = row[colDNI] ? row[colDNI].toString().trim() : '';
      
      if (dniEnFila === dni.toString().trim()) {
        const estadoActual = row[colEstado] ? row[colEstado].toString().toLowerCase().trim() : '';
        Logger.log('🔍 DNI encontrado en fila ' + (i + 1) + ' - Estado actual: "' + estadoActual + '"');
        
        // Verificar todos los posibles estados pendientes
        if (estadoActual === 'pendiente' || 
            estadoActual === 'pendiente de pago' || 
            estadoActual === 'pendiente_pago' || 
            estadoActual === '') {
          sheet.getRange(i + 1, colEstado + 1).setValue('activa');
          Logger.log('✅ Estado cambiado a "activa" en fila ' + (i + 1));
          activados++;
        } else {
          Logger.log('ℹ️ Estado no cambiado (ya es: "' + estadoActual + '")');
        }
      }
    }
    
    Logger.log('📊 Total activados en ' + sheet.getName() + ': ' + activados);
    return activados;
    
  } catch (error) {
    Logger.log('❌ Error al activar en hoja ' + sheet.getName() + ': ' + error.toString());
    return 0;
  }
}

/**
 * Desactivar inscripciones cuando el pago vuelve a pendiente
 */
function desactivarInscripcionesPorDNI(dni) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let desactivadas = 0;
    const hojasAfectadas = [];
    
    // ⚠️ IMPORTANTE: Mantener sincronizado con la lista de deportes en consultarInscripcion()
    // Lista de hojas donde buscar inscripciones (DÍAS + DEPORTES)
    const hojasParaRevisar = [
      'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO',
      'FÚTBOL', 'VÓLEY', 'BÁSQUET', 'FÚTBOL FEMENINO',
      'ENTRENAMIENTO FUNCIONAL ADULTOS', 'ENTRENAMIENTO FUNCIONAL MENORES',
      'ENTRENAMIENTO DE FUERZA Y TONIFICACIÓN MUSCULAR',
      'MAMAS FIT', 'GYM JUVENIL', 'ENTRENAMIENTO FUNCIONAL MIXTO'
    ];
    
    Logger.log('🔍 Buscando inscripciones activas para DNI: ' + dni);
    
    // Buscar y desactivar en cada hoja
    for (const nombreHoja of hojasParaRevisar) {
      const sheet = ss.getSheetByName(nombreHoja);
      
      if (sheet) {
        const desactivadosEnHoja = desactivarEnHoja(sheet, dni);
        if (desactivadosEnHoja > 0) {
          Logger.log('✅ Desactivado en hoja ' + nombreHoja + ': ' + desactivadosEnHoja + ' registros');
          desactivadas += desactivadosEnHoja;
          hojasAfectadas.push(nombreHoja);
        }
      }
    }
    
    if (desactivadas === 0) {
      Logger.log('⚠️ No se encontraron inscripciones activas para desactivar con DNI: ' + dni);
      return { 
        success: false, 
        error: 'No se encontraron inscripciones activas en las hojas de días/deportes' 
      };
    }
    
    Logger.log('🎉 Total de inscripciones desactivadas: ' + desactivadas);
    
    return { 
      success: true, 
      mensaje: 'Inscripciones desactivadas correctamente',
      desactivadas: desactivadas,
      hojasAfectadas: hojasAfectadas
    };
    
  } catch (error) {
    Logger.log('❌ Error al desactivar inscripciones: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Desactivar inscripciones en una hoja específica (DIA o DEPORTE)
 */
function desactivarEnHoja(sheet, dni) {
  try {
    const data = sheet.getDataRange().getValues();
    let desactivados = 0;
    const headers = data[0];
    
    // Buscar columna de DNI
    let colDNI = -1;
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j].toString().toLowerCase().trim();
      if (header === 'dni' || header.includes('dni')) {
        colDNI = j;
        break;
      }
    }
    
    if (colDNI === -1) {
      return 0;
    }
    
    // Buscar columna de estado
    let colEstado = -1;
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j].toString().toLowerCase().trim();
      if (header === 'estado' || header.includes('estado')) {
        colEstado = j;
        break;
      }
    }
    
    if (colEstado === -1) {
      return 0;
    }
    
    // Buscar todas las filas con ese DNI
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const dniEnFila = row[colDNI] ? row[colDNI].toString().trim() : '';
      
      if (dniEnFila === dni.toString().trim()) {
        const estadoActual = row[colEstado] ? row[colEstado].toString().toLowerCase().trim() : '';
        
        // Solo desactivar si está activa
        if (estadoActual === 'activa' || estadoActual === 'activo') {
          sheet.getRange(i + 1, colEstado + 1).setValue('pendiente_pago');
          Logger.log('✅ Estado cambiado a "pendiente_pago" en fila ' + (i + 1) + ' de ' + sheet.getName());
          desactivados++;
        }
      }
    }
    
    return desactivados;
    
  } catch (error) {
    Logger.log('❌ Error al desactivar en hoja ' + sheet.getName() + ': ' + error.toString());
    return 0;
  }
}

/**
 * Función de prueba manual para activar inscripciones
 * Ejecuta esto manualmente con un DNI de prueba para ver los logs
 */
function testActivarInscripciones() {
  // CAMBIA ESTE DNI POR UNO DE PRUEBA
  const dniPrueba = '12345678';
  
  Logger.log('🧪 === INICIANDO PRUEBA DE ACTIVACIÓN ===');
  Logger.log('🧪 DNI de prueba: ' + dniPrueba);
  
  const resultado = activarInscripcionesPorDNI(dniPrueba);
  
  Logger.log('🧪 === RESULTADO ===');
  Logger.log(JSON.stringify(resultado, null, 2));
  
  return resultado;
}

/**
 * Función principal que maneja todas las peticiones
 */
function doGet(e) {
  // Validar que existe el objeto e y parameter (cuando se ejecuta manualmente no existe)
  if (!e || !e.parameter) {
    return respuestaJSON({ success: false, error: 'Petición inválida - ejecutar desde web' });
  }
  
  const params = e.parameter;
  
  // Validar token
  if (!params.token || params.token !== SECURITY_TOKEN) {
    return respuestaJSON({ success: false, error: 'Token inválido' });
  }
  
  const action = params.action;
  
  try {
    switch (action) {
      case 'horarios':
        const añoNacimiento = params.año_nacimiento ? parseInt(params.año_nacimiento) : null;
        return respuestaJSON(obtenerHorarios(añoNacimiento));
        
      case 'mis_inscripciones':
        return respuestaJSON(obtenerInscripcionesPorDNI(params.dni));
        
      case 'verificar_pago':
        return respuestaJSON(verificarPago(params.dni));
        
      case 'consultar_inscripcion':
        return respuestaJSON(consultarInscripcion(params.dni));
        
      case 'listar_inscritos':
        return respuestaJSON(listarInscritos(params.dia, params.deporte));
        
      case 'validar_dni':
        return respuestaJSON(validarDNI(params.dni));
        
      default:
        return respuestaJSON({ success: false, error: 'Acción no válida' });
    }
  } catch (error) {
    return respuestaJSON({ success: false, error: error.toString() });
  }
}

/**
 * Maneja peticiones POST
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Validar token
    if (!data.token || data.token !== SECURITY_TOKEN) {
      return respuestaJSON({ success: false, error: 'Token inválido' });
    }
    
    const action = data.action;
    
    switch (action) {
      case 'inscribir_multiple':
        return respuestaJSON(inscribirMultiple(data.alumno, data.horarios));
        
      case 'registrar_pago':
        return respuestaJSON(registrarPago(data));
        
      case 'subir_comprobante':
        return respuestaJSON(subirComprobanteDrive(data));
        
      default:
        return respuestaJSON({ success: false, error: 'Acción no válida' });
    }
  } catch (error) {
    return respuestaJSON({ success: false, error: error.toString() });
  }
}

/**
 * Obtener todos los horarios disponibles
 * @param {number} añoNacimiento - Año de nacimiento del alumno para filtrar por edad (opcional)
 */
function obtenerHorarios(añoNacimiento) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.HORARIOS);
  
  if (!sheet) {
    return { success: false, error: 'Hoja HORARIOS no encontrada' };
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  let horarios = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // Saltar filas vacías
    
    const horario = {};
    headers.forEach((header, index) => {
      const value = row[index];
      
      // Formatear horas si son las columnas hora_inicio o hora_fin
      if (header === 'hora_inicio' || header === 'hora_fin') {
        horario[header] = formatearHoraLima(value);
      } else {
        horario[header] = value;
      }
    });
    
    // Calcular cupos restantes
    const cupoMaximo = parseInt(horario.cupo_maximo || horario.cupo_max || 20);
    const cuposOcupados = parseInt(horario.cupos_ocupados || 0);
    horario.cupos_restantes = cupoMaximo - cuposOcupados;
    horario.id = horario.horario_id || horario.id;
    
    horarios.push(horario);
  }
  
  // Filtrar por edad si se proporciona el año de nacimiento
  if (añoNacimiento) {
    horarios = horarios.filter(h => {
      const añoMin = h.año_min || h['año_min'];
      const añoMax = h.año_max || h['año_max'];
      const estado = (h.estado || '').toString().toLowerCase();
      
      // Validar que el horario esté activo
      if (estado !== 'activo') return false;
      
      // Validar que tenga rango de edad definido
      if (!añoMin || !añoMax) return false;
      
      // Filtrar: año_min <= añoNacimiento <= año_max
      return añoMin <= añoNacimiento && añoNacimiento <= añoMax;
    });
  }
  
  Logger.log('📊 Total horarios retornados: ' + horarios.length);
  if (horarios.length > 0) {
    Logger.log('📝 Ejemplo de horario: ' + JSON.stringify(horarios[0]));
  }
  
  return { success: true, horarios, filtradoPorEdad: !!añoNacimiento };
}

/**
 * Inscribir alumno en múltiples horarios
 */
function inscribirMultiple(alumno, horarios) {
  // LOGGING DETALLADO AL INICIO
  Logger.log('==================== INICIO INSCRIPCIÓN ====================');
  Logger.log('📥 DATOS RECIBIDOS:');
  Logger.log('👤 Alumno: ' + JSON.stringify(alumno));
  Logger.log('📅 Horarios (cantidad): ' + horarios.length);
  Logger.log('📋 Horarios completos: ' + JSON.stringify(horarios));
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetInscripciones = ss.getSheetByName(SHEET_NAMES.INSCRIPCIONES);
  const sheetPagos = ss.getSheetByName(SHEET_NAMES.PAGOS);
  
  if (!sheetInscripciones) {
    Logger.log('❌ ERROR: Hoja INSCRIPCIONES no encontrada');
    return { success: false, error: 'Hoja INSCRIPCIONES no encontrada' };
  }
  
  if (!sheetPagos) {
    Logger.log('❌ ERROR: Hoja PAGOS no encontrada');
    return { success: false, error: 'Hoja PAGOS no encontrada' };
  }
  
  // Generar código de operación único
  const codigo = generarCodigoOperacion();
  const fecha = new Date();
  const fechaStr = Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
  
  // Calcular monto total
  let montoTotal = 0;
  horarios.forEach(h => {
    montoTotal += parseFloat(h.precio || 50);
  });
  
  // Concatenar horarios seleccionados (IDs)
  const horariosIds = horarios.map(h => h.id).join(',');
  
  // Preparar datos del alumno
  const apellidos = `${alumno.apellido_paterno || ''} ${alumno.apellido_materno || ''}`.trim();
  const edad = calcularEdad(alumno.fecha_nacimiento);
  
  // Subir imágenes de documentos a Drive y obtener URLs
  Logger.log('📸 Subiendo documentos a Drive...');
  const nombreAlumno = `${alumno.nombres || ''}_${apellidos || ''}_${alumno.dni || ''}`.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
  const urlDNIFrontal = alumno.imagen_dni_frontal ? subirImagenDrive(alumno.imagen_dni_frontal, 'DNI_Frontal', nombreAlumno) : '';
  const urlDNIReverso = alumno.imagen_dni_reverso ? subirImagenDrive(alumno.imagen_dni_reverso, 'DNI_Reverso', nombreAlumno) : '';
  const urlFotoCarnet = alumno.imagen_foto_carnet ? subirImagenDrive(alumno.imagen_foto_carnet, 'Foto_Carnet', nombreAlumno) : '';
  Logger.log('✅ Documentos subidos correctamente');
  
  // 1. REGISTRAR EN INSCRIPCIONES (UNA SOLA FILA con datos del alumno)
  sheetInscripciones.appendRow([
    fechaStr,                           // A: timestamp
    alumno.dni || '',                   // B: dni
    alumno.nombres || '',               // C: nombres
    apellidos,                          // D: apellidos
    alumno.fecha_nacimiento || '',      // E: fecha_nacimiento
    edad,                               // F: edad
    alumno.sexo || '',                  // G: sexo
    alumno.telefono || '',              // H: telefono
    alumno.email || '',                 // I: email
    alumno.apoderado || '',             // J: apoderado
    alumno.direccion || '',             // K: direccion
    alumno.seguro_tipo || '',           // L: seguro_tipo
    alumno.condicion_medica || '',      // M: condicion_medica
    alumno.telefono_apoderado || '',    // N: telefono_apoderado
    urlDNIFrontal,                      // O: url_dni_frontal
    urlDNIReverso,                      // P: url_dni_reverso
    urlFotoCarnet                       // Q: url_foto_carnet
  ]);
  
  // 2. REGISTRAR EN PAGOS (una sola fila con todos los datos)
  sheetPagos.appendRow([
    codigo,                               // A: id (código de operación)
    alumno.dni || '',                     // B: dni
    alumno.nombres || '',                 // C: nombres
    apellidos,                            // D: apellidos
    alumno.telefono || '',                // E: telefono
    montoTotal,                           // F: monto
    'Yape',                               // G: metodo_pago (por defecto)
    'pendiente',                          // H: estado_pago (IMPORTANTE: inicia en pendiente)
    fechaStr                              // I: fecha_registro
    // J: url_comprobante (se llena cuando el usuario sube la imagen)
    // K: fecha_subida (se llena cuando el usuario sube la imagen)
  ]);
  
  // 3. REGISTRAR CADA HORARIO EN SU HOJA DE DÍA Y DEPORTE
  Logger.log('🔄 Iniciando registro en hojas de días y deportes. Total horarios: ' + horarios.length);
  
  horarios.forEach((horario, index) => {
    Logger.log('📋 Procesando horario ' + (index + 1) + ': ' + JSON.stringify(horario));
    
    const dia = horario.dia ? horario.dia.toUpperCase() : '';
    const deporte = horario.deporte ? horario.deporte.toUpperCase() : '';
    
    Logger.log('📍 Día normalizado: "' + dia + '", Deporte normalizado: "' + deporte + '"');
    
    // Datos básicos del alumno para las hojas de días/deportes (solo lo esencial)
    const datosAlumnoBasico = [
      fechaStr,                           // Timestamp
      alumno.dni || '',                   // DNI
      alumno.nombres || '',               // Nombres
      apellidos,                          // Apellidos
      edad,                               // Edad
      alumno.sexo || '',                  // Sexo
      alumno.telefono || '',              // Teléfono
      alumno.email || ''                  // Email
    ];
    
    // Agregar a hoja de DÍA (crea automáticamente si no existe)
    if (dia) {
      Logger.log('📝 Intentando registrar en hoja de día: ' + dia);
      try {
        const sheetDia = obtenerOCrearHoja(dia, true);
        sheetDia.appendRow([
          ...datosAlumnoBasico,
          horario.deporte || '',          // Deporte
          horario.hora_inicio || '',      // Hora Inicio
          horario.hora_fin || '',         // Hora Fin
          codigo,                         // Código Registro
          'pendiente_pago'                // Estado
        ]);
        Logger.log('✅ Registrado exitosamente en hoja de día: ' + dia);
      } catch (error) {
        Logger.log('❌ Error al registrar en día ' + dia + ': ' + error.toString());
      }
    } else {
      Logger.log('⚠️ No se puede registrar en día porque está vacío');
    }
    
    // Agregar a hoja de DEPORTE (crea automáticamente si no existe)
    if (deporte) {
      Logger.log('📝 Intentando registrar en hoja de deporte: ' + deporte);
      try {
        const sheetDeporte = obtenerOCrearHoja(deporte, false);
        sheetDeporte.appendRow([
          ...datosAlumnoBasico,
          horario.dia || '',              // Día
          horario.hora_inicio || '',      // Hora Inicio
          horario.hora_fin || '',         // Hora Fin
          codigo,                         // Código Registro
          'pendiente_pago'                // Estado
        ]);
        Logger.log('✅ Registrado exitosamente en hoja de deporte: ' + deporte);
      } catch (error) {
        Logger.log('❌ Error al registrar en deporte ' + deporte + ': ' + error.toString());
      }
    } else {
      Logger.log('⚠️ No se puede registrar en deporte porque está vacío');
    }
  });
  
  // 4. ACTUALIZAR CUPOS OCUPADOS en la hoja HORARIOS
  Logger.log('📊 Actualizando cupos ocupados en HORARIOS...');
  actualizarCuposOcupados(horarios);
  
  return {
    success: true,
    codigo_operacion: codigo,
    mensaje: 'Inscripción registrada correctamente',
    inscripciones_creadas: 1,
    horarios_registrados: horarios.length
  };
}

/**
 * Consultar inscripción por DNI (para página de consulta) - Busca en todas las hojas de días/deportes
 */
function consultarInscripcion(dni) {
  if (!dni) {
    return { success: false, error: 'DNI requerido' };
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetPagos = ss.getSheetByName(SHEET_NAMES.PAGOS);
  
  if (!sheetPagos) {
    return { success: false, error: 'Hoja PAGOS no encontrada' };
  }
  
  // 1. Buscar en PAGOS el estado del alumno
  const dataPagos = sheetPagos.getDataRange().getValues();
  let registroPago = null;
  
  for (let i = 1; i < dataPagos.length; i++) {
    const row = dataPagos[i];
    if (row[1] && row[1].toString() === dni.toString()) { // Columna B: dni
      registroPago = {
        codigo_operacion: row[0],       // A: id
        dni: row[1],                    // B: dni
        nombres: row[2],                // C: nombres
        apellidos: row[3],              // D: apellidos
        telefono: row[4],               // E: telefono
        monto: row[5],                  // F: monto
        metodo_pago: row[6],            // G: metodo_pago
        estado: row[7],                 // H: estado_pago
        fecha_registro: row[8],         // I: fecha_registro
        url_comprobante: row[9],        // J: url_comprobante (índice 9)
        fecha_subida: row[10]           // K: fecha_subida (índice 10)
      };
      break;
    }
  }
  
  if (!registroPago) {
    return { success: false, error: 'No se encontró inscripción con ese DNI' };
  }
  
  // 2. Obtener datos del alumno desde INSCRIPCIONES
  const sheetInscripciones = ss.getSheetByName(SHEET_NAMES.INSCRIPCIONES);
  let datosAlumno = null;
  
  if (sheetInscripciones) {
    const dataInscripciones = sheetInscripciones.getDataRange().getValues();
    
    // Buscar TODAS las filas con el DNI y quedarnos con la que tenga URLs o la más reciente
    let filaEncontrada = null;
    let filaConURLs = null;
    
    // Primero buscar la fila que tiene URLs
    for (let i = dataInscripciones.length - 1; i >= 1; i--) {
      const row = dataInscripciones[i];
      if (row[1] && row[1].toString() === dni.toString()) {
        if (!filaEncontrada) {
          filaEncontrada = row; // Guardar la primera encontrada (más reciente)
          Logger.log('📍 Fila encontrada para DNI ' + dni + ' en posición: ' + (i + 1));
        }
        
        // Si esta fila tiene URLs, usarla
        if (row[14] || row[15] || row[16]) {
          filaConURLs = row;
          Logger.log('✅ Fila con URLs encontrada en posición: ' + (i + 1));
          Logger.log('   - URL DNI Frontal (col O): ' + row[14]);
          Logger.log('   - URL DNI Reverso (col P): ' + row[15]);
          Logger.log('   - URL Foto Carnet (col Q): ' + row[16]);
          break; // Encontramos fila con URLs, usar esta
        }
      }
    }
    
    // Usar la fila con URLs si existe, sino usar la más reciente
    const row = filaConURLs || filaEncontrada;
    
    if (row) {
      // Formatear fecha de nacimiento si existe
      let fechaNac = '';
      if (row[4]) {
        if (row[4] instanceof Date) {
          fechaNac = Utilities.formatDate(row[4], 'America/Lima', 'dd/MM/yyyy');
        } else {
          fechaNac = row[4].toString();
        }
      }
      
      datosAlumno = {
        dni: row[1],                    // B: dni
        nombres: row[2] || '',          // C: nombres
        apellidos: row[3] || '',        // D: apellidos
        fecha_nacimiento: fechaNac,     // E: fecha_nacimiento (formateada)
        edad: row[5] || '',             // F: edad
        sexo: row[6] || '',             // G: sexo
        telefono: row[7] || '',         // H: telefono
        email: row[8] || '',            // I: email
        apoderado: row[9] || '',        // J: apoderado (índice 9)
        direccion: row[10] || '',       // K: direccion (índice 10)
        seguro_tipo: row[11] || '',     // L: seguro_tipo (índice 11)
        condicion_medica: row[12] || '', // M: condicion_medica (índice 12)
        telefono_apoderado: row[13] || '', // N: telefono_apoderado (índice 13)
        url_dni_frontal: row[14] || '',    // O: url_dni_frontal (índice 14)
        url_dni_reverso: row[15] || '',    // P: url_dni_reverso (índice 15)
        url_foto_carnet: row[16] || ''     // Q: url_foto_carnet (índice 16)
      };
      
      Logger.log('📋 Datos alumno FINAL enviados:');
      Logger.log('   - DNI: ' + datosAlumno.dni);
      Logger.log('   - Nombre: ' + datosAlumno.nombres + ' ' + datosAlumno.apellidos);
      Logger.log('   - URL DNI Frontal: ' + (datosAlumno.url_dni_frontal || 'NO TIENE'));
      Logger.log('   - URL DNI Reverso: ' + (datosAlumno.url_dni_reverso || 'NO TIENE'));
      Logger.log('   - URL Foto Carnet: ' + (datosAlumno.url_foto_carnet || 'NO TIENE'));
    }
  }
  
  // 3. Buscar horarios en todas las hojas de días y deportes
  const diasSemana = ['LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
  
  // ⚠️ IMPORTANTE: Para AGREGAR un deporte nuevo:
  // 1. Agregar aquí el nombre EXACTO de la pestaña (MAYÚSCULAS)
  // 2. Actualizar también las listas en activarInscripciones() y desactivarInscripciones()
  // 3. La hoja se creará automáticamente al inscribir al primer alumno
  const deportes = [
    'FÚTBOL', 'VÓLEY', 'BÁSQUET', 
    'FÚTBOL FEMENINO',
    'ENTRENAMIENTO FUNCIONAL ADULTOS',
    'ENTRENAMIENTO FUNCIONAL MENORES',
    'ENTRENAMIENTO DE FUERZA Y TONIFICACIÓN MUSCULAR',
    'MAMAS FIT',
    'GYM JUVENIL',
    'ENTRENAMIENTO FUNCIONAL MIXTO'
  ];
  
  const horarios = [];
  
  // Buscar en hojas de días
  for (let dia of diasSemana) {
    const sheet = ss.getSheetByName(dia);
    if (!sheet) continue;
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) continue; // Solo headers
    
    const headers = data[0];
    
    // Buscar índices de columnas dinámicamente
    let colDNI = -1, colNombres = -1, colApellidos = -1, colFechaNac = -1;
    let colEdad = -1, colSexo = -1, colTelefono = -1, colEmail = -1;
    let colDireccion = -1, colApoderado = -1, colTelApoderado = -1;
    let colSeguro = -1, colCondicion = -1, colDeporte = -1;
    let colHoraInicio = -1, colHoraFin = -1, colEstado = -1;
    
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j].toString().toLowerCase().trim();
      if (header === 'dni' || header.includes('dni')) colDNI = j;
      if (header === 'nombres' || header.includes('nombres')) colNombres = j;
      if (header === 'apellidos' || header.includes('apellidos')) colApellidos = j;
      if (header === 'fecha nacimiento' || header.includes('fecha nac')) colFechaNac = j;
      if (header === 'edad') colEdad = j;
      if (header === 'sexo') colSexo = j;
      if (header === 'teléfono' || header === 'telefono') colTelefono = j;
      if (header === 'email' || header === 'correo') colEmail = j;
      if (header === 'dirección' || header === 'direccion') colDireccion = j;
      if (header === 'apoderado') colApoderado = j;
      if (header === 'teléfono apoderado' || header === 'telefono apoderado') colTelApoderado = j;
      if (header === 'seguro tipo' || header.includes('seguro')) colSeguro = j;
      if (header === 'condición médica' || header.includes('condicion')) colCondicion = j;
      if (header === 'deporte') colDeporte = j;
      if (header === 'hora inicio' || header.includes('hora inicio')) colHoraInicio = j;
      if (header === 'hora fin' || header.includes('hora fin')) colHoraFin = j;
      if (header === 'estado') colEstado = j;
    }
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (colDNI === -1 || !row[colDNI]) continue;
      
      const dniRow = row[colDNI].toString().trim();
      if (dniRow === dni.toString().trim()) {
        // Solo agregar horario (ya tenemos datos del alumno de INSCRIPCIONES)
        horarios.push({
          dia: dia,
          deporte: colDeporte !== -1 ? row[colDeporte] : '-',
          hora_inicio: colHoraInicio !== -1 ? formatearHoraLima(row[colHoraInicio]) : '-',
          hora_fin: colHoraFin !== -1 ? formatearHoraLima(row[colHoraFin]) : '-',
          estado: colEstado !== -1 ? row[colEstado] : 'pendiente_pago'
        });
      }
    }
  }
  
  // Buscar en hojas de deportes
  for (let deporte of deportes) {
    const sheet = ss.getSheetByName(deporte);
    if (!sheet) continue;
    
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) continue; // Solo headers
    
    const headers = data[0];
    
    // Buscar índices de columnas dinámicamente
    let colDNI = -1, colNombres = -1, colApellidos = -1, colFechaNac = -1;
    let colEdad = -1, colSexo = -1, colTelefono = -1, colEmail = -1;
    let colDireccion = -1, colApoderado = -1, colTelApoderado = -1;
    let colSeguro = -1, colCondicion = -1, colDia = -1;
    let colHoraInicio = -1, colHoraFin = -1, colEstado = -1;
    
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j].toString().toLowerCase().trim();
      if (header === 'dni' || header.includes('dni')) colDNI = j;
      if (header === 'nombres' || header.includes('nombres')) colNombres = j;
      if (header === 'apellidos' || header.includes('apellidos')) colApellidos = j;
      if (header === 'fecha nacimiento' || header.includes('fecha nac')) colFechaNac = j;
      if (header === 'edad') colEdad = j;
      if (header === 'sexo') colSexo = j;
      if (header === 'teléfono' || header === 'telefono') colTelefono = j;
      if (header === 'email' || header === 'correo') colEmail = j;
      if (header === 'dirección' || header === 'direccion') colDireccion = j;
      if (header === 'apoderado') colApoderado = j;
      if (header === 'teléfono apoderado' || header === 'telefono apoderado') colTelApoderado = j;
      if (header === 'seguro tipo' || header.includes('seguro')) colSeguro = j;
      if (header === 'condición médica' || header.includes('condicion')) colCondicion = j;
      if (header === 'día' || header === 'dia') colDia = j;
      if (header === 'hora inicio' || header.includes('hora inicio')) colHoraInicio = j;
      if (header === 'hora fin' || header.includes('hora fin')) colHoraFin = j;
      if (header === 'estado') colEstado = j;
    }
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (colDNI === -1 || !row[colDNI]) continue;
      
      const dniRow = row[colDNI].toString().trim();
      if (dniRow === dni.toString().trim()) {
        // Solo agregar horario (ya tenemos datos del alumno de INSCRIPCIONES)
        horarios.push({
          dia: colDia !== -1 ? row[colDia] : '-',
          deporte: deporte,
          hora_inicio: colHoraInicio !== -1 ? formatearHoraLima(row[colHoraInicio]) : '-',
          hora_fin: colHoraFin !== -1 ? formatearHoraLima(row[colHoraFin]) : '-',
          estado: colEstado !== -1 ? row[colEstado] : 'pendiente_pago'
        });
      }
    }
  }
  
  // Si no se encontraron datos del alumno en las hojas de horarios
  if (!datosAlumno) {
    return { 
      success: false, 
      error: 'No se encontraron inscripciones activas. Contacta con el administrador.' 
    };
  }
  
  // Eliminar horarios duplicados
  // Un horario es único por: dia + deporte + hora_inicio + hora_fin
  // Normalizar a mayúsculas para evitar duplicados por diferencias de capitalización
  const horariosUnicos = [];
  const horariosVistos = new Set();
  
  for (let horario of horarios) {
    const diaUpper = horario.dia.toString().toUpperCase();
    const deporteUpper = horario.deporte.toString().toUpperCase();
    const clave = `${diaUpper}-${deporteUpper}-${horario.hora_inicio}-${horario.hora_fin}`;
    if (!horariosVistos.has(clave)) {
      horariosVistos.add(clave);
      horariosUnicos.push(horario);
    }
  }
  
  Logger.log('📊 Total horarios encontrados: ' + horarios.length);
  Logger.log('✅ Horarios únicos después de filtrar: ' + horariosUnicos.length);
  
  // 3. Combinar datos en formato esperado por el frontend
  const resultado = {
    success: true,
    alumno: {
      dni: datosAlumno.dni,
      nombres: datosAlumno.nombres,
      apellidos: datosAlumno.apellidos,
      fecha_nacimiento: datosAlumno.fecha_nacimiento,
      edad: datosAlumno.edad,
      sexo: datosAlumno.sexo,
      telefono: datosAlumno.telefono,
      email: datosAlumno.email,
      direccion: datosAlumno.direccion,
      apoderado: datosAlumno.apoderado,
      telefono_apoderado: datosAlumno.telefono_apoderado,
      seguro_tipo: datosAlumno.seguro_tipo,
      condicion_medica: datosAlumno.condicion_medica,
      url_dni_frontal: datosAlumno.url_dni_frontal || '',
      url_dni_reverso: datosAlumno.url_dni_reverso || '',
      url_foto_carnet: datosAlumno.url_foto_carnet || ''
    },
    pago: {
      codigo_operacion: registroPago.codigo_operacion,
      monto: registroPago.monto,
      metodo_pago: registroPago.metodo_pago,
      estado: registroPago.estado,
      fecha_registro: registroPago.fecha_registro,
      url_comprobante: registroPago.url_comprobante,
      fecha_subida: registroPago.fecha_subida
    },
    horarios: horariosUnicos
  };
  
  return resultado;
}

/**
 * Obtener inscripciones por DNI
 */
function obtenerInscripcionesPorDNI(dni) {
  if (!dni) {
    return { success: false, error: 'DNI requerido' };
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.INSCRIPCIONES);
  
  if (!sheet) {
    return { success: false, error: 'Hoja INSCRIPCIONES no encontrada' };
  }
  
  const data = sheet.getDataRange().getValues();
  const inscripciones = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[1] && row[1].toString() === dni.toString()) { // Columna B: dni
      inscripciones.push({
        fecha_registro: row[0],
        dni: row[1],
        nombres: row[2],
        apellidos: row[3],
        deporte: row[13],
        dia: row[14]
      });
    }
  }
  
  return { success: true, inscripciones };
}

/**
 * Verificar estado de pago
 */
function verificarPago(dni) {
  if (!dni) {
    return { success: false, error: 'DNI requerido' };
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.PAGOS);
  
  if (!sheet) {
    return { success: false, error: 'Hoja PAGOS no encontrada' };
  }
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[1] && row[1].toString() === dni.toString()) { // Columna B: dni
      return {
        success: true,
        pago: {
          codigo: row[0],
          dni: row[1],
          estado: row[7],
          monto: row[5],
          fecha: row[8]
        }
      };
    }
  }
  
  return { success: false, error: 'No se encontró registro de pago' };
}

/**
 * Listar todos los inscritos (para panel de admin)
 */
function listarInscritos(dia, deporte) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const inscritosPorDNI = {}; // Agrupar por DNI para evitar duplicados
    
    // Lista de todas las hojas de días y deportes
    const hojas = [
      'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO',
      'FÚTBOL', 'VÓLEY', 'BÁSQUET', 'FÚTBOL FEMENINO',
      'ENTRENAMIENTO FUNCIONAL ADULTOS', 'ENTRENAMIENTO FUNCIONAL MENORES',
      'ENTRENAMIENTO DE FUERZA Y TONIFICACIÓN MUSCULAR'
    ];
    
    // Filtrar hojas según filtros
    let hojasABuscar = hojas;
    if (dia) {
      hojasABuscar = hojasABuscar.filter(h => h === dia.toUpperCase());
    }
    if (deporte) {
      hojasABuscar = hojasABuscar.filter(h => h.includes(deporte.toUpperCase()));
    }
    
    // Recorrer cada hoja
    for (const nombreHoja of hojasABuscar) {
      const sheet = ss.getSheetByName(nombreHoja);
      
      if (!sheet) continue;
      
      const data = sheet.getDataRange().getValues();
      if (data.length <= 1) continue; // Solo headers
      
      const headers = data[0];
      
      // Buscar índices de columnas
      let colDNI = -1, colNombres = -1, colApellidos = -1, colEdad = -1;
      let colSexo = -1, colTelefono = -1, colEmail = -1, colDeporte = -1;
      let colHoraInicio = -1, colHoraFin = -1, colEstado = -1, colCodigo = -1;
      
      for (let j = 0; j < headers.length; j++) {
        const header = headers[j].toString().toLowerCase().trim();
        if (header === 'dni' || header.includes('dni')) colDNI = j;
        if (header === 'nombres' || header.includes('nombres')) colNombres = j;
        if (header === 'apellidos' || header.includes('apellidos')) colApellidos = j;
        if (header === 'edad') colEdad = j;
        if (header === 'sexo') colSexo = j;
        if (header === 'teléfono' || header === 'telefono') colTelefono = j;
        if (header === 'email') colEmail = j;
        if (header === 'deporte') colDeporte = j;
        if (header === 'hora inicio' || header.includes('hora inicio')) colHoraInicio = j;
        if (header === 'hora fin' || header.includes('hora fin')) colHoraFin = j;
        if (header === 'estado') colEstado = j;
        if (header === 'código registro' || header.includes('código')) colCodigo = j;
      }
      
      // Extraer datos y agrupar por DNI
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const dni = colDNI !== -1 ? row[colDNI].toString().trim() : '';
        
        if (!dni) continue; // Saltar si no tiene DNI
        
        // Formatear horas a zona horaria de Lima
        const horaInicio = colHoraInicio !== -1 && row[colHoraInicio] 
          ? formatearHoraLima(row[colHoraInicio]) 
          : '-';
        const horaFin = colHoraFin !== -1 && row[colHoraFin] 
          ? formatearHoraLima(row[colHoraFin]) 
          : '-';
        
        const horario = {
          dia: nombreHoja,
          deporte: colDeporte !== -1 && row[colDeporte] ? row[colDeporte] : nombreHoja,
          hora_inicio: horaInicio,
          hora_fin: horaFin,
          estado: colEstado !== -1 && row[colEstado] ? row[colEstado] : 'pendiente_pago'
        };
        
        // Si el DNI ya existe, solo agregar el horario
        if (inscritosPorDNI[dni]) {
          inscritosPorDNI[dni].horarios.push(horario);
        } else {
          // Primera vez que vemos este DNI - extraer todos los datos
          inscritosPorDNI[dni] = {
            dni: dni,
            nombres: colNombres !== -1 && row[colNombres] ? row[colNombres] : '',
            apellidos: colApellidos !== -1 && row[colApellidos] ? row[colApellidos] : '',
            edad: colEdad !== -1 && row[colEdad] ? row[colEdad] : '',
            sexo: colSexo !== -1 && row[colSexo] ? row[colSexo] : '',
            telefono: colTelefono !== -1 && row[colTelefono] ? row[colTelefono] : '',
            email: colEmail !== -1 && row[colEmail] ? row[colEmail] : '',
            codigo_registro: colCodigo !== -1 && row[colCodigo] ? row[colCodigo] : '',
            horarios: [horario]
          };
        }
      }
    }
    
    // Obtener info de pagos de la hoja PAGOS
    const sheetPagos = ss.getSheetByName(SHEET_NAMES.PAGOS);
    const pagosMap = {};
    
    if (sheetPagos) {
      const dataPagos = sheetPagos.getDataRange().getValues();
      for (let i = 1; i < dataPagos.length; i++) {
        const dni = dataPagos[i][1] ? dataPagos[i][1].toString() : ''; // Columna B
        if (dni) {
          pagosMap[dni] = {
            codigo_operacion: dataPagos[i][0],   // A: código
            monto: dataPagos[i][5],              // F: monto
            metodo_pago: dataPagos[i][6],        // G: metodo_pago
            estado_pago: dataPagos[i][7],        // H: estado
            url_comprobante: dataPagos[i][9],    // J: url_comprobante (índice 9)
            fecha_subida: dataPagos[i][10]       // K: fecha_subida (índice 10)
          };
        }
      }
    }
    
    // Convertir el objeto a array y combinar con info de pagos
    const inscritos = Object.values(inscritosPorDNI).map(inscrito => {
      // Eliminar horarios duplicados para este inscrito
      // Normalizar a mayúsculas para evitar duplicados por diferencias de capitalización
      const horariosUnicos = [];
      const horariosVistos = new Set();
      
      for (let horario of inscrito.horarios) {
        const diaUpper = horario.dia.toString().toUpperCase();
        const deporteUpper = horario.deporte.toString().toUpperCase();
        const clave = `${diaUpper}-${deporteUpper}-${horario.hora_inicio}-${horario.hora_fin}`;
        if (!horariosVistos.has(clave)) {
          horariosVistos.add(clave);
          horariosUnicos.push(horario);
        }
      }
      
      inscrito.horarios = horariosUnicos;
      
      if (pagosMap[inscrito.dni]) {
        inscrito.pago = pagosMap[inscrito.dni];
      }
      
      // Para mostrar en la tabla principal, usar info del primer horario
      if (inscrito.horarios.length > 0) {
        inscrito.deporte = inscrito.horarios[0].deporte;
        inscrito.dia = inscrito.horarios[0].dia;
        inscrito.hora_inicio = inscrito.horarios[0].hora_inicio;
        inscrito.hora_fin = inscrito.horarios[0].hora_fin;
        inscrito.estado = inscrito.horarios[0].estado;
      }
      
      return inscrito;
    });
    
    return { success: true, inscritos: inscritos };
    
  } catch (error) {
    Logger.log('❌ Error al listar inscritos: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Formatear hora a zona horaria de Lima (HH:mm)
 */
function formatearHoraLima(fecha) {
  try {
    if (!fecha) return '';
    
    // Si ya es un string con formato HH:mm o similar
    if (typeof fecha === 'string') {
      // Si ya tiene formato HH:mm, devolverlo
      if (/^\d{1,2}:\d{2}$/.test(fecha)) {
        return fecha;
      }
      // Si tiene formato de fecha completo, intentar parsear
      if (fecha.includes('T') || fecha.includes('-')) {
        const d = new Date(fecha);
        if (!isNaN(d.getTime())) {
          return Utilities.formatDate(d, 'America/Lima', 'HH:mm');
        }
      }
      return fecha;
    }
    
    // Si es un objeto Date de Excel (fecha serial)
    if (fecha instanceof Date) {
      return Utilities.formatDate(fecha, 'America/Lima', 'HH:mm');
    }
    
    // Si es un número (fecha serial de Excel o timestamp)
    if (typeof fecha === 'number') {
      // Excel fecha serial (típicamente < 100000)
      if (fecha < 100000) {
        // Convertir fecha serial de Excel a Date
        const excelEpoch = new Date(1899, 11, 30);
        const d = new Date(excelEpoch.getTime() + fecha * 86400000);
        return Utilities.formatDate(d, 'America/Lima', 'HH:mm');
      }
      // Timestamp Unix
      const d = new Date(fecha);
      return Utilities.formatDate(d, 'America/Lima', 'HH:mm');
    }
    
    return '';
    
  } catch (error) {
    Logger.log('Error al formatear hora: ' + error.toString() + ' - Valor: ' + JSON.stringify(fecha));
    return '';
  }
}

/**
 * Registrar pago
 */
function registrarPago(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.PAGOS);
  
  if (!sheet) {
    return { success: false, error: 'Hoja PAGOS no encontrada' };
  }
  
  const codigo = generarCodigoOperacion();
  const fecha = new Date();
  const fechaStr = Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
  
  sheet.appendRow([
    codigo,
    data.alumno.dni,
    data.alumno.nombres,
    data.alumno.apellidos,
    data.alumno.telefono,
    data.monto || 0,
    data.metodo_pago || 'Yape',
    'pendiente',
    fechaStr,
    data.horarios_seleccionados ? data.horarios_seleccionados.join(',') : ''
  ]);
  
  return { success: true, codigo_pago: codigo };
}

/**
 * Subir comprobante a Google Drive y guardar enlace en Sheet
 */
function subirComprobanteDrive(data) {
  try {
    if (!data.codigo_operacion || !data.imagen || !data.dni) {
      return { success: false, error: 'Datos incompletos' };
    }
    
    // Buscar datos del alumno en INSCRIPCIONES para obtener nombre completo
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetInscripciones = ss.getSheetByName(SHEET_NAMES.INSCRIPCIONES);
    let nombreCompleto = data.alumno || data.dni;
    let apellidos = '';
    
    if (sheetInscripciones) {
      const dataInscripciones = sheetInscripciones.getDataRange().getValues();
      for (let i = 1; i < dataInscripciones.length; i++) {
        if (dataInscripciones[i][1] && dataInscripciones[i][1].toString() === data.dni.toString()) {
          nombreCompleto = dataInscripciones[i][2] || ''; // Columna C: nombres
          apellidos = dataInscripciones[i][3] || ''; // Columna D: apellidos
          break;
        }
      }
    }
    
    // Crear nombre de carpeta del alumno
    const nombreCarpetaAlumno = `${nombreCompleto}_${apellidos}_${data.dni}`.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    
    // Subir comprobante a la carpeta del alumno usando la función existente
    const urlComprobante = subirImagenDrive(data.imagen, 'Comprobante_Pago', nombreCarpetaAlumno);
    
    if (!urlComprobante) {
      return { success: false, error: 'Error al subir comprobante a Drive' };
    }
    
    // Obtener fileId para URL directa
    const fileId = extraerFileIdDeUrl(urlComprobante);
    const urlImagen = fileId ? `https://drive.google.com/uc?export=view&id=${fileId}` : urlComprobante;
    
    // Actualizar hoja PAGOS con la URL del comprobante
    const sheetPagos = ss.getSheetByName(SHEET_NAMES.PAGOS);
    if (!sheetPagos) {
      return { success: false, error: 'Hoja PAGOS no encontrada' };
    }
    
    const dataPagos = sheetPagos.getDataRange().getValues();
    const fecha = new Date();
    const fechaSubidaStr = Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm');
    
    // Buscar la fila con el código de operación
    let filaEncontrada = -1;
    for (let i = 1; i < dataPagos.length; i++) {
      const codigoEnSheet = dataPagos[i][0] ? dataPagos[i][0].toString().trim() : '';
      const codigoBuscado = data.codigo_operacion.toString().trim();
      
      if (codigoEnSheet === codigoBuscado) {
        filaEncontrada = i + 1;
        break;
      }
    }
    
    if (filaEncontrada === -1) {
      return { 
        success: false, 
        error: `Código de operación "${data.codigo_operacion}" no encontrado en la hoja PAGOS` 
      };
    }
    
    // Actualizar columna J (10) con el enlace directo de la imagen
    sheetPagos.getRange(filaEncontrada, 10).setValue(urlImagen);
    // Actualizar fecha de subida en columna K (11)
    sheetPagos.getRange(filaEncontrada, 11).setValue(fechaSubidaStr);
    
    Logger.log('✅ Comprobante registrado en PAGOS para código: ' + data.codigo_operacion);
    
    return { 
      success: true, 
      url_comprobante: urlImagen,
      url_vista: urlComprobante,
      fecha_subida: fechaSubidaStr,
      mensaje: 'Comprobante subido correctamente'
    };
    
  } catch (error) {
    Logger.log('❌ Error en subirComprobanteDrive: ' + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * Extraer file ID de una URL de Google Drive
 */
function extraerFileIdDeUrl(url) {
  try {
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

/**
 * Subir imagen individual a Google Drive en carpeta del alumno
 * @param {string} imagenBase64 - Imagen en formato base64
 * @param {string} nombreArchivo - Nombre del archivo (DNI_Frontal, DNI_Reverso, Foto_Carnet, Comprobante_Pago)
 * @param {string} nombreCarpetaAlumno - Nombre de la carpeta del alumno (Nombre_Apellido_DNI)
 */
function subirImagenDrive(imagenBase64, nombreArchivo, nombreCarpetaAlumno) {
  try {
    if (!imagenBase64) {
      Logger.log('⚠️ No hay imagen para subir');
      return '';
    }
    
    // Obtener o crear carpeta principal
    const carpetaPrincipal = obtenerOCrearCarpeta('JAGUARES - Documentos');
    
    // Crear carpeta del alumno
    const carpetaAlumno = obtenerOCrearCarpeta(nombreCarpetaAlumno, carpetaPrincipal);
    
    // Convertir base64 a blob
    const base64Data = imagenBase64.split(',')[1]; // Remover prefijo data:image/...
    const mimeType = imagenBase64.split(';')[0].split(':')[1]; // Extraer tipo MIME
    const extension = mimeType.split('/')[1];
    
    const blob = Utilities.newBlob(
      Utilities.base64Decode(base64Data),
      mimeType,
      nombreArchivo + '.' + extension
    );
    
    // Subir archivo a la carpeta del alumno
    const archivo = carpetaAlumno.createFile(blob);
    
    // Hacer accesible
    archivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    const url = archivo.getUrl();
    Logger.log('✅ Imagen subida: ' + nombreArchivo + ' → ' + url);
    
    return url;
    
  } catch (error) {
    Logger.log('❌ Error al subir imagen: ' + error.toString());
    return '';
  }
}

/**
 * Obtener o crear carpeta en Drive
 */
function obtenerOCrearCarpeta(nombreCarpeta, carpetaPadre) {
  let carpeta;
  
  if (carpetaPadre) {
    // Buscar en carpeta padre
    const carpetas = carpetaPadre.getFoldersByName(nombreCarpeta);
    if (carpetas.hasNext()) {
      carpeta = carpetas.next();
    } else {
      carpeta = carpetaPadre.createFolder(nombreCarpeta);
    }
  } else {
    // Buscar en raíz
    const carpetas = DriveApp.getFoldersByName(nombreCarpeta);
    if (carpetas.hasNext()) {
      carpeta = carpetas.next();
    } else {
      carpeta = DriveApp.createFolder(nombreCarpeta);
    }
  }
  
  return carpeta;
}

/**
 * Generar código de operación único
 */
function generarCodigoOperacion() {
  const fecha = new Date();
  const timestamp = fecha.getTime().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ACAD-${Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'yyyyMMdd')}-${random}`;
}

/**
 * Obtener o crear hoja (crea automáticamente si no existe, o arregla estructura si está incompleta)
 */
function obtenerOCrearHoja(nombreHoja, esDia) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(nombreHoja);
  
  // Headers esperados según tipo de hoja (SIMPLIFICADOS - solo datos esenciales)
  const headersEsperadosDia = [
    'Timestamp', 'DNI', 'Nombres', 'Apellidos', 'Edad',
    'Sexo', 'Teléfono', 'Email', 'Deporte', 'Hora Inicio', 'Hora Fin',
    'Código Registro', 'Estado'
  ];
  
  const headersEsperadosDeporte = [
    'Timestamp', 'DNI', 'Nombres', 'Apellidos', 'Edad',
    'Sexo', 'Teléfono', 'Email', 'Día', 'Hora Inicio', 'Hora Fin',
    'Código Registro', 'Estado'
  ];
  
  if (!sheet) {
    // CREAR NUEVA HOJA
    Logger.log('📝 Creando nueva hoja: ' + nombreHoja);
    sheet = ss.insertSheet(nombreHoja);
    
    // Agregar headers
    if (esDia) {
      sheet.appendRow(headersEsperadosDia);
    } else {
      sheet.appendRow(headersEsperadosDeporte);
    }
    
    // Formatear header
    const headerRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
    headerRange.setBackground('#C59D5F');
    headerRange.setFontColor('#FFFFFF');
    headerRange.setFontWeight('bold');
    headerRange.setHorizontalAlignment('center');
    
    Logger.log('✅ Hoja creada exitosamente: ' + nombreHoja);
  } else {
    // VERIFICAR ESTRUCTURA DE HOJA EXISTENTE
    const lastCol = sheet.getLastColumn();
    const headersActuales = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    
    Logger.log('🔍 Verificando estructura de hoja existente: ' + nombreHoja);
    Logger.log('📊 Columnas actuales: ' + lastCol + ' - Headers: ' + JSON.stringify(headersActuales));
    
    // Verificar si faltan las últimas 4 columnas específicas
    const columnasEsperadas = esDia ? headersEsperadosDia : headersEsperadosDeporte;
    const columnaEspecifica = esDia ? 'Deporte' : 'Día';
    
    // Buscar si tiene la columna específica (Deporte para días, Día para deportes)
    const tieneColumnaEspecifica = headersActuales.some(h => 
      h && h.toString().toLowerCase().includes(columnaEspecifica.toLowerCase())
    );
    
    const tieneHoraInicio = headersActuales.some(h => 
      h && h.toString().toLowerCase().includes('hora') && h.toString().toLowerCase().includes('inicio')
    );
    
    const tieneEstado = headersActuales.some(h => 
      h && h.toString().toLowerCase() === 'estado'
    );
    
    if (!tieneColumnaEspecifica || !tieneHoraInicio || !tieneEstado) {
      Logger.log('⚠️ Hoja incompleta. Agregando columnas faltantes...');
      
      // Agregar las columnas faltantes en el header (fila 1)
      let colNum = lastCol + 1;
      
      if (!tieneColumnaEspecifica) {
        sheet.getRange(1, colNum).setValue(columnaEspecifica);
        colNum++;
      }
      
      if (!tieneHoraInicio) {
        sheet.getRange(1, colNum).setValue('Hora Inicio');
        colNum++;
        sheet.getRange(1, colNum).setValue('Hora Fin');
        colNum++;
      }
      
      if (!tieneEstado) {
        sheet.getRange(1, colNum).setValue('Estado');
      }
      
      // Re-formatear toda la fila de headers
      const newHeaderRange = sheet.getRange(1, 1, 1, sheet.getLastColumn());
      newHeaderRange.setBackground('#C59D5F');
      newHeaderRange.setFontColor('#FFFFFF');
      newHeaderRange.setFontWeight('bold');
      newHeaderRange.setHorizontalAlignment('center');
      
      Logger.log('✅ Columnas agregadas a hoja: ' + nombreHoja);
    } else {
      Logger.log('✅ Hoja ya tiene estructura correcta: ' + nombreHoja);
    }
  }
  
  return sheet;
}

/**
 * Actualizar cupos ocupados en la hoja HORARIOS
 */
function actualizarCuposOcupados(horariosInscritos) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetHorarios = ss.getSheetByName(SHEET_NAMES.HORARIOS);
    
    if (!sheetHorarios) {
      Logger.log('⚠️ Hoja HORARIOS no encontrada');
      return;
    }
    
    const data = sheetHorarios.getDataRange().getValues();
    const headers = data[0];
    
    // Buscar columnas
    let colHorarioId = -1;
    let colCuposOcupados = -1;
    
    for (let j = 0; j < headers.length; j++) {
      const header = headers[j].toString().toLowerCase().trim();
      if (header === 'horario_id' || header === 'id') {
        colHorarioId = j;
      } else if (header === 'cupos_ocupados') {
        colCuposOcupados = j;
      }
    }
    
    if (colHorarioId === -1 || colCuposOcupados === -1) {
      Logger.log('⚠️ No se encontraron columnas horario_id o cupos_ocupados');
      return;
    }
    
    // Actualizar cada horario inscrito
    horariosInscritos.forEach(horario => {
      const horarioId = parseInt(horario.id || horario.horario_id);
      
      // Buscar la fila del horario
      for (let i = 1; i < data.length; i++) {
        const filaHorarioId = parseInt(data[i][colHorarioId]);
        
        if (filaHorarioId === horarioId) {
          // Incrementar cupos ocupados
          const cuposActuales = parseInt(data[i][colCuposOcupados] || 0);
          const nuevosCupos = cuposActuales + 1;
          
          // Actualizar en la sheet (fila i+1 porque arrays empiezan en 0 pero sheets en 1)
          sheetHorarios.getRange(i + 1, colCuposOcupados + 1).setValue(nuevosCupos);
          
          Logger.log(`✅ Cupos actualizados para horario ${horarioId}: ${cuposActuales} → ${nuevosCupos}`);
          break;
        }
      }
    });
    
    Logger.log('✅ Todos los cupos actualizados correctamente');
    
  } catch (error) {
    Logger.log('❌ Error al actualizar cupos: ' + error.toString());
  }
}

/**
 * Calcular edad desde fecha de nacimiento
 */
function calcularEdad(fechaNacimiento) {
  if (!fechaNacimiento) return '';
  
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }
  
  return edad;
}

/**
 * Obtener hora de inicio basada en el horario (simulado)
 */
function obtenerHoraInicio(deporte, dia) {
  // Esto debería venir de la hoja HORARIOS, pero por ahora retornamos un valor por defecto
  return '08:00';
}

/**
 * Obtener hora de fin basada en el horario (simulado)
 */
function obtenerHoraFin(deporte, dia) {
  // Esto debería venir de la hoja HORARIOS, pero por ahora retornamos un valor por defecto
  return '10:00';
}

/**
 * Crear respuesta JSON
 */
function respuestaJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Función de prueba para autorizar permisos de Drive
 * Ejecuta esta función manualmente la primera vez para autorizar
 */
function testAutorizarPermisosDrive() {
  try {
    // Crear carpeta de prueba
    const carpetaPrueba = obtenerOCrearCarpeta('JAGUARES - Test');
    Logger.log('✅ Carpeta creada: ' + carpetaPrueba.getName());
    
    // Crear archivo de prueba
    const contenido = 'Este es un archivo de prueba para autorizar permisos';
    const blob = Utilities.newBlob(contenido, 'text/plain', 'test.txt');
    const archivo = carpetaPrueba.createFile(blob);
    archivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    Logger.log('✅ Archivo de prueba creado: ' + archivo.getUrl());
    Logger.log('✅ Permisos de Drive autorizados correctamente');
    
    // Limpiar - eliminar archivo de prueba
    archivo.setTrashed(true);
    
    return '✅ Permisos autorizados correctamente';
    
  } catch (error) {
    Logger.log('❌ Error: ' + error.toString());
    return '❌ Error: ' + error.toString();
  }
}

/**
 * Validar DNI
 */
function validarDNI(dni) {
  const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAMES.INSCRIPCIONES);
  const datos = hoja.getDataRange().getValues();

  for (let i = 1; i < datos.length; i++) {
    if (datos[i][0].toString().trim() === dni) {
      return {
        success: true,
        valido: false,
        error: 'DNI ya registrado'
      };
    }
  }

  return {
    success: true,
    valido: true
  };
}
