import { config } from 'dotenv';

// Cargar variables de entorno para tests
config({ path: '.env.test' });

// Configuración global para tests e2e
beforeAll(() => {
  // Configurar timeout global para tests e2e
  jest.setTimeout(30000);
});

afterAll(() => {
  // Limpiar recursos después de todos los tests
  console.log('🧪 E2E Tests completed');
});
