# Prompt para Cursor — **Modificación** (NO feature nueva): Endurecimiento de Autenticación JWT, Usuarios y Autorización (NestJS + MariaDB)

**Rol:** Eres un desarrollador backend senior. **No crearás un módulo nuevo**; **modificarás/refactorizarás** el existente de **autenticación JWT** y **gestión de usuarios** en `electridom-api` (NestJS + TypeORM + MariaDB) para elevar la seguridad, trazabilidad y control de sesiones. Mantén compatibilidad hacia atrás con los endpoints actuales (login/refresh/logout/usuarios) y con los módulos `calculations`, `projects` y `rules/rules-admin`.

---

## Objetivo
Endurecer la seguridad, **sin romper clientes actuales**:
- Rotación segura de JWT (access/refresh) con **sesiones por dispositivo** y lista de revocación.
- Soporte para **claves RSA (RS256) con KID** y endpoint **JWKS**.
- **RBAC** claro (roles/permisos) aplicado en endpoints existentes (sin cambiar rutas).
- **Brute-force / rate limiting** y bloqueo temporal de cuentas.
- 2FA **opcional** (TOTP) sujeto a feature flag.
- Auditoría de eventos críticos (inicios de sesión, reseteos, cambios de rol).

> Presenta todos los cambios como **modificaciones incrementales**. No elimines endpoints actuales; añade campos y cabeceras nuevas de forma no disruptiva.

---

## Alcance (Modificaciones)
1. **Tokens y sesiones**
   - Acceso (JWT) corto: **10–15 min**. Refresh: **7–30 días**, **rotado** en cada uso.
   - Guardar **sesiones** por usuario/dispositivo con `jti` y **refresh hash** (Argon2id).
   - Detección y mitigación de **reutilización** de refresh (token theft).
   - Revocación de **una** sesión, **todas** las sesiones o por **deviceId**.

2. **Criptografía y claves**
   - Soporte **RS256** con **`kid`** y **JWKS** (`GET /v1/.well-known/jwks.json`).
   - Compatibilidad con HS256 actual mediante `AUTH_JWT_ALG=HS256|RS256`.
   - **Rotación de claves**: estrategia `rolling` con par activo + par próximo (variables/env o archivos montados).

3. **RBAC y permisos (aplicación suave)**
   - Decoradores `@Roles(...)` y `@Permissions(...)`.
   - Roles mínimos: `ADMIN`, `DESIGNER`, `AUDITOR`.
   - Permisos ejemplo: `rulesets:publish`, `projects:write`, `projects:read`, `users:admin`.
   - No romper rutas existentes: solo **aplicar guardas** donde corresponda (p. ej., `rules-admin` requiere `ADMIN`).

4. **Endurecimiento de credenciales**
   - Hash **Argon2id** para contraseñas. Campos: `passwordHash`, `passwordAlgo`.
   - **Política** configurable: longitud mínima, complejidad básica, historial opcional (últimas N) y `lastPasswordChangeAt`.
   - Bloqueo temporal tras N intentos fallidos (`failedLoginCount`, `lockUntil`).

5. **2FA TOTP (opcional, feature flag)**
   - Variables: `AUTH_TOTP_ENABLED=true|false` (por defecto `false`).
   - Flujos: **enroll**, **verify**, **disable**, **backup codes**. Aplicar **solo** si la bandera está activa.

6. **Rate limiting / DoS**
   - `@nestjs/throttler` a nivel de `auth` y global. Cabeceras `Retry-After`.
   - Persistencia opcional en BD para contadores (si no hay Redis).

7. **Auditoría**
   - Tabla `audit_logs` para: login success/fail, refresh, logout, password change, role/permission change.
   - Incluir `traceId`, `ip`, `userAgent`, `userId` (si aplica).

8. **Headers y CORS**
   - `helmet` + CORS restrictivo por `ALLOWED_ORIGINS`.
   - Cookies `HttpOnly/Secure/SameSite` si se usa cookie para refresh (opcional, mantener compatibilidad con body).

---

## Especificaciones Técnicas (Cambios)

### 1) Esquema de Datos (TypeORM) — **Migraciones incrementales**
**Tabla `users` (añadir columnas):**
```ts
passwordHash VARCHAR(255) NOT NULL,
passwordAlgo VARCHAR(16) NOT NULL DEFAULT 'argon2id',
failedLoginCount INT NOT NULL DEFAULT 0,
lockUntil DATETIME NULL,
lastPasswordChangeAt DATETIME NULL,
is2faEnabled BOOLEAN NOT NULL DEFAULT 0,
otpSecret VARBINARY(255) NULL,
otpBackupCodes VARBINARY(2048) NULL
```

**Nuevas tablas:**
```ts
CREATE TABLE user_sessions (
  id CHAR(36) PRIMARY KEY,
  userId CHAR(36) NOT NULL,
  deviceId VARCHAR(64) NULL,
  ip VARCHAR(64) NULL,
  userAgent VARCHAR(256) NULL,
  refreshHash VARCHAR(255) NOT NULL,
  jti VARCHAR(64) NOT NULL,
  isRevoked BOOLEAN NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  lastUsedAt DATETIME NULL,
  revokedAt DATETIME NULL,
  CONSTRAINT fk_sessions_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(userId, jti)
);

CREATE TABLE roles (
  id CHAR(36) PRIMARY KEY,
  code VARCHAR(32) UNIQUE NOT NULL,
  name VARCHAR(64) NOT NULL
);

CREATE TABLE permissions (
  id CHAR(36) PRIMARY KEY,
  code VARCHAR(64) UNIQUE NOT NULL
);

CREATE TABLE user_roles (
  userId CHAR(36) NOT NULL,
  roleId CHAR(36) NOT NULL,
  PRIMARY KEY(userId, roleId),
  FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(roleId) REFERENCES roles(id) ON DELETE CASCADE
);

CREATE TABLE role_permissions (
  roleId CHAR(36) NOT NULL,
  permissionId CHAR(36) NOT NULL,
  PRIMARY KEY(roleId, permissionId),
  FOREIGN KEY(roleId) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY(permissionId) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE TABLE audit_logs (
  id CHAR(36) PRIMARY KEY,
  userId CHAR(36) NULL,
  action VARCHAR(64) NOT NULL,
  ip VARCHAR(64) NULL,
  userAgent VARCHAR(256) NULL,
  detail JSON NULL,
  traceId VARCHAR(64) NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### 2) JWT y Claves
- Variables `.env`:
  - `AUTH_JWT_ALG=HS256|RS256`
  - `JWT_SECRET=`
  - `JWT_PRIVATE_KEY_PEM=...`
  - `JWT_PUBLIC_JWKS_DIR=/keys/jwks`
  - `JWT_KEY_KID=current`
  - `JWT_ACCESS_TTL=900s`, `JWT_REFRESH_TTL=30d`
- Payload: añadir `sid`, `jti`, `roles`, `perms`; `kid` en header.
- Endpoint **JWKS**: `GET /v1/.well-known/jwks.json`.

### 3) Flujos y Endpoints (mantener rutas actuales)
- `POST /v1/auth/login` → agregar `refreshToken` y `session` (`sid`, `deviceId`).
- `POST /v1/auth/refresh` → validar/rotar refresh, detectar reutilización, revocar sesiones y auditar.
- `POST /v1/auth/logout` → revocar sesión actual.
- `GET /v1/auth/sessions` → listar sesiones del usuario.
- `DELETE /v1/auth/sessions/:sid` → revocar una sesión específica.
- **2FA (si `AUTH_TOTP_ENABLED=true`)**: enroll/verify/disable/backup-codes.

### 4) Guards y Decorators
- `JwtAuthGuard` (validar `kid`, `sid`, revocación y expiración).
- `RolesGuard` y `PermissionsGuard` con decoradores `@Roles(...)`, `@Permissions(...)`.

### 5) Seguridad adicional
- `@nestjs/throttler` en `/auth/login` y `/auth/refresh`.
- `helmet`, `cors` con `ALLOWED_ORIGINS`.

### 6) Auditoría
- `AuditService` para eventos críticos.

### 7) Compatibilidad
- Mantener contratos actuales y permitir **modo legado** con `AUTH_LEGACY_REFRESH=true`.

---

## Variables de Entorno (añadidos)
```
AUTH_JWT_ALG=HS256
JWT_SECRET=supersecreto
JWT_PRIVATE_KEY_PEM=-----BEGIN PRIVATE KEY-----...
JWT_PUBLIC_JWKS_DIR=./keys/jwks
JWT_KEY_KID=current
JWT_ACCESS_TTL=900s
JWT_REFRESH_TTL=30d
AUTH_TOTP_ENABLED=false
THROTTLE_TTL=60
THROTTLE_LIMIT=5
ALLOWED_ORIGINS=http://localhost:4200,http://localhost:3000
AUTH_LEGACY_REFRESH=true
```

---

## Entregables (en este PR de **modificación**)
1. Migraciones incrementales.
2. Refactor de `AuthService` + `JwtStrategy` con RS256 opcional, `kid`, JWKS.
3. `SessionService` y endpoints `sessions` (listar/revocar).
4. Guards `RolesGuard`/`PermissionsGuard` y aplicación en módulos.
5. Rate limiting, helmet, CORS endurecido.
6. Auditoría de eventos críticos.
7. Tests unitarios y e2e.
8. Swagger y `README.md` actualizados.

---

## Notas de Migración (pasos seguros)
1. Fase 1: soporte dual HS/RS y publicar JWKS.
2. Fase 2: sesiones/refresh rotativo con modo legado activo.
3. Fase 3: conmutar a RS256 y firmar con `kid=current`.
4. Fase 4: desactivar legado y exigir rotación.
5. Fase 5: rotación programada de claves con `kid=next`.
