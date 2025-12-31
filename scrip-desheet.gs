// ==================== CONFIGURACIÓN ====================

// ID de tu Google Sheet (cámbialo por el tuyo)
const SHEET_ID = '1Mu4VOpfy5AuOdAZMa9s1bkDQBwfcRsELqagdSxrcvLQ';

// Token de seguridad (debe coincidir con el del backend)
const API_TOKEN = 'academia_2025_TOKEN_8f7s9dF!23xL';

// Monto de inscripción (en soles)
const MONTO_INSCRIPCION = 50.00;

// ==================== FUNCIONES ====================

/**
 * Maneja peticiones GET
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    const token = e.parameter.token;
    
    // Validar token
    if (token !== API_TOKEN) {
      return jsonResponse({ ok: false, error: 'Token inválido' }, 401);
    }
    
    // Ejecutar acción según el parámetro
    if (action === 'horarios') {
      return getHorarios();
    } else if (action === 'mis_inscripciones') {
      const dni = e.parameter.dni;
      return getMisInscripciones(dni);
    } else if (action === 'verificar_pago') {
      const dni = e.parameter.dni;
      return verificarPago(dni);
    } else if (action === 'consultar_inscripcion') {
      const dni = e.parameter.dni;
      return consultarInscripcion(dni);
    } else if (action === 'activar_inscripciones') {
      const dni = e.parameter.dni;
      return jsonResponse(confirmarPagoYActivarInscripciones(dni));
    } else if (action === 'eliminar_usuario') {
      const dni = e.parameter.dni;
      return eliminarUsuarioPorDNI(dni);
    } else if (action === 'validar_dni') {
      const dni = e.parameter.dni;
      return validarDNI(dni);
    } else if (action === 'listar_inscritos') {
      const dia = e.parameter.dia;
      const deporte = e.parameter.deporte;
      return listarInscritos(dia, deporte);
    } else {
      return jsonResponse({ ok: false, error: 'Acción no válida' }, 400);
    }
    
  } catch (error) {
    return jsonResponse({ ok: false, error: error.toString() }, 500);
  }
}

/**
 * Maneja peticiones POST
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const token = data.token;
    
    // Validar token
    if (token !== API_TOKEN) {
      return jsonResponse({ ok: false, error: 'Token inválido' }, 401);
    }
    
    // Ejecutar acción
    if (data.action === 'inscribir_multiple') {
      return inscribirMultiple(data.alumno, data.horarios);
    } else if (data.action === 'registrar_pago') {
      return registrarPago(data.alumno, data.metodo_pago, data.horarios_seleccionados);
    } else {
      return jsonResponse({ ok: false, error: 'Acción no válida' }, 400);
    }
    
  } catch (error) {
    return jsonResponse({ ok: false, error: error.toString() }, 500);
  }
}

/**
 * Obtiene todos los horarios disponibles
 */
function getHorarios() {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sheet = ss.getSheetByName('HORARIOS');
    
    if (!sheet) {
      throw new Error('Hoja HORARIOS no encontrada');
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const horarios = [];
    
    // Procesar cada fila (empezar desde 1 para saltar headers)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      
      // Saltar filas vacías
      if (!row[0]) continue;
      
      const horario = {
        id: row[0]?.toString() || '',              // horario_id (columna A)
        deporte: row[1] || '',                     // deporte (columna B)
        dia: row[2] || '',                         // dia (columna C)
        hora_inicio: row[3] || '',                 // hora_inicio (columna D)
        hora_fin: row[4] || '',                    // hora_fin (columna E)
        cupo_maximo: parseInt(row[5]) || 0,       // cupo_maximo (columna F)
        cupos_ocupados: parseInt(row[6]) || 0,    // cupos_ocupados (columna G)
        activo: row[7] === 'activo' || row[7] === 'ACTIVO' || row[7] === 'Activo' || row[7] === true,  // estado (columna H)
        precio: parseFloat(row[8]) || 50.00,      // precio (columna I)
      };
      
      // Calcular cupos restantes
      horario.cupos_restantes = horario.cupo_maximo - horario.cupos_ocupados;
      
      horarios.push(horario);
    }
    
    return jsonResponse({ success: true, horarios: horarios });
    
  } catch (error) {
    return jsonResponse({ ok: false, error: error.toString() }, 500);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Valida si un DNI ya está registrado y verifica formato
 * Debe llamarse al inicio del formulario antes de que el usuario llene todos los datos
 */
function validarDNI(dni) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  
  try {
    // Validar formato de DNI (8 dígitos numéricos)
    if (!dni || dni.toString().length !== 8 || isNaN(dni)) {
      return jsonResponse({ 
        success: false, 
        valido: false,
        error: 'El DNI debe tener exactamente 8 dígitos numéricos' 
      }, 400);
    }
    
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const inscripcionesSheet = ss.getSheetByName('INSCRIPCIONES');
    
    if (!inscripcionesSheet) {
      throw new Error('Hoja INSCRIPCIONES no encontrada');
    }
    
    // Verificar si el DNI ya existe en INSCRIPCIONES
    const datosInscripciones = inscripcionesSheet.getDataRange().getValues();
    
    for (let i = 1; i < datosInscripciones.length; i++) {
      if (datosInscripciones[i][1]?.toString() === dni.toString()) {
        return jsonResponse({ 
          success: true, 
          valido: false,
          existe: true,
          error: 'El DNI ' + dni + ' ya está registrado. Un usuario no puede registrarse dos veces.' 
        });
      }
    }
    
    // DNI válido y no existe
    return jsonResponse({
      success: true,
      valido: true,
      existe: false,
      message: 'DNI disponible para registro'
    });
    
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() }, 500);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Inscribe a un alumno en múltiples horarios (máximo 2)
 */
