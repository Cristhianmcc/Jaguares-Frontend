# 🐆 Sistema de Inscripciones - Academia Jaguares (FRONTEND)

Frontend del sistema web de inscripciones deportivas con integración de pagos y gestión de horarios.

## 🚀 Características

- ✅ Inscripción de alumnos con validación de datos
- ✅ Selección inteligente de horarios con filtrado por edad
- ✅ **Validación en tiempo real** de horarios duplicados
- ✅ Detección automática de conflictos de horario
- ✅ Sistema de pagos integrado con Culqi
- ✅ Consulta de inscripciones por DNI
- ✅ Diseño responsivo y moderno
- ✅ Conexión con backend Node.js

## 📋 Requisitos

### Frontend
- Navegador moderno (Chrome, Firefox, Safari, Edge)
- Live Server o similar (para desarrollo local)
- Backend funcionando (ver repositorio backend)

### Backend (Repositorio separado)
- Node.js 18+ con Express
- Google Apps Script configurado
- Cuenta de Culqi para pagos

## 🛠️ Instalación Local

### 1. Clonar este repositorio (Frontend)
```bash
git clone https://github.com/tu-usuario/jaguares-funcional.git
cd jaguares-funcional
```

### 2. Configurar URL del backend
Editar `js/api-service.js` línea 1-2:
```javascript
// Para desarrollo local
const API_BASE_URL = 'http://localhost:3002';

// Para producción
// const API_BASE_URL = 'https://jaguares-backend.onrender.com';
```

### 3. Configurar Google Apps Script
1. Abrir `APPS-SCRIPT-GOOGLE-SHEETS.gs`
2. Copiar contenido
3. Ir a [script.google.com](https://script.google.com)
4. Crear nuevo proyecto
5. Pegar código
6. Configurar `TOKEN_SECRETO` en el script
7. Desplegar como Web App
8. Copiar URL del script

### 4. Abrir frontend con Live Server
1. Abrir proyecto en VS Code
2. Instalar extensión "Live Server"
3. Click derecho en `index.html` > "Open with Live Server"
4. O simplemente abrir `index.html` en el navegador

El frontend estará en `http://127.0.0.1:5500` (o similar)

## 🧪 Pruebas

**Nota:** Las pruebas están en el repositorio del backend.

### Pruebas manuales del frontend:
1. Abrir `inscripcion.html` - Llenar formulario
2. Seleccionar horarios - Verificar filtrado por edad
3. Intentar seleccionar horario duplicado - Debe mostrar error
4. Intentar horarios con conflicto - Debe mostrar advertencia
5. Confirmar y proceder a pago

## 📦 Estructura del Proyecto

```
jaguares-funcional/ (FRONTEND)
├── index.html              # Página principal
├── inscripcion.html        # Paso 1: Datos del alumno
├── seleccion-horarios.html # Paso 2: Selección de horarios
├── confirmacion.html       # Paso 3: Confirmación y pago
├── exito.html             # Página de éxito
├── consulta.html          # Consultar inscripciones
├── js/
│   ├── api-service.js     # Cliente API (conecta con backend)
│   ├── inscripcion.js     # Lógica de inscripción
│   ├── seleccion-horarios.js  # Selección con validaciones
│   ├── confirmacion.js    # Confirmación y pago
│   └── ...
├── css/
│   └── styles.css         # Estilos principales
├── assets/                # Imágenes y recursos
├── APPS-SCRIPT-GOOGLE-SHEETS.gs  # Script para Google Sheets
└── *.md                   # Documentación
```

**Backend (repositorio separado):**
- `index.js` - Servidor Express con caché
- `package.json` - Dependencias Node.js
- `.env` - Variables de entorno

## 🚀 Despliegue

### Frontend (GitHub Pages o Netlify)

**Opción 1: GitHub Pages**
**Opción 1: GitHub Pages**
1. Ir a Settings > Pages en GitHub
2. Seleccionar branch `main`
3. Guardar

**Opción 2: Netlify**
1. Arrastrar carpeta a Netlify
2. O conectar repositorio GitHub

**URL Frontend:** https://tu-usuario.github.io/jaguares-funcional

### Backend (Ver repositorio backend)
El backend debe estar desplegado en Render.com u otro servicio.

**URL Backend:** https://jaguares-backend.onrender.com

⚠️ **Importante:** Actualizar `API_BASE_URL` en `js/api-service.js` con la URL del backend en producción.

Ver [CHECKLIST-DESPLIEGUE.md](CHECKLIST-DESPLIEGUE.md) para más detalles.

## 📚 Documentación

- [CHECKLIST-DESPLIEGUE.md](CHECKLIST-DESPLIEGUE.md) - Lista completa de verificación
- [MANUAL-CLIENTE-JAGUARES.md](MANUAL-CLIENTE-JAGUARES.md) - Manual de usuario
- [GUIA-CONFIGURACION-CLIENTE.md](GUIA-CONFIGURACION-CLIENTE.md) - Guía de configuración

## 🆕 Últimas Actualizaciones

### v2.0 (Enero 2026)
- ✨ **Validación de duplicados en tiempo real**
- ✨ **Detección de conflictos de horario**
- ✨ Nuevos deportes: MAMAS FIT, GYM JUVENIL, ENTRENAMIENTO FUNCIONAL MIXTO
- 🚀 Sistema de caché mejorado
- 🎨 UI/UX renovada
- 🧪 Suite completa de pruebas

## 🐛 Problemas Conocidos

- Render Free tier: El servidor puede tardar ~30s en el primer request después de inactividad
- Google Sheets: Límite de 100 requests/100s

## 📞 Soporte

Para soporte técnico:
- Email: soporte@academiajaguares.com
- GitHub Issues: [Reportar un problema](https://github.com/tu-usuario/jaguares-funcional/issues)

## 📄 Licencia

Copyright © 2026 Academia Jaguares. Todos los derechos reservados.

## 🙏 Agradecimientos

- [Culqi](https://culqi.com) por la integración de pagos
- [Render](https://render.com) por el hosting
- [Google Apps Script](https://script.google.com) por el backend

---

**Estado:** ✅ Listo para Producción  
**Última actualización:** Enero 10, 2026
