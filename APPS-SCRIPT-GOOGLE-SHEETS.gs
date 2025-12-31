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

// Token de seguridad (cambiar por uno único)
const SECURITY_TOKEN = "tu-token-secreto-aqui-123456";

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
 * Función principal que maneja todas las peticiones
 */
function doGet(e) {
  const params = e.parameter;
  
  // Validar token
  if (!params.token || params.token !== SECURITY_TOKEN) {
    return respuestaJSON({ success: false, error: 'Token inválido' });
  }
  
  const action = params.action;
  
  try {
    switch (action) {
      case 'horarios':
        return respuestaJSON(obtenerHorarios());
        
      case 'mis_inscripciones':
        return respuestaJSON(obtenerInscripcionesPorDNI(params.dni));
        
      case 'verificar_pago':
        return respuestaJSON(verificarPago(params.dni));
        
      case 'consultar_inscripcion':
        return respuestaJSON(consultarInscripcion(params.dni));
        
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
        
      default:
        return respuestaJSON({ success: false, error: 'Acción no válida' });
    }
  } catch (error) {
    return respuestaJSON({ success: false, error: error.toString() });
  }
}

/**
 * Obtener todos los horarios disponibles
 */
function obtenerHorarios() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAMES.HORARIOS);
  
  if (!sheet) {
    return { success: false, error: 'Hoja HORARIOS no encontrada' };
  }
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const horarios = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // Saltar filas vacías
    
    const horario = {};
    headers.forEach((header, index) => {
      horario[header] = row[index];
    });
    
    horarios.push(horario);
  }
  
  return { success: true, horarios };
}

/**
 * Inscribir alumno en múltiples horarios
 */
function inscribirMultiple(alumno, horarios) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetInscripciones = ss.getSheetByName(SHEET_NAMES.INSCRIPCIONES);
  const sheetPagos = ss.getSheetByName(SHEET_NAMES.PAGOS);
  
  if (!sheetInscripciones) {
    return { success: false, error: 'Hoja INSCRIPCIONES no encontrada' };
  }
  
  if (!sheetPagos) {
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
  
  // 1. REGISTRAR EN INSCRIPCIONES (múltiples filas, una por cada horario)
  horarios.forEach(horario => {
    sheetInscripciones.appendRow([
      fechaStr,                           // A: fecha_registro
      alumno.dni || '',                   // B: dni
      alumno.nombres || '',               // C: nombres
      apellidos,                          // D: apellidos
      alumno.fecha_nacimiento || '',      // E: fecha_nacimiento
      calcularEdad(alumno.fecha_nacimiento), // F: edad
      alumno.sexo || '',                  // G: sexo
      alumno.telefono || '',              // H: telefono
      alumno.email || '',                 // I: email
      alumno.direccion || '',             // J: direccion
      alumno.apoderado || '',             // K: apoderado
      alumno.seguro_tipo || '',           // L: seguro
      horario.id || '',                   // M: horario_id
      horario.deporte || '',              // N: deporte
      horario.dia || ''                   // O: dia
    ]);
  });
  
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
    fechaStr,                             // I: fecha_registro
    horariosIds                           // J: horarios_seleccionados
  ]);
  
  return {
    success: true,
    codigo_operacion: codigo,
    mensaje: 'Inscripción registrada correctamente',
    inscripciones_creadas: horarios.length
  };
}

/**
 * Consultar inscripción por DNI (para página de consulta)
 */
function consultarInscripcion(dni) {
  if (!dni) {
    return { success: false, error: 'DNI requerido' };
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetPagos = ss.getSheetByName(SHEET_NAMES.PAGOS);
  const sheetInscripciones = ss.getSheetByName(SHEET_NAMES.INSCRIPCIONES);
  
  if (!sheetPagos || !sheetInscripciones) {
    return { success: false, error: 'Hojas no encontradas' };
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
        horarios_ids: row[9]            // J: horarios_seleccionados
      };
      break;
    }
  }
  
  if (!registroPago) {
    return { success: false, error: 'No se encontró inscripción con ese DNI' };
  }
  
  // VALIDAR: Solo mostrar si está confirmado
  if (registroPago.estado.toLowerCase() !== 'confirmado' && 
      registroPago.estado.toLowerCase() !== 'confir' &&
      registroPago.estado.toLowerCase() !== 'activo') {
    return { 
      success: false, 
      error: 'Tu inscripción está pendiente de confirmación. Por favor envía tu comprobante de pago por WhatsApp.' 
    };
  }
  
  // 2. Buscar inscripciones completas en INSCRIPCIONES
  const dataInscripciones = sheetInscripciones.getDataRange().getValues();
  const datosAlumno = null;
  const horarios = [];
  
  for (let i = 1; i < dataInscripciones.length; i++) {
    const row = dataInscripciones[i];
    if (row[1] && row[1].toString() === dni.toString()) { // Columna B: dni
      // Obtener datos del alumno (de la primera coincidencia)
      if (!datosAlumno) {
        var datosAlumno = {
          dni: row[1],
          nombres: row[2],
          apellidos: row[3],
          fecha_nacimiento: row[4],
          edad: row[5],
          sexo: row[6],
          telefono: row[7],
          email: row[8],
          direccion: row[9],
          apoderado: row[10],
          seguro_tipo: row[11]
        };
      }
      
      // Agregar horario
      horarios.push({
        id: row[12],
        deporte: row[13],
        dia: row[14],
        hora_inicio: obtenerHoraInicio(row[13], row[14]),
        hora_fin: obtenerHoraFin(row[13], row[14]),
        sede: 'Sede Principal',
        categoria: 'Nivel Intermedio',
        precio: '50.00'
      });
    }
  }
  
  // 3. Combinar datos
  const resultado = {
    ...datosAlumno,
    ...registroPago,
    alumno: `${datosAlumno.nombres} ${datosAlumno.apellidos}`,
    horarios: horarios
  };
  
  return { success: true, data: resultado };
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
 * Generar código de operación único
 */
function generarCodigoOperacion() {
  const fecha = new Date();
  const timestamp = fecha.getTime().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `ACAD-${Utilities.formatDate(fecha, Session.getScriptTimeZone(), 'yyyyMMdd')}-${random}`;
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