function inscribirMultiple(alumno, horarios) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const horariosSheet = ss.getSheetByName('HORARIOS');
    const inscripcionesSheet = ss.getSheetByName('INSCRIPCIONES');
    
    if (!horariosSheet || !inscripcionesSheet) {
      throw new Error('Hojas HORARIOS o INSCRIPCIONES no encontradas');
    }
    
    // Validar máximo 2 horarios
   // if (horarios.length > 2) {
     // return jsonResponse({ success: false, error: 'Máximo 2 horarios permitidos' }, 400);
    //}
    
    // Obtener datos de horarios
    const horariosData = horariosSheet.getDataRange().getValues();
    const detalles = [];
    const horariosAActualizar = [];
    
    // Verificar cupos para cada horario
    for (let horarioId of horarios) {
      let encontrado = false;
      
      for (let i = 1; i < horariosData.length; i++) {
        if (horariosData[i][0]?.toString() === horarioId.toString()) {
          encontrado = true;
          const cupoMaximo = parseInt(horariosData[i][5]) || 0;
          const cuposOcupados = parseInt(horariosData[i][6]) || 0;
          const activo = horariosData[i][7] === 'activo' || horariosData[i][7] === 'ACTIVO' || horariosData[i][7] === 'Activo' || horariosData[i][7] === true;
          
          if (!activo) {
            detalles.push({ horario_id: horarioId, success: false, message: 'Horario inactivo' });
          } else if (cuposOcupados >= cupoMaximo) {
            detalles.push({ horario_id: horarioId, success: false, message: 'Sin cupos disponibles' });
          } else {
            detalles.push({ horario_id: horarioId, success: true });
            horariosAActualizar.push({ fila: i + 1, datos: horariosData[i] });
          }
          break;
        }
      }
      
      if (!encontrado) {
        detalles.push({ horario_id: horarioId, success: false, message: 'Horario no encontrado' });
      }
    }
    
    // Si alguno falló, retornar error
    const fallidos = detalles.filter(d => !d.success);
    if (fallidos.length > 0) {
      return jsonResponse({ 
        success: false, 
        error: 'Algunos horarios no están disponibles',
        detalles: detalles 
      }, 409);
    }
    
    // Generar código de operación
    const timestamp = new Date();
    const codigo = 'ACAD-' + Utilities.formatDate(timestamp, 'GMT-5', 'yyyyMMdd') + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    // Calcular monto total
    let montoTotal = 0;
    for (let horarioInfo of horariosAActualizar) {
      const precio = parseFloat(horarioInfo.datos[8]) || 50.00; // columna I (precio)
      montoTotal += precio;
    }
    
    // Validar formato de DNI (8 dígitos numéricos)
    if (!alumno.dni || alumno.dni.toString().length !== 8 || isNaN(alumno.dni)) {
      return jsonResponse({ 
        success: false, 
        error: 'El DNI debe tener exactamente 8 dígitos numéricos' 
      }, 400);
    }
    
    // NUEVA LÓGICA: Insertar UNA SOLA VEZ en INSCRIPCIONES (solo datos personales)
    // Verificar si el DNI ya existe en INSCRIPCIONES
    const datosInscripciones = inscripcionesSheet.getDataRange().getValues();
    let dniExiste = false;
    
    for (let i = 1; i < datosInscripciones.length; i++) {
      if (datosInscripciones[i][1]?.toString() === alumno.dni.toString()) { // Columna B (DNI)
        dniExiste = true;
        break;
      }
    }
    
    // Si el DNI ya existe, retornar error (no permitir duplicados)
    if (dniExiste) {
      return jsonResponse({ 
        success: false, 
        error: 'El DNI ' + alumno.dni + ' ya está registrado. Un usuario no puede registrarse dos veces.' 
      }, 409);
    }
    
    // Agregar UNA SOLA fila con datos personales
    const inscripcionPersonal = [
        timestamp,                          // A: timestamp
        alumno.dni,                        // B: dni
        alumno.nombres,                    // C: nombres
        alumno.apellidos,                  // D: apellidos
        alumno.fecha_nacimiento || '',     // E: fecha_nacimiento
        alumno.edad || '',                 // F: edad
        alumno.sexo || '',                 // G: sexo
        alumno.telefono,                   // H: telefono
        alumno.email || '',                // I: email
        alumno.apoderado || '',            // J: apoderado
        alumno.direccion || '',            // K: direccion
        alumno.seguro_tipo || '',          // L: seguro_tipo
        alumno.condicion_medica || '',     // M: condicion_medica
        alumno.telefono_apoderado || ''    // N: telefono_apoderado
      ];
      
      inscripcionesSheet.appendRow(inscripcionPersonal);
    
    // CREAR/ACTUALIZAR HOJAS POR DÍA DE LA SEMANA Y POR DEPORTE
    // Cada horario se registra en DOS lugares:
    // 1. Hoja del DÍA (LUNES, MARTES, etc.) - para ver quién tiene clases ese día
    // 2. Hoja del DEPORTE (FÚTBOL, VÓLEY, etc.) - para ver todos los de ese deporte
    
    for (let horarioInfo of horariosAActualizar) {
      const deporte = horarioInfo.datos[1];
      const dia = horarioInfo.datos[2];
      const horaInicio = horarioInfo.datos[3];
      const horaFin = horarioInfo.datos[4];
      const horarioId = horarioInfo.datos[0];
      
      // ===== 1. AGREGAR A HOJA DEL DÍA =====
      const nombreHojaDia = dia.toUpperCase(); // LUNES, MARTES, etc.
      let hojaDia = ss.getSheetByName(nombreHojaDia);
      
      // Crear hoja del día si no existe
      if (!hojaDia) {
        hojaDia = ss.insertSheet(nombreHojaDia);
        
        const encabezados = [
          'Timestamp',
          'DNI',
          'Nombres',
          'Apellidos',
          'Edad',
          'Sexo',
          'Teléfono',
          'Email',
          'Deporte',
          'Hora Inicio',
          'Hora Fin',
          'Código Registro',
          'Estado'
        ];
        hojaDia.appendRow(encabezados);
        
        const rangoEncabezado = hojaDia.getRange(1, 1, 1, encabezados.length);
        rangoEncabezado.setBackground('#1e88e5'); // Azul para días
        rangoEncabezado.setFontColor('#ffffff');
        rangoEncabezado.setFontWeight('bold');
      }
      
      // Agregar fila a hoja del día
      const filaDia = [
        timestamp,
        alumno.dni,
        alumno.nombres,
        alumno.apellidos,
        alumno.edad || '',
        alumno.sexo || '',
        alumno.telefono,
        alumno.email || '',
        deporte,
        horaInicio,
        horaFin,
        codigo,
        'pendiente_pago'
      ];
      
      hojaDia.appendRow(filaDia);
      
      // ===== 2. AGREGAR A HOJA DEL DEPORTE =====
      const nombreHojaDeporte = deporte.toUpperCase(); // FÚTBOL, VÓLEY, etc.
      let hojaDeporte = ss.getSheetByName(nombreHojaDeporte);
      
      // Crear hoja del deporte si no existe
      if (!hojaDeporte) {
        hojaDeporte = ss.insertSheet(nombreHojaDeporte);
        
        const encabezados = [
          'Timestamp',
          'DNI',
          'Nombres',
          'Apellidos',
          'Edad',
          'Sexo',
          'Teléfono',
          'Email',
          'Día',
          'Hora Inicio',
          'Hora Fin',
          'Código Registro',
          'Estado'
        ];
        hojaDeporte.appendRow(encabezados);
        
        const rangoEncabezado = hojaDeporte.getRange(1, 1, 1, encabezados.length);
        rangoEncabezado.setBackground('#43a047'); // Verde para deportes
        rangoEncabezado.setFontColor('#ffffff');
        rangoEncabezado.setFontWeight('bold');
      }
      
      // Agregar fila a hoja del deporte
      const filaDeporte = [
        timestamp,
        alumno.dni,
        alumno.nombres,
        alumno.apellidos,
        alumno.edad || '',
        alumno.sexo || '',
        alumno.telefono,
        alumno.email || '',
        dia,
        horaInicio,
        horaFin,
        codigo,
        'pendiente_pago'
      ];
      
      hojaDeporte.appendRow(filaDeporte);
      
      // ===== INCREMENTAR CUPOS OCUPADOS EN HORARIOS =====
      // Incrementar inmediatamente para que el cupo se reserve
      const cuposActuales = parseInt(horarioInfo.datos[6]) || 0;
      horariosSheet.getRange(horarioInfo.fila, 7).setValue(cuposActuales + 1);
    }
    
    // ===== AGREGAR REGISTRO EN PAGOS =====
    const pagosSheet = ss.getSheetByName('PAGOS');
    
    if (pagosSheet) {
      // Crear lista de IDs de horarios seleccionados
      const horariosIds = horariosAActualizar.map(h => h.datos[0]).join(',');
      
      // Concatenar apellidos
      const apellidosCompleto = `${alumno.apellido_paterno || ''} ${alumno.apellido_materno || ''}`.trim();
      
      // Registrar en PAGOS con estado "pendiente"
      const nuevoPago = [
        codigo,                          // A: id (código de operación)
        alumno.dni,                      // B: dni
        alumno.nombres,                  // C: nombres
        apellidosCompleto,               // D: apellidos
        alumno.telefono,                 // E: telefono
        montoTotal,                      // F: monto (suma de precios)
        'Yape',                          // G: metodo_pago (por defecto)
        'pendiente',                     // H: estado_pago (PENDIENTE hasta que admin confirme)
        timestamp                        // I: fecha_registro
      ];
      
      pagosSheet.appendRow(nuevoPago);
    }
    // ===== FIN REGISTRO EN PAGOS =====
    
    return jsonResponse({ 
      success: true, 
      codigo_operacion: codigo,
      inscripciones_exitosas: horariosAActualizar.length,
      total_intentos: horarios.length
    });
    
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() }, 500);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Obtiene las inscripciones de un alumno por DNI
 */
