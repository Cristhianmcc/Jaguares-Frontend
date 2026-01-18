# Implementación: Subir Comprobante Tardío

## ✅ Completado:
1. Tabla `pagos_mensuales` creada en MySQL

## 🔄 En Progreso:
Funcionalidad para subir comprobante cuando no lo hicieron durante la inscripción

## 📝 Próximos Pasos:
1. Modificar `consulta.js` - Agregar botón "Subir Comprobante" cuando `comprobante_pago IS NULL`
2. Crear endpoint `/api/subir-comprobante-tardio/:dni` en `server/index.js`
3. Actualizar MySQL `alumnos.comprobante_pago`
4. Enviar a hoja PAGOS del Sheet

## Estado: EN DESARROLLO
No se ha roto ninguna funcionalidad existente.
