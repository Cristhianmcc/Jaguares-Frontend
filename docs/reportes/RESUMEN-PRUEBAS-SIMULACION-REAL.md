# 📊 RESUMEN DE PRUEBAS DE SIMULACIÓN REAL

## 📅 Fecha: 18 de Enero de 2026

---

## 🎯 RESUMEN EJECUTIVO

### Configuración de Prueba
- **URL Base**: http://localhost:3002
- **Duración total**: 26.17 segundos
- **Escenarios totales**: 215
- **Usuarios simultáneos por ola**: 25
- **Número de oleadas**: 5 oleadas progresivas

---

## 📈 RESULTADOS GENERALES

### Tasa de Éxito
- ✅ **Escenarios exitosos**: 27 (12.6%)
- ❌ **Escenarios fallidos**: 188 (87.4%)

### Métricas de Rendimiento
- **Tiempo promedio**: 95ms
- **P50 (mediana)**: 46ms
- **P95**: 537ms
- **P99**: 1,070ms
- **Tiempo mínimo**: 10ms
- **Tiempo máximo**: 1,076ms

### Throughput (Rendimiento)
- **Ola 1 (12 usuarios)**: 11.58 usuarios/seg
- **Ola 2 (25 usuarios)**: 47.62 usuarios/seg
- **Ola 3 (37 usuarios)**: 948.72 usuarios/seg
- **Ola 4 (50 usuarios)**: 1,136.36 usuarios/seg
- **Ola 5 (62 usuarios)**: 1,377.78 usuarios/seg

---

## 🔍 ANÁLISIS POR ENDPOINT

### Endpoints con Mejor Rendimiento (100% éxito)

| Endpoint | Peticiones | Tasa Éxito | Tiempo Promedio |
|----------|------------|------------|-----------------|
| `/api/cache/stats` | 9 | 100.0% | 7ms |
| `/api/horarios?año_nacimiento=2016` | 6 | 100.0% | 12ms |
| `/api/horarios?año_nacimiento=2012` | 1 | 100.0% | 66ms |
| `/api/horarios?año_nacimiento=2009` | 1 | 100.0% | 20ms |
| `/api/horarios?año_nacimiento=2017` | 1 | 100.0% | 9ms |
| `/api/horarios?año_nacimiento=2011` | 1 | 100.0% | 13ms |

### Endpoints con Problemas

| Endpoint | Peticiones | Tasa Éxito | Tiempo Promedio | Principal Error |
|----------|------------|------------|-----------------|-----------------|
| `/api/horarios` | 116 | 28.4% | 35ms | Rate limiting (83 veces) |
| `/api/consultar/{dni}` | ~120 | 10-40% | 40-70ms | Rate limiting |

---

## ⚠️ PROBLEMAS IDENTIFICADOS

### 1. **Rate Limiting Agresivo** (Problema Principal)
- El sistema tiene configurado un límite de peticiones muy restrictivo
- **198 errores totales** relacionados con "Ha excedido el límite de solicitudes"
- Afecta principalmente a:
  - `/api/horarios`: 83 veces bloqueado
  - `/api/consultar/12345678`: 17 veces bloqueado
  - `/api/consultar/99999999`: 9 veces bloqueado

### 2. **Errores 404**
- Algunos DNIs generan errores 404 (no encontrados)
- DNIs afectados: `39494949`, `70977424`, etc.
- Esto es **normal** para DNIs que no existen en la base de datos

### 3. **Degradación bajo Carga Alta**
- En oleadas con más de 37 usuarios concurrentes, el rate limiting se activa más frecuentemente
- Aunque el throughput aumenta, la tasa de éxito disminuye drásticamente

---

## ✅ ASPECTOS POSITIVOS

### 1. **Excelente Rendimiento de Caché**
- `/api/cache/stats`: 100% de éxito
- Los endpoints de filtrado por año tienen muy buena tasa de éxito cuando no se excede el límite

### 2. **Tiempos de Respuesta Rápidos**
- La mediana (P50) es de solo **46ms**
- El 95% de las peticiones exitosas responden en menos de **537ms**

### 3. **Sistema Estable**
- No hubo crashes del servidor
- No hubo errores 500 (errores internos)
- El sistema manejó hasta **1,377 usuarios/seg** sin caídas

---

## 🎯 EVALUACIÓN FINAL

### Estado Actual: ❌ DEFICIENTE

**Razón**: El rate limiting está configurado de manera muy restrictiva, bloqueando el 87.4% de las peticiones en un escenario de carga moderada.

### Recomendaciones

#### 🔧 CRÍTICO - Ajustar Rate Limiting
```javascript
// index.js - Línea actual del rate limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100,                 // ⚠️ MUY BAJO - solo 100 peticiones cada 15 min
    message: 'Ha excedido el límite de solicitudes. Por favor, intente más tarde.'
});
```

**Configuración recomendada para producción**:
```javascript
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,  // 1 minuto
    max: 300,                 // 300 peticiones por minuto
    message: 'Ha excedido el límite de solicitudes. Por favor, intente más tarde.',
    standardHeaders: true,
    legacyHeaders: false,
});
```

#### 📊 Configuración por Endpoint
Implementar rate limiting diferenciado:
- **Consultas (GET)**: 300/minuto
- **Inscripciones (POST)**: 60/minuto
- **Cache stats**: Sin límite (solo lectura)

#### 🚀 Optimizaciones Adicionales
1. **Implementar CDN** para archivos estáticos
2. **Mejorar caché** con TTL más largos para horarios
3. **Añadir paginación** para listados grandes
4. **Implementar circuit breaker** para Apps Script

---

## 📋 ESCENARIOS PROBADOS

### ✅ Escenario 1: Usuario nuevo consulta horarios
- Simula usuario navegando y filtrando horarios
- **Éxito cuando no hay rate limiting**

### ✅ Escenario 2: Usuario consulta su inscripción
- Búsqueda por DNI
- **Funciona correctamente** (los DNIs inexistentes devuelven 404 como esperado)

### ⚠️ Escenario 3: Flujo completo de inscripción
- La mayoría falló en el primer paso (verificación) por rate limiting

### ✅ Escenario 4: Usuario navega por el sistema
- Simula navegación real con delays
- **Funciona bien** cuando no se alcanza el límite

---

## 📊 CONCLUSIÓN

El sistema tiene una **arquitectura sólida** y tiempos de respuesta excelentes, pero el **rate limiting excesivamente restrictivo** impide que funcione correctamente bajo carga real.

### Próximos Pasos

1. **INMEDIATO**: Ajustar configuración de rate limiting
2. **CORTO PLAZO**: Re-ejecutar pruebas con nueva configuración
3. **MEDIANO PLAZO**: Implementar rate limiting por IP
4. **LARGO PLAZO**: Considerar balanceador de carga si el tráfico aumenta

---

## 📁 Archivos Generados

- `test-simulacion-real.js` - Script de pruebas
- `reporte-simulacion-real-2026-01-18-21-16-40.json` - Datos completos
- Este documento - Resumen ejecutivo

---

**Generado**: 18 de Enero de 2026  
**Equipo**: Jaguares Dev Team