function getMisInscripciones(dni) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const inscripcionesSheet = ss.getSheetByName('INSCRIPCIONES');
    const horariosSheet = ss.getSheetByName('HORARIOS');
    
    if (!inscripcionesSheet || !horariosSheet) {
      throw new Error('Hojas no encontradas');
    }
    
    const inscripcionesData = inscripcionesSheet.getDataRange().getValues();
    const horariosData = horariosSheet.getDataRange().getValues();
    const inscripciones = [];
    
    // Buscar inscripciones del DNI (usando columnas reales)
    for (let i = 1; i < inscripcionesData.length; i++) {
      const row = inscripcionesData[i];
      
      // Comparar con columna B (dni)
      if (row[1]?.toString() === dni.toString()) {
        inscripciones.push({
          timestamp: row[0] || '',           // columna A
          alumno_dni: row[1] || '',          // columna B
          alumno_nombres: row[2] || '',      // columna C
          alumno_apellidos: row[3] || '',    // columna D
          telefono: row[7] || '',            // columna H
          email: row[8] || '',               // columna I
          horario_id: row[10] || '',         // columna K
          deporte: row[11] || '',            // columna L
          dia: row[12] || '',                // columna M
          hora_inicio: row[13] || '',        // columna N
          hora_fin: row[14] || '',           // columna O
          codigo_inscripcion: row[15] || '', // columna P
          estado: row[16] || 'activa',       // columna Q
          fecha_inscripcion: row[0] || ''    // columna A (timestamp) - mismo que timestamp
        });
      }
    }
    
    return jsonResponse({ success: true, inscripciones: inscripciones, total: inscripciones.length });
    
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() }, 500);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Retorna respuesta JSON
 */
