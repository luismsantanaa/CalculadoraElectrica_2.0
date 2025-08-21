# Prompt para Cursor — Backend HU-002 (NestJS + MariaDB)

**Rol:** Eres un desarrollador backend senior. Continuarás el backend en **NestJS + TypeScript** con **TypeORM** y **MariaDB** en el monorepo/proyecto `electridom-api`. Debes implementar **persistencia y versionado** de proyectos de cálculo, reusando el motor de cálculo de la HU-001 y el **Motor de Reglas data-driven**.

---

## Contexto del producto
El sistema calcula y diseña instalaciones eléctricas residenciales en RD. En la HU-001 ya existe el endpoint `POST /v1/calculations/preview` que calcula cargas y propuesta preliminar de circuitos a partir de `superficies[]` y `consumos[]` usando reglas normativas parametrizables (`norm_rules`).

**Objetivo en HU-002:** Persistir **Proyectos** y sus **Versiones** con **auditoría reproducible** (entradas, salidas, warnings, firma de reglas usadas). Permitir **crear**, **versionar**, **consultar**, **listar**, **archivar** y **exportar** proyectos. Todas las validaciones de HU-001 aplican también aquí.

> **Requisito de auditoría:** guardar la **firma de reglas** (hash) para cada versión, calculada a partir de `code`, `numericValue` y `updatedAt` de `norm_rules`. Si cambian las reglas entre versiones, debe aparecer un **warning** recordando esa diferencia.

---

## Historia de Usuario: HU-002
**Como** diseñador eléctrico residencial  
**Quiero** guardar y versionar los cálculos de una vivienda  
**Para** poder retomarlos luego, compararlos y auditar qué reglas y datos se utilizaron en cada versión.

### Criterios de Aceptación (API)
1. **Crear proyecto (y versión 1 opcional)**
   - `POST /v1/projects`
   - Request:
     ```json
     {
       "projectName": "Residencia García",
       "description": "Unifamiliar 2 plantas",
       "superficies": [{ "ambiente": "Sala", "areaM2": 18.5 }],
       "consumos": [{ "nombre": "Televisor", "ambiente": "Sala", "watts": 120 }],
       "opciones": { "tensionV": 120, "monofasico": true },
       "computeNow": true
     }
     ```
   - Reglas:
     - Si `computeNow=true` → ejecutar cálculo (reusar servicio de HU-001) y almacenar **snapshot** de entradas/salidas como **Versión 1**.
     - Si `false` → crear proyecto sin versiones.
   - Respuesta 201:
     ```json
     {
       "projectId": "uuid",
       "projectName": "Residencia García",
       "status": "ACTIVE",
       "latestVersion": {
         "versionId": "uuid",
         "versionNumber": 1,
         "createdAt": "2025-08-19T18:00:00Z",
         "rulesSignature": "sha256:...",
         "totales": { "totalConectadaVA": 8120, "demandaEstimadaVA": 6120 }
       }
     }
     ```

2. **Crear nueva versión**
   - `POST /v1/projects/{projectId}/versions`
   - Request: mismos DTOs de entrada (`superficies`, `consumos`, `opciones`). Opcional `note`.
   - Comportamiento:
     - Valida entradas (como HU-001).
     - Ejecuta cálculo con **reglas actuales**.
     - Incrementa `versionNumber` (transaccional) y guarda snapshot.
   - Respuesta 201: datos completos de la nueva versión (ver punto 4).

3. **Obtener proyecto (resumen con última versión)**
   - `GET /v1/projects/{projectId}` → metadatos + última versión (solo totales y timestamps).
   - 404 si no existe o si está archivado y `includeArchived=false` por defecto.

4. **Obtener versión específica (detalle completo)**
   - `GET /v1/projects/{projectId}/versions/{versionId}`
   - Respuesta 200:
     ```json
     {
       "projectId": "uuid",
       "versionId": "uuid",
       "versionNumber": 2,
       "createdAt": "2025-08-19T18:25:00Z",
       "input": {
         "superficies": [ ... ],
         "consumos": [ ... ],
         "opciones": { "tensionV": 120, "monofasico": true }
       },
       "output": {
         "cargasPorAmbiente": [ ... ],
         "totales": { "totalConectadaVA": 8120, "demandaEstimadaVA": 6120 },
         "propuestaCircuitos": [ ... ],
         "warnings": [ "Reglas cambiaron respecto a la versión 1" ]
       },
       "rulesSignature": "sha256:...",
       "rulesChangedFromPrevious": true,
       "note": "Ajuste de consumos cocina",
       "traceId": "..."
     }
     ```

5. **Listar proyectos (paginado/búsqueda)**
   - `GET /v1/projects?query=&page=1&pageSize=20&includeArchived=false`
   - Respuesta: lista con `projectId`, `projectName`, `status`, `createdAt`, `updatedAt`, `latestVersion.versionNumber`.

6. **Archivar / restaurar proyecto**
   - `PATCH /v1/projects/{projectId}` body: `{ "status": "ARCHIVED" }` o `{ "status": "ACTIVE" }`.
   - No borra datos.

