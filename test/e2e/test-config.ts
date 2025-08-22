export const testConfig = {
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    username: process.env.DB_USER || 'electridom',
    password: process.env.DB_PASS || 'electridom',
    database: process.env.DB_NAME || 'electridom', // Usar base de datos principal
    synchronize: true,
    logging: false,
  },
  application: {
    port: parseInt(process.env.PORT || '3001', 10),
    apiPrefix: process.env.API_PREFIX || 'api',
  },
  security: {
    throttleTtl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    throttleLimit: parseInt(process.env.THROTTLE_LIMIT || '1000', 10),
    authThrottleLimit: parseInt(process.env.AUTH_THROTTLE_LIMIT || '10', 10),
  },
  rules: {
    cacheTtlMs: parseInt(process.env.RULE_CACHE_TTL_MS || '1000', 10),
    applyMigrationsOnStartup: true,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'test-jwt-secret-key-for-testing-only',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  },
};
