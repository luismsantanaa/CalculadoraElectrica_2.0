import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api');
  const corsEnabled = configService.get<boolean>('CORS_ENABLED', true);
  const corsOrigin = configService.get<string>('CORS_ORIGIN', '*');

  // Global prefix for all routes
  app.setGlobalPrefix(apiPrefix);

  // Enable validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Enable CORS for frontend
  if (corsEnabled) {
    app.enableCors({
      origin: corsOrigin,
    });
  }

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Calculadora Eléctrica RD - API')
    .setDescription(
      `
      API REST para la Calculadora Eléctrica de República Dominicana

      Esta API proporciona endpoints para:
      • 📊 Gestión de proyectos eléctricos
      • ⚡ Cálculos de potencia y circuitos
      • 📐 Medición de superficies y ambientes
      • 🔌 Selección de conductores y protecciones
      • 📦 Lista de materiales y costos
      • 📄 Generación de reportes en PDF/Excel

      Desarrollada según normas NEC 2020 y R.I.E. (Reglamento de Instalaciones Eléctricas)
    `,
    )
    .setVersion('1.0.0')
    .addTag('proyectos', 'Gestión de proyectos eléctricos')
    .addTag('superficies', 'Medición de ambientes y superficies')
    .addTag('potencia', 'Cálculos de potencia demandada')
    .addTag('circuitos', 'Distribución de circuitos eléctricos')
    .addTag('conductores', 'Selección de conductores y cables')
    .addTag('protecciones', 'Protecciones termomagnéticas')
    .addTag('materiales', 'Lista de materiales y costos')
    .addTag('reportes', 'Generación de reportes PDF/Excel')
    .addTag('utilidades', 'Herramientas y cálculos auxiliares')
    .addTag('usuarios', 'Gestión de usuarios y autenticación')
    .addServer('http://localhost:3000')
    .addServer('https://api.calculadoraelectricrd.com')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
      syntaxHighlight: {
        theme: 'arta',
      },
    },
    customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { color: #1e3a8a; font-size: 2rem; }
      .swagger-ui .info .description { font-size: 1.1rem; line-height: 1.6; }
      .swagger-ui .scheme-container { background: #f8f9fa; padding: 15px; border-radius: 8px; }
    `,
    customSiteTitle: 'Calculadora Eléctrica RD - API Documentation',
  });

  await app.listen(port);
  console.log('🚀 Backend server running on http://localhost:3000');
  console.log('📖 Swagger UI available at http://localhost:3000/api/docs');
  console.log('📋 API JSON schema at http://localhost:3000/api/docs-json');
  console.log('⚡ API endpoints at http://localhost:3000/api');
  console.log('💾 Database: MariaDb (calculadora-electrica)');
}
bootstrap().catch((error) => {
  console.error('Error starting application:', error);
  process.exit(1);
});