7. **Exportar proyecto (bundle JSON)**
   - `GET /v1/projects/{projectId}/export` → JSON con `project`, `versions[]` completos.

8. **Errores formales**
   - 400/422 con `{ "traceId":"...", "errors":[ "..."] }`.
   - 409 si hay contención de versionado (reintentar).

9. **Rendimiento**
   - Respuesta < 1.5s para proyectos de hasta 50 ambientes / 300 consumos.

---

## Criterios de Aceptación (Arquitectura y Calidad)
- **Nuevos Módulos Nest**
  - `projects` (controlador, servicios de aplicación y dominio, repos).
  - Reusar `calculations` (HU-001) y `rules` para cálculo y firma de reglas.
- **Entidades TypeORM**
  - `Project` y `ProjectVersion` (ver esquema más abajo).
- **Transaccionalidad**
  - Crear versión debe ser transaccional (BEGIN/COMMIT/ROLLBACK).
- **Integridad**
  - `versionNumber` autoincremental por proyecto con restricción única `(projectId, versionNumber)`.
  - Límite configurable de versiones por proyecto (por defecto 100) → si se excede, rechazar con 422 y mensaje claro.
- **Auditoría**
  - `rulesSignature` (hash) por versión.
  - Guardar `warnings[]` del cálculo.
- **Observabilidad**
  - Logs con `traceId`.
- **Swagger**
  - Documentar ejemplos de cada endpoint.
- **Pruebas**
  - Unitarias: versionado, firma de reglas, detección de cambios de reglas.
  - e2e: crear proyecto, crear versiones, obtener detalle, exportar.
- **Docker/CI**
  - Reusar `Dockerfile`, `docker-compose.yml` y `ci/azure-pipelines.yml` existentes.

---

## Motor de Reglas y Firma
- Servicio `RuleSignatureService`:
  - Lee todas las `norm_rules` (campos: `code`, `numericValue`, `updatedAt`), las ordena por `code` y genera `sha256` de la cadena JSON canónica.
  - API: `getCurrentSignature(): string`.
- Cuando se crea una **Versión**, guardar `rulesSignature`.  
- Campo derivado en respuesta: `rulesChangedFromPrevious = prev.rulesSignature !== current.rulesSignature`.

---

## Esquema de Datos (TypeORM)

**Entidad `Project`**
```ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ProjectVersion } from './project-version.entity';

export type ProjectStatus = 'ACTIVE' | 'ARCHIVED';

@Entity({ name: 'projects' })
export class Project {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ length: 120 }) projectName: string;

  @Column({ type: 'text', nullable: true }) description?: string;

  @Column({ type: 'varchar', length: 16, default: 'ACTIVE' })
  status: ProjectStatus;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;

  @OneToMany(() => ProjectVersion, v => v.project) versions: ProjectVersion[];
}
```

**Entidad `ProjectVersion`**
```ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index, JoinColumn } from 'typeorm';
import { Project } from './project.entity';

@Entity({ name: 'project_versions' })
@Index(['projectId', 'versionNumber'], { unique: true })
export class ProjectVersion {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column('uuid') projectId: string;
  @ManyToOne(() => Project, p => p.versions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' }) project: Project;

  @Column({ type: 'int' }) versionNumber: number;

  // Snapshot de entradas
  @Column('json') inputSuperficies: any;
  @Column('json') inputConsumos: any;
  @Column('json', { nullable: true }) inputOpciones?: any;

  // Snapshot de salidas
  @Column('json') outputCargasPorAmbiente: any;
  @Column('json') outputTotales: any;
  @Column('json') outputPropuestaCircuitos: any;
  @Column('json', { default: '[]' }) outputWarnings: any;

  // Auditoría de reglas
  @Column({ length: 200 }) rulesSignature: string;

  // Nota opcional del usuario
  @Column({ type: 'varchar', length: 240, nullable: true }) note?: string;

  @CreateDateColumn() createdAt: Date;
}
```

**Migraciones mínimas**
- `projects`: (`id`, `projectName`, `description`, `status`, `createdAt`, `updatedAt`).
- `project_versions`: (`id`, `projectId` FK, `versionNumber` unique por proyecto, `input*` JSON, `output*` JSON, `rulesSignature`, `note`, `createdAt`).

---

## DTOs

**Crear Proyecto**
```ts
import { IsString, IsNotEmpty, MaxLength, IsOptional, IsBoolean, ValidateNested, ArrayMinSize, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { PreviewRequestDto } from '../../calculations/dto/preview.request.dto'; // reutilizar tipos hijos

class CreateProjectBaseDto {
  @IsString() @IsNotEmpty() @MaxLength(120) projectName: string;
  @IsOptional() @IsString() @MaxLength(500) description?: string;
}

export class CreateProjectRequestDto extends CreateProjectBaseDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => Object) superficies: PreviewRequestDto['superficies'];
  @IsArray() @ValidateNested({ each: true }) @Type(() => Object) consumos: PreviewRequestDto['consumos'];
  @ValidateNested() @Type(() => Object) @IsOptional() opciones?: PreviewRequestDto['opciones'];
  @IsOptional() @IsBoolean() computeNow?: boolean; // default true
}
```

