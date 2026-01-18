# 🐆 JAGUARES - Sistema de Inscripciones con Cronograma

## 🎯 Cambios Implementados

### ✅ Nueva UI de Selección de Horarios

La interfaz de selección ahora funciona con **cronogramas por deporte**:

1. **Selección por Deporte**: El usuario primero ve cards de deportes disponibles
2. **Cronograma Semanal**: Al hacer clic, se muestra una tabla con todos los horarios de la semana
3. **Restricción de Hora**: Solo se pueden seleccionar turnos a la misma hora
   - Si elige Lunes 8:00 AM, solo puede elegir otros días a las 8:00 AM
   - Si quiere cambiar de hora, debe desmarcar todos los horarios actuales

### ✅ Precios Actualizados

| Plan | Base | Clases/Semana | Precio | Días Extra |
|------|------|---------------|--------|------------|
| **Económico** | 60 soles | 2 (8 clases/mes) | S/.60 | +20 soles (+1 día) = S/.80 |
| **Estándar** | 80 soles | 2 (8 clases/mes) | S/.80 | +40 soles (+1 día) = S/.120 |
| **Premium** | 100 soles | 2 (8 clases/mes) | S/.100 | +50 soles (+1 día) = S/.150<br>+100 soles (+2 días) = S/.200 |

**Matrícula por deporte: S/.20**

---

## 📁 Archivos Nuevos Creados

### 1. Frontend
- `seleccion-horarios-new.html` - Nueva página con UI de cronogramas
- `js/seleccion-horarios-new.js` - Lógica de selección con restricciones

### 2. Base de Datos
- `ESQUEMA-DB-MYSQL.md` - Documentación completa del esquema de BD
- `docker-compose.yml` - Configuración de Docker para MySQL local
- `init-db.sql` - Script de inicialización con tablas, triggers y datos

---

## 🚀 Cómo Usar

### Opción 1: Probar el Frontend (sin backend)

1. Abre `seleccion-horarios-new.html` en tu navegador
2. Verás la nueva interfaz de selección por deportes
3. ⚠️ Necesitas que `api-service.js` tenga el método `obtenerHorarios()`

### Opción 2: Levantar MySQL con Docker

#### Requisitos:
- Docker Desktop instalado
- PowerShell o terminal

#### Pasos:

1. **Abrir terminal en la carpeta del proyecto**
```powershell
cd c:\Users\Cris\Desktop\jaguares-funcional
```

2. **Levantar los contenedores**
```powershell
docker-compose up -d
```

3. **Verificar que esté corriendo**
```powershell
docker ps
```

Deberías ver:
- `jaguares_mysql` en puerto 3306
- `jaguares_phpmyadmin` en puerto 8080

4. **Acceder a phpMyAdmin** (opcional)
- URL: http://localhost:8080
- Usuario: `jaguares_user`
- Contraseña: `jaguares_pass`

5. **Conexión desde tu backend**
```javascript
// Ejemplo Node.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'jaguares_user',
  password: 'jaguares_pass',
  database: 'jaguares_db'
});
```

### Opción 3: Detener los contenedores

```powershell
docker-compose down
```

Para eliminar también los datos:
```powershell
docker-compose down -v
```

---

## 🗄️ Estructura de la Base de Datos

### Tablas Principales:
- `deportes` - Catálogo de deportes
- `horarios` - Horarios por deporte/día/hora
- `alumnos` - Información de estudiantes
- `inscripciones` - Registros de inscripciones
- `inscripcion_horarios` - Relación muchos a muchos
- `pagos` - Registro de pagos y comprobantes
- `asistencias` - Control de asistencia
- `administradores` - Usuarios del sistema
- `logs_actividad` - Auditoría

### Vistas Útiles:
- `vista_horarios_completos` - Join de horarios con deportes
- `vista_inscripciones_activas` - Inscripciones con detalles

### Triggers Automáticos:
- Actualización automática de cupos al inscribir/cancelar

---

## 🔌 API Endpoints Necesarios

Tu backend debería tener estos endpoints:

### 1. Obtener Horarios
```http
GET /api/horarios?año_nacimiento=2010

Response:
{
  "horarios": [
    {
      "horario_id": 1,
      "deporte": "Fútbol",
      "dia": "LUNES",
      "hora_inicio": "08:10",
      "hora_fin": "09:20",
      "cupo_maximo": 20,
      "cupos_ocupados": 5,
      "categoria": "2011-2012",
      "precio": 60,
      "plan": "Económico"
    }
  ]
}
```

### 2. Crear Inscripción
```http
POST /api/inscripciones

Body:
{
  "alumno": { ... },
  "horarios_seleccionados": [ 1, 3, 5 ],
  "plan": "Económico"
}

Response:
{
  "success": true,
  "inscripcion_id": 123
}
```

### 3. Guardar Imágenes en Google Drive
```http
POST /api/imagenes/upload

Body (multipart/form-data):
{
  "file": [File],
  "tipo": "dni_frontal",
  "alumno_dni": "12345678"
}

Response:
{
  "url": "https://drive.google.com/file/d/..."
}
```

---

## 📝 Próximos Pasos

1. ✅ **Trae tu backend** - Intégralo con Docker
2. ⚠️ **Configura las rutas API** - Asegúrate que coincidan con `api-service.js`
3. 🔐 **Configura Google Drive API** - Para subir imágenes
4. 🧪 **Prueba el flujo completo** - Inscripción → Pago → Confirmación
5. 🚀 **Deploy a Render** - Cuando esté listo

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to Docker daemon"
```powershell
# Inicia Docker Desktop primero
```

### Error: "Port 3306 already in use"
```powershell
# Verifica si ya tienes MySQL corriendo
netstat -ano | findstr :3306

# Detén el servicio de MySQL local o cambia el puerto en docker-compose.yml
```

### Error: "Access denied for user"
```powershell
# Verifica las credenciales en docker-compose.yml
# Usuario: jaguares_user
# Contraseña: jaguares_pass
```

---

## 📞 Contacto

Si encuentras algún problema o necesitas ayuda:
1. Revisa los logs de Docker: `docker logs jaguares_mysql`
2. Verifica que el contenedor esté corriendo: `docker ps`
3. Revisa la consola del navegador para errores de JavaScript

---

## 📚 Documentación Adicional

- Ver `ESQUEMA-DB-MYSQL.md` para detalles completos de la base de datos
- Los archivos `seleccion-horarios-new.*` son los nuevos (no sobrescriben los antiguos)
- Puedes seguir usando Google Sheets para imágenes, MySQL solo para datos estructurados
