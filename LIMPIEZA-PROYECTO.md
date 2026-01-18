# 🧹 PLAN DE LIMPIEZA Y ORGANIZACIÓN DEL PROYECTO JAGUARES

## 📋 Análisis del Proyecto

### Archivos Identificados

#### ✅ ARCHIVOS ESENCIALES (Mantener en raíz)
**HTML Frontend (Páginas principales)**
- `index.html` - Página principal
- `inscripcion.html` - Formulario de inscripción
- `consulta.html` - Consultar inscripciones
- `confirmacion.html` - Confirmación de pago
- `exito.html` - Página de éxito
- `seleccion-horarios.html` - Selección de horarios

**HTML Admin**
- `admin-login.html` - Login administrativo
- `admin-dashboard.html` - Dashboard admin
- `admin-crud.html` - CRUD de alumnos
- `admin-usuarios.html` - Gestión de usuarios
- `admin-panel.html` - Panel administrativo

**Servidor**
- `server/` - Carpeta del servidor backend
- `index.js` - **⚠️ LEGACY - Ya no se usa, el servidor está en server/**

**Archivos de Configuración**
- `package.json` - Dependencias raíz
- `package-lock.json` - Lock de dependencias
- `.gitignore` - Archivos ignorados por Git
- `.env.example` - Ejemplo de variables de entorno
- `docker-compose.yml` - Configuración Docker

**Documentación Importante**
- `README.md` - Documentación principal
- `LEEME-PRIMERO.md` - Guía de inicio
- `MANUAL-CLIENTE-JAGUARES.md` - Manual del cliente

---

#### 📁 ARCHIVOS A ORGANIZAR EN CARPETAS

**1. Documentación (crear carpeta `/docs`)**
- `CAMBIOS-MODAL-INACTIVO.md`
- `CAMBIOS-MODAL-RESPONSIVE.md`
- `CAMBIOS-PAGINA-PAGO.md`
- `CHECKLIST-DESPLIEGUE.md`
- `CHECKLIST-ENTREGA-CLIENTE.md`
- `CONFIGURAR-GOOGLE-SHEETS.md`
- `ESQUEMA-DB-MYSQL.md`
- `GUIA-CONFIGURACION-CLIENTE.md`
- `GUIA-OPTIMIZACION-ASYNC.md`
- `GUIA-RAPIDA-PRUEBAS.md`
- `IMPLEMENTACION-SUBIR-COMPROBANTE.md`
- `INSTRUCCIONES-ACTUALIZAR-APPS-SCRIPT.md`
- `README-CRONOGRAMA.md`
- `VISTA-PREVIA-PAGO.md`
- `MANUAL-CLIENTE-JAGUARES.docx`
- `CONTRATO-JAGUARES.html`

**2. Scripts de Prueba (crear carpeta `/tests`)**
- `test-carga-progresiva.js`
- `test-casos-extremos.js`
- `test-debug-detallado.js`
- `test-escenarios-reales.js`
- `test-inscripcion-debug.js`
- `test-login.js`
- `test-modales-validacion.js`
- `test-produccion-completo.js`
- `test-produccion-final.js` ⭐ Principal
- `test-seguridad-avanzado.js`
- `test-simulacion-real.js` ⭐ Principal
- `test-sistema-completo.js`
- `test-sistema-completo-imagenes.js`
- `test-stress-extremo.js`
- `test-stress-simple.js`
- `test-suite-completa.js`
- `test-validacion-duplicados.js`
- `test-validaciones.js`
- `ejecutar-todas-pruebas.js`
- `monitor-tiempo-real.js`
- `run-test-produccion.js`
- `verificacion-pre-despliegue.js`
- `artillery-helpers.js`
- `prueba-carga-realista.yml`
- `COMO-EJECUTAR-PRUEBAS.md`

**3. Reportes (crear carpeta `/reportes`)**
- `reporte-carga-2026.json`
- `reporte-produccion-2026-01-18T15-59-03.json`
- `reporte-produccion-2026-01-18T15-59-03.txt`
- `reporte-produccion-2026-01-18T16-00-28.json`
- `reporte-produccion-2026-01-18T16-00-28.txt`
- `reporte-produccion-2026-01-18T16-10-00.json`
- `reporte-produccion-2026-01-18T16-10-00.txt`
- `reporte-produccion-2026-01-18T16-12-14.json`
- `reporte-produccion-2026-01-18T16-12-14.txt`
- `reporte-produccion-2026-01-18T16-37-58.json`
- `reporte-produccion-2026-01-18T16-37-58.txt`
- `reporte-simulacion-real-2026-01-18-21-16-40.json`
- `reporte-simulacion-real-2026-01-18-21-21-41.json` ⭐ Más reciente
- `resultado-stress-simple.txt`
- `test-stress-output.txt`
- `REPORTE-FINAL-COMPLETO.md`
- `REPORTE-FINAL-PRODUCCION.md`
- `REPORTE-FINAL-VERIFICACION.md`
- `REPORTE-VERIFICACION-SISTEMA.md`
- `RESULTADO-PRUEBAS-FINALES.md`
- `RESUMEN-EJECUTIVO-SIMPLE.md`
- `RESUMEN-PRUEBAS.md`
- `RESUMEN-PRUEBAS-SIMULACION-REAL.md`
- `RESUMEN-VERIFICACION.md`
- `REVISION-COMPLETA.md`

**4. Datos y Scripts SQL (crear carpeta `/database`)**
- `actualizar-anos.sql`
- `agregar-horarios-faltantes.sql`
- `fix-columnas.sql`
- `init-db.sql`
- `insertar-categorias.js`
- `insertar-horarios-completos.sql`
- `APPS-SCRIPT-GOOGLE-SHEETS.gs`

**5. Archivos CSV/Datos (crear carpeta `/data`)**
- `Deportes - HORARIOS (1.csv`
- `HORARIOS-2026.csv`
- `HORARIOS-BD-COMPLETO.tsv`
- `HORARIOS.csv`
- `horarios-base-datos.txt`
- `horarios-exportados.csv`

**6. HTML de Prueba/Deprecated (crear carpeta `/deprecated`)**
- `admin.html` - Versión antigua
- `seleccion-horarios-new.html` - Nueva versión (mover si no se usa)

**7. Archivos Misceláneos**
- `loaderio-0478005442fcb231d87f9b2d9737de9.txt` - Verificación de Loader.io

---

#### ❌ ARCHIVOS A ELIMINAR

**Reportes Duplicados/Antiguos (mantener solo el más reciente de cada tipo)**
- `reporte-produccion-2026-01-18T15-59-03.*` ❌
- `reporte-produccion-2026-01-18T16-00-28.*` ❌
- `reporte-produccion-2026-01-18T16-10-00.*` ❌
- `reporte-produccion-2026-01-18T16-12-14.*` ❌
- `reporte-simulacion-real-2026-01-18-21-16-40.json` ❌ (mantener solo el más nuevo)

**Archivos Legacy**
- `index.js` ❌ - El servidor ahora está en `server/index.js`

---

## 🎯 ESTRUCTURA PROPUESTA

```
jaguares-funcional/
├── 📄 index.html
├── 📄 inscripcion.html
├── 📄 consulta.html
├── 📄 confirmacion.html
├── 📄 exito.html
├── 📄 seleccion-horarios.html
├── 📄 admin-login.html
├── 📄 admin-dashboard.html
├── 📄 admin-crud.html
├── 📄 admin-usuarios.html
├── 📄 admin-panel.html
├── 📄 README.md
├── 📄 LEEME-PRIMERO.md
├── 📄 MANUAL-CLIENTE-JAGUARES.md
├── 📄 package.json
├── 📄 .gitignore
├── 📄 .env.example
├── 📄 docker-compose.yml
│
├── 📁 server/              (Backend - ya organizado)
├── 📁 assets/              (Imágenes, logos)
├── 📁 css/                 (Estilos)
├── 📁 js/                  (Scripts frontend)
│
├── 📁 docs/                (NUEVA - Documentación)
│   ├── configuracion/
│   ├── cambios/
│   └── guias/
│
├── 📁 tests/               (NUEVA - Scripts de prueba)
│   ├── test-simulacion-real.js ⭐
│   ├── test-produccion-final.js ⭐
│   └── ... otros tests
│
├── 📁 reportes/            (NUEVA - Reportes de pruebas)
│   ├── actuales/
│   └── historicos/
│
├── 📁 database/            (NUEVA - SQL y datos)
│   ├── sql/
│   └── scripts/
│
├── 📁 data/                (NUEVA - CSVs y datos de horarios)
│
└── 📁 deprecated/          (NUEVA - Archivos antiguos por si acaso)
```

---

## ✅ ACCIONES A REALIZAR

1. ✅ Crear estructura de carpetas
2. ✅ Mover archivos a sus carpetas correspondientes
3. ✅ Eliminar reportes antiguos duplicados
4. ✅ Eliminar archivos legacy (index.js raíz)
5. ✅ Actualizar .gitignore
6. ✅ Crear README.md en cada carpeta nueva

---

## 🚀 COMANDOS PARA EJECUTAR

```powershell
# Ejecutar el script de limpieza
.\limpiar-proyecto.ps1
```

---

**Fecha**: 2026-01-18  
**Versión**: 1.0  
**Estado**: Propuesta - Pendiente de aprobación
