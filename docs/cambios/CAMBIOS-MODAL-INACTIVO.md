# Mejoras al Modal de Membresía Inactiva

## 📋 Resumen
Se agregó funcionalidad para que los usuarios con membresía inactiva puedan **subir su comprobante de pago directamente desde el modal**, sin necesidad de usar WhatsApp u otros medios de contacto.

## ✨ Cambios Implementados

### 1. Interfaz de Usuario (consulta.html)
- ✅ Agregada **zona de subida de comprobante** dentro del modal de "MEMBRESÍA INACTIVA"
- ✅ Preview de la imagen antes de enviar
- ✅ Validación de formato (solo imágenes JPG/PNG)
- ✅ Validación de tamaño (máximo 5MB)
- ✅ Reorganización de opciones:
  - **OPCIÓN 1**: Subir comprobante directo (NUEVO)
  - **OPCIÓN 2**: Enviar por WhatsApp
  - **OPCIÓN 3**: Otros medios de contacto

### 2. Funcionalidad JavaScript (consulta-v2.js)

#### Nuevas Funciones:
1. **`previsualizarComprobanteInactivo(event)`**
   - Valida el archivo seleccionado
   - Muestra preview de la imagen
   - Habilita el botón de envío

2. **`subirComprobanteInactivo()`**
   - Convierte la imagen a Base64
   - Envía el comprobante al backend
   - Usa el endpoint `/api/pago-mensual` con parámetro especial
   - Muestra modal de éxito al completar

3. **`mostrarModalExitoComprobanteInactivo()`**
   - Modal de confirmación después de enviar
   - Informa al usuario sobre tiempos de verificación
   - Redirige al inicio después de cerrar

#### Funciones Modificadas:
- **`mostrarModalInactivo(dni)`**
  - Ahora guarda el DNI globalmente: `window.dniUsuarioInactivo`
  - Resetea el formulario de subida al abrir
  - Mantiene funcionalidad existente de WhatsApp

### 3. Estilos CSS (consulta.html)
- ✅ Agregadas animaciones `fade-in` y `scale-in`
- ✅ Mantiene animación existente `slideUp`

## 🔄 Flujo de Usuario

### Usuario Inactivo - Antes:
1. Ingresa DNI en consulta
2. Ve modal de "MEMBRESÍA INACTIVA"
3. Solo tiene opciones de contacto (WhatsApp, teléfono, email)
4. Debe enviar comprobante por medios externos

### Usuario Inactivo - Ahora:
1. Ingresa DNI en consulta
2. Ve modal de "MEMBRESÍA INACTIVA"
3. **Puede subir comprobante directamente** desde el modal
4. O alternativamente usar WhatsApp u otros medios
5. Al subir, recibe confirmación instantánea
6. El admin verifica el pago en 2-24 horas

## 🔌 Integración con Backend

### Endpoint Utilizado:
```javascript
POST /api/pago-mensual
```

### Datos Enviados:
```javascript
{
  dni: "12345678",
  alumno: "Usuario DNI 12345678",
  imagen: "data:image/jpeg;base64,...",
  nombre_archivo: "REGULARIZACION_12345678_comprobante.jpg",
  mes: "Regularización",
  monto: 0,
  esRegularizacion: true
}
```

### Comportamiento:
- El comprobante se sube a **Google Drive**
- Se registra en la tabla `pagos_mensuales` con estado **"pendiente"**
- El administrador lo verifica desde el panel admin
- Al aprobar, el usuario se reactiva automáticamente

## ✅ Beneficios

1. **Experiencia mejorada**: El usuario puede regularizar su pago sin salir de la página
2. **Menos fricción**: No necesita abrir WhatsApp ni escribir mensajes
3. **Más rápido**: Upload directo a Drive vs. enviar por chat
4. **Trazabilidad**: Queda registrado automáticamente en el sistema
5. **Consistencia**: Usa la misma infraestructura que el pago mensual regular

## 🛡️ Validaciones

- ✅ Solo acepta imágenes (JPG, PNG, etc.)
- ✅ Máximo 5MB de tamaño
- ✅ DNI debe estar presente
- ✅ Conversión correcta a Base64
- ✅ Manejo de errores completo

## 🧪 Pruebas Recomendadas

1. Ingresar DNI de usuario inactivo
2. Verificar que se muestre el modal correctamente
3. Intentar subir archivo no válido (PDF, muy grande, etc.)
4. Subir comprobante válido
5. Verificar que llegue a Drive
6. Verificar que se registre en MySQL
7. Confirmar modal de éxito
8. Verificar que el admin puede ver el comprobante

## 📝 Notas Importantes

- La funcionalidad NO rompe nada existente
- Mantiene todas las opciones anteriores (WhatsApp, teléfono, email)
- Usa la misma estructura que el pago mensual regular
- Compatible con el sistema de aprobación del admin
- El parámetro `esRegularizacion: true` es informativo (no afecta el backend actual)

## 🎨 Diseño

- Interfaz consistente con el resto del sistema
- Colores: Azul para upload, Verde para WhatsApp, Gris para otros contactos
- Animaciones suaves al mostrar modales
- Responsive (funciona en móvil y desktop)
- Dark mode compatible

---

**Fecha de implementación**: 18 de enero de 2026  
**Archivos modificados**:
- `consulta.html` (interfaz del modal)
- `js/consulta-v2.js` (lógica de subida)

**Sin cambios en backend** - Usa endpoints existentes
