# CONTRATO DE PRESTACIÓN DE SERVICIOS DE DESARROLLO WEB
## SISTEMA DE INSCRIPCIONES DEPORTIVAS - JAGUARES

**FECHA:** Lima, 2 de enero de 2026

---

## ENTRE:

**DESARROLLADOR:**  
Cristhian Arturo Medina Ccopa  
Correo: cristhianmc84@gmail.com  
Teléfono: 955195324  
Ubicación: Lima, Perú

**CLIENTE:**  
[Nombre del representante legal - JAGUARES]  
Centro de Alto Rendimiento Deportivo JAGUARES  
RUC/DNI: _______________________  
Correo: _______________________  
Teléfono: _______________________  
Ubicación: _______________________

---

## OBJETO DEL CONTRATO

Desarrollo de un **Sistema Web de Inscripciones y Gestión** para el Centro de Alto Rendimiento Deportivo JAGUARES, que incluye:
- Portal web público para inscripciones
- Sistema de consulta de inscripciones
- Panel administrativo de gestión
- Integración con sistema de pagos
- Base de datos en Google Sheets

---

## 1. ALCANCE Y ESPECIFICACIONES TÉCNICAS

### 1.1 MÓDULOS DEL SISTEMA

#### **A) PORTAL WEB PÚBLICO**

**Página Principal (Landing Page):**
- Hero section con imágenes destacadas
- Información sobre deportes disponibles (Fútbol, Vóley, Básquet, etc.)
- Testimonios y galerías
- Call-to-action para inscripciones
- Diseño responsive y optimizado SEO

**Sistema de Inscripciones:**
- Formulario multi-paso validado
- Campos: datos personales, datos del apoderado, datos médicos
- Selección de deporte y categoría
- Selección de horarios disponibles
- Generación automática de código único de inscripción
- Envío de confirmación por correo (opcional)
- Integración con Google Sheets para almacenamiento

**Sistema de Consulta:**
- Búsqueda por código de inscripción
- Visualización de estado de inscripción
- Descarga de información en PDF
- Consulta de horarios asignados

**Página de Confirmación:**
- Resumen completo de inscripción
- Código QR para pago (Yape/Plin)
- Instrucciones de pago
- Información de contacto

#### **B) PANEL ADMINISTRATIVO**

**Dashboard de Control:**
- Estadísticas en tiempo real (total inscritos, por deporte, por estado)
- Gráficos visuales de datos
- Filtros avanzados de búsqueda
- Exportación de reportes

**Gestión de Inscripciones:**
- Visualización de todas las inscripciones
- Búsqueda y filtrado avanzado
- Edición de estados (Pendiente, Confirmado, Rechazado)
- Eliminación de registros
- Exportación a Excel/PDF

**Sistema de Autenticación:**
- Login seguro con credenciales
- Protección de acceso al panel
- Gestión de sesiones

#### **C) INTEGRACIONES Y TECNOLOGÍAS**

**Google Sheets API:**
- Conexión automática con hoja de cálculo
- Escritura de nuevas inscripciones
- Lectura para consultas y administración
- Script de Apps Script para gestión de datos
- Backup automático de información

**Hosting y Deployment:**
- Despliegue en Netlify (plan gratuito)
- Dominio personalizado (si el cliente lo provee)
- Certificado SSL incluido
- CDN global automático
- Continuous deployment desde GitHub

**Tecnologías Utilizadas:**
- Frontend: HTML5, CSS3, JavaScript Vanilla
- Backend: Google Apps Script (serverless)
- Base de datos: Google Sheets
- Hosting: Netlify
- Control de versiones: Git/GitHub

### 1.2 CARACTERÍSTICAS TÉCNICAS

✅ **Diseño Responsive:** Optimizado para móviles, tablets y escritorio  
✅ **Validaciones en tiempo real:** Prevención de errores de usuario  
✅ **Seguridad:** Protección contra XSS, CSRF, inyección de código  
✅ **Performance:** Tiempos de carga < 2 segundos  
✅ **SEO Optimizado:** Meta tags, Open Graph, Schema.org  
✅ **Accesibilidad:** Cumplimiento de estándares WCAG  
✅ **Progressive Enhancement:** Funciona incluso sin JavaScript

### 1.3 ENTREGABLES DOCUMENTALES

