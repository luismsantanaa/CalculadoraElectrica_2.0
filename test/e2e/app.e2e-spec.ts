import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { NormRule } from '../../src/modules/rules/entities/norm-rule.entity';
import { normRulesSeed } from '../../src/modules/rules/seeds/norm-rules.seed';

describe('AppController (e2e)', () => {
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
          entities: [NormRule],
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
    const normRuleRepository = dataSource.getRepository(NormRule);
    for (const ruleData of normRulesSeed) {
      const rule = normRuleRepository.create(ruleData);
      await normRuleRepository.save(rule);
    }
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/v1/calculations/preview (POST)', () => {
    const validRequest = {
      superficies: [
        { ambiente: 'Sala', areaM2: 18.5 },
        { ambiente: 'Dormitorio 1', areaM2: 12.0 },
      ],
      consumos: [
        { nombre: 'Televisor', ambiente: 'Sala', watts: 120 },
        { nombre: 'Lámpara', ambiente: 'Dormitorio 1', watts: 60 },
      ],
      opciones: { tensionV: 120, monofasico: true },
    };

    it('should calculate preview successfully', () => {
      return request(app.getHttpServer())
        .post('/v1/calculations/preview')
        .send(validRequest)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('cargasPorAmbiente');
          expect(res.body).toHaveProperty('totales');
          expect(res.body).toHaveProperty('propuestaCircuitos');
          expect(res.body).toHaveProperty('warnings');
          expect(res.body).toHaveProperty('traceId');
          expect(Array.isArray(res.body.cargasPorAmbiente)).toBe(true);
          expect(res.body.cargasPorAmbiente).toHaveLength(2);
          expect(res.body.totales.totalConectadaVA).toBeGreaterThan(0);
          expect(res.body.totales.demandaEstimadaVA).toBeGreaterThan(0);
        });
    });

    it('should return 400 for empty superficies', () => {
      const invalidRequest = {
        ...validRequest,
        superficies: [],
      };

      return request(app.getHttpServer())
        .post('/v1/calculations/preview')
        .send(invalidRequest)
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('traceId');
          expect(res.body).toHaveProperty('errors');
          expect(Array.isArray(res.body.errors)).toBe(true);
        });
    });

    it('should return 400 for duplicate environments', () => {
      const invalidRequest = {
        ...validRequest,
        superficies: [
          { ambiente: 'Sala', areaM2: 18.5 },
          { ambiente: 'Sala', areaM2: 12.0 }, // Duplicado
        ],
      };

      return request(app.getHttpServer())
        .post('/v1/calculations/preview')
        .send(invalidRequest)
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('traceId');
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors).toContain(
            "El ambiente 'Sala' está duplicado",
          );
        });
    });

    it('should return 400 for consumption in non-existent environment', () => {
      const invalidRequest = {
        ...validRequest,
        consumos: [
          { nombre: 'Televisor', ambiente: 'Cocina', watts: 120 }, // Ambiente inexistente
        ],
      };

      return request(app.getHttpServer())
        .post('/v1/calculations/preview')
        .send(invalidRequest)
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('traceId');
          expect(res.body).toHaveProperty('errors');
          expect(res.body.errors).toContain(
            "El ambiente 'Cocina' no existe para el consumo 'Televisor'",
          );
        });
    });

    it('should handle factorUso in consumptions', () => {
      const requestWithFactorUso = {
        ...validRequest,
        consumos: [
          { nombre: 'Televisor', ambiente: 'Sala', watts: 120, factorUso: 0.8 },
        ],
      };

      return request(app.getHttpServer())
        .post('/v1/calculations/preview')
        .send(requestWithFactorUso)
        .expect(200)
        .expect((res) => {
          const sala = res.body.cargasPorAmbiente.find(
            (c) => c.ambiente === 'Sala',
          );
          expect(sala.tomasVA).toBe(96); // 120 * 0.8
        });
    });

    it('should include traceId in response headers', () => {
      return request(app.getHttpServer())
        .post('/v1/calculations/preview')
        .send(validRequest)
        .expect(200)
        .expect((res) => {
          expect(res.headers).toHaveProperty('x-trace-id');
          expect(res.body).toHaveProperty('traceId');
          expect(res.headers['x-trace-id']).toBe(res.body.traceId);
        });
    });
  });
});
