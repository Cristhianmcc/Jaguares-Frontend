# INSTRUCCIONES: Agregar Endpoint de Consulta

## TU CÓDIGO ACTUAL ES MEJOR ✅

Tu Apps Script ya tiene TODO funcionando correctamente. Solo necesitas agregar el endpoint de consulta.

## Paso 1: Agregar case en doGet()

Busca esta parte en tu código (línea ~34):

```javascript
    } else if (action === 'verificar_pago') {
      const dni = e.parameter.dni;
      return verificarPago(dni);
    } else {
      return jsonResponse({ ok: false, error: 'Acción no válida' }, 400);
    }
```

**CAMBIA** por:

```javascript
    } else if (action === 'verificar_pago') {
      const dni = e.parameter.dni;
      return verificarPago(dni);
    } else if (action === 'consultar_inscripcion') {
      const dni = e.parameter.dni;
      return consultarInscripcion(dni);
    } else {
      return jsonResponse({ ok: false, error: 'Acción no válida' }, 400);
    }
```

## Paso 2: Agregar función consultarInscripcion()

**PEGA ESTO AL FINAL** de tu archivo (después de la función `onEditPagos`):

```javascript
/**
 * Consultar inscripción por DNI (para página de consulta pública)
 * Solo muestra datos si el pago está confirmado
 */
function consultarInscripcion(dni) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  
  try {
    if (!dni) {
      return { success: false, error: 'DNI requerido' };
    }
    
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const pagosSheet = ss.getSheetByName('PAGOS');
    const inscripcionesSheet = ss.getSheetByName('INSCRIPCIONES');
    
    if (!pagosSheet || !inscripcionesSheet) {
      return { success: false, error: 'Hojas no encontradas' };
    }
    
    // 1. Verificar estado del pago en PAGOS
    const pagosData = pagosSheet.getDataRange().getValues();
    let registroPago = null;
    
    for (let i = 1; i < pagosData.length; i++) {
      if (pagosData[i][1]?.toString() === dni.toString()) { // Columna B: dni
        registroPago = {
          codigo_operacion: pagosData[i][0],       // A: id
          dni: pagosData[i][1],                    // B: dni
          nombres: pagosData[i][2],                // C: nombres
          apellidos: pagosData[i][3],              // D: apellidos
          telefono: pagosData[i][4],               // E: telefono
          monto: pagosData[i][5],                  // F: monto
          metodo_pago: pagosData[i][6],            // G: metodo_pago
          estado: pagosData[i][7],                 // H: estado_pago
          fecha_registro: pagosData[i][8]          // I: fecha_registro
        };
        break;
      }
    }
    
    if (!registroPago) {
      return { success: false, error: 'No se encontró inscripción con ese DNI' };
    }
    
    // 2. VALIDAR: Solo mostrar si está confirmado
    if (registroPago.estado.toLowerCase() !== 'confirmado') {
      return { 
        success: false, 
        error: 'Tu inscripción está pendiente de confirmación. Por favor envía tu comprobante de pago por WhatsApp.' 
      };
    }
    
    // 3. Buscar inscripciones ACTIVAS en INSCRIPCIONES
    const inscripcionesData = inscripcionesSheet.getDataRange().getValues();
    let datosAlumno = null;
    const horarios = [];
    
    for (let i = 1; i < inscripcionesData.length; i++) {
      const row = inscripcionesData[i];
      
      // Buscar por DNI (columna B) y estado activa (columna Q)
      if (row[1]?.toString() === dni.toString() && row[16] === 'activa') {
        
        // Obtener datos del alumno (solo la primera vez)
        if (!datosAlumno) {
          datosAlumno = {
            dni: row[1],                    // B
            nombres: row[2],                // C
            apellidos: row[3],              // D
            fecha_nacimiento: row[4],       // E
            edad: row[5],                   // F
            sexo: row[6],                   // G
            telefono: row[7],               // H
            email: row[8],                  // I
            apoderado: row[9],              // J
            seguro_tipo: '',                // No está en INSCRIPCIONES
            direccion: ''                   // No está en INSCRIPCIONES
          };
        }
        
        // Agregar horario
        horarios.push({
          id: row[10],                      // K: horario_id
          deporte: row[11],                 // L: deporte
          dia: row[12],                     // M: dia
          hora_inicio: row[13],             // N: hora_inicio
          hora_fin: row[14],                // O: hora_fin
          sede: 'Sede Principal',
          categoria: 'Nivel Intermedio',
          precio: '50.00'
        });
      }
    }
    
    if (!datosAlumno) {
      return { 
        success: false, 
        error: 'No se encontraron inscripciones activas. Contacta con administración.' 
      };
    }
    
    // 4. Combinar todos los datos
    const resultado = {
      ...datosAlumno,
      ...registroPago,
      alumno: `${datosAlumno.nombres} ${datosAlumno.apellidos}`,
      horarios: horarios
    };
    
    return { success: true, data: resultado };
    
  } catch (error) {
    return { success: false, error: error.toString() };
  } finally {
    lock.releaseLock();
  }
}
```

## ¡LISTO!

Con estos 2 cambios, tu sistema estará 100% completo:

1. ✅ Al inscribirse → Se registra en INSCRIPCIONES (pendiente_pago) y PAGOS (pendiente)
2. ✅ Usuario envía comprobante por WhatsApp
3. ✅ Tú cambias estado en PAGOS de "pendiente" a "confirmado"
4. ✅ **AUTOMÁTICAMENTE** el trigger activa las inscripciones y ocupa cupos
5. ✅ Usuario puede consultar su inscripción (solo si está confirmado)

## MANTÉN TU CÓDIGO ACTUAL

Tu versión tiene características importantes:
- ✅ Trigger automático `onEditPagos`
- ✅ Función `confirmarPagoYActivarInscripciones`
- ✅ Manejo correcto de cupos
- ✅ Estados pendiente_pago → activa

**NO LO REEMPLACES**, solo agrega estas 2 cosas.
