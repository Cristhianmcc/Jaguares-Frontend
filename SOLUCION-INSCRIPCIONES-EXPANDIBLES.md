# Solución: Expandir Inscripciones por DNI

## Problema Actual
- `listarInscritos()` agrupa horarios por DNI (línea 1284: `inscritosPorDNI = {}`)
- Si liss (DNI 65641549) tiene 3 inscripciones en INSCRIPCIONES, solo aparece 1 vez

## Solución Correcta
Cambiar la lógica para:
1. **Backend**: Retornar TODAS las filas de INSCRIPCIONES como objetos separados
2. **Frontend**: Agrupar visualmente por DNI y mostrar expansión

## Cambios Necesarios

### 1. Apps Script: Nueva función `listarInscripcionesPorFilas()`
```javascript
function listarInscripcionesPorFilas() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetInscripciones = ss.getSheetByName('INSCRIPCIONES');
  
  // Leer TODAS las filas de INSCRIPCIONES
  const data = sheetInscripciones.getDataRange().getValues();
  const headers = data[0];
  
  const inscripciones = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    inscripciones.push({
      timestamp: row[0],
      dni: row[1],
      nombres: row[2],
      apellidos: row[3],
      // ... resto de campos
      estado_usuario: row[colEstadoUsuario] || 'activo',
      fila: i + 1  // Número de fila para identificación única
    });
  }
  
  // Agrupar por DNI SOLO PARA CONTAR
  const porDNI = {};
  inscripciones.forEach(ins => {
    if (!porDNI[ins.dni]) porDNI[ins.dni] = [];
    porDNI[ins.dni].push(ins);
  });
  
  return { success: true, inscripciones, porDNI };
}
```

### 2. Frontend: Renderizar con expansión
```javascript
function renderizarTabla(data) {
  const { inscripciones, porDNI } = data;
  
  // Para cada DNI único
  Object.keys(porDNI).forEach(dni => {
    const insDelDNI = porDNI[dni];
    
    // Fila principal (primera inscripción)
    const primera = insDelDNI[0];
    const tieneMas = insDelDNI.length > 1;
    
    const row = crearFila(primera, tieneMas);
    tablaBody.appendChild(row);
    
    // Filas expandibles (resto de inscripciones)
    if (tieneMas) {
      for (let i = 1; i < insDelDNI.length; i++) {
        const rowExtra = crearFilaExpandible(insDelDNI[i], dni);
        tablaBody.appendChild(rowExtra);
      }
    }
  });
}
```

### 3. Desactivar inscripción específica
```javascript
function desactivarInscripcionEspecifica(dni, timestamp) {
  // Backend busca la fila con ese DNI y timestamp
  // Cambia SOLO esa fila a inactivo
}
```

## Resultado Visual
```
DNI        NOMBRES    APELLIDOS    ...    ACCIONES
🔽 65641549 [+2]  liss    liss liss        🚫 (desactiva TODAS)
   ↳ INACTIVO     liss    liss liss        ✅ (reactiva esta)
   ↳              liss    liss liss        🚫 (desactiva esta)
```

Cada fila expandible corresponde a UNA fila de INSCRIPCIONES.