📄 Documentación técnica completa en formato Markdown:
- `README.md` - Guía de inicio rápido
- `INSTRUCCIONES-CONFIGURACION.md` - Setup de Google Sheets
- `ESTRUCTURA-SHEET-CLIENTE.md` - Estructura de base de datos
- `APPS-SCRIPT-GOOGLE-SHEETS.gs` - Código del backend
- `CONFIGURACION-MULTI-CLIENTE.md` - Guía para reutilizar el sistema
- `RESUMEN-PROYECTO.md` - Visión general del proyecto
- Guías adicionales según necesidad

---

## 2. CRONOGRAMA Y METODOLOGÍA DE TRABAJO

### **FASE 1: Diseño y Estructura (COMPLETADA ✅)**
- ✅ Diseño de interfaz de usuario
- ✅ Estructura HTML de todas las páginas
- ✅ Sistema de navegación responsive

### **FASE 2: Desarrollo Frontend (COMPLETADA ✅)**
- ✅ Formularios de inscripción con validación
- ✅ Sistema de selección de horarios
- ✅ Páginas de consulta y confirmación
- ✅ Panel administrativo completo

### **FASE 3: Integración Backend (COMPLETADA ✅)**
- ✅ Configuración de Google Sheets API
- ✅ Apps Script para manejo de datos
- ✅ Conexión frontend-backend
- ✅ Sistema de códigos únicos

### **FASE 4: Testing y Deployment (COMPLETADA ✅)**
- ✅ Pruebas de funcionalidad
- ✅ Pruebas de carga y rendimiento
- ✅ Deployment en Netlify
- ✅ Configuración de dominio

### **FASE 5: Documentación y Capacitación (EN PROCESO 🔄)**
- ✅ Documentación técnica completa
- 🔄 Capacitación al personal administrativo
- 🔄 Entrega de credenciales y accesos
- 🔄 Transferencia de conocimiento

**TIEMPO TOTAL INVERTIDO:** ~15-20 días hábiles  
**ESTADO ACTUAL:** 90% completado

---

## 3. INVERSIÓN Y FORMA DE PAGO

### **INVERSIÓN TOTAL DEL PROYECTO:**

| Concepto | Precio |
|----------|--------|
| **Desarrollo Frontend (5 páginas funcionales)** | S/ 400.00 |
| **Panel Administrativo Completo** | S/ 250.00 |
| **Integración Google Sheets API + Apps Script** | S/ 200.00 |
| **Sistema de Consultas y Reportes** | S/ 150.00 |
| **Documentación Técnica Completa** | S/ 100.00 |
| **Testing, Deployment y Configuración** | S/ 150.00 |
| **Capacitación y Soporte Inicial** | S/ 100.00 |
| | |
| **SUBTOTAL** | S/ 1,350.00 |
| **Descuento por proyecto completo (-10%)** | -S/ 135.00 |
| **Descuento adicional** | -S/ 15.00 |
| | |
| **INVERSIÓN TOTAL** | **S/ 1,200.00** |

### **FORMA DE PAGO PROPUESTA:**

**OPCIÓN A - Pago Único (Recomendado):**
- Pago único con 5% descuento adicional
- **Total a pagar:** S/ 1,140.00
- Transferencia bancaria o Yape/Plin

**OPCIÓN B - Pagos Diferidos:**
- **Adelanto 40%:** S/ 480.00 (para formalizar contrato)
- **Segunda cuota 30%:** S/ 360.00 (a los 15 días)
- **Saldo final 30%:** S/ 360.00 (contra entrega y capacitación)

**OPCIÓN C - Plan de Pago Mensual:**
- **Adelanto 30%:** S/ 360.00 (para formalizar contrato)
- **3 cuotas mensuales:** S/ 280.00 c/u
- Sin intereses adicionales

### **MÉTODOS DE PAGO ACEPTADOS:**

✅ Transferencia bancaria (BCP, Interbank, BBVA)  
✅ Yape / Plin  
✅ Depósito en cuenta  
✅ Pago con tarjeta (+ 3.5% comisión)

**CONDICIÓN IMPORTANTE:**  
El código fuente y accesos completos serán transferidos únicamente después del **pago total del proyecto (100%)**.

---

## 4. RESPONSABILIDADES DEL CLIENTE

El cliente se compromete a proporcionar:

### **4.1 ACCESOS Y PERMISOS:**
✓ Cuenta de Google (Gmail) para configurar Google Sheets  
✓ Acceso a dominio (si desea usar dominio personalizado)  
✓ Logo oficial en alta resolución (formato PNG transparente)  
✓ Colores institucionales (códigos hexadecimales)

### **4.2 CONTENIDO:**
✓ Textos institucionales (Misión, Visión, Historia)  
✓ Lista completa de deportes y categorías  
✓ Horarios disponibles por deporte  
✓ Precios de inscripción  
✓ Imágenes de instalaciones (mínimo 10 fotos en alta calidad)  
✓ Datos de contacto oficiales (teléfonos, email, dirección, redes sociales)

### **4.3 COORDINACIÓN:**
✓ Asignar un responsable de comunicación con el desarrollador  
✓ Responder consultas en máximo 48 horas hábiles  
✓ Aprobar avances y cambios de manera oportuna  
✓ Participar en reuniones de revisión (máximo 3 reuniones de 1 hora)  
✓ Asistir a capacitación del sistema (2 sesiones de 1.5 horas)

### **4.4 OPCIONALES (COSTOS ADICIONALES):**
✓ Dominio personalizado: ~S/ 80-120/año (cliente lo adquiere directamente)  
✓ Email corporativo: ~S/ 50-150/año (Google Workspace o similar)  
✓ Cloudflare Pro (CDN premium): ~$20/mes (opcional, no necesario inicialmente)

---

## 5. POLÍTICA DE REVISIONES Y CAMBIOS

### **5.1 DURANTE EL DESARROLLO:**

✅ Se incluyen **3 rondas de revisiones/ajustes** sin costo adicional  
✅ Los cambios deben estar dentro del alcance definido en este contrato  
✅ Cada ronda de revisión debe consolidar todos los cambios en una sola lista  
✅ Tiempo máximo por ronda: 2-3 días hábiles

**CAMBIOS QUE GENERAN COSTO ADICIONAL:**
- Agregar nuevos módulos o funcionalidades no contempladas
- Cambiar completamente el diseño visual después de aprobado
- Integrar nuevos servicios externos (más allá de Google Sheets)
- Desarrollo de aplicación móvil nativa
- Conexión con sistemas de pago automático (Culqi, Niubiz, etc.)

### **5.2 DESPUÉS DE LA ENTREGA FINAL:**

**GARANTÍA INCLUIDA (30 DÍAS):**  
✅ Corrección de errores de programación: **SIN COSTO**  
✅ Bugs o fallos en funcionalidades existentes: **SIN COSTO**  
✅ Problemas de compatibilidad de navegadores: **SIN COSTO**

**NO CUBIERTO POR GARANTÍA:**  
❌ Cambios de contenido (textos, imágenes)  
❌ Nuevas funcionalidades o módulos  
❌ Modificaciones al diseño visual  
❌ Errores causados por modificaciones del cliente  
❌ Problemas de hosting o servicios externos

### **5.3 TARIFAS POST-ENTREGA:**

| Servicio | Tarifa |
|----------|--------|
| **Cambios menores** (textos, imágenes, colores) | S/ 50.00/hora (mín. 1h) |
| **Cambios técnicos** (funcionalidades, scripts) | S/ 80.00/hora (mín. 2h) |
| **Nuevas funcionalidades** | A cotizar según complejidad |
| **Mantenimiento mensual** | S/ 200.00/mes (incluye 4h de cambios) |
| **Soporte prioritario** | S/ 350.00/mes (incluye 8h + soporte 24/7) |
| **Capacitación adicional** | S/ 100.00/sesión (2 horas) |

---

## 6. ENTREGABLES FINALES

### **6.1 CÓDIGO FUENTE COMPLETO:**
✅ Repositorio GitHub privado con todo el código  
✅ Estructura de archivos organizada y documentada  
✅ Historial completo de commits  
✅ Acceso de administrador al repositorio

### **6.2 SISTEMA DESPLEGADO Y FUNCIONAL:**
✅ Sitio web 100% funcional en Netlify  
✅ Dominio conectado (si el cliente lo provee)  
✅ SSL/HTTPS configurado  
✅ Google Sheets conectado y operativo  
✅ Panel administrativo accesible

### **6.3 DOCUMENTACIÓN TÉCNICA:**
✅ Manual de usuario del panel administrativo (PDF)  
✅ Guía de configuración técnica (Markdown)  
✅ Documentación de APIs y scripts  
✅ Guía de mantenimiento y actualización  
✅ FAQ y solución de problemas comunes

