# 🚀 COMPLETAR Y EJECUTAR PRUEBAS - GUÍA PASO A PASO

## ⚡ INICIO RÁPIDO

### 1️⃣ Verificar Configuración de Google Sheets
```powershell
cd c:\Users\Cris\Desktop\jaguares-funcional\server
Get-Content .env | Select-String "GOOGLE"
```

### 2️⃣ Ejecutar Pruebas Completas
```powershell
cd c:\Users\Cris\Desktop\jaguares-funcional
node test-produccion-final.js
```

### 3️⃣ Ver Resultados
Los reportes se guardan automáticamente:
- `reporte-produccion-[fecha].txt` - Formato legible
- `reporte-produccion-[fecha].json` - Datos completos

---

## 📊 TIPOS DE PRUEBAS DISPONIBLES

### 🧪 Pruebas Básicas (Recomendado empezar aquí)
```powershell
node test-produccion-final.js
```
- ⏱️ Duración: 10-15 minutos
- 👥 50 usuarios concurrentes
- 📡 Prueba TODOS los endpoints
- 💾 Genera reporte detallado

### 🔥 Pruebas de Estrés Extremo
```powershell
node test-stress-extremo.js
```
- ⏱️ Duración: 20-30 minutos
- 👥 200+ usuarios concurrentes en 5 olas
- ⚡ Prueba los límites del sistema
- 📈 Analiza degradación de rendimiento

### 📺 Monitor en Tiempo Real
```powershell
node monitor-tiempo-real.js
```
- ⏱️ Duración: Continuo (Ctrl+C para detener)
- 🖥️ Dashboard en consola
- 📊 Actualización cada 2 segundos
- 💾 Estadísticas de caché en vivo

---

## 🔧 SI NECESITAS CONFIGURAR GOOGLE SHEETS

### Verificar si ya está configurado
```powershell
cd server
Get-ChildItem -Filter "*.json" | Where-Object {$_.Name -like "*credential*" -or $_.Name -like "*service*"}
```

### Configurar el archivo .env
Editar `server/.env` y asegurarse que existe:
```env
GOOGLE_APPLICATION_CREDENTIALS=./nombre-archivo-credenciales.json
GOOGLE_SPREADSHEET_ID=tu_spreadsheet_id_aquí
```

---

## ✅ CRITERIOS DE ÉXITO

### Sistema LISTO para producción si:
- ✅ Tasa de éxito > 90%
- ✅ Tiempo promedio < 500ms
- ✅ Inscripciones exitosas > 45/50
- ✅ Sin errores 5xx en endpoints principales
- ✅ Sistema soporta 50+ usuarios concurrentes

### Sistema NECESITA optimización si:
- ⚠️ Tasa de éxito < 80%
- ⚠️ Tiempo promedio > 1s
- ⚠️ Inscripciones exitosas < 40/50
- ⚠️ Errores 5xx frecuentes

---

## 📁 ARCHIVOS CREADOS

### Scripts de Pruebas
1. **test-produccion-final.js** - Suite completa de tests
2. **test-stress-extremo.js** - Pruebas de carga extrema
3. **monitor-tiempo-real.js** - Monitoreo continuo
4. **ejecutar-todas-pruebas.js** - Ejecutor maestro

### Reportes Generados
- Automáticamente en la raíz del proyecto
- Formato: `reporte-[tipo]-[fecha].{json,txt}`

---

## 🐛 SOLUCIÓN RÁPIDA DE ERRORES

### "Google Sheets API error"
→ Configurar credenciales de Google (ver arriba)

### "ECONNREFUSED"
→ Asegurarse que el servidor esté corriendo:
```powershell
cd server
npm start
```

### "Rate limit exceeded"
→ Esperar 15 minutos o reducir carga en el script

---

## 📞 SIGUIENTE PASO

**Ejecuta ahora mismo:**
```powershell
node test-produccion-final.js
```

Y revisa el archivo: **RESULTADO-PRUEBAS-FINALES.md** para entender los resultados.

---

**Creado:** 2026-01-18 | **Sistema de Testing Jaguares v2.0**