**Crear Versión**
```ts
import { IsOptional, IsString, MaxLength } from 'class-validator';
export class CreateVersionRequestDto {
  superficies: any[]; // mismos contratos que HU-001
  consumos: any[];
  opciones?: any;
  @IsOptional() @IsString() @MaxLength(240) note?: string;
}
```

**Respuestas resumidas**
```ts
export class ProjectSummaryDto {
  projectId: string;
  projectName: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  latestVersion?: { versionId: string; versionNumber: number; createdAt: string; rulesSignature: string; totales?: any; };
}

export class ProjectVersionDetailDto {
  projectId: string;
  versionId: string;
  versionNumber: number;
  createdAt: string;
  input: { superficies: any[]; consumos: any[]; opciones?: any; };
  output: { cargasPorAmbiente: any[]; totales: any; propuestaCircuitos: any[]; warnings: string[]; };
  rulesSignature: string;
  rulesChangedFromPrevious: boolean;
  note?: string;
  traceId: string;
}
```

---

## Servicios y Flujos

**ProjectsAppService**
- `createProject(dto)`:
  - Normaliza y valida entradas (reusar validaciones HU-001).
  - Crea `Project` (status `ACTIVE`).
  - Si `computeNow !== false`: llama `CalculationAppService.preview()` → crea `ProjectVersion` con `versionNumber=1` y snapshots.
  - Devuelve `ProjectSummaryDto`.

- `createVersion(projectId, dto)`:
  - Verifica que el proyecto exista y no esté `ARCHIVED`.
  - Obteniene `lastVersion.versionNumber` con `SELECT ... FOR UPDATE` (o equivalente).
  - Ejecuta cálculo → compone snapshots.
  - Genera `rulesSignature` con `RuleSignatureService`.
  - Compara con firma previa y añade warning si difiere.
  - Inserta nueva versión con `versionNumber = previous + 1` en transacción.

- `getProject(projectId)` y `getVersion(projectId, versionId)`.
- `listProjects(params)` con paginación e índice por `createdAt`/`projectName`.
- `updateProjectStatus(projectId, status)`.

**Capa dominio**
- Reusar `CalculationDomainService` (HU-001).
- `RuleSignatureService` para hash SHA-256 (usa `crypto` nativo).

---

## Controlador (`ProjectsController`)
- `POST /v1/projects` → crear proyecto (+ versión 1 si `computeNow`).
- `POST /v1/projects/:projectId/versions` → nueva versión.
- `GET /v1/projects/:projectId` → resumido.
- `GET /v1/projects/:projectId/versions/:versionId` → detalle.
- `GET /v1/projects` → listado paginado.
- `PATCH /v1/projects/:projectId` body `{ status: 'ARCHIVED' | 'ACTIVE' }`.
- `GET /v1/projects/:projectId/export` → bundle JSON.

Registrar en Swagger con ejemplos de request/response.

---

## Validaciones y Errores
- Reutilizar `ValidationPipe` global (transform + whitelist).
- Validaciones de HU-001 para `superficies` y `consumos`.
- `traceId` en todas las respuestas y en errores `{ traceId, errors[] }`.
- `409 Conflict` si falla la asignación concurrente de `versionNumber` (reintento recomendado por el cliente).

---

## Configuración y Entorno
- **.env** agrega:
  - `MAX_VERSIONS_PER_PROJECT=100`
- Respetar `DB_*` de HU-001 (MariaDB).
- Indices recomendados:
  - `projects(projectName)`, `projects(status, updatedAt)`
  - `project_versions(projectId, versionNumber)` (unique)

---

## Pruebas
- **Unitarias** (Jest):
  - Firma de reglas estable ante mismo set de reglas.
  - Detección de cambio de firma cuando cambia algún `numericValue` o `updatedAt`.
  - Incremento correcto de `versionNumber` con concurrencia simulada (mocks).
- **e2e**:
  - Crear proyecto con `computeNow=true` y verificar versión 1.
  - Crear nueva versión y verificar `rulesChangedFromPrevious` cuando se modifica una regla.
  - Exportar proyecto y validar estructura.

---

## Entregables que debes generar ahora
1. Módulo `projects` con controlador, servicios (app y dominio), DTOs y mapeos.
2. Entidades `Project` y `ProjectVersion` con migraciones TypeORM.
3. Servicio `RuleSignatureService` (sha256) y su prueba unitaria.
4. Integración con `CalculationAppService` (HU-001) para construir snapshots.
5. Endpoints REST según criterios (Swagger con ejemplos).
6. Manejo de errores con `traceId` consistente.
7. Tests unitarios y e2e.
8. Actualización de `docker-compose.yml` si es necesario (no debería).
9. Documentación en `README.md` sección HU-002 (uso de endpoints).

---

**Entrega ahora todo el código y archivos listados.**
