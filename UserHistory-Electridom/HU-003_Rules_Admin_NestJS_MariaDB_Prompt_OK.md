# Prompt para Cursor — Backend HU-003 (NestJS + MariaDB) — **Administración de Reglas Normativas (CRUD + Conjuntos de Reglas)**

**Rol:** Eres un desarrollador backend senior. Continuarás el backend en **NestJS + TypeScript** con **TypeORM** y **MariaDB** dentro del proyecto `electridom-api`. Implementarás **CRUD de Reglas Normativas**, **Conjuntos de Reglas (RuleSets)**, auditoría de cambios y utilidades de importación/exportación, manteniendo compatibilidad con HU-001 (cálculo) y HU-002 (proyectos/versionado).

> Objetivo: operar el **Motor de Reglas data-driven** desde la API (crear/editar/publicar conjuntos de reglas), de forma auditable y reproducible. El sistema de cálculo debe poder usar el `RuleSet` ACTIVO por fecha efectiva o uno específico indicado por el cliente.

---

## Contexto del producto
- HU-001: `POST /v1/calculations/preview` calcula cargas y propuesta de circuitos usando reglas.
- HU-002: se guardan **Proyectos** con **Versiones** y una **firma de reglas (sha256)** usada en cada versión.
- HU-003: agregar **gestión operativa de reglas**:
  - **RuleSets**: colección nombrada de reglas (`code`/`numericValue`/`unit`/`updatedAt`) con estado y vigencia.
  - **Publicación**: activar un RuleSet (por rango de fechas) que será tomado por defecto por el cálculo.
  - **Auditoría**: registrar quién cambió qué, cuándo y de qué valor a cuál.
  - **Interoperabilidad**: importar/exportar RuleSets en JSON.
  - **Compatibilidad**: `RuleProviderService` debe resolver el RuleSet activo por fecha **o** un `rulesetId` solicitado.

> **Seguridad mínima**: Como aún no hay autenticación completa, agrega un **API Key Guard** para endpoints de administración: leer `x-api-key` o `Authorization: ApiKey <key>` y comparar con `ADMIN_API_KEY` del `.env`. Si falta o no coincide → 401.

---

## Historia de Usuario: HU-003
**Como** responsable técnico del diseño eléctrico  
**Quiero** crear, editar y publicar conjuntos de reglas normativas  
**Para** asegurar que los cálculos usen parámetros vigentes, con trazabilidad de cambios y posibilidad de revertir.

### Criterios de Aceptación (API)
1. **Crear RuleSet (borrador)**
   - `POST /v1/rulesets` *(protegido por API Key)*
   - Request:
     ```json
     {
       "name": "RIE-RD Baseline 2025-08",
       "description": "Semilla basada en RIE RD (placeholder)",
       "effectiveFrom": "2025-09-01T00:00:00Z",
       "effectiveTo": null
     }
     ```
   - Respuesta 201: metadatos del RuleSet (`id`, `status=DRAFT`, fechas, contadores).

2. **Cargar/Actualizar reglas (bulk upsert en DRAFT)**
   - `PUT /v1/rulesets/{rulesetId}/rules` *(protegido)*
   - Request (ejemplo mínimo):
     ```json
     {
       "rules": [
         { "code": "LUZ_VA_POR_M2", "description": "VA por m² iluminación", "numericValue": 100.0, "unit": "VA/m2", "category": "ILU", "source": "TODO validar RIE RD" },
         { "code": "TOMA_VA_MAX_POR_CIRCUITO", "description": "Límite VA por circuito TOM", "numericValue": 1800.0, "unit": "VA", "category": "TOM" }
       ],
       "actor": "lsantana"
     }
     ```
   - Comportamiento:
     - Upsert por `(rulesetId, code)`.
     - Registrar cambios en `RuleChangeLog` (antes/después).

3. **Publicar RuleSet**
   - `POST /v1/rulesets/{rulesetId}/publish` *(protegido)*
   - Reglas:
     - Sólo `DRAFT` → `ACTIVE`.
     - Validar fechas (`effectiveFrom` ≤ `effectiveTo` o `null`).
     - **Exclusividad por fecha**: no permitir solapamiento de RuleSets `ACTIVE` para intervalos que se crucen.

4. **Retirar (RETIRE) RuleSet**
   - `POST /v1/rulesets/{rulesetId}/retire` *(protegido)*
   - Cambia `status` a `RETIRED`. No borra reglas.

5. **Listar RuleSets**
   - `GET /v1/rulesets?status=&query=&page=&pageSize=`
   - Retorna `id`, `name`, `status`, `effectiveFrom/To`, `rulesCount`, `createdAt/updatedAt`.

6. **Obtener RuleSet (detalle)**
   - `GET /v1/rulesets/{rulesetId}` → metadatos + lista de reglas (paginable).

7. **Diff entre RuleSets**
   - `GET /v1/rulesets/{a}/diff/{b}` → arrays `added[]`, `removed[]`, `changed[]` (por `code`).

8. **Exportar RuleSet**
   - `GET /v1/rulesets/{rulesetId}/export` → JSON portable con metadatos y `rules[]`.

9. **Importar RuleSet**
   - `POST /v1/rulesets/import` *(protegido)* → crea `DRAFT` con `rules[]` y metadatos.

10. **Resolver reglas para cálculo**
    - `GET /v1/rules/active?at=2025-09-10T00:00:00Z` → devuelve `ruleset` vigente y `rules[]`.
    - Endpoints de HU-001/002 aceptan `?rulesetId=` o `X-Ruleset-Id`.

11. **Errores**
    - 400/422 validaciones; 409 en conflicto de fechas; `{ "traceId": "...", "errors": ["..."] }`.

---

## Arquitectura y Módulos
- `rules-admin` (controller, app service, domain service).
- `security` (ApiKeyGuard).
- Reusar `rules` (`NormRule`, `RuleProviderService`).
- Extender `RuleProviderService` para `rulesetId` y resolución por fecha.

---

## Esquema de Datos (TypeORM) — Resumen
- `RuleSet` con `status`, `effectiveFrom/To`.
- `NormRule` pertenece a `RuleSet` (`ruleSetId`, `unique(ruleSetId, code)`).
- `RuleChangeLog` para auditoría (before/after, actor).

---

## DTOs principales
- `CreateRuleSetDto`, `UpdateRuleSetDto` (name, description, effective dates).
- `BulkUpsertRulesDto` con `rules[]` (code, description, numericValue, unit, category, source?, isDefault?).

---

## Seguridad mínima (ApiKey)
- `.env`: `ADMIN_API_KEY=...`
- Guard: `x-api-key` o `Authorization: ApiKey <key>` → 401 si inválido.

---

## Pruebas
- Unitarias: solapamientos al publicar, upsert con `RuleChangeLog`, resolución por `at`/`rulesetId`.
- e2e: DRAFT→upsert→publish→resolver activo→calcular preview; diff; export/import.

---

## Entregables
1. Módulo `rules-admin` + migraciones.
2. Actualizar `NormRule` + migraciones.
3. `RuleChangeLog` + registro en upsert.
4. `ApiKeyGuard`.
5. Extensiones en `RuleProviderService` y `CalculationAppService`.
6. Swagger y pruebas.
7. README sección HU-003.
