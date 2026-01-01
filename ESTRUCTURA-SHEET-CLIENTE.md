# 📊 Estructura del Google Sheet para CLIENTES

## ✅ Lo que SÍ tienes que copiar (obligatorio):

### 🔹 Hoja 1: **HORARIOS**
Esta hoja tiene las columnas fijas. Los horarios se agregan manualmente o por script.

**Columnas requeridas (en este orden):**

| Columna | Nombre         | Tipo    | Descripción                    | Ejemplo              |
|---------|----------------|---------|--------------------------------|----------------------|
| **A**   | horario_id     | Texto   | ID único del horario           | FUTBOL-LUN-09-10     |
| **B**   | deporte        | Texto   | Nombre del deporte             | Fútbol               |
| **C**   | dia            | Texto   | Día de la semana               | Lunes                |
| **D**   | hora_inicio    | Texto   | Hora de inicio                 | 09:00                |
| **E**   | hora_fin       | Texto   | Hora de fin                    | 10:00                |
| **F**   | cupo_maximo    | Número  | Cupos totales disponibles      | 20                   |
| **G**   | cupos_ocupados | Número  | Cupos ya ocupados (empieza en 0)| 0                   |
| **H**   | estado         | Texto   | "activo" o "inactivo"          | activo               |
| **I**   | precio         | Número  | Precio por clase en soles      | 50                   |

**Ejemplo de fila:**
```
FUTBOL-LUN-09-10 | Fútbol | Lunes | 09:00 | 10:00 | 20 | 0 | activo | 50
```

**⚠️ IMPORTANTE:**
- La columna **G (cupos_ocupados)** empieza en 0 y se actualiza automáticamente
- El script incrementa/decrementa esta columna automáticamente

---

### 🔹 Hoja 2: **INSCRIPCIONES**
Esta hoja se llena automáticamente cuando alguien se inscribe.

**Columnas requeridas (en este orden):**

| Columna | Nombre              | Tipo     | Descripción                      |
|---------|---------------------|----------|----------------------------------|
| **A**   | inscripcion_id      | Texto    | ID único (auto-generado)         |
| **B**   | dni                 | Texto    | DNI del alumno                   |
| **C**   | nombre_completo     | Texto    | Nombre del alumno                |
| **D**   | edad                | Número   | Edad del alumno                  |
| **E**   | genero              | Texto    | Masculino/Femenino               |
| **F**   | telefono            | Texto    | Teléfono de contacto             |
| **G**   | email               | Texto    | Email del alumno                 |
| **H**   | direccion           | Texto    | Dirección del alumno             |
| **I**   | tutor_nombre        | Texto    | Nombre del tutor (si es menor)   |
| **J**   | tutor_telefono      | Texto    | Teléfono del tutor               |
| **K**   | horario_id          | Texto    | ID del horario seleccionado      |
| **L**   | deporte             | Texto    | Deporte inscrito                 |
| **M**   | dia                 | Texto    | Día de la clase                  |
| **N**   | hora_inicio         | Texto    | Hora de inicio                   |
| **O**   | hora_fin            | Texto    | Hora de fin                      |
| **P**   | fecha_inscripcion   | Fecha    | Fecha de inscripción             |
| **Q**   | estado_pago         | Texto    | pendiente/confirmado/rechazado   |
| **R**   | monto_pago          | Número   | Monto a pagar                    |
| **S**   | fecha_pago          | Fecha    | Fecha del pago                   |
| **T**   | metodo_pago         | Texto    | YAPE/PLIN                        |
| **U**   | codigo_operacion    | Texto    | Código del pago                  |
| **V**   | estado_inscripcion  | Texto    | activa/pendiente/cancelada       |

**⚠️ NO escribas nada aquí manualmente - se llena solo con las inscripciones**

---

## 📝 Pasos para crear el Sheet del CLIENTE:

### ✅ OPCIÓN 1: Copiar tu Sheet completo (MÁS FÁCIL)

1. **Abre tu Google Sheet actual** (el de Jaguares)
2. **File → Make a copy**
3. **Nombra el nuevo:** "Academia Cliente 1"
4. **Borra solo los datos de INSCRIPCIONES** (no las columnas, solo las filas con datos)
5. **En HORARIOS:**
   - Opción A: Deja los horarios si el cliente usa los mismos
   - Opción B: Borra las filas de horarios y deja que el cliente agregue los suyos
   - ⚠️ **IMPORTANTE: Resetea cupos_ocupados a 0** en cada fila

6. **Comparte el Sheet con el cliente** (o con su cuenta)

✅ **Listo - ya tiene la estructura perfecta**

---

### ✅ OPCIÓN 2: Crear Sheet desde cero (manual)

