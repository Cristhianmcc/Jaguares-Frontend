# 📝 Instrucciones para Actualizar Apps Script

## ⚠️ IMPORTANTE: Debes actualizar el código en Google Apps Script

Se realizaron cambios críticos en el archivo `APPS-SCRIPT-GOOGLE-SHEETS.gs` que **DEBES copiar a Google Apps Script** para que funcione correctamente.

## 🔧 Cambios Realizados

### 1. Modal de Usuario Inactivo
- ✅ Ajustado el tamaño del modal (ahora es más ancho: `max-w-2xl`)
- ✅ Agregado scroll interno para ver todo el contenido
- ✅ Mejor distribución de las 3 opciones
- ✅ Footer sticky para que el botón "Cerrar" siempre esté visible

### 2. Función `subirPagoMensual` (APPS SCRIPT)
**Problema anterior:**
- Creaba una carpeta nueva con formato `Usuario_DNI_23122132`
- No usaba la carpeta existente del usuario

**Solución implementada:**
- Ahora **busca la carpeta existente** del usuario por DNI
- Usa la estructura ya creada: `pulga_pulga_pulga_35454946/Pagos_Mensuales`
- Si no encuentra la carpeta del usuario, devuelve un error claro

### 3. Nueva Función `buscarCarpetaPorDNI`
Esta función busca la carpeta del usuario que termine con `_DNI`:
- Ejemplo: `pulga_pulga_pulga_35454946` para DNI 35454946
- Es compatible con el formato actual de carpetas

## 📋 Pasos para Actualizar Apps Script

### 1. Abrir Google Apps Script
1. Ve a tu Google Sheet de JAGUARES
2. Clic en **Extensiones** → **Apps Script**

### 2. Copiar el Código Actualizado
1. Abre el archivo `APPS-SCRIPT-GOOGLE-SHEETS.gs` de este proyecto
2. Copia **TODO** el contenido
3. Pégalo en el editor de Apps Script (reemplazando todo el código anterior)

### 3. Guardar y Desplegar
1. Clic en **💾 Guardar** (o Ctrl+S)
2. Clic en **Implementar** → **Administrar implementaciones**
3. Clic en el ícono de **lápiz** (editar) de la implementación activa
4. Selecciona **Nueva versión** en el dropdown
5. Clic en **Implementar**
6. Copia la URL (si cambió) y actualízala en tu `.env`

## 🧪 Verificar que Funciona

### Prueba 1: Subir Pago Mensual (Usuario Activo)
1. Ingresa como usuario activo en `consulta.html`
2. Ve a la sección "Pago Mensual"
3. Sube un comprobante
4. Verifica en Drive que se guardó en: `JAGUARES - Documentos/nombre_usuario_DNI/Pagos_Mensuales/`

### Prueba 2: Regularizar Pago (Usuario Inactivo)
1. Ingresa con DNI de usuario inactivo
2. Se abrirá el modal con las 3 opciones
3. Sube un comprobante desde "OPCIÓN 1"
4. Verifica que se guardó en la **carpeta existente** del usuario

## ✅ Resultado Esperado

Antes:
```
JAGUARES - Documentos/
  ├── pulga_pulga_pulga_35454946/
  │   └── Pagos_Mensuales/
  └── Usuario_DNI_35454946/  ❌ CARPETA DUPLICADA (PROBLEMA)
      └── Pagos_Mensuales/
```

Después:
```
JAGUARES - Documentos/
  └── pulga_pulga_pulga_35454946/
      └── Pagos_Mensuales/
          ├── PAGO_enero-de-2026_2026-01-18_123456.jpg
          ├── PAGO_febrero-de-2026_2026-02-15_234567.jpg
          └── PAGO_Regularización_2026-01-18_345678.jpg ✅
```

## 🔍 Logs para Debug

Después de actualizar, puedes ver los logs en Apps Script:
1. **Ver** → **Registros** (en el editor de Apps Script)
2. Busca mensajes como:
   - `✅ Carpeta encontrada: pulga_pulga_pulga_35454946`
   - `✅ Pago mensual subido a Drive`

Si ves:
- `⚠️ No se encontró carpeta para DNI: XXXXX` → El usuario no tiene carpeta (no está inscrito)

## ⚡ Cambios en el Frontend

Los cambios en `consulta.html` y `consulta-v2.js` ya están aplicados y funcionando.

## 📝 Notas Importantes

1. **NO** elimines las carpetas duplicadas manualmente sin verificar qué archivos tienen
2. La función nueva es **retrocompatible** con la estructura actual
3. Si un usuario no tiene carpeta, recibirá un mensaje claro de error
4. Los usuarios que se inscriban desde ahora en adelante tendrán sus pagos mensuales en la carpeta correcta

---

**Fecha de actualización**: 18 de enero de 2026  
**Archivos modificados**:
- ✅ `consulta.html` (modal mejorado)
- ✅ `APPS-SCRIPT-GOOGLE-SHEETS.gs` (función corregida)

**Siguiente paso**: Copiar el código de Apps Script a Google 🚀