### **6.4 CREDENCIALES Y ACCESOS:**
✅ Credenciales del panel administrativo  
✅ Acceso a cuenta Netlify (o transferencia de ownership)  
✅ Acceso al repositorio GitHub  
✅ Enlace a Google Sheet con permisos de editor  
✅ Documentación de todas las contraseñas (en documento seguro)

### **6.5 CAPACITACIÓN:**
✅ 2 sesiones de capacitación virtual (Zoom/Meet)  
   - Sesión 1: Uso del panel administrativo (1.5 horas)  
   - Sesión 2: Gestión de inscripciones y reportes (1.5 horas)  
✅ Video tutorial grabado del sistema  
✅ Soporte vía WhatsApp durante los primeros 7 días

---

## 7. PROPIEDAD INTELECTUAL Y DERECHOS

### **7.1 TRANSFERENCIA DE DERECHOS:**

Una vez completado el **pago total (100%)**, el cliente adquiere:

✅ **Propiedad total** del código fuente desarrollado  
✅ **Licencia completa** para usar, modificar y distribuir el código  
✅ **Derechos de autor** sobre el sistema (excepto librerías de terceros)  
✅ **Libertad total** para contratar a otro desarrollador para modificaciones futuras

### **7.2 EXCEPCIONES:**

El desarrollador retiene el derecho de:
- Usar el proyecto en su portafolio profesional
- Mencionar al cliente como referencia (con autorización previa)
- Reutilizar componentes genéricos en otros proyectos
- Crear versiones "template" del sistema para otros clientes

### **7.3 CÓDIGO DE TERCEROS:**

El sistema incluye librerías open-source con sus propias licencias:
- Ninguna librería con restricciones comerciales
- Todas las dependencias son gratuitas y de código abierto
- El cliente puede usar el sistema comercialmente sin restricciones

---

## 8. GARANTÍA Y SOPORTE TÉCNICO

### **8.1 GARANTÍA ESTÁNDAR (30 DÍAS):**

**COBERTURA:**  
✅ Corrección de bugs y errores de programación  
✅ Problemas de compatibilidad de navegadores  
✅ Fallas en funcionalidades existentes  
✅ Problemas de rendimiento (si son causados por el código)  
✅ Errores en la integración con Google Sheets  
✅ Problemas de seguridad en el código

**TIEMPO DE RESPUESTA:**  
- Errores críticos (sitio caído): **4-8 horas**  
- Errores importantes (funcionalidad no trabaja): **24-48 horas**  
- Errores menores (problemas visuales): **3-5 días**

**EXCLUSIONES:**  
❌ Problemas causados por modificaciones no autorizadas del cliente  
❌ Errores en servicios externos (Google Sheets caído, Netlify caído)  
❌ Cambios en requisitos o nuevas funcionalidades  
❌ Problemas de infraestructura (hosting, dominio)  
❌ Pérdida de datos por mal uso del sistema

### **8.2 SOPORTE POST-GARANTÍA:**

**SOPORTE BÁSICO (Gratuito):**  
✅ Consultas por email: respuesta en 48-72 horas  
✅ Dudas sobre uso del sistema  
✅ Recomendaciones de buenas prácticas

**SOPORTE PREMIUM (De pago):**  
- Plan Mensual: S/ 200/mes (4 horas de soporte)  
- Plan Trimestral: S/ 500/trimestre (12 horas de soporte)  
- Incluye: actualizaciones, cambios menores, soporte prioritario

---

## 9. CONFIDENCIALIDAD Y PROTECCIÓN DE DATOS

### **9.1 CONFIDENCIALIDAD:**

Ambas partes se comprometen a:
✅ Mantener confidencial toda información intercambiada  
✅ No divulgar datos sensibles del proyecto  
✅ No compartir credenciales con terceros  
✅ Proteger la información de inscripciones de los clientes

### **9.2 PROTECCIÓN DE DATOS PERSONALES:**

**LEY N° 29733 - Ley de Protección de Datos Personales (Perú):**

El **cliente** es responsable de:
- Obtener consentimiento de padres/apoderados para recopilar datos
- Cumplir con la ley de protección de datos personales
- Implementar medidas de seguridad en Google Sheets
- Informar sobre el uso de datos personales

El **desarrollador** implementa:
- Validaciones para prevenir inyección de código
- No almacena contraseñas en texto plano
- Usa HTTPS para todas las comunicaciones
- No comparte datos con terceros no autorizados

### **9.3 BACKUP Y RESPONSABILIDAD:**

