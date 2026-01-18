# SISTEMA DE INSCRIPCIONES - ACADEMIA JAGUARES
## Manual del Cliente

---

## 📋 ÍNDICE

1. [¿Qué es el Sistema JAGUARES?](#qué-es-el-sistema-jaguares)
2. [¿Qué Hace el Sistema?](#qué-hace-el-sistema)
3. [Componentes del Sistema](#componentes-del-sistema)
4. [Flujo de Inscripción del Alumno](#flujo-de-inscripción-del-alumno)
5. [Panel de Administración](#panel-de-administración)
6. [Consulta de Estado](#consulta-de-estado)
7. [Sistema de Matrículas](#sistema-de-matrículas)
8. [Google Sheets - Tu Base de Datos](#google-sheets---tu-base-de-datos)
9. [Configuración de Horarios](#configuración-de-horarios)
10. [Preguntas Frecuentes](#preguntas-frecuentes)
11. [Solución de Problemas](#solución-de-problemas)
12. [Contacto y Soporte](#contacto-y-soporte)

---

## 🎯 ¿QUÉ ES EL SISTEMA JAGUARES?

El Sistema JAGUARES es una plataforma web completa para gestionar las inscripciones de tu academia deportiva de forma automática. 

**En palabras simples:** Es como tener un empleado digital que trabaja 24/7 recibiendo inscripciones, organizando horarios, guardando pagos y manteniéndote informado de todo.

### Beneficios para tu Academia:
- ✅ Los alumnos se inscriben solos, sin necesidad de que tú estés presente
- ✅ Todo queda registrado automáticamente en Google Sheets
- ✅ Los pagos se verifican con comprobantes en Google Drive
- ✅ Puedes ver y confirmar inscripciones desde cualquier lugar
- ✅ Funciona en computadoras, tablets y celulares

---

## 💡 ¿QUÉ HACE EL SISTEMA?

### Para los Alumnos:
1. **Inscribirse en línea** - Completan un formulario con sus datos personales
2. **Elegir horarios** - Ven los horarios disponibles filtrados por su edad
3. **Subir comprobante** - Toman foto de su pago y la suben al sistema
4. **Consultar estado** - Pueden revisar si su inscripción fue confirmada

### Para Ti (Administrador):
1. **Ver todas las inscripciones** - Lista de todos los alumnos registrados
2. **Confirmar pagos** - Revisar comprobantes y aprobar inscripciones
3. **Gestionar alumnos** - Ver datos completos, horarios y documentos
4. **Controlar el acceso** - Sistema protegido con contraseña

---

## 🧩 COMPONENTES DEL SISTEMA

Tu sistema tiene 3 partes principales que trabajan juntas:

### 1. **Sitio Web (escuelajaguares.netlify.app)**
Es lo que ven los alumnos. Incluye:
- Página de inicio (información de la academia)
- Formulario de inscripción
- Selector de horarios
- Página de confirmación y pago
- Consulta de estado

### 2. **Google Sheets**
Tu base de datos. Guarda todo en hojas de cálculo:
- **HORARIOS**: Todos los horarios disponibles con precios y edades
- **INSCRIPCIONES**: Registro de cada alumno inscrito
- **PAGOS**: Estado de pagos y comprobantes
- **Hojas por día/deporte**: Organización de alumnos por actividad

### 3. **Google Drive**
Tu archivo digital. Almacena:
- Comprobantes de pago (Yape/Plin/transferencias)
- Fotos de DNI (frente y reverso)
- Fotos tamaño carnet de los alumnos

---

## 📝 FLUJO DE INSCRIPCIÓN DEL ALUMNO

### Paso 1: Datos Personales
El alumno ingresa a tu sitio web y completa:
- DNI
- Nombres y apellidos
- Fecha de nacimiento (el sistema calcula su edad automáticamente)
- Sexo
- Teléfono
- Email
- Dirección
- Datos del apoderado (si es menor de edad)
- Tipo de seguro
- Condiciones médicas (si tiene alguna)
- Sube 3 fotos: DNI frente, DNI reverso, foto tamaño carnet

**Importante:** El sistema valida que el DNI tenga 8 dígitos y verifica que no esté ya registrado.

### Paso 2: Selección de Horarios
El sistema muestra SOLO los horarios apropiados para la edad del alumno:
- Si tiene 12 años, verá deportes para categoría Sub-14
- Si tiene 18+ años, verá Mamá Fit y deportes adultos
- Cada horario muestra: día, hora, precio mensual y cupos disponibles
- Puede seleccionar múltiples horarios (diferentes deportes o días)

**El precio final incluye:**
- Mensualidad de cada deporte seleccionado
- Matrícula de S/ 20 por cada deporte NUEVO

### Paso 3: Confirmación y Pago
El alumno ve un resumen con:
- Sus datos personales
- Horarios seleccionados
- Desglose del precio (deportes + matrícula)
- Total a pagar

Luego:
- Realiza el pago por Yape/Plin/transferencia
- Toma foto del comprobante
- Sube la foto al sistema
- Recibe un código de operación (ejemplo: ACAD-20260109-3VXB4)

### Paso 4: Registro Automático
El sistema automáticamente:
- Guarda todos los datos en Google Sheets
- Sube el comprobante a Google Drive
- Genera un registro en la hoja PAGOS con estado "pendiente"
- Añade al alumno a las hojas de cada día/deporte seleccionado

---

## 👨‍💼 PANEL DE ADMINISTRACIÓN

Tu panel de control para gestionar todo. Accedes con:
- Email: admin@jaguares.com
- Contraseña: (la que configuraste)

### ¿Qué puedes hacer?

#### 1. Ver Lista de Inscritos
- Tabla con todos los alumnos
- Columnas: Nombre, DNI, Deporte, Día, Horario, Estado de pago
- Puedes buscar por nombre o DNI
- Puedes filtrar por día o deporte

#### 2. Confirmar Pagos
Cuando un alumno sube su comprobante:
1. Verás su inscripción en estado "pendiente"
2. Haz clic en su nombre para ver los detalles
3. Revisa el comprobante de pago (foto del Yape/Plin)
4. Si el pago es correcto, haz clic en "Confirmar Pago"
5. El estado cambia a "confirmado" automáticamente

**Lo que pasa al confirmar:**
- El registro en Google Sheets se actualiza a "confirmado"
- El alumno puede ver su inscripción activa al consultar
- Ya está oficialmente inscrito y puede asistir a clases

#### 3. Ver Detalles del Alumno
Al hacer clic en cualquier alumno ves:
- **Datos personales**: DNI, nombre, edad, teléfono, email, dirección
- **Datos médicos**: Tipo de seguro, condiciones médicas
- **Documentos**: Fotos de DNI (frente/reverso) y foto tamaño carnet
- **Comprobante**: Foto del pago realizado
- **Horarios inscritos**: Todos los deportes y horarios del alumno

Puedes hacer clic en las imágenes para verlas en grande en Google Drive.

---

## 🔍 CONSULTA DE ESTADO

Los alumnos pueden consultar el estado de su inscripción:

1. Van a la página de "Consulta"
2. Ingresan su DNI
3. El sistema muestra:
   - Estado del pago (pendiente/confirmado)
   - Datos personales registrados
   - Horarios inscritos

**Si el pago está pendiente:**
- Ven un mensaje de que su inscripción está en revisión
- No pueden acceder a clases aún

**Si el pago está confirmado:**
- Ven un mensaje de inscripción activa
- Pueden ver todos sus horarios
- Ya pueden asistir a las clases

---

## 💳 SISTEMA DE MATRÍCULAS

### ¿Cómo funciona?

La matrícula es de **S/ 20 por cada deporte** y se paga **UNA VEZ AL AÑO**.

#### Ejemplo 1: Alumno nuevo
Juan se inscribe por primera vez en Fútbol:
- Mensualidad Fútbol: S/ 120
- Matrícula Fútbol: S/ 20
- **Total a pagar: S/ 140**

#### Ejemplo 2: Alumno que se retira y vuelve
María se inscribió en Vóley en enero (pagó matrícula).
En marzo se retiró.
En julio vuelve a inscribirse en Vóley:
- Mensualidad Vóley: S/ 60
- Matrícula Vóley: S/ 0 (ya la pagó este año)
- **Total a pagar: S/ 60**

#### Ejemplo 3: Alumno que agrega un deporte
Carlos está inscrito en Fútbol (ya pagó matrícula de Fútbol).
Ahora quiere inscribirse también en Básquet:
- Mensualidad Básquet: S/ 120
- Matrícula Básquet: S/ 20 (es un deporte nuevo para él)
- **Total a pagar: S/ 140**

### El sistema automáticamente:
- Revisa si el alumno ya se inscribió en ese deporte durante el año
- Cobra matrícula solo si es primera vez en ese deporte
- Muestra un mensaje explicando qué deportes requieren matrícula

---

## 📊 GOOGLE SHEETS - TU BASE DE DATOS

Todo se guarda automáticamente en tu Google Sheets. Así están organizadas las hojas:

### Hoja: HORARIOS
**Contiene:** Todos los horarios disponibles de la academia

**Columnas importantes:**
- `horario_id`: Número único de cada horario
- `deporte`: Nombre del deporte (Fútbol, Vóley, Básquet, etc.)
- `dia`: Día de la semana
- `hora_inicio`: Hora de inicio (ejemplo: 08:30)
- `hora_fin`: Hora de finalización (ejemplo: 09:40)
- `cupo_maximo`: Cantidad máxima de alumnos
- `cupos_ocupados`: Cantidad actual de inscritos
- `precio`: Precio mensual
- `año_min`: Año de nacimiento mínimo (ejemplo: 1900)
- `año_max`: Año de nacimiento máximo (ejemplo: 2010)
- `edad_minima`: Edad mínima (ejemplo: 16)
- `edad_maxima`: Edad máxima (ejemplo: 18)
- `categoria`: Categoría del horario (Sub-14, Sub-16, Adulto, etc.)
- `estado`: activo/inactivo

**Ejemplo de fila:**
```
ID: 1
Deporte: Fútbol
Día: LUNES
Hora: 08:30 - 09:40
Cupo máximo: 20
Precio: 120
Año mín: 2008, Año máx: 2010
Edad: 16-18 años
Categoría: Sub-18
Estado: activo
```

### Hoja: INSCRIPCIONES
**Contiene:** Registro de cada inscripción

**Columnas importantes:**
- `fecha_registro`: Cuándo se inscribió
- `dni`: DNI del alumno
- `nombres`: Nombres completos
- `apellidos`: Apellidos completos
- `fecha_nacimiento`: Fecha de nacimiento
- `edad`: Edad calculada automáticamente
- `sexo`: Masculino/Femenino
- `telefono`: Teléfono de contacto
- `email`: Email
- `direccion`: Dirección
- `apoderado`: Nombre del apoderado (si es menor)
- `telefono_apoderado`: Teléfono del apoderado
- `seguro_tipo`: Tipo de seguro (SIS, EsSalud, privado, ninguno)
- `condicion_medica`: Condiciones médicas especiales
- `deporte`: Deporte al que se inscribió
- `dia`: Día del horario
- `url_dni_frontal`: Link a foto DNI frente en Drive
- `url_dni_reverso`: Link a foto DNI reverso en Drive
- `url_foto_carnet`: Link a foto tamaño carnet en Drive
- `codigo_registro`: Código único de la inscripción

### Hoja: PAGOS
**Contiene:** Estado de pagos y comprobantes

**Columnas importantes:**
- `codigo_operacion`: Código único (ejemplo: ACAD-20260109-3VXB4)
- `dni`: DNI del alumno
- `nombres`: Nombre del alumno
- `apellidos`: Apellidos
- `telefono`: Teléfono
- `monto`: Total pagado
- `metodo_pago`: Yape/Plin/Transferencia
- `estado_pago`: pendiente/confirmado
- `fecha_registro`: Fecha de inscripción
- `url_comprobante`: Link a foto del comprobante en Drive
- `fecha_subida`: Cuándo se subió el comprobante

### Hojas por Día (LUNES, MARTES, etc.)
**Contiene:** Alumnos organizados por día de la semana

Cada hoja tiene los mismos datos de INSCRIPCIONES pero filtrados por día.
Útil para ver quiénes asisten cada día.

### Hojas por Deporte (FÚTBOL, VÓLEY, etc.)
**Contiene:** Alumnos organizados por deporte

Cada hoja tiene los mismos datos pero filtrados por deporte.
Útil para ver las listas de cada disciplina.

---

## ⚙️ CONFIGURACIÓN DE HORARIOS

### ¿Cómo agregar un nuevo horario?

1. Abre tu Google Sheets
2. Ve a la hoja "HORARIOS"
3. Agrega una nueva fila con estos datos:

**Campos obligatorios:**
- `horario_id`: Número consecutivo (si el último es 157, pon 158)
- `deporte`: Nombre exacto del deporte
- `dia`: LUNES/MARTES/MIÉRCOLES/JUEVES/VIERNES/SÁBADO/DOMINGO
- `hora_inicio`: Formato HH:MM (ejemplo: 08:30)
- `hora_fin`: Formato HH:MM (ejemplo: 09:40)
- `cupo_maximo`: Número de cupos (ejemplo: 20)
- `cupos_ocupados`: Empieza en 0
- `precio`: Precio mensual en soles (ejemplo: 120)
- `año_min`: Año de nacimiento mínimo
- `año_max`: Año de nacimiento máximo
- `edad_minima`: Edad mínima en años
- `edad_maxima`: Edad máxima en años
- `categoria`: Nombre de la categoría
- `estado`: activo

### Ejemplos de configuración por edad:

**Para niños de 6-8 años (nacidos entre 2018-2020):**
```
año_min: 2018
año_max: 2020
edad_minima: 6
edad_maxima: 8
categoria: Sub-8
```

**Para adolescentes de 16-18 años (nacidos entre 2008-2010):**
```
año_min: 2008
año_max: 2010
edad_minima: 16
edad_maxima: 18
categoria: Sub-18
```

**Para adultos 18+ años (sin límite superior):**
```
año_min: 1900
año_max: 2008
edad_minima: 18
edad_maxima: 99
categoria: Adulto (18+)
```

**IMPORTANTE:** Los años funcionan al revés:
- Año MÁS BAJO (1900) = Persona MÁS VIEJA
- Año MÁS ALTO (2020) = Persona MÁS JOVEN

### ¿Cómo cambiar precios?

1. Busca el horario en la hoja HORARIOS
2. Cambia el valor en la columna `precio`
3. El nuevo precio aparecerá automáticamente en el sitio web

### ¿Cómo desactivar un horario?

1. Busca el horario en la hoja HORARIOS
2. Cambia `estado` de "activo" a "inactivo"
3. Ya no aparecerá en el sitio web

---

## ❓ PREGUNTAS FRECUENTES

### ¿Puedo inscribir a alguien manualmente?

Sí. Puedes agregar una fila directamente en la hoja INSCRIPCIONES con todos los datos. Recuerda también agregarlo a PAGOS y marcarlo como "confirmado".

### ¿Los alumnos pueden cambiar sus datos después de inscribirse?

No, el sistema no permite ediciones. Deberías cambiar los datos manualmente en Google Sheets o pedirles que se registren nuevamente con otro DNI.

### ¿Qué pasa si se llenan los cupos?

El sistema automáticamente actualiza `cupos_ocupados` cada vez que alguien se inscribe. Cuando llegue al `cupo_maximo`, el horario dejará de aparecer como disponible.

### ¿Puedo tener múltiples administradores?

Actualmente hay un solo usuario admin. Si necesitas múltiples usuarios, tendrías que agregar esa funcionalidad.

### ¿Los datos están seguros?

Sí. Todo está en tu Google Drive y Google Sheets personal. Solo tú tienes acceso. El sistema usa tokens de seguridad para proteger la información.

### ¿Qué pasa si un alumno sube un comprobante falso?

Por eso debes revisar cada comprobante antes de confirmar el pago en el panel de administración. No confirmes hasta verificar que el pago sea real.

### ¿Puedo cambiar los precios de matrícula?

Sí, pero requiere modificar el código. Actualmente está fijado en S/ 20 por deporte. Si quieres cambiarlo, habla con tu desarrollador.

### ¿El sistema envía correos automáticos?

No, actualmente no. Tendrías que notificar manualmente a los alumnos o agregar esa funcionalidad.

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Problema: "No aparecen horarios al seleccionar"

**Causas posibles:**
1. La fecha de nacimiento del alumno no coincide con ningún rango de edad
2. Los horarios están con estado "inactivo"
3. Todos los cupos están llenos

**Solución:**
- Revisa la hoja HORARIOS y verifica que los rangos de `año_min` y `año_max` estén correctos
- Verifica que el `estado` sea "activo"
- Revisa que `cupos_ocupados` no haya llegado a `cupo_maximo`

### Problema: "El sitio web no carga"

**Causas posibles:**
1. Problemas con Netlify (proveedor del hosting)
2. Cambios en la URL del sitio

**Solución:**
- Verifica que la URL sea la correcta
- Intenta abrir en modo incógnito
- Limpia el caché del navegador
- Contacta soporte de Netlify si persiste

### Problema: "Las imágenes no se ven en el panel admin"

**Causas posibles:**
1. El folder de Google Drive no tiene permisos públicos
2. URLs mal formadas en Google Sheets

**Solución:**
- Verifica que el folder de Drive esté compartido como "Cualquiera con el enlace"
- Verifica que las URLs empiecen con "https://drive.google.com/"

### Problema: "No puedo confirmar pagos"

**Causas posibles:**
1. Contraseña incorrecta de administrador
2. El DNI no existe en la base de datos

**Solución:**
- Verifica usuario y contraseña de admin
- Busca el DNI en la hoja PAGOS para confirmar que exista

### Problema: "El alumno dice que no puede consultar su inscripción"

**Causas posibles:**
1. DNI mal ingresado
2. El registro aún no se sincronizó

**Solución:**
- Pídele que verifique su DNI (8 dígitos)
- Espera 1 minuto y vuelve a intentar
- Verifica en PAGOS que su DNI esté registrado

---

## 📞 CONTACTO Y SOPORTE

### Información del Sistema

**Sitio Web:** https://escuelajaguares.netlify.app  
**Panel Admin:** https://escuelajaguares.netlify.app/admin-panel.html

### ¿Necesitas ayuda?

Para soporte técnico o modificaciones al sistema:
- Contacta a tu desarrollador
- Envía capturas de pantalla del problema
- Describe exactamente qué estabas haciendo cuando ocurrió el error

### Actualizaciones Futuras

Si en el futuro necesitas:
- Agregar nuevos deportes
- Cambiar el diseño del sitio
- Agregar notificaciones por email/WhatsApp
- Reportes automáticos
- Sistema de pagos online integrado
- App móvil

Consulta con tu desarrollador sobre costos y tiempos de implementación.

---

## 📚 RESUMEN EJECUTIVO

### Lo que tienes ahora:

✅ **Sistema web completo** funcionando 24/7  
✅ **Inscripciones automáticas** sin intervención manual  
✅ **Base de datos** organizada en Google Sheets  
✅ **Almacenamiento** de documentos en Google Drive  
✅ **Panel de administración** para gestionar todo  
✅ **Sistema de consultas** para alumnos  
✅ **Cálculo automático** de matrículas por deporte  
✅ **Filtros de edad** para mostrar horarios apropiados  
✅ **Validaciones** para evitar datos incorrectos  
✅ **Sistema probado** con más de 3,000 usuarios simultáneos  

### Tu trabajo como administrador:

1. **Revisar comprobantes** de pago diariamente
2. **Confirmar inscripciones** en el panel admin
3. **Actualizar horarios** cuando sea necesario en Google Sheets
4. **Hacer backup** de Google Sheets semanalmente
5. **Responder consultas** de alumnos sobre su estado

### El sistema trabaja por ti:

- Recibe inscripciones 24/7
- Valida todos los datos automáticamente
- Guarda todo de forma organizada
- Calcula precios con matrícula
- Filtra horarios por edad
- Evita duplicados
- Controla cupos disponibles

---

**¡Tu Academia JAGUARES está lista para crecer!** 🚀

---

*Manual del Cliente - Sistema JAGUARES v1.0*  
*Fecha: Enero 2026*