function jsonResponse(data, statusCode) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Registra un pago pendiente en la hoja PAGOS
 */
function registrarPago(alumno, metodoPago, horariosSeleccionados) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const pagosSheet = ss.getSheetByName('PAGOS');
    const horariosSheet = ss.getSheetByName('HORARIOS');
    
    if (!pagosSheet) {
      throw new Error('Hoja PAGOS no encontrada');
    }
    
    if (!horariosSheet) {
      throw new Error('Hoja HORARIOS no encontrada');
    }
    
    // Convertir array de horarios a string separado por comas
    const horariosString = horariosSeleccionados ? horariosSeleccionados.join(',') : '';
    
    // Calcular monto total basado en los horarios seleccionados
    let montoTotal = 0;
    if (horariosSeleccionados && horariosSeleccionados.length > 0) {
      const horariosData = horariosSheet.getDataRange().getValues();
      for (let i = 1; i < horariosData.length; i++) {
        const horarioId = horariosData[i][0]?.toString();
        if (horariosSeleccionados.includes(horarioId)) {
          const precio = parseFloat(horariosData[i][8]) || 50.00; // columna I (precio)
          montoTotal += precio;
        }
      }
    }
    
    // Si no hay horarios o el monto es 0, usar monto por defecto
    if (montoTotal === 0) {
      montoTotal = 50.00;
    }
    
    // Verificar si ya existe un pago para este DNI
    const pagosData = pagosSheet.getDataRange().getValues();
    for (let i = 1; i < pagosData.length; i++) {
      if (pagosData[i][1]?.toString() === alumno.dni.toString()) {
        const estadoPago = pagosData[i][7]; // columna H (estado_pago)
        
        // Si ya tiene un pago confirmado, retornar éxito
        if (estadoPago === 'confirmado') {
          return jsonResponse({ 
            success: true, 
            existe: true,
            estado_pago: 'confirmado',
            message: 'Ya tienes un pago confirmado' 
          });
        }
        
        // Si tiene pago pendiente, actualizar método de pago y horarios
        if (estadoPago === 'pendiente') {
          pagosSheet.getRange(i + 1, 7).setValue(metodoPago); // actualizar metodo_pago
          pagosSheet.getRange(i + 1, 11).setValue(horariosString); // actualizar horarios_seleccionados
          return jsonResponse({ 
            success: true, 
            existe: true,
            estado_pago: 'pendiente',
            message: 'Pago pendiente actualizado' 
          });
        }
      }
    }
    
    // Generar ID único
    const timestamp = new Date();
    const id = 'PAG-' + Utilities.formatDate(timestamp, 'GMT-5', 'yyyyMMddHHmmss');
    
    // Registrar nuevo pago
    const nuevoPago = [
      id,                          // id (columna A)
      alumno.dni,                  // dni (columna B)
      alumno.nombres,              // nombres (columna C)
      alumno.apellidos,            // apellidos (columna D)
      alumno.telefono,             // telefono (columna E)
      montoTotal,                  // monto (columna F) - calculado dinámicamente
      metodoPago,                  // metodo_pago (columna G)
      'pendiente',                 // estado_pago (columna H)
      timestamp,                   // fecha_registro (columna I)
      '',                          // fecha_pago (columna J) - vacío hasta confirmación
      horariosString               // horarios_seleccionados (columna K)
    ];
    
    pagosSheet.appendRow(nuevoPago);
    
    return jsonResponse({ 
      success: true, 
      existe: false,
      id_pago: id,
      monto: montoTotal,
      estado_pago: 'pendiente',
      message: 'Pago registrado correctamente'
    });
    
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() }, 500);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Verifica el estado de pago de un DNI
 */
function verificarPago(dni) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const pagosSheet = ss.getSheetByName('PAGOS');
    
    if (!pagosSheet) {
      throw new Error('Hoja PAGOS no encontrada');
    }
    
    const pagosData = pagosSheet.getDataRange().getValues();
    
    // Buscar pago del DNI
    for (let i = 1; i < pagosData.length; i++) {
      if (pagosData[i][1]?.toString() === dni.toString()) {
        return jsonResponse({ 
          success: true,
          existe: true,
          pago: {
            id: pagosData[i][0],
            dni: pagosData[i][1],
            nombres: pagosData[i][2],
            apellidos: pagosData[i][3],
            monto: pagosData[i][5],
            metodo_pago: pagosData[i][6],
            estado_pago: pagosData[i][7],
            fecha_registro: pagosData[i][8]
          }
        });
      }
    }
    
    // No se encontró pago
    return jsonResponse({ 
      success: true,
      existe: false,
      message: 'No se encontró registro de pago para este DNI'
    });
    
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() }, 500);
  } finally {
    lock.releaseLock();
  }
}
/**
 * Función para que el ADMIN confirme un pago y active las inscripciones
 * Esta función se puede llamar manualmente o automáticamente cuando se edita el estado del pago
 */
