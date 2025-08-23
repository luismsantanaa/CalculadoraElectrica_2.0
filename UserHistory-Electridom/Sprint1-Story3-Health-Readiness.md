# Historia 3 — Health & Readiness (/health)

## Contexto
Necesitamos endpoints de salud para despliegue y monitoreo.

## Objetivo
- `GET /health` con **liveness** y **readiness**.
- Checks: **base de datos MariaDB** (TypeORM ping) y **disco** (espacio libre mínimo).  
  (Redis u otros servicios podrán agregarse luego.)

## Dependencias
- `@nestjs/terminus`

## Tareas para Cursor
1. Instalar y configurar Terminus; crear `HealthModule`.
2. Implementar:
   - Liveness: proceso vivo.
   - Readiness: DB `SELECT 1`, y check de almacenamiento (ruta `/tmp` o `process.cwd()`).
3. Estructura de respuesta:
```json
{ "status":"ok","info":{...},"error":{...},"details":{...} }
```
4. Añadir a Swagger (summary y ejemplos).
5. Tests e2e:  
   - DB down → readiness `status: "error"` / HTTP 503.  
   - Normal → HTTP 200.

## Criterios de Aceptación
- `/health` retorna 200 cuando DB está OK.
- Cuando DB falla, readiness devuelve 503.