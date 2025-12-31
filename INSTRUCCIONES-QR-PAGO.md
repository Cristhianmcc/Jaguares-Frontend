# 📱 Instrucciones para Agregar QR de Pago

## ¿Qué necesitas hacer?

Para que la página de éxito muestre correctamente el QR de pago de Yape/Plin, necesitas agregar la imagen del QR en la carpeta `assets`.

## Pasos:

### 1️⃣ Generar tu QR de Yape o Plin

**Opción A - Yape:**
1. Abre tu app de Yape
2. Ve a "Recibir dinero" o "Cobrar"
3. Activa "Yape QR"
4. Toma captura de pantalla del QR generado

**Opción B - Plin:**
1. Abre tu app de Plin
2. Ve a "Mi código QR"
3. Toma captura de pantalla del QR

**Opción C - Generar QR online:**
1. Ve a https://qr-code-generator.com/
2. Selecciona "Texto"
3. Ingresa tu número: `955195324`
4. Descarga el QR en formato PNG

### 2️⃣ Guardar el QR en el proyecto

1. Copia tu imagen del QR
2. Pégala en la carpeta: `c:\Users\Cris\Desktop\jaguares-funcional\assets\`
3. Renombra la imagen como: **`qr-yape-plin.png`**

### 3️⃣ Verificar

1. Abre la página de éxito después de hacer una inscripción
2. Deberías ver el QR en la sección "DATOS DE PAGO"
3. Si no aparece, verás un placeholder morado/verde con el ícono de QR

## 📋 Resumen de lo agregado

✅ **Sección de pago con QR** en la página de éxito  
✅ **Botón para copiar el número** de celular (955 195 324)  
✅ **Monto total a pagar** calculado automáticamente  
✅ **Instrucciones paso a paso** para completar el pago  
✅ **Integración con WhatsApp** para enviar comprobante  

## 🎨 Diseño

La sección incluye:
- QR code centrado (248x248px)
- Número de celular con botón copiar
- Monto total destacado
- Instrucciones claras en 4 pasos
- Diseño responsive (mobile-first)
- Modo oscuro compatible

## 🔄 Si no tienes el QR ahora

No te preocupes, el sistema mostrará un placeholder elegante con:
- Gradiente morado-verde
- Ícono de QR grande
- Texto: "Escanea con Yape o Plin"

Los usuarios aún podrán:
- Copiar el número de celular
- Ver el monto a pagar
- Enviar mensaje por WhatsApp

---

**Nota:** El número configurado actualmente es **955 195 324**. Si necesitas cambiarlo, edita:
- Línea 109 en `js/exito.js` (display number)
- Línea 293 en `js/exito.js` (función copiarNumero)
