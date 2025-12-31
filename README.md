# JAGUARES - Sistema de Inscripciones
## Centro de Alto Rendimiento Deportivo

Sistema web completo de inscripciones con diseño profesional y conexión a Google Sheets.

---

## 🚀 Características

✅ **Diseño Moderno**: Interfaz profesional con Tailwind CSS  
✅ **Formulario Multi-Paso**: Inscripción guiada en 3 pasos  
✅ **Selección de Horarios**: Sistema intuitivo con validaciones  
✅ **Google Sheets Integration**: Almacenamiento en tiempo real  
✅ **Responsive**: Funciona perfecto en móviles y desktop  
✅ **Dark Mode**: Soporte para modo oscuro  

---

## 📁 Estructura del Proyecto

```
jaguares-funcional/
├── index.html                  # Página principal
├── inscripcion.html           # Formulario de datos del alumno
├── seleccion-horarios.html    # Selector de horarios
├── confirmacion.html          # Resumen y confirmación
├── exito.html                 # Página de éxito
├── js/
│   ├── api-service.js         # Servicio de API y utilidades
│   ├── main.js                # Script principal
│   ├── inscripcion.js         # Lógica del formulario
│   ├── seleccion-horarios.js  # Lógica de horarios
│   ├── confirmacion.js        # Lógica de confirmación
│   └── exito.js               # Lógica página de éxito
├── css/
├── assets/
└── .env                       # Variables de entorno (crear)
```

---

## 🛠️ Instalación

### 1. Configurar el Backend

El backend ya está funcionando en el proyecto `campamento - copia (2)`. Solo necesitas:

```bash
# Navegar al proyecto backend existente
cd "campamento - copia (2)"

# El servidor ya tiene las rutas necesarias
# Solo asegúrate que esté corriendo:
npm start
```

El servidor debe estar en: `http://localhost:3002`

### 2. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura tus credenciales:

```bash
cd jaguares-funcional
cp .env.example .env
```

Edita `.env` con tus valores:

```env
APPS_SCRIPT_URL=https://script.google.com/macros/s/TU_ID/exec
APPS_SCRIPT_TOKEN=tu_token_secreto
PORT=3002
```

### 3. Configurar la URL del Backend

En `js/api-service.js`, línea 8, actualiza la URL si es necesario:

```javascript
const API_CONFIG = {
    baseUrl: 'http://localhost:3002', // Cambiar en producción
    // ...
};
```

### 4. Servir los Archivos HTML

Necesitas un servidor web local. Opciones:

**Opción A: Live Server (VS Code)**
1. Instala la extensión "Live Server"
2. Click derecho en `index.html` > "Open with Live Server"

**Opción B: Python**
```bash
# Python 3
python -m http.server 8000

# Abre: http://localhost:8000
```

**Opción C: Node.js http-server**
```bash
npx http-server -p 8000
```

---

## 📊 Configuración de Google Sheets

### Estructura de Hojas Requeridas

Tu Google Sheet debe tener estas hojas:

#### 1. **Hoja: Horarios**
Columnas:
- id
- deporte
- dia
- hora_inicio
- hora_fin
- cupo_maximo
- cupos_ocupados
- cupos_restantes
- activo
- precio
- sede
- nivel
- entrenador

#### 2. **Hoja: Inscripciones**
Columnas:
- id
- codigo_inscripcion
- alumno_dni
- alumno_nombres
- alumno_apellidos
- fecha_nacimiento
- sexo
- telefono
- direccion
- email
- seguro_tipo
- condicion_medica
- apoderado
- telefono_apoderado
- horario_id
- deporte
- dia
- hora_inicio
- hora_fin
- fecha_inscripcion
- estado

### Apps Script

El código de Apps Script ya está en tu proyecto actual en:
`campamento - copia (2)/APPS_SCRIPT_CODIGO.js`

Solo copia ese código a tu Google Apps Script.

---

## 🎯 Uso del Sistema

### Flujo de Inscripción