function confirmarPagoYActivarInscripciones(dni) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const pagosSheet = ss.getSheetByName('PAGOS');
    const inscripcionesSheet = ss.getSheetByName('INSCRIPCIONES');
    const horariosSheet = ss.getSheetByName('HORARIOS');
    
    if (!pagosSheet || !inscripcionesSheet || !horariosSheet) {
      throw new Error('Hojas no encontradas');
    }
    
    // Buscar pago del DNI
    const pagosData = pagosSheet.getDataRange().getValues();
    let pagoConfirmado = false;
    
    for (let i = 1; i < pagosData.length; i++) {
      if (pagosData[i][1]?.toString() === dni.toString()) {
        const estadoPago = pagosData[i][7]; // columna H (estado_pago)
        if (estadoPago === 'confirmado') {
          pagoConfirmado = true;
          break;
        }
      }
    }
    
    if (!pagoConfirmado) {
      return { success: false, error: 'Pago no confirmado para este DNI' };
    }
    
    // Actualizar estado en TODAS las hojas de días y deportes
    actualizarEstadoEnHojas(dni.toString(), 'activa');
    
    // NOTA: Los cupos ya se incrementaron al hacer la inscripción
    // Solo cambiamos el estado a "activa"
    
    return { 
      success: true, 
      message: 'Inscripciones activadas correctamente para DNI: ' + dni
    };
    
  } catch (error) {
    return { success: false, error: error.toString() };
  } finally {
    lock.releaseLock();
  }
}

/**
 * Trigger automático cuando se edita la hoja PAGOS
 * Si el admin cambia el estado_pago a "confirmado", activa las inscripciones
 * Si el admin cambia el estado_pago a "pendiente", vuelve las inscripciones a pendiente_pago
 */
function onEditPagos(e) {
  try {
    const sheet = e.source.getActiveSheet();
    
    // Solo ejecutar si se edita la hoja PAGOS
    if (sheet.getName() !== 'PAGOS') {
      return;
    }
    
    const range = e.range;
    const row = range.getRow();
    const col = range.getColumn();
    
    // Solo ejecutar si se edita la columna H (estado_pago) - columna 8
    if (col !== 8 || row === 1) {
      return; // Ignorar header
    }
    
    const nuevoValor = range.getValue();
    const dni = sheet.getRange(row, 2).getValue(); // columna B (dni)
    
    if (!dni) return;
    
    // Si el nuevo valor es "confirmado", activar inscripciones
    if (nuevoValor === 'confirmado') {
      confirmarPagoYActivarInscripciones(dni.toString());
      
      SpreadsheetApp.getActiveSpreadsheet().toast(
        'Inscripciones activadas para DNI: ' + dni, 
        'Pago Confirmado', 
        5
      );
    }
    // Si el nuevo valor es "pendiente", volver a estado pendiente_pago
    else if (nuevoValor === 'pendiente') {
      actualizarEstadoEnHojas(dni.toString(), 'pendiente_pago');
      
      SpreadsheetApp.getActiveSpreadsheet().toast(
        'Inscripciones cambiadas a pendiente para DNI: ' + dni, 
        'Pago Pendiente', 
        5
      );
    }
    
  } catch (error) {
    Logger.log('Error en onEditPagos: ' + error.toString());
  }
}

/**
 * Elimina TODOS los registros de un usuario por DNI
 * Borra de: INSCRIPCIONES, PAGOS, todas las hojas de días, todas las hojas de deportes
 */
