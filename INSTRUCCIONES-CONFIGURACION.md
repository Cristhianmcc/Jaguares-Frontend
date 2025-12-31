# ✅ INSTRUCCIONES PARA CONFIGURAR EL SISTEMA

## PROBLEMA IDENTIFICADO:
1. Las inscripciones tienen estado "pendiente_pago" pero el pago está "confirmado"
2. El script estaba leyendo columnas incorrectas (índices antiguos)
3. El trigger automático no está configurado

## SOLUCIONES IMPLEMENTADAS:

### 1. ✅ Script Actualizado
He corregido el archivo `scrip-desheet.gs` con los índices correctos de columnas:

**INSCRIPCIONES (estructura real):**
- A: timestamp
- B: dni
- C: nombres
- D: apellidos
- E: fecha_nacimiento
- F: edad
- G: sexo
- H: telefono
- I: email
- J: apoderado
- K: direccion
- L: seguro_tipo
- M: condicion_medica
- N: telefono_apoderado
- O: horario_id
- P: deporte
- Q: dia
- R: hora_inicio
- S: hora_fin
- T: codigo_registro
- **U: estado** ← Aquí debe cambiar de "pendiente_pago" a "activa"
- V: estado_pago
- W: metodo_pago
- X: monto
- Y: comprobante_url
- Z: fecha_pago

## 🔧 PASOS QUE DEBES SEGUIR AHORA:

### PASO 1: Actualizar el Script en Google Apps Script

1. Ve a tu Google Sheet de Deportes
2. Click en **Extensiones → Apps Script**
3. Reemplaza TODO el contenido del archivo `Código.gs` con el archivo actualizado `scrip-desheet.gs` que acabo de modificar
4. Click en **Guardar** (💾)
5. Click en **Implementar → Nueva implementación**
6. En "Tipo", selecciona **Aplicación web**
7. Descripción: "Sistema Academia - v2"
8. "Ejecutar como": **Yo**
9. "Acceso": **Cualquier persona**
10. Click en **Implementar**
11. Copia la nueva URL (se verá algo como: `https://script.google.com/macros/s/...`)

### PASO 2: Configurar el Trigger Automático (IMPORTANTE)

Este trigger hace que cuando cambies el estado del pago a "confirmado", automáticamente se activen las inscripciones.

1. En el editor de Apps Script, click en el icono del **reloj ⏰** (Activadores/Triggers) en la barra lateral izquierda
2. Click en **+ Añadir activador** (esquina inferior derecha)
3. Configura así:
   - **Función que se ejecuta**: `onEditPagos`
   - **Origen del evento**: `De hoja de cálculo`
   - **Tipo de evento**: `Al editar`
   - **Notificaciones por error**: `Notificarme inmediatamente`
4. Click en **Guardar**
5. Autoriza los permisos si te los pide

### PASO 3: Activar las Inscripciones del DNI 74651254 (SOLUCIÓN INMEDIATA)

Como ya tienes el pago confirmado pero las inscripciones siguen en "pendiente_pago", debes ejecutar manualmente la función:

**Opción A - Desde Apps Script (RECOMENDADO):**
1. En el editor de Apps Script
2. Arriba, donde dice "Seleccionar función", elige `confirmarPagoYActivarInscripciones`
3. Click en **Ejecutar** (▶️)
4. En la ventana que aparece, ingresa: `74651254`
5. Verás en los logs que se activaron las inscripciones

**Opción B - Cambiar manualmente el estado:**
1. Ve a la hoja **INSCRIPCIONES**
2. Busca todas las filas con DNI = 74651254 y estado = "pendiente_pago" (columna U)
3. Cambia manualmente "pendiente_pago" por "activa" en cada fila
4. ⚠️ **IMPORTANTE**: Después de hacer este cambio manual, el trigger funcionará automáticamente para futuros cambios

### PASO 4: Verificar que Funciona

1. Recarga la página de consulta: http://localhost:3000/consulta.html (o donde tengas tu frontend)
2. Ingresa el DNI: **74651254**
3. **Ahora deberías ver:**
   - ✅ Estado: CONFIRMADO (verde)
   - ✅ Datos del alumno completos
   - ✅ Lista de horarios inscritos (Fútbol, Vóley, etc.)

## 📝 PARA FUTURAS INSCRIPCIONES:

De ahora en adelante, el flujo será:

1. **Usuario se inscribe** → Las inscripciones se crean con estado "pendiente_pago" en INSCRIPCIONES
2. **Se crea el pago** → Se registra en PAGOS con estado "pendiente"
3. **Admin verifica el pago** → Cambia manualmente en PAGOS el estado de "pendiente" a "confirmado"
4. **Trigger automático** → Al detectar el cambio, ejecuta `confirmarPagoYActivarInscripciones()`
5. **Inscripciones se activan** → El estado cambia de "pendiente_pago" a "activa"
6. **Usuario consulta** → Ve sus horarios activos ✅

## ⚠️ SI ALGO NO FUNCIONA:

**Problema: No aparecen los horarios en la consulta**
- Verifica que en INSCRIPCIONES, columna U (estado) diga "activa" (no "pendiente_pago")
- Verifica que en PAGOS, columna H (estado_pago) diga "confirmado" (no "pendiente")

**Problema: El trigger no se ejecuta**
- Verifica que el trigger `onEditPagos` esté configurado correctamente
- Verifica que cuando edites la columna H en PAGOS, se dispare el trigger
- Revisa los logs en Apps Script: **Ver → Registros** para ver si hay errores

**Problema: Error al consultar**
- Verifica que la URL del Apps Script esté actualizada en tu archivo `.env`:
  ```
  APPS_SCRIPT_URL=https://script.google.com/macros/s/TU_NUEVA_URL/exec
  ```
- Reinicia el servidor Node.js después de cambiar el `.env`

## 🎯 RESUMEN RÁPIDO:

1. ✅ Copiar el script actualizado a Apps Script
2. ✅ Configurar el trigger `onEditPagos`
3. ✅ Ejecutar manualmente `confirmarPagoYActivarInscripciones("74651254")`
4. ✅ Recargar la página de consulta y ver los horarios

¿Listo? ¡Ahora deberías ver los horarios! 🎉
