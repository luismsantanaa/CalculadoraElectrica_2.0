import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { NormRule } from '../../src/modules/rules/entities/norm-rule.entity';
import { RuleSet } from '../../src/modules/rules/entities/rule-set.entity';
import { normRulesSeed } from '../../src/modules/rules/seeds/norm-rules.seed';
import { calculationFixtures } from './fixtures/calculation-payloads';
import { performanceTester } from './utils/performance-test';

describe('Calculadora Eléctrica RD - E2E Tests', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [],
        }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [NormRule, RuleSet],
          synchronize: true,
          logging: false,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();

    // Seed test data
    const dataSource = app.get('DataSource');
    const ruleSetRepository = dataSource.getRepository(RuleSet);
    const normRuleRepository = dataSource.getRepository(NormRule);
    
    // Crear un RuleSet por defecto
    const defaultRuleSet = ruleSetRepository.create({
      name: 'Test Rules',
      version: '1.0.0',
      isActive: true,
      description: 'Test rule set for e2e tests',
    });
    await ruleSetRepository.save(defaultRuleSet);

    // Crear reglas con el RuleSet
    for (const ruleData of normRulesSeed) {
      const rule = normRuleRepository.create({
        ...ruleData,
        ruleSet: defaultRuleSet,
      });
      await normRuleRepository.save(rule);
    }
  }, 30000); // Aumentar timeout a 30 segundos

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  afterAll(() => {
    // Print performance summary at the end
    performanceTester.printSummary();
  });

  describe('POST /v1/calculations/preview - Happy Path Tests', () => {
    it('should calculate preview with minimal payload successfully', () => {
      return request(app.getHttpServer())
        .post('/v1/calculations/preview')
        .send(calculationFixtures.minimal)
        .expect(200)
        .expect((res) => {
          // Validar estructura de respuesta
          expect(res.body).toHaveProperty('cargasPorAmbiente');
          expect(res.body).toHaveProperty('totales');
          expect(res.body).toHaveProperty('propuestaCircuitos');
          expect(res.body).toHaveProperty('warnings');
          expect(res.body).toHaveProperty('traceId');
          expect(res.body).toHaveProperty('rulesSignature');

          // Validar tipos de datos
          expect(Array.isArray(res.body.cargasPorAmbiente)).toBe(true);
          expect(typeof res.body.totales.totalConectadaVA).toBe('number');
          expect(typeof res.body.totales.demandaEstimadaVA).toBe('number');
          expect(Array.isArray(res.body.propuestaCircuitos)).toBe(true);
          expect(Array.isArray(res.body.warnings)).toBe(true);
          expect(typeof res.body.traceId).toBe('string');
          expect(typeof res.body.rulesSignature).toBe('string');

          // Validar valores lógicos
          expect(res.body.cargasPorAmbiente).toHaveLength(1);
          expect(res.body.totales.totalConectadaVA).toBeGreaterThan(0);
          expect(res.body.totales.demandaEstimadaVA).toBeGreaterThan(0);
          expect(res.body.propuestaCircuitos.length).toBeGreaterThan(0);
          expect(res.body.rulesSignature.length).toBeGreaterThan(0);
        });
    });

    it('should calculate preview with medium payload successfully', () => {
      return request(app.getHttpServer())
        .post('/v1/calculations/preview')
        .send(calculationFixtures.medium)
        .expect(200)
        .expect((res) => {
          expect(res.body.cargasPorAmbiente).toHaveLength(5);
          expect(res.body.totales.totalConectadaVA).toBeGreaterThan(0);
          expect(res.body.propuestaCircuitos.length).toBeGreaterThan(0);
          
          // Validar que cada ambiente tiene sus cargas
          const sala = res.body.cargasPorAmbiente.find(c => c.ambiente === 'Sala');
          expect(sala).toBeDefined();
          expect(sala.totalVA).toBeGreaterThan(0);
        });
    });

    it('should calculate preview with large payload successfully', () => {
      return request(app.getHttpServer())
        .post('/v1/calculations/preview')
        .send(calculationFixtures.large)
        .expect(200)
        .expect((res) => {
          expect(res.body.cargasPorAmbiente).toHaveLength(20);
          expect(res.body.totales.totalConectadaVA).toBeGreaterThan(0);
          expect(res.body.propuestaCircuitos.length).toBeGreaterThan(0);
          
          // Validar que todos los ambientes están incluidos
          const ambientes = res.body.cargasPorAmbiente.map(c => c.ambiente);
          expect(ambientes).toContain('Sala');
          expect(ambientes).toContain('Cocina');
          expect(ambientes).toContain('Dormitorio Principal');
        });
    });

    it('should include traceId in response headers', () => {
      return request(app.getHttpServer())
        .post('/v1/calculations/preview')
        .send(calculationFixtures.minimal)
        .expect(200)
        .expect((res) => {
          expect(res.headers).toHaveProperty('x-trace-id');
          expect(res.body).toHaveProperty('traceId');
          expect(res.headers['x-trace-id']).toBe(res.body.traceId);
        });
    });

    it('should include rules signature in response', () => {
      return request(app.getHttpServer())
        .post('/v1/calculations/preview')
        .send(calculationFixtures.minimal)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('rulesSignature');
          expect(typeof res.body.rulesSignature).toBe('string');
          expect(res.body.rulesSignature.length).toBeGreaterThan(0);
        });
    });
  });

  describe('POST /v1/calculations/preview - Validation Error Tests', () => {
    it('should return 400 for empty superficies', () => {
      return request(app.getHttpServer())
        .post('/v1/calculations/preview')
        .send(calculationFixtures.invalid.emptySuperficies)
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('traceId');
          expect(res.body).toHaveProperty('errors');
          expect(Array.isArray(res.body.errors)).toBe(true);
          expect(res.body.errors.length).toBeGreaterThan(0);
        });
    });

    it('should return 400 for negative area', () => {
      return request(app.getHttpServer())
        .post('/v1/calculations/preview')
        .send(calculationFixtures.invalid.negativeArea)
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors.some(e => e.includes('areaM2'))).toBe(true);
        });
    });

    it('should return 400 for negative watts', () => {
      return request(app.getHttpServer())
        .post('/v1/calculations/preview')
        .send(calculationFixtures.invalid.negativeWatts)
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors.some(e => e.includes('watts'))).toBe(true);
        });
    });

    it('should return 400 for duplicate environments', () => {
      return request(app.getHttpServer())
        .post('/v1/calculations/preview')
        .send(calculationFixtures.invalid.duplicateEnvironment)
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors.some(e => e.includes('duplicado'))).toBe(true);
        });
    });

    it('should return 400 for consumption in non-existent environment', () => {
      return request(app.getHttpServer())
        .post('/v1/calculations/preview')
        .send(calculationFixtures.invalid.consumptionInNonExistentEnvironment)
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors.some(e => e.includes('no existe'))).toBe(true);
        });
    });

    it('should return 400 for invalid tension', () => {
      return request(app.getHttpServer())
        .post('/v1/calculations/preview')
        .send(calculationFixtures.invalid.invalidTension)
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors.some(e => e.includes('tensionV'))).toBe(true);
        });
    });

    it('should return 400 for missing required fields', () => {
      return request(app.getHttpServer())
        .post('/v1/calculations/preview')
        .send(calculationFixtures.invalid.missingRequiredFields)
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors.length).toBeGreaterThan(0);
        });
    });
  });

  describe('POST /v1/calculations/preview - Performance Tests', () => {
    it('should respond within 800ms for minimal payload', async () => {
      const result = await performanceTester.testEndpoint(
        app,
        'post',
        '/v1/calculations/preview',
        calculationFixtures.minimal,
        800,
        'Minimal Payload Performance'
      );

      expect(result.passed).toBe(true);
      expect(result.responseTime).toBeLessThan(800);
      expect(result.statusCode).toBe(200);
    });

    it('should respond within 800ms for medium payload', async () => {
      const result = await performanceTester.testEndpoint(
        app,
        'post',
        '/v1/calculations/preview',
        calculationFixtures.medium,
        800,
        'Medium Payload Performance'
      );

      expect(result.passed).toBe(true);
      expect(result.responseTime).toBeLessThan(800);
      expect(result.statusCode).toBe(200);
    });

    it('should respond within 800ms for large payload', async () => {
      const result = await performanceTester.testEndpoint(
        app,
        'post',
        '/v1/calculations/preview',
        calculationFixtures.large,
        800,
        'Large Payload Performance'
      );

      expect(result.passed).toBe(true);
      expect(result.responseTime).toBeLessThan(800);
      expect(result.statusCode).toBe(200);
    });

    it('should handle multiple concurrent requests', async () => {
      const promises = Array(5).fill(null).map((_, index) =>
        performanceTester.testEndpoint(
          app,
          'post',
          '/v1/calculations/preview',
          calculationFixtures.minimal,
          800,
          `Concurrent Request ${index + 1}`
        )
      );

      const results = await Promise.all(promises);
      
      results.forEach(result => {
        expect(result.passed).toBe(true);
        expect(result.statusCode).toBe(200);
      });
    });
  });

  describe('POST /v1/calculations/preview - Business Logic Tests', () => {
    it('should calculate correct total VA for given inputs', () => {
      const testPayload = {
        superficies: [{ ambiente: 'Sala', areaM2: 20 }],
        consumos: [
          { nombre: 'TV', ambiente: 'Sala', watts: 100 },
          { nombre: 'Lámpara', ambiente: 'Sala', watts: 60 },
        ],
        opciones: { tensionV: 120, monofasico: true },
      };

      return request(app.getHttpServer())
        .post('/v1/calculations/preview')
        .send(testPayload)
        .expect(200)
        .expect((res) => {
          const sala = res.body.cargasPorAmbiente.find(c => c.ambiente === 'Sala');
          expect(sala).toBeDefined();
          
          // Validar que la iluminación se calcula por área
          expect(sala.iluminacionVA).toBeGreaterThan(0);
          
          // Validar que las tomas incluyen los consumos
          expect(sala.tomasVA).toBeGreaterThanOrEqual(160); // 100 + 60
        });
    });

    it('should generate circuit proposal with valid structure', () => {
      return request(app.getHttpServer())
        .post('/v1/calculations/preview')
        .send(calculationFixtures.medium)
        .expect(200)
        .expect((res) => {
          expect(res.body.propuestaCircuitos).toBeDefined();
          expect(Array.isArray(res.body.propuestaCircuitos)).toBe(true);
          
          res.body.propuestaCircuitos.forEach(circuit => {
            expect(circuit).toHaveProperty('tipo');
            expect(circuit).toHaveProperty('cargaAsignadaVA');
            expect(circuit).toHaveProperty('ambientesIncluidos');
            expect(typeof circuit.tipo).toBe('string');
            expect(typeof circuit.cargaAsignadaVA).toBe('number');
            expect(Array.isArray(circuit.ambientesIncluidos)).toBe(true);
          });
        });
    });

    it('should handle factorUso in consumptions correctly', () => {
      const payloadWithFactorUso = {
        ...calculationFixtures.minimal,
        consumos: [
          { nombre: 'TV', ambiente: 'Sala', watts: 120, factorUso: 0.8 },
        ],
      };

      return request(app.getHttpServer())
        .post('/v1/calculations/preview')
        .send(payloadWithFactorUso)
        .expect(200)
        .expect((res) => {
          const sala = res.body.cargasPorAmbiente.find(c => c.ambiente === 'Sala');
          expect(sala.tomasVA).toBe(96); // 120 * 0.8
        });
    });
  });

  describe('POST /v1/calculations/preview - Edge Cases', () => {
    it('should handle very small areas', () => {
      const smallAreaPayload = {
        superficies: [{ ambiente: 'Closet', areaM2: 1 }],
        consumos: [],
        opciones: { tensionV: 120, monofasico: true },
      };

      return request(app.getHttpServer())
        .post('/v1/calculations/preview')
        .send(smallAreaPayload)
        .expect(200)
        .expect((res) => {
          expect(res.body.cargasPorAmbiente).toHaveLength(1);
          const closet = res.body.cargasPorAmbiente[0];
          expect(closet.ambiente).toBe('Closet');
          expect(closet.iluminacionVA).toBeGreaterThan(0);
        });
    });

    it('should handle very large areas', () => {
      const largeAreaPayload = {
        superficies: [{ ambiente: 'Garaje', areaM2: 100 }],
        consumos: [],
        opciones: { tensionV: 120, monofasico: true },
      };

      return request(app.getHttpServer())
        .post('/v1/calculations/preview')
        .send(largeAreaPayload)
        .expect(200)
        .expect((res) => {
          expect(res.body.cargasPorAmbiente).toHaveLength(1);
          const garaje = res.body.cargasPorAmbiente[0];
          expect(garaje.ambiente).toBe('Garaje');
          expect(garaje.iluminacionVA).toBeGreaterThan(0);
        });
    });

    it('should handle zero watts consumption', () => {
      const zeroWattsPayload = {
        superficies: [{ ambiente: 'Sala', areaM2: 20 }],
        consumos: [{ nombre: 'Test', ambiente: 'Sala', watts: 0 }],
        opciones: { tensionV: 120, monofasico: true },
      };

      return request(app.getHttpServer())
        .post('/v1/calculations/preview')
        .send(zeroWattsPayload)
        .expect(200)
        .expect((res) => {
          const sala = res.body.cargasPorAmbiente.find(c => c.ambiente === 'Sala');
          expect(sala.tomasVA).toBe(0);
        });
    });
  });
});