function eliminarUsuarioPorDNI(dni) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const horariosSheet = ss.getSheetByName('HORARIOS');
    let registrosEliminados = 0;
    let horariosAfectados = [];
    
    // 3. Obtener horarios del usuario antes de eliminar (desde hojas de días)
    const dias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
    for (const nombreDia of dias) {
      const hojaDia = ss.getSheetByName(nombreDia);
      if (!hojaDia) continue;
      
      const datosDia = hojaDia.getDataRange().getValues();
      for (let i = 1; i < datosDia.length; i++) {
        if (datosDia[i][1]?.toString() === dni.toString()) {
          // Buscar el horario_id correspondiente en HORARIOS
          const deporte = datosDia[i][8]; // columna I
          const dia = nombreDia;
          const horaInicio = datosDia[i][9]; // columna J
          
          // Buscar en HORARIOS para obtener el ID
          const horariosData = horariosSheet.getDataRange().getValues();
          for (let j = 1; j < horariosData.length; j++) {
            if (horariosData[j][1] === deporte && 
                horariosData[j][2].toUpperCase() === dia && 
                horariosData[j][3] === horaInicio) {
              horariosAfectados.push({
                id: horariosData[j][0],
                fila: j + 1
              });
              break;
            }
          }
        }
      }
    }
    
    // 1. Eliminar de INSCRIPCIONES
    const inscripcionesSheet = ss.getSheetByName('INSCRIPCIONES');
    if (inscripcionesSheet) {
      const datosInscripciones = inscripcionesSheet.getDataRange().getValues();
      for (let i = datosInscripciones.length - 1; i >= 1; i--) {
        if (datosInscripciones[i][1]?.toString() === dni.toString()) {
          inscripcionesSheet.deleteRow(i + 1);
          registrosEliminados++;
          break; // Solo debe haber uno
        }
      }
    }
    
    // 2. Eliminar de PAGOS
    const pagosSheet = ss.getSheetByName('PAGOS');
    if (pagosSheet) {
      const datosPagos = pagosSheet.getDataRange().getValues();
      for (let i = datosPagos.length - 1; i >= 1; i--) {
        if (datosPagos[i][1]?.toString() === dni.toString()) {
          pagosSheet.deleteRow(i + 1);
          registrosEliminados++;
        }
      }
    }
    
    // 3. Eliminar de hojas de DÍAS
    for (const nombreDia of dias) {
      const hojaDia = ss.getSheetByName(nombreDia);
      if (!hojaDia) continue;
      
      const datosDia = hojaDia.getDataRange().getValues();
      for (let i = datosDia.length - 1; i >= 1; i--) {
        if (datosDia[i][1]?.toString() === dni.toString()) {
          hojaDia.deleteRow(i + 1);
          registrosEliminados++;
        }
      }
    }
    
    // 4. Eliminar de hojas de DEPORTES
    const deportes = [
      'FÚTBOL', 'VÓLEY', 'BÁSQUET', 'FÚTBOL FEMENINO',
      'ENTRENAMIENTO FUNCIONAL ADULTOS', 'ENTRENAMIENTO FUNCIONAL MENORES',
      'ENTRENAMIENTO DE FUERZA Y TONIFICACIÓN MUSCULAR'
    ];
    for (const nombreDeporte of deportes) {
      const hojaDeporte = ss.getSheetByName(nombreDeporte);
      if (!hojaDeporte) continue;
      
      const datosDeporte = hojaDeporte.getDataRange().getValues();
      for (let i = datosDeporte.length - 1; i >= 1; i--) {
        if (datosDeporte[i][1]?.toString() === dni.toString()) {
          hojaDeporte.deleteRow(i + 1);
          registrosEliminados++;
        }
      }
    }
    
    // 5. DECREMENTAR CUPOS EN HORARIOS
    if (horariosSheet && horariosAfectados.length > 0) {
      for (const horario of horariosAfectados) {
        const cuposActuales = parseInt(horariosSheet.getRange(horario.fila, 7).getValue()) || 0;
        const nuevosCupos = Math.max(0, cuposActuales - 1); // No permitir negativos
        horariosSheet.getRange(horario.fila, 7).setValue(nuevosCupos);
      }
    }
    
    return jsonResponse({
      success: true,
      registros_eliminados: registrosEliminados,
      cupos_liberados: horariosAfectados.length,
      message: 'Usuario con DNI ' + dni + ' eliminado completamente del sistema'
    });
    
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() }, 500);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Actualiza el estado en las hojas de días y deportes cuando se confirma un pago
 */
function actualizarEstadoEnHojas(dni, nuevoEstado) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  
  // Actualizar en hojas de DÍAS (MIERCOLES sin tilde, SÁBADO con tilde según el Sheet)
  const dias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
  for (const nombreDia of dias) {
    const hojaDia = ss.getSheetByName(nombreDia);
    if (!hojaDia) continue;
    
    const datosDia = hojaDia.getDataRange().getValues();
    for (let i = 1; i < datosDia.length; i++) {
      if (datosDia[i][1]?.toString() === dni.toString()) {
        hojaDia.getRange(i + 1, 13).setValue(nuevoEstado); // Columna M (Estado)
      }
    }
  }
  
  // Actualizar en hojas de DEPORTES
  const deportes = [
    'FÚTBOL', 'VÓLEY', 'BÁSQUET', 'FÚTBOL FEMENINO',
    'ENTRENAMIENTO FUNCIONAL ADULTOS', 'ENTRENAMIENTO FUNCIONAL MENORES',
    'ENTRENAMIENTO DE FUERZA Y TONIFICACIÓN MUSCULAR'
  ];
  for (const nombreDeporte of deportes) {
    const hojaDeporte = ss.getSheetByName(nombreDeporte);
    if (!hojaDeporte) continue;
    
    const datosDeporte = hojaDeporte.getDataRange().getValues();
    for (let i = 1; i < datosDeporte.length; i++) {
      if (datosDeporte[i][1]?.toString() === dni.toString()) {
        hojaDeporte.getRange(i + 1, 13).setValue(nuevoEstado); // Columna M (Estado)
      }
    }
  }
}

/**
 * Consulta inscripción por DNI (para página de consulta pública)
 * Verifica que el pago esté confirmado antes de mostrar datos
 */