1. **Crear nuevo Google Sheet**
2. **Renombrar las hojas:**
   - Hoja 1 → **HORARIOS**
   - Hoja 2 → **INSCRIPCIONES**

3. **En hoja HORARIOS, agregar columnas:**
   ```
   A1: horario_id
   B1: deporte
   C1: dia
   D1: hora_inicio
   E1: hora_fin
   F1: cupo_maximo
   G1: cupos_ocupados
   H1: estado
   I1: precio
   ```

4. **En hoja INSCRIPCIONES, agregar columnas:**
   ```
   A1: inscripcion_id
   B1: dni
   C1: nombre_completo
   ... (todas las 22 columnas de la tabla de arriba)
   ```

5. **Agregar horarios manualmente** (o dejar vacío)

---

## 🎨 ¿Los DEPORTES y DÍAS se crean automáticamente?

### ❌ NO - Los horarios se agregan manualmente

Los deportes y días NO se crean automáticamente. Tienes que:

1. **Agregar cada horario manualmente** en la hoja HORARIOS
2. O usar un script para generar horarios masivamente
3. El cliente decide qué deportes ofrecer y en qué horarios

**Ejemplo:**
Si el cliente ofrece:
- Fútbol los Lunes y Miércoles de 9-10 y 10-11
- Vóley los Martes y Jueves de 15-16 y 16-17

Debes agregar 8 filas en HORARIOS:
```
FUTBOL-LUN-09-10  | Fútbol | Lunes     | 09:00 | 10:00 | 20 | 0 | activo | 50
FUTBOL-LUN-10-11  | Fútbol | Lunes     | 10:00 | 11:00 | 20 | 0 | activo | 50
FUTBOL-MIE-09-10  | Fútbol | Miércoles | 09:00 | 10:00 | 20 | 0 | activo | 50
...
VOLEY-MAR-15-16   | Vóley  | Martes    | 15:00 | 16:00 | 20 | 0 | activo | 50
...
```

---

## 🛠️ Script opcional para generar horarios masivamente

Si el cliente tiene muchos horarios, puedes usar este script:

```javascript
function generarHorariosMasivos() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('HORARIOS');
  
  const deportes = ['Fútbol', 'Vóley', 'Básquet'];
  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
  const horarios = [
    ['09:00', '10:00'],
    ['10:00', '11:00'],
    ['15:00', '16:00'],
    ['16:00', '17:00']
  ];
  
  let fila = 2; // Empezar después del header
  
  deportes.forEach(deporte => {
    dias.forEach(dia => {
      horarios.forEach(([inicio, fin]) => {
        const id = `${deporte.toUpperCase()}-${dia.substring(0,3).toUpperCase()}-${inicio.replace(':','')}-${fin.replace(':','')}`;
        
        sheet.getRange(fila, 1, 1, 9).setValues([[
          id,           // horario_id
          deporte,      // deporte
          dia,          // dia
          inicio,       // hora_inicio
          fin,          // hora_fin
          20,           // cupo_maximo
          0,            // cupos_ocupados
          'activo',     // estado
          50            // precio
        ]]);
        
        fila++;
      });
    });
  });
  
  SpreadsheetApp.getUi().alert('Horarios generados exitosamente!');
}
```

Copia este script en Extensions → Apps Script y ejecútalo.

---

## ✅ Checklist para el Sheet del cliente:

- [ ] Copiar tu Sheet o crear uno nuevo
- [ ] Verificar que tiene 2 hojas: HORARIOS e INSCRIPCIONES
- [ ] HORARIOS tiene las 9 columnas correctas
- [ ] INSCRIPCIONES tiene las 22 columnas correctas
- [ ] Agregar los horarios específicos del cliente
- [ ] Todos los cupos_ocupados están en 0
- [ ] Todos los estados están en "activo"
- [ ] Copiar el código Apps Script (scrip-desheet.gs)
- [ ] Cambiar el SHEET_ID en el script
- [ ] Cambiar el API_TOKEN en el script
- [ ] Hacer deployment del Apps Script
- [ ] Compartir el Sheet con el cliente

---

## 🎯 Resumen:

**SÍ tienes que copiar:**
- ✅ Estructura de las 2 hojas (HORARIOS e INSCRIPCIONES)
- ✅ Nombres de las columnas
- ✅ Código del Apps Script

**NO se crea automáticamente:**
- ❌ Deportes
- ❌ Días  
- ❌ Horarios

**Debes agregar manualmente:**
- ✏️ Cada horario que el cliente ofrecerá
- ✏️ Deportes específicos del cliente
- ✏️ Días y horas que trabajarán

¿Necesitas que te cree un template vacío o el script para generar horarios masivamente?