✅ El cliente es **responsable** de realizar backups periódicos de Google Sheets  
✅ El desarrollador **no es responsable** por pérdida de información  
✅ Se recomienda exportar datos semanalmente  
✅ Google Sheets tiene historial de versiones automático (30 días)

---

## 10. LIMITACIÓN DE RESPONSABILIDAD

### **10.1 EXCLUSIONES DE RESPONSABILIDAD:**

El desarrollador **NO** es responsable por:

❌ **Disponibilidad de servicios externos:**  
   - Caídas de Netlify, Google Sheets, Gmail, etc.  
   - Cambios en APIs de terceros

❌ **Acciones del cliente:**  
   - Modificaciones no autorizadas del código  
   - Compartir credenciales con terceros  
   - Mal uso del sistema administrativo

❌ **Casos de fuerza mayor:**  
   - Desastres naturales  
   - Fallas de infraestructura de internet  
   - Cambios en legislación que afecten el sistema

❌ **Límites de servicios gratuitos:**  
   - Netlify: 100GB ancho de banda/mes  
   - Google Sheets API: 500 requests/100 segundos  
   - Si se superan, el cliente debe actualizar planes

### **10.2 LÍMITE DE RESPONSABILIDAD:**

La responsabilidad total del desarrollador está limitada al **monto total pagado** por el cliente (S/ 1,200.00). No se aceptan reclamaciones por daños indirectos, lucro cesante o pérdidas de negocio.

---

## 11. RESOLUCIÓN Y TERMINACIÓN DEL CONTRATO

### **11.1 CAUSAS DE TERMINACIÓN:**

**Por incumplimiento del cliente:**
- Falta de pago después de 15 días de vencimiento
- No proporcionar información necesaria después de 30 días de solicitada
- Modificación no autorizada del código durante desarrollo
- Conducta inapropiada o abusiva hacia el desarrollador

**Por incumplimiento del desarrollador:**
- No entregar el proyecto en plazo acordado sin justificación (+ 30 días)
- Entrega de un producto que no cumple con el alcance mínimo
- Negligencia grave en el desarrollo

**Por mutuo acuerdo:**
- Ambas partes deciden terminar el contrato por escrito
- Se liquidan pagos pendientes según avance

### **11.2 CONSECUENCIAS DE TERMINACIÓN ANTICIPADA:**

**Si termina el CLIENTE (sin causa justificada):**
- ❌ No se reembolsa el adelanto pagado
- ✅ Se entrega todo el trabajo realizado hasta la fecha
- ✅ El cliente paga el % correspondiente al avance (si aplica)
- ✅ No se entrega documentación completa (solo código actual)

**Si termina el DESARROLLADOR (sin causa justificada):**
- ✅ Se reembolsa el 100% del adelanto
- ✅ Se entrega todo el trabajo realizado
- ✅ Se transfieren accesos parciales

**Si hay causa justificada (de cualquiera):**
- Se evalúa caso por caso según el avance real
- Puede existir penalidad según la gravedad
- Se busca acuerdo justo para ambas partes

---

## 12. MODIFICACIONES AL CONTRATO

### **12.1 CAMBIOS EN ALCANCE:**

Cualquier cambio en el alcance del proyecto debe:
✅ Ser solicitado por escrito (email o WhatsApp)  
✅ Ser evaluado y cotizado por el desarrollador  
✅ Ser aprobado por ambas partes  
✅ Generar un adendum a este contrato  
✅ Puede ajustar precios y plazos

### **12.2 PROCESO DE CAMBIOS:**

1. Cliente solicita cambio por escrito
2. Desarrollador evalúa: impacto en tiempo y costo
3. Desarrollador envía cotización del cambio
4. Cliente aprueba o rechaza
5. Si aprueba: se firma adendum y se procede
6. Si rechaza: se continúa con alcance original

---

## 13. TÉRMINOS Y CONDICIONES GENERALES

### **13.1 VIGENCIA:**
✅ Este contrato entra en vigencia desde la fecha de firma  
✅ La validez de la cotización es de **15 días hábiles** desde la fecha de emisión  
✅ Después de 15 días, precios y plazos pueden ser reajustados

### **13.2 COMUNICACIÓN:**
✅ Toda comunicación oficial debe ser por **email** o **WhatsApp**  
✅ Las llamadas telefónicas deben ser confirmadas por escrito  
✅ Cambios o acuerdos verbales no tienen validez legal  
✅ El desarrollador responde emails en máximo 48 horas hábiles

