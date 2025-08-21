import { registerAs } from '@nestjs/config';

export const envConfig = registerAs('env', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api',
  corsEnabled: process.env.CORS_ENABLED === 'true',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  allowedOrigins:
    process.env.ALLOWED_ORIGINS ||
    'http://localhost:4200,http://localhost:3000',
}));

export const databaseConfig = registerAs('database', () => ({
  type: 'mariadb',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  username: process.env.DB_USER || 'electridom',
  password: process.env.DB_PASS || 'electridom',
  database: process.env.DB_NAME || 'electridom',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
}));

export const jwtConfig = registerAs('jwt', () => ({
  secret:
    process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  algorithm: process.env.AUTH_JWT_ALG || 'HS256',
  accessTtl: process.env.JWT_ACCESS_TTL || '900s',
  refreshTtl: process.env.JWT_REFRESH_TTL || '30d',
}));

export const securityConfig = registerAs('security', () => ({
  throttleTtl: parseInt(process.env.THROTTLE_TTL || '60', 10),
  throttleLimit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
  authThrottleLimit: parseInt(process.env.AUTH_THROTTLE_LIMIT || '5', 10),
  totpEnabled: process.env.AUTH_TOTP_ENABLED === 'true',
  legacyRefresh: process.env.AUTH_LEGACY_REFRESH === 'true',
}));

export const rulesConfig = registerAs('rules', () => ({
  cacheTtlMs: parseInt(process.env.RULE_CACHE_TTL_MS || '60000', 10),
  applyMigrationsOnStartup: process.env.APPLY_MIGRATIONS_ON_STARTUP === 'true',
}));
