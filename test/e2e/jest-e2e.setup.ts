import { config } from 'dotenv';

// Cargar variables de entorno para tests
config();

// Configuración global para tests e2e
beforeAll(() => {
  // Configurar timeout global para tests e2e
  jest.setTimeout(30000);
  
  // Verificar que estamos usando la base de datos de prueba
  const testDb = process.env.TEST_DB_NAME || 'electridom_test';
  console.log(`🧪 Configurando tests E2E con base de datos: ${testDb}`);
});

afterAll(() => {
  // Limpiar recursos después de todos los tests
  console.log('🧪 E2E Tests completed');
});

// Configuración global para manejo de errores en tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});