function consultarInscripcion(dni) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const pagosSheet = ss.getSheetByName('PAGOS');
    const inscripcionesSheet = ss.getSheetByName('INSCRIPCIONES');
    
    if (!pagosSheet || !inscripcionesSheet) {
      throw new Error('Hojas no encontradas');
    }
    
    // Buscar en PAGOS primero (verificar que el pago esté confirmado)
    const pagosData = pagosSheet.getDataRange().getValues();
    let pagoEncontrado = null;
    
    for (let i = 1; i < pagosData.length; i++) {
      const row = pagosData[i];
      
      if (row[1]?.toString() === dni.toString()) { // columna B (dni)
        pagoEncontrado = {
          id: row[0] || '',                    // A: id
          dni: row[1] || '',                   // B: dni
          nombres: row[2] || '',               // C: nombres
          apellidos: row[3] || '',             // D: apellidos
          telefono: row[4] || '',              // E: telefono
          monto: row[5] || 0,                  // F: monto
          metodo_pago: row[6] || '',           // G: metodo_pago
          estado_pago: row[7] || 'pendiente',  // H: estado_pago
          fecha_registro: row[8] || '',        // I: fecha_registro
          fecha_pago: row[9] || '',            // J: fecha_pago
          horarios_ids: row[10] || ''          // K: horarios_seleccionados
        };
        break;
      }
    }
    
    // Si no hay pago o no está confirmado
    if (!pagoEncontrado) {
      return jsonResponse({ 
        success: false, 
        error: 'No se encontró ninguna inscripción con ese DNI' 
      });
    }
    
    if (pagoEncontrado.estado_pago !== 'confirmado') {
      return jsonResponse({
        success: false,
        error: 'Su inscripción está pendiente de confirmación de pago',
        estado: pagoEncontrado.estado_pago
      });
    }
    
    // Buscar datos completos del alumno en INSCRIPCIONES
    const inscripcionesData = inscripcionesSheet.getDataRange().getValues();
    let datosCompletos = null;
    
    for (let i = 1; i < inscripcionesData.length; i++) {
      if (inscripcionesData[i][1]?.toString() === dni.toString()) {
        datosCompletos = {
          fecha_nacimiento: inscripcionesData[i][4] || '',
          edad: inscripcionesData[i][5] || '',
          sexo: inscripcionesData[i][6] || '',
          email: inscripcionesData[i][8] || '',
          apoderado: inscripcionesData[i][9] || '',
          direccion: inscripcionesData[i][10] || '',
          seguro_tipo: inscripcionesData[i][11] || '',
          condicion_medica: inscripcionesData[i][12] || '',
          telefono_apoderado: inscripcionesData[i][13] || ''
        };
        break;
      }
    }
    
    // Buscar en las hojas de días de la semana (MIERCOLES sin tilde, SÁBADO con tilde según el Sheet)
    // Estructura hojas días: A=Timestamp, B=DNI, C=Nombres, D=Apellidos, E=Edad, F=Sexo,
    //                        G=Teléfono, H=Email, I=Deporte, J=Hora Inicio, K=Hora Fin, L=Código, M=Estado
    const dias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
    const inscripciones = [];
    
    Logger.log('Buscando inscripciones para DNI: ' + dni);
    
    for (const nombreDia of dias) {
      const hojaDia = ss.getSheetByName(nombreDia);
      
      if (!hojaDia) continue;
      
      const datosDia = hojaDia.getDataRange().getValues();
      
      for (let i = 1; i < datosDia.length; i++) {
        const row = datosDia[i];
        const rowDni = row[1]?.toString(); // Columna B (DNI)
        const rowEstado = row[12]; // Columna M (Estado)
        
        if (rowDni === dni.toString() && rowEstado === 'activa') {
          // Convertir hora_inicio y hora_fin de número serial a formato HH:mm
          let horaInicio = '';
          let horaFin = '';
          
          if (row[9]) {
            const horaInicioDate = new Date(row[9]);
            if (!isNaN(horaInicioDate.getTime())) {
              horaInicio = Utilities.formatDate(horaInicioDate, 'America/Lima', 'HH:mm');
            }
          }
          
          if (row[10]) {
            const horaFinDate = new Date(row[10]);
            if (!isNaN(horaFinDate.getTime())) {
              horaFin = Utilities.formatDate(horaFinDate, 'America/Lima', 'HH:mm');
            }
          }
          
          inscripciones.push({
            horario_id: '', // No tenemos ID específico
            deporte: row[8] || '', // Columna I (Deporte)
            dia: nombreDia,
            hora_inicio: horaInicio,
            hora_fin: horaFin,
            codigo_inscripcion: row[11] || '', // Columna L (Código)
            estado: rowEstado
          });
        }
      }
    }
    
    Logger.log('Total inscripciones activas encontradas: ' + inscripciones.length);
    
    // Retornar datos completos
    return jsonResponse({
      success: true,
      alumno: {
        dni: pagoEncontrado.dni,
        nombres: pagoEncontrado.nombres,
        apellidos: pagoEncontrado.apellidos,
        telefono: pagoEncontrado.telefono,
        fecha_nacimiento: datosCompletos ? datosCompletos.fecha_nacimiento : '',
        edad: datosCompletos ? datosCompletos.edad : '',
        sexo: datosCompletos ? datosCompletos.sexo : '',
        email: datosCompletos ? datosCompletos.email : '',
        apoderado: datosCompletos ? datosCompletos.apoderado : '',
        direccion: datosCompletos ? datosCompletos.direccion : '',
        seguro_tipo: datosCompletos ? datosCompletos.seguro_tipo : '',
        condicion_medica: datosCompletos ? datosCompletos.condicion_medica : '',
        telefono_apoderado: datosCompletos ? datosCompletos.telefono_apoderado : ''
      },
      pago: {
        monto: pagoEncontrado.monto,
        metodo_pago: pagoEncontrado.metodo_pago,
        estado: pagoEncontrado.estado_pago,
        fecha_registro: pagoEncontrado.fecha_registro,
        fecha_pago: pagoEncontrado.fecha_pago,
        codigo: pagoEncontrado.id
      },
      horarios: inscripciones,
      total_inscripciones: inscripciones.length
    });
    
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() }, 500);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Lista todos los inscritos con filtros opcionales por día y/o deporte
 * Para el panel de administración
 */
function listarInscritos(dia, deporte) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const inscripciones = [];
    
    // Si se especifica DÍA (con o sin deporte), buscar SOLO en esa hoja
    if (dia) {
      const nombreHojaDia = dia.toUpperCase();
      const hojaDia = ss.getSheetByName(nombreHojaDia);
      
      if (hojaDia) {
        const datos = hojaDia.getDataRange().getValues();
        
        // Saltar header (fila 0)
        for (let i = 1; i < datos.length; i++) {
          const row = datos[i];
          
          // Saltar filas vacías (sin DNI)
          if (!row[1] || row[1].toString().trim() === '') {
            continue;
          }
          
          // Si también se filtra por deporte, verificar
          if (deporte && row[8]?.toUpperCase() !== deporte.toUpperCase()) {
            continue;
          }
          
          // Convertir hora_inicio y hora_fin de número serial a formato HH:MM
          let horaInicio = '';
          let horaFin = '';
          
          if (row[9]) {
            const horaInicioDate = new Date(row[9]);
            if (!isNaN(horaInicioDate.getTime())) {
              horaInicio = Utilities.formatDate(horaInicioDate, 'America/Lima', 'HH:mm');
            }
          }
          
          if (row[10]) {
            const horaFinDate = new Date(row[10]);
            if (!isNaN(horaFinDate.getTime())) {
              horaFin = Utilities.formatDate(horaFinDate, 'America/Lima', 'HH:mm');
            }
          }
          
          inscripciones.push({
            timestamp: row[0] || '',
            dni: row[1] || '',
            nombres: row[2] || '',
            apellidos: row[3] || '',
            edad: row[4] || '',
            sexo: row[5] || '',
            telefono: row[6] || '',
            email: row[7] || '',
            deporte: row[8] || '',
            hora_inicio: horaInicio,
            hora_fin: horaFin,
            codigo: row[11] || '',
            estado: row[12] || ''
          });
        }
      }
      
      // Si hay filtro de día, retornar SOLO los resultados de esa hoja (aunque esté vacío)
      return jsonResponse({
        success: true,
        inscritos: inscripciones,
        total: inscripciones.length,
        filtros: {
          dia: dia || null,
          deporte: deporte || null
        }
      });
    }
    // Si se especifica DEPORTE (sin día), buscar SOLO en esa hoja
    else if (deporte) {
      const nombreHojaDeporte = deporte.toUpperCase();
      const hojaDeporte = ss.getSheetByName(nombreHojaDeporte);
      
      if (hojaDeporte) {
        const datos = hojaDeporte.getDataRange().getValues();
        
        for (let i = 1; i < datos.length; i++) {
          const row = datos[i];
          
          // Saltar filas vacías (sin DNI)
          if (!row[1] || row[1].toString().trim() === '') {
            continue;
          }
          
          // Convertir hora_inicio y hora_fin de número serial a formato HH:MM
          let horaInicio = '';
          let horaFin = '';
          
          if (row[9]) {
            const horaInicioDate = new Date(row[9]);
            if (!isNaN(horaInicioDate.getTime())) {
              horaInicio = Utilities.formatDate(horaInicioDate, 'America/Lima', 'HH:mm');
            }
          }
          
          if (row[10]) {
            const horaFinDate = new Date(row[10]);
            if (!isNaN(horaFinDate.getTime())) {
              horaFin = Utilities.formatDate(horaFinDate, 'America/Lima', 'HH:mm');
            }
          }
          
          inscripciones.push({
            timestamp: row[0] || '',
            dni: row[1] || '',
            nombres: row[2] || '',
            apellidos: row[3] || '',
            edad: row[4] || '',
            sexo: row[5] || '',
            telefono: row[6] || '',
            email: row[7] || '',
            dia: row[8] || '',
            hora_inicio: horaInicio,
            hora_fin: horaFin,
            codigo: row[11] || '',
            estado: row[12] || ''
          });
        }
      }
      
      // Si hay filtro de deporte, retornar SOLO los resultados de esa hoja (aunque esté vacío)
      return jsonResponse({
        success: true,
        inscritos: inscripciones,
        total: inscripciones.length,
        filtros: {
          dia: dia || null,
          deporte: deporte || null
        }
      });
    }
    // Si NO hay filtros, listar TODOS desde las hojas de DÍAS
    else {
      const dias = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SÁBADO', 'DOMINGO'];
      const dnisProcesados = new Set(); // Para evitar duplicados
      
      for (const nombreDia of dias) {
        const hojaDia = ss.getSheetByName(nombreDia);
        if (!hojaDia) continue;
        
        const datos = hojaDia.getDataRange().getValues();
        
        for (let i = 1; i < datos.length; i++) {
          const row = datos[i];
          
          // Saltar filas vacías (sin DNI)
          if (!row[1] || row[1].toString().trim() === '') {
            continue;
          }
          
          const dni = row[1].toString();
          
          // Si ya procesamos este DNI, saltar
          if (dnisProcesados.has(dni)) {
            continue;
          }
          
          dnisProcesados.add(dni);
          
          // Convertir hora_inicio y hora_fin de número serial a formato HH:MM
          let horaInicio = '';
          let horaFin = '';
          
          if (row[9]) {
            const horaInicioDate = new Date(row[9]);
            if (!isNaN(horaInicioDate.getTime())) {
              horaInicio = Utilities.formatDate(horaInicioDate, 'America/Lima', 'HH:mm');
            }
          }
          
          if (row[10]) {
            const horaFinDate = new Date(row[10]);
            if (!isNaN(horaFinDate.getTime())) {
              horaFin = Utilities.formatDate(horaFinDate, 'America/Lima', 'HH:mm');
            }
          }
          
          inscripciones.push({
            timestamp: row[0] || '',
            dni: row[1] || '',
            nombres: row[2] || '',
            apellidos: row[3] || '',
            edad: row[4] || '',
            sexo: row[5] || '',
            telefono: row[6] || '',
            email: row[7] || '',
            deporte: row[8] || '',
            hora_inicio: horaInicio,
            hora_fin: horaFin,
            codigo: row[11] || '',
            estado: row[12] || ''
          });
        }
      }
    }
    
    return jsonResponse({
      success: true,
      inscritos: inscripciones,
      total: inscripciones.length,
      filtros: {
        dia: dia || null,
        deporte: deporte || null
      }
    });
    
  } catch (error) {
    return jsonResponse({ success: false, error: error.toString() }, 500);
  } finally {
    lock.releaseLock();
  }
}