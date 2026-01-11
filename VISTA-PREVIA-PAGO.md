# 🎨 Vista Previa - Nueva Página de Pago

## Estructura Visual de la Página

```
┌─────────────────────────────────────────────────────────────┐
│  ✅ ¡INSCRIPCIÓN EXITOSA!                                    │
│  Código: JGR-2025-0001                                       │
│  Alumno: Juan Pérez | DNI: 12345678                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  💳 MÉTODOS DE PAGO                                          │
│  ───────────────────────────────────────────────────────    │
│                                                              │
│  🟢 PLIN - PAGO INMEDIATO                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   🟢  PAGAR CON PLIN                                 │   │
│  │       Toca para ver QR                               │   │
│  │       📱 Escanear código QR                          │   │
│  └──────────────────────────────────────────────────────┘   │
│  Destinatario: Oscar Orosco (955 195 324)                   │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  🏦 TRANSFERENCIA BANCARIA                                   │
│                                                              │
│  🔵 BBVA CONTINENTAL                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Cuenta Ahorros: 001108140277791167   [📋 Copiar]   │   │
│  │  CCI: 01181400027779116714             [📋 Copiar]   │   │
│  │  👤 Oscar Orosco                                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  🔴 BCP (BANCO DE CRÉDITO)                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Cuenta Ahorros: 19407824258089        [📋 Copiar]   │   │
│  │  CCI: 00219410782425808997             [📋 Copiar]   │   │
│  │  👤 Oscar Orosco Aldonate                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  💵 PAGO EN EFECTIVO                                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ⚠️  IMPORTANTE                                       │   │
│  │  Las clases NO serán activadas hasta confirmar       │   │
│  │  el pago. Coordina por WhatsApp primero.             │   │
│  │                                                       │   │
│  │  [💬 Coordinar Pago por WhatsApp]                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ─────────────────────────────────────────────────────────  │
│                                                              │
│  💰 MONTO A PAGAR: S/. 260.00                                │
│  • Deportes: S/. 220.00                                      │
│  • Matrícula (2 deportes): S/. 40.00                         │
│                                                              │
│  💡 INSTRUCCIONES:                                           │
│  1. Elige tu método: Plin, Transferencia o Efectivo         │
│  2. Realiza el pago del monto indicado                       │
│  3. Toma captura del comprobante                             │
│  4. Envía por WhatsApp usando el botón de abajo              │
│                                                              │
│  [📥 Descargar Comprobante]  [📱 Enviar por WhatsApp]       │
│  [🔍 Consultar Estado]                                       │
│  [← Volver al Inicio]                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Colores y Estilos

### Plin (Verde)
- **Color principal:** `from-green-500 to-green-700`
- **Hover:** `from-green-600 to-green-800`
- **Logo:** `assets/plinlogo.png`
- **QR:** `assets/plin.jpg` (Oscar Orosco)

### BBVA (Azul)
- **Gradiente:** `from-blue-600 to-blue-800`
- **Banner:** `assets/banner-BBVA.jpg`
- **Botón copiar:** `bg-blue-600 hover:bg-blue-700`

### BCP (Rojo/Naranja)
- **Gradiente:** `from-red-600 to-orange-700`
- **Banner:** `assets/banner-bcp.jpg`
- **Botón copiar:** `bg-red-600 hover:bg-red-700`

### Efectivo (Ámbar/Advertencia)
- **Background:** `bg-amber-50 dark:bg-amber-900/10`
- **Border:** `border-amber-400`
- **Icono:** `⚠️` (warning symbol)
- **Botón WhatsApp:** `from-green-600 to-green-700`

---

## 📱 Responsive Breakpoints

### Mobile (< 640px)
```
┌─────────────────┐
│ PLIN (full)     │
│ [QR Button]     │
│                 │
│ BBVA            │
│ [Cuenta + Copy] │
│ [CCI + Copy]    │
│                 │
│ BCP             │
│ [Cuenta + Copy] │
│ [CCI + Copy]    │
│                 │
│ EFECTIVO        │
│ [WhatsApp]      │
└─────────────────┘
```

### Tablet/Desktop (> 640px)
```
┌─────────────────────────────┐
│ PLIN (centered, max-width)  │
│                             │
│ BBVA | BCP (side by side)   │
│                             │
│ EFECTIVO (full width)       │
└─────────────────────────────┘
```

---

## ⚡ Interacciones

### Botón Plin
1. **Hover:** Escala 1.02x + sombra más grande
2. **Click:** Abre modal con QR grande
3. **Modal:** Fondo oscuro + QR centrado + botón cerrar

### Botones Copiar
1. **Click:** Copia al portapapeles
2. **Feedback:** Cambia a verde "✓ Copiado" por 2 segundos
3. **Notificación:** Toast en esquina superior derecha

### Botón Efectivo
1. **Hover:** Escala 1.02x
2. **Click:** Abre WhatsApp con mensaje pre-llenado
3. **Mensaje incluye:**
   - Código de inscripción
   - Nombre y DNI
   - Lista de clases
   - Monto total
   - Texto: "Quiero coordinar pago en efectivo"

---

## 🔧 Funciones JavaScript

### `copiarCuenta(numeroCuenta, event)`
```javascript
// Copia número de cuenta
// Cambia botón a verde "Copiado"
// Muestra notificación
// Restaura después de 2 segundos
```

### `contactarWhatsAppEfectivo()`
```javascript
// Lee datos de localStorage
// Construye mensaje con:
//   - Código inscripción
//   - Nombre y DNI
//   - Lista de deportes
//   - Monto total
// Abre WhatsApp con mensaje
```

### `abrirModalQR(urlImagen, tipo)`
```javascript
// Abre modal fullscreen
// Muestra QR grande
// Botón descargar QR
// Click fuera cierra modal
// ESC cierra modal
```

---

## ✅ Ventajas del Nuevo Diseño

1. **Claridad:** Cada método de pago claramente separado
2. **Profesional:** Logos bancarios + gradientes corporativos
3. **UX:** Copy-to-clipboard + feedback visual inmediato
4. **Seguridad:** Advertencia clara para pagos en efectivo
5. **Mobile-first:** Diseño optimizado para smartphones
6. **Accesibilidad:** Alto contraste + iconos claros
7. **Dark mode:** Funciona perfectamente en modo oscuro

---

## 🚀 Mejoras vs Versión Anterior

| Aspecto | Antes | Ahora |
|---------|-------|-------|
| Métodos de pago | Yape + Plin | Plin + 2 Bancos + Efectivo |
| Copiar datos | Solo teléfono | Teléfono + 4 cuentas |
| Advertencias | Genérica | Específica por método |
| Logos | No | Sí (Plin + BBVA + BCP) |
| Responsive | Básico | Optimizado mobile-first |
| Feedback visual | Mínimo | Completo (colores + notif) |
| WhatsApp | 1 botón | 2 botones (pago + efectivo) |

---

## 📸 Capturas de Pantalla Simuladas

### Vista Desktop
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│           [Logo Plin]  PLIN - PAGO INMEDIATO                 │
│                                                              │
│              ┌──────────────────────┐                        │
│              │  🟢 PAGAR CON PLIN  │                        │
│              │  Toca para ver QR   │                        │
│              └──────────────────────┘                        │
│                                                              │
│  ┌─────────────────────┐  ┌─────────────────────┐          │
│  │   BBVA (Azul)       │  │   BCP (Rojo)        │          │
│  │ [Banner BBVA]       │  │ [Banner BCP]        │          │
│  │ Cuenta: ...167      │  │ Cuenta: ...089      │          │
│  │ CCI: ...714         │  │ CCI: ...997         │          │
│  └─────────────────────┘  └─────────────────────┘          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ⚠️  EFECTIVO - Coordina por WhatsApp primero       │   │
│  │  [💬 Contactar por WhatsApp]                        │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

### Vista Mobile
```
┌───────────────┐
│ [Plin Logo]   │
│               │
│  ┌─────────┐  │
│  │ 🟢 PLIN │  │
│  │ Ver QR  │  │
│  └─────────┘  │
│               │
│ ┌───────────┐ │
│ │ BBVA      │ │
│ │ [Banner]  │ │
│ │ Cta:...   │ │
│ │ [Copiar]  │ │
│ │ CCI:...   │ │
│ │ [Copiar]  │ │
│ └───────────┘ │
│               │
│ ┌───────────┐ │
│ │ BCP       │ │
│ │ [Banner]  │ │
│ │ Cta:...   │ │
│ │ [Copiar]  │ │
│ │ CCI:...   │ │
│ │ [Copiar]  │ │
│ └───────────┘ │
│               │
│ ⚠️ EFECTIVO   │
│ [WhatsApp]    │
└───────────────┘
```

---

## 🎯 Casos de Uso

### Caso 1: Usuario paga con Plin
1. ✅ Hace clic en "PAGAR CON PLIN"
2. ✅ Se abre modal con QR grande
3. ✅ Escanea con app Plin
4. ✅ Confirma pago
5. ✅ Toma captura
6. ✅ Envía por WhatsApp

### Caso 2: Usuario transfiere desde banco
1. ✅ Ve las 2 opciones: BBVA o BCP
2. ✅ Hace clic en "Copiar" cuenta
3. ✅ Abre su app bancaria
4. ✅ Pega el número copiado
5. ✅ Transfiere el monto
6. ✅ Envía comprobante por WhatsApp

### Caso 3: Usuario paga en efectivo
1. ✅ Lee advertencia: "Clases NO activadas"
2. ✅ Hace clic en "Coordinar por WhatsApp"
3. ✅ Se abre WhatsApp con mensaje pre-llenado
4. ✅ Coordina día/hora para pago
5. ✅ Va presencialmente
6. ✅ Paga en efectivo
7. ✅ Admin confirma pago en sistema

---

**Diseño:** Profesional y funcional ✨  
**UX:** Optimizada para conversión 🎯  
**Mobile:** Completamente responsive 📱  
**Accesibilidad:** Cumple estándares ♿  
**Estado:** ✅ Listo para producción