1. **Inicio**: Usuario ingresa al sistema
2. **Paso 1 - Datos**: Completa información personal
3. **Paso 2 - Horarios**: Selecciona horarios (máx 2 por día)
4. **Paso 3 - Confirmación**: Revisa y confirma
5. **Éxito**: Recibe código de inscripción

### Validaciones Automáticas

- ✅ DNI de 8 dígitos
- ✅ Campos obligatorios
- ✅ Datos de apoderado si es menor de edad
- ✅ Máximo 2 horarios por día
- ✅ Verificación de cupos disponibles
- ✅ Validación de email

---

## 🔧 Configuración Avanzada

### Cambiar WhatsApp

En `js/exito.js`, línea 113:

```javascript
const whatsappNumero = '51955195324'; // Tu número
```

### Personalizar Deportes

Los deportes se cargan dinámicamente desde Google Sheets.
Para agregar/modificar, edita la hoja "Horarios".

### Modificar Precios

Los precios también vienen de Google Sheets.
Actualiza la columna "precio" en la hoja "Horarios".

---

## 🚀 Despliegue a Producción

### Opción 1: Netlify

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

Configura variables de entorno en Netlify:
- `APPS_SCRIPT_URL`
- `APPS_SCRIPT_TOKEN`

### Opción 2: Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

### Opción 3: GitHub Pages

1. Sube el proyecto a GitHub
2. Ve a Settings > Pages
3. Selecciona la rama y carpeta
4. GitHub Pages servirá los HTML

**⚠️ Importante**: Actualiza `baseUrl` en `api-service.js` con tu URL de producción.

---

## 📱 Integración WhatsApp

El sistema genera mensajes automáticos para WhatsApp con:
- Código de inscripción
- Datos del alumno
- Horarios seleccionados
- Precio total

---

## 🐛 Solución de Problemas

### Error: "No se pueden cargar los horarios"

**Causa**: Backend no está corriendo o URL incorrecta

**Solución**:
```bash
# Verifica que el backend esté corriendo
cd "campamento - copia (2)"
npm start

# Verifica la URL en api-service.js
```

### Error: "DNI inválido"

**Causa**: DNI debe tener exactamente 8 dígitos

**Solución**: Ingresa un DNI válido de 8 números

### Error: "Máximo 2 horarios por día"

**Causa**: Ya seleccionaste 2 horarios para ese día

**Solución**: Deselecciona uno antes de agregar otro

### Error CORS

**Causa**: Peticiones bloqueadas por política CORS

**Solución**: Asegúrate que el backend tenga configurado CORS:
```javascript
app.use(cors());
```

---

## 📚 API Endpoints Utilizados

```
GET  /api/horarios                    # Obtener horarios
POST /api/inscribir-multiple          # Inscribir alumno
GET  /api/mis-inscripciones/:dni      # Consultar inscripciones
POST /api/registrar-pago              # Registrar pago
GET  /api/verificar-pago/:dni         # Verificar estado pago
```

---

## 🎨 Personalización del Diseño

### Colores (Tailwind)

En cada HTML, sección `tailwind-config`:

```javascript
colors: {
    primary: { 
        DEFAULT: '#C59D5F',  // Dorado principal
        dark: '#B08546',     // Dorado oscuro
        light: '#E3C58E'     // Dorado claro
    },
    // ...
}
```

### Tipografía

Usando Google Fonts:
- **Heading**: Lexend (Sans-serif moderna)
- **Body**: Lexend

---

## 📞 Soporte

Para dudas o problemas:
- WhatsApp: +51 955 195 324
- Email: contacto@jaguares.pe

---

## 📄 Licencia

© 2025 JAGUARES - Centro de Alto Rendimiento. Todos los derechos reservados.

---

## 🎉 ¡Listo!

Tu sistema de inscripciones JAGUARES está completo y funcional.

**Siguiente paso**: Prueba el flujo completo:
1. Inicia el backend
2. Abre `index.html` en tu navegador
3. Completa una inscripción de prueba
4. Verifica que los datos lleguen a Google Sheets

¡Éxito con tu academia deportiva! 🐆⚽🏀🏐