### **13.3 LEGISLACIÓN APLICABLE:**
✅ Este contrato se rige por las **leyes de la República del Perú**  
✅ Jurisdicción: Cortes de Lima, Perú  
✅ Idioma oficial del contrato: Español

### **13.4 RESOLUCIÓN DE CONFLICTOS:**

**ETAPA 1 - Negociación directa:**  
- Intentar resolver por comunicación entre las partes (15 días)

**ETAPA 2 - Mediación:**  
- Acudir a un mediador neutral (si es necesario)

**ETAPA 3 - Arbitraje o vía judicial:**  
- Como último recurso, según lo establecido por ley peruana

### **13.5 NOTIFICACIONES:**

Todas las notificaciones deben enviarse a:

**Para el Cliente:**  
[Email del cliente]  
[Dirección física si aplica]

**Para el Desarrollador:**  
cristhianmc84@gmail.com  
WhatsApp: +51 955 195 324

### **13.6 INDEPENDENCIA CONTRACTUAL:**
✅ Este es un contrato de **prestación de servicios independiente**  
✅ No existe relación laboral entre las partes  
✅ El desarrollador trabaja de manera autónoma  
✅ Cada parte es responsable de sus propios impuestos

### **13.7 CESIÓN DE DERECHOS:**
❌ Ninguna parte puede ceder este contrato sin consentimiento escrito de la otra  
❌ El desarrollador no puede subcontratar sin autorización  
✅ Ambas partes deben aprobar cualquier transferencia de obligaciones

---

## 14. FIRMAS Y ACEPTACIÓN

Al firmar este contrato, ambas partes declaran:
- Haber leído y comprendido todos los términos
- Aceptar todas las condiciones establecidas
- Tener capacidad legal para celebrar este contrato
- Que este documento constituye el acuerdo completo entre las partes

---

### **POR EL CLIENTE:**

**Nombre completo:** ___________________________________________

**DNI/RUC:** ___________________________________________

**Cargo:** ___________________________________________

**Firma:** ___________________________________________

**Fecha:** ____ / ____ / 2026

---

### **POR EL DESARROLLADOR:**

**Nombre completo:** Cristhian Arturo Medina Ccopa

**DNI:** ___________________________________________

**Firma:** ___________________________________________

**Fecha:** 02 / 01 / 2026

---

## ANEXOS Y DOCUMENTOS COMPLEMENTARIOS

📎 **ANEXO A:** Lista detallada de funcionalidades del sistema  
📎 **ANEXO B:** Estructura de Google Sheets y campos de base de datos  
📎 **ANEXO C:** Mockups y diseños aprobados (si aplica)  
📎 **ANEXO D:** Cronograma detallado de entregas  
📎 **ANEXO E:** Manual de usuario del panel administrativo

---

## NOTAS IMPORTANTES

⚠️ **HOSTING Y SERVICIOS:**
- El sistema usa Netlify (plan gratuito) - **SIN COSTO** para el cliente
- Google Sheets como base de datos - **SIN COSTO** (incluido en Gmail gratuito)
- Dominio personalizado: Cliente debe adquirirlo (S/ 80-120/año)
- Cloudflare (CDN): Opcional, configuración incluida si cliente tiene dominio

⚠️ **LÍMITES TÉCNICOS (PLANES GRATUITOS):**
- Netlify: 100GB ancho de banda/mes - Suficiente para ~50,000-100,000 visitas/mes
- Google Sheets API: 500 requests/100 segundos - Suficiente para uso normal
- Si se superan, requiere actualizar a planes de pago (costo del cliente)

⚠️ **RECOMENDACIONES:**
- Realizar backup manual de Google Sheets semanalmente
- Cambiar contraseña del panel admin cada 3 meses
- Revisar inscripciones diariamente durante temporada alta
- Mantener registro de cambios realizados al sistema

---

**VERSIÓN DEL CONTRATO:** 1.0  
**FECHA DE ELABORACIÓN:** 02 de enero de 2026  
**ELABORADO POR:** Cristhian Arturo Medina Ccopa

---

*Este contrato ha sido redactado según las mejores prácticas del desarrollo web en Perú y se ajusta a la Ley N° 29733 de Protección de Datos Personales, Código Civil Peruano y normativas aplicables al comercio electrónico y servicios digitales.*

**📧 Para consultas sobre este contrato:**  
Email: cristhianmc84@gmail.com  
WhatsApp: +51 955 195 324