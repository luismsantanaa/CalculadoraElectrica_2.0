# Historia 2 — Modificación Auth: Refresh Tokens + Revocación (Sesiones)

## Contexto
El login ya emite access tokens. Agregaremos **refresh tokens** para renovar sesiones y una **lista de revocación** por dispositivo/UA.

## Objetivo
- `POST /auth/login` devuelve `{ accessToken, refreshToken }`.
- `POST /auth/refresh` acepta refresh válido (one-time-use → rotación de refresh).
- `POST /auth/logout` revoca la sesión actual.
- Admin/usuario podrá listar y revocar sesiones activas (opcional).

## Cambios de datos (TypeORM)
Crear tabla `sessions`:
- `id` (uuid), `user_id` (fk), `refresh_hash` (varchar 128), `ua` (text), `ip` (varchar 64),  
  `expires_at` (datetime), `revoked_at` (datetime, nullable), `created_at`.
Índices: `user_id`, `refresh_hash` único.

## ENV requeridas
- `REFRESH_TTL=30d`
- `REFRESH_ROTATE=true` (true = one-time-use)
- `REFRESH_SALT` (para hash HMAC de refresh)

## Endpoints
- `POST /auth/login` → añade `refreshToken` (HttpOnly cookie **o** body; dejar configurable).
- `POST /auth/refresh` → emite nuevo par `{ access, refresh }` y marca anterior como **rotado**.
- `POST /auth/logout` → revoca sesión actual (por refresh o jti).
- (Opcional) `GET /auth/sessions` y `DELETE /auth/sessions/:id`.

## Tareas para Cursor
1. **Entidad `Session`** + migration de `sessions`.
2. **Servicio `SessionService`**: crear, validar, rotar (one-time-use), revocar, listar por usuario.
3. **AuthController**: implementar `login/refresh/logout` con flujos atómicos (transacciones).
4. **Hash de refresh**: no persistir el token plano; guardar `HMAC(refresh, REFRESH_SALT)`.
5. **Opcional cookies**: flag para setear `HttpOnly; Secure; SameSite=Lax`.
6. **Testing**
   - Unit: rotación one-time-use; revocación; expiración.
   - e2e: login → refresh (válido) → usar refresh viejo (debe fallar) → logout → refresh (debe fallar).

## Criterios de Aceptación
- Refresh **no** se almacena en texto plano.
- Rotación one-time-use operativa.
- Logout invalida la sesión inmediatamente.
- Swagger actualizado con ejemplos de `login/refresh/logout`.