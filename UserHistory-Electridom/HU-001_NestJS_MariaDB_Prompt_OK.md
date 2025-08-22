# Prompt para Cursor — Backend HU-001 (NestJS + MariaDB)

**Rol:** Eres un desarrollador backend senior. Generarás una **API REST con NestJS (TypeScript)** usando **TypeORM** y **MariaDB**. Implementa arquitectura modular limpia, validación robusta, documentación Swagger, pruebas (unitarias y e2e), Docker y CI para Azure DevOps. El proyecto se llama **electridom-api**.

---

## Contexto del producto
Aplicación para cálculo/diseño de instalaciones eléctricas residenciales en República Dominicana. Entrada principal: JSON con `superficies[]` (ambientes y m²) y `consumos[]` (artefactos con watts y ambiente). Salida: **cargas por ambiente**, **totales**, **demanda estimada** y **propuesta preliminar** de circuitos base (iluminación y tomacorrientes), **sin materiales**.

> **Importante de cumplimiento**: No “cablear” valores normativos. Implementar un **Motor de Reglas data-driven** (tabla `norm_rules` con semillas por defecto). Todas las fórmulas deben tomar constantes desde el proveedor de reglas. Anotar `// TODO: validar con RIE RD/NEC` en cada regla semilla.

---

## Historia de Usuario: HU-001
**Como** diseñador eléctrico residencial  
**Quiero** enviar superficies y consumos de una vivienda  
**Para** obtener carga conectada total, demanda estimada y propuesta preliminar de circuitos (ILU/TOM), sin materiales.

### Criterios de Aceptación (API)
1. `POST /v1/calculations/preview` recibe:
   ```json
   {
     "superficies": [{ "ambiente": "Sala", "areaM2": 18.5 }],
     "consumos": [{ "nombre": "Televisor", "ambiente": "Sala", "watts": 120 }],
     "opciones": { "tensionV": 120, "monofasico": true }
   }
   ```
2. Validación:
   - `superficies` no vacío; `ambiente` único (case-insensitive); `areaM2` > 0.
   - `consumos.watts` ≥ 0; `consumos.ambiente` debe existir en `superficies`.
   - Unidades: áreas en m², potencias en W.
3. Uso del **Motor de Reglas** para:
   - Iluminación base por m².
   - Factores de demanda por tipo (iluminación, tomas, fijas).
   - Límite de VA por circuito (ILU/TOM).
4. Respuesta 200 (ejemplo):
   ```json
   {
     "cargasPorAmbiente": [
       {
         "ambiente": "Sala",
         "iluminacionVA": 1850,
         "tomasVA": 1200,
         "cargasFijasVA": 120,
         "totalVA": 3170
       }
     ],
     "totales": { "totalConectadaVA": 8120, "demandaEstimadaVA": 6120 },
     "propuestaCircuitos": [
       {
         "tipo": "ILU",
         "cargaAsignadaVA": 3200,
         "ambientesIncluidos": ["Sala", "Dormitorio 1"],
         "breakerSugerido": "15A // TODO validar RIE RD",
         "calibreSugerido": "AWG 14 // TODO validar RIE RD"
       },
       {
         "tipo": "TOM",
         "cargaAsignadaVA": 2920,
         "ambientesIncluidos": ["Sala", "Cocina"],
         "breakerSugerido": "20A // TODO validar RIE RD",
         "calibreSugerido": "AWG 12 // TODO validar RIE RD"
       }
     ],
     "warnings": [
       "Regla LUZ_VA_POR_M2 usa valor por defecto. TODO validar con RIE RD."
     ],
     "traceId": "..."
   }
   ```
5. Errores 400/422: `{"traceId":"...","errors":["El ambiente 'X' no existe para el consumo 'Y'."]}`
6. Rendimiento: respuesta < 1s en dataset pequeño (≤ 30 ambientes, ≤ 150 consumos).

---

## Criterios de Aceptación (Arquitectura y Calidad)
- **Módulos Nest**
  - `app` (bootstrap, config, swagger, filters).
  - `calculations` (controlador, DTOs, servicio de aplicación).
  - `rules` (entidad `NormRule`, repositorio, `RuleProvider`, seeds).
  - `common` (pipes, exceptions, tipos, utilidades, `TraceIdInterceptor`).

- **Capa de Dominio (dentro de modules)**
  - Servicios de dominio puros (`CalculationDomainService`).
  - Value Objects conceptuales (modelados vía tipos/DTO + validación).

- **Persistencia**
  - **TypeORM** con **MariaDB**.
  - Migraciones y **seed inicial** de `norm_rules`.
  - Repositorios por módulo.

- **Observabilidad**
  - Logger estructurado.
  - Filtro global de excepciones con `traceId`.

- **Documentación**
  - Swagger con ejemplos completos.

- **Pruebas**
  - Unitarias (Jest) para `CalculationDomainService`.
  - e2e con `@nestjs/testing` + `supertest` (usar SQLite en memoria para e2e).

- **Contenedores**
  - `Dockerfile` multi-stage para la API.
  - `docker-compose.yml` con `api`, `mariadb` y volumen persistente.

- **CI/CD**
  - `ci/azure-pipelines.yml`: instalar, lint, build, test (unit/e2e), publicar artefacto.

- **Estándares**
  - ESLint, Prettier, strict TS (`"strict": true`).

---

## Motor de Reglas (data-driven)
**Entidad `NormRule`**  
Campos: `id (uuid)`, `code (unique)`, `description`, `numericValue (decimal)`, `unit (string)`, `category (string)`, `source (string|null)`, `isDefault (bool)`, `updatedAt`.

**Seeds (valores placeholder, almacenar en BD):**
- `LUZ_VA_POR_M2 = 100.0` // TODO validar RIE RD
- `TOMA_VA_MAX_POR_CIRCUITO = 1800.0` // TODO validar RIE RD
- `ILU_VA_MAX_POR_CIRCUITO = 1440.0` // TODO validar RIE RD
- `FACTOR_DEMANDA_LUZ = 1.0` // TODO validar
- `FACTOR_DEMANDA_TOMA = 1.0` // TODO validar
- `FACTOR_DEMANDA_CARGAS_FIJAS = 1.0` // TODO validar

**Proveedor de reglas**
- `RuleProvider` con caché en memoria (TTL configurable).
- API: `getNumber(code: string, opts?: { fallback?: number; warnings: string[] })`.
- Si falta la regla: usar `fallback` y agregar `warnings`.

---

## Lógica de Negocio (resumen)
1. **Normalización de ambientes**: nombres case-insensitive, recortar espacios, rechazar duplicados.
2. **Cálculos por ambiente:**
   - `iluminacionVA = areaM2 * getNumber('LUZ_VA_POR_M2')`.
   - Clasificación de consumos: por defecto se tratan como **tomas** salvo lista blanca configurable para **fijas** (ej. horno/microondas si así se define luego). Para HU-001, todos los consumos a **tomas**, salvo se envíe un `factorUso` u otra marca (opcional) → incluir y documentar warning si no se provee.
   - `tomasVA = suma(consumos watts del ambiente)`.
   - `cargasFijasVA` (por ahora 0, salvo se configure lista).
   - `totalVA = suma de las tres`.
3. **Demanda**:
   - `demanda = ilumVA*FACTOR_DEMANDA_LUZ + tomasVA*FACTOR_DEMANDA_TOMA + fijasVA*FACTOR_DEMANDA_CARGAS_FIJAS`.
4. **Propuesta de circuitos**:
   - Particionar **ILU** y **TOM** separadamente. Empaquetar ambientes sin exceder `*_VA_MAX_POR_CIRCUITO` (estrategia first-fit decreasing).
   - Sugerencias `breakerSugerido` y `calibreSugerido` como **texto informativo** con `// TODO validar`.
5. **Warnings**:
   - Reglas en fallback, factores no provistos, consumos en ambientes no encontrados (error), nombres duplicados (error).

---

## Estructura del proyecto
```
electridom-api/
  src/
    app.module.ts
    main.ts
    common/
      exceptions/http-exception.filter.ts
      interceptors/trace-id.interceptor.ts
      dto/pagination.dto.ts (si aplica)
      utils/strings.ts
    rules/
      rules.module.ts
      entities/norm-rule.entity.ts
      rules.service.ts (repo)
      rule-provider.service.ts
      seeds/norm-rules.seed.ts
    calculations/
      calculations.module.ts
      calculations.controller.ts
      dto/preview.request.dto.ts
      dto/preview.response.dto.ts
      services/calculation-domain.service.ts
      services/calculation-app.service.ts
    config/
      configuration.ts
  test/
    unit/calculation-domain.service.spec.ts
    e2e/app.e2e-spec.ts
  ormconfig.ts (o data-source.ts)
  docker/
    docker-compose.yml
  ci/
    azure-pipelines.yml
```

---

## Entidades y DTOs

**Entidad TypeORM: `NormRule`**
```ts
import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'norm_rules' })
export class NormRule {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) code: string;
  @Column() description: string;
  @Column('decimal', { precision: 12, scale: 3 }) numericValue: string;
  @Column() unit: string;
  @Column() category: string;
  @Column({ nullable: true }) source?: string;
  @Column({ default: true }) isDefault: boolean;
  @UpdateDateColumn() updatedAt: Date;
}
```

**Request DTO**
```ts
import { IsArray, ArrayMinSize, IsString, IsNotEmpty, IsNumber, Min, IsOptional, Max, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

class SuperficieDto {
  @IsString() @IsNotEmpty() ambiente: string;
  @IsNumber() @Min(0.0001) areaM2: number;
}
class ConsumoDto {
  @IsString() @IsNotEmpty() nombre: string;
  @IsString() @IsNotEmpty() ambiente: string;
  @IsNumber() @Min(0) watts: number;
  @IsOptional() @IsNumber() @Min(0) @Max(1) factorUso?: number;
}
class OpcionesDto {
  @IsOptional() @IsNumber() tensionV?: number; // 120 por defecto
  @IsOptional() @IsBoolean() monofasico?: boolean; // true por defecto
}
export class PreviewRequestDto {
  @IsArray() @ValidateNested({ each: true }) @Type(() => SuperficieDto) @ArrayMinSize(1) superficies: SuperficieDto[];
  @IsArray() @ValidateNested({ each: true }) @Type(() => ConsumoDto) consumos: ConsumoDto[];
  @ValidateNested() @Type(() => OpcionesDto) @IsOptional() opciones?: OpcionesDto;
}
```

**Response DTO (esqueleto)**
```ts
export class PreviewResponseDto {
  cargasPorAmbiente: Array<{
    ambiente: string;
    iluminacionVA: number;
    tomasVA: number;
    cargasFijasVA: number;
    totalVA: number;
  }>;
  totales: { totalConectadaVA: number; demandaEstimadaVA: number; };
  propuestaCircuitos: Array<{
    tipo: 'ILU' | 'TOM';
    cargaAsignadaVA: number;
    ambientesIncluidos: string[];
    breakerSugerido: string;
    calibreSugerido: string;
  }>;
  warnings: string[];
  traceId: string;
}
```

---

## Configuración y entorno
- **Paquetes clave**: `@nestjs/common`, `@nestjs/core`, `@nestjs/swagger`, `class-validator`, `class-transformer`, `typeorm`, `mysql2` (driver MariaDB), `dotenv`, `winston` (opcional).
- **Variables (.env)**
  - `APP_PORT=3000`
  - `DB_HOST=mariadb`
  - `DB_PORT=3306`
  - `DB_USER=electridom`
  - `DB_PASS=electridom`
  - `DB_NAME=electridom`
  - `RULE_CACHE_TTL_MS=60000`
  - `APPLY_MIGRATIONS_ON_STARTUP=true`
- **TypeORM DataSource** con migraciones y sincronización desactivada en prod.
- **Bootstrap**: si `APPLY_MIGRATIONS_ON_STARTUP=true`, ejecutar migraciones y **seed** `NormRule` si la tabla está vacía.

---

## Swagger
- Configurar `SwaggerModule` en `main.ts` con `title`, `description`, `version`, y **ejemplos de request/response**.
- Prefijo global `/v1`.

---

## Controlador y Servicios
- **`CalculationsController`**
  - `POST /v1/calculations/preview`:
    - Pipe global `ValidationPipe` con transform y whitelist.
    - Llama a `CalculationAppService.preview(dto)`.
- **`CalculationDomainService`**
  - Funciones puras: normalización de ambientes, cálculo de VA por m², suma de cargas, demanda, empaquetado de circuitos (first-fit decreasing), generación de warnings.
- **`RuleProviderService`**
  - Lee `NormRule` por `code`. Si no existe → usar `fallback` y registrar warning.
  - Caché en memoria con TTL.

---

## Manejo de errores y `traceId`
- Filtro global que captura excepciones y responde con `{ traceId, errors[] }`.
- Interceptor `TraceIdInterceptor` que añade `traceId` (UUID v4) al `request` y lo expone en respuestas.

---

## Docker
**Dockerfile (multi-stage)**
- Stage build: `node:20-alpine` → `npm ci`, `npm run build`.
- Stage run: `node:20-alpine` → copiar `dist`, `package*.json`, `npm ci --omit=dev`, `node dist/main.js`.
- Expose `${APP_PORT}`.

**docker-compose.yml**
- Servicios:
  - `api`: build `.`; env desde `.env`; depende de `mariadb`; puertos `3000:3000`.
  - `mariadb`: imagen `mariadb:11`; env `MARIADB_USER`, `MARIADB_PASSWORD`, `MARIADB_DATABASE`, `MARIADB_ROOT_PASSWORD`; volumen persistente; healthcheck.
  - (Opcional) `adminer` en `8080:8080`.

---

## Pruebas
- **Unitarias** (`jest`): casos felices y validaciones de dominio.
- **e2e**: bootstrap Nest con TypeOrm sqlite in-memory (`:memory:`), sincronización ON solo en test; probar `POST /v1/calculations/preview` con datos ejemplo; 400 en casos inválidos; warning cuando falta regla.
- Scripts:
  - `"test": "jest"`
  - `"test:e2e": "jest --config test/jest-e2e.json"`

---

## CI (Azure DevOps)
`ci/azure-pipelines.yml`:
- Pool Ubuntu.
- Steps:
  - `NodeTool@0` (Node 20).
  - `npm ci`
  - `npm run lint`
  - `npm run build`
  - `npm test`
  - `npm run test:e2e`
  - Publicar `dist/` como artefacto.

---

## Entregables que debes generar ahora
1. Proyecto NestJS inicializado y modularizado (`calculations`, `rules`, `common`, `config`).
2. Entidad `NormRule`, repo y migraciones TypeORM.
3. **Seed** inicial de `norm_rules`.
4. `RuleProviderService` con caché y warnings.
5. `CalculationDomainService` y `CalculationAppService`.
6. `CalculationsController` con `POST /v1/calculations/preview`.
7. Validación con `class-validator` y `ValidationPipe` global.
8. Filtro global de errores + `TraceIdInterceptor`.
9. Swagger configurado + ejemplos.
10. `Dockerfile` y `docker-compose.yml` (API + MariaDB + volumen).
11. Pruebas unitarias y e2e.
12. `ci/azure-pipelines.yml`.
13. `README.md` con instrucciones `npm run start:dev`, migraciones y `docker-compose up`.

---

**Entrega ahora todo el código y archivos listados.**
