# Historia 1 — Modificación Auth: JWT RS256 + JWKS y Rotación de Claves

## Contexto
Ya existe autenticación JWT. Debemos **mejorarla**: firmar con **RS256**, exponer **JWKS** público y permitir **rotación segura** de claves, sin romper a clientes existentes.

## Objetivo
- Firmar **access tokens** con RS256 usando una **clave privada activa**.
- Publicar `/.well-known/jwks.json` con **clave(s) pública(s)** activas (kid).
- Soportar **rotación programada** y **gracia** para validar tokens emitidos con la clave anterior (2 claves públicas activas máximo).
- Mantener endpoints actuales de login/guardias, sin cambios de contrato.

## Cambios de datos (TypeORM)
Crear tabla `jwks_keys`:
- `id` (uuid), `kid` (string, único), `type` ('RSA'), `public_pem` (text), `private_pem` (text, nullable en prod si se usa KMS),  
  `is_active` (bool), `created_at`, `rotated_at` (nullable).
Índices: `kid` único, `is_active` parcial.

## ENV requeridas
- `JWT_RS256_ACTIVE_KID`  
- **Opción A (archivos):** `JWT_PRIVKEY_PATH`, `JWT_PUBKEY_PATH`  
- **Opción B (DB):** gestionar en `jwks_keys` (clave privada cifrada con `KEY_ENCRYPTION_SECRET`).  
- `JWT_EXPIRES_IN=900s`

## Endpoints
- `GET /.well-known/jwks.json` → JWK Set (solo claves **públicas** activas)  
- (Opcional admin) `POST /admin/keys/rotate` → generar nuevo par, activar; mantener anterior como pública por periodo de gracia.

## Tareas para Cursor
1. **Entidad y repo `JwksKey`** + **migration** de `jwks_keys`.
2. **Servicio `KeyStoreService`**: obtener clave activa (kid), listar públicas activas, rotar claves.
3. **Proveedor `JwtService`** (wrapper): firmar RS256 con `kid` en header; validar con JWKS.
4. **Controlador `JwksController`**: `GET /.well-known/jwks.json`.
5. **CLI script** (nestjs-command o ts-node) `yarn keys:rotate`:
   - Genera par RSA (2048/3072), persiste, activa nuevo `kid`, desactiva privado anterior y deja pública anterior activa por gracia.
6. **Config**: inyectar `kid` actual desde `KeyStoreService`.
7. **Testing**
   - Unit: `KeyStoreService` (crear, activar, rotar).
   - e2e: emitir token con `kid-1`, rotar a `kid-2`, validar que el endpoint JWKS publique ambos; aceptar tokens antiguos durante gracia.

## Criterios de Aceptación
- Access tokens firmados con RS256 incluyen `kid`.
- `/.well-known/jwks.json` devuelve solo **claves públicas activas**.
- Rotación mantiene validación de tokens emitidos con clave anterior durante el periodo de gracia.
- No se exponen claves privadas.
- Swagger actualizado (ejemplos de bearer token con `kid`).

## Ejemplos (Swagger)
- **Respuesta JWKS** (resumida):
```json
{ "keys": [ { "kty":"RSA","kid":"kid-2025-08-22","n":"...","e":"AQAB","alg":"RS256","use":"sig" } ] }
```