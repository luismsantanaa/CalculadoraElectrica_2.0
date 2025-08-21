<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g @nestjs/mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).

# Calculadora Eléctrica RD - Backend API

API REST para la Calculadora Eléctrica de República Dominicana desarrollada con NestJS, TypeORM y MariaDB.

## 🚀 Características

- **Motor de Reglas Data-Driven**: Sistema de reglas normativas configurables (RIE RD/NEC)
- **Cálculos Eléctricos**: Preview de instalaciones residenciales con propuesta de circuitos
- **Arquitectura Modular**: Diseño limpio y escalable
- **Documentación Swagger**: API completamente documentada
- **Validación Robusta**: Validación de entrada con class-validator
- **Observabilidad**: Logging estructurado y traceId
- **Pruebas**: Unitarias y e2e con Jest
- **Docker**: Contenedores para desarrollo y producción
- **CI/CD**: Pipeline de Azure DevOps

## 📋 Prerrequisitos

- Node.js 20.x
- npm 10.x
- MariaDB 11.x
- Docker y Docker Compose (opcional)

## 🛠️ Instalación

### Desarrollo Local

1. **Clonar el repositorio**

   ```bash
   git clone <repository-url>
   cd calculadora-electrica-backend
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   ```

3. **Configurar variables de entorno**

   ```bash
   cp .env.example .env
   ```

   Editar `.env` con tus configuraciones:

   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=electridom
   DB_PASS=electridom
   DB_NAME=electridom

   # Application
   PORT=3000
   API_PREFIX=api

   # Rules Engine
   RULE_CACHE_TTL_MS=60000
   APPLY_MIGRATIONS_ON_STARTUP=true
   ```

4. **Ejecutar migraciones y seeds**

   ```bash
   npm run migration:run
   npm run seed
   ```

5. **Iniciar en modo desarrollo**
   ```bash
   npm run start:dev
   ```

### Docker

1. **Construir y ejecutar con Docker Compose**

   ```bash
   docker-compose up -d
   ```

2. **Ver logs**

   ```bash
   docker-compose logs -f api
   ```

3. **Detener servicios**
   ```bash
   docker-compose down
   ```

## 📚 API Endpoints

### Cálculos Eléctricos

#### POST /v1/calculations/preview

Calcula preview de instalación eléctrica residencial.

**Request:**

```json
{
  "superficies": [
    { "ambiente": "Sala", "areaM2": 18.5 },
    { "ambiente": "Dormitorio 1", "areaM2": 12.0 }
  ],
  "consumos": [
    { "nombre": "Televisor", "ambiente": "Sala", "watts": 120 },
    { "nombre": "Lámpara", "ambiente": "Dormitorio 1", "watts": 60 }
  ],
  "opciones": {
    "tensionV": 120,
    "monofasico": true
  }
}
```

**Response:**

```json
{
  "cargasPorAmbiente": [
    {
      "ambiente": "Sala",
      "iluminacionVA": 1850,
      "tomasVA": 120,
      "cargasFijasVA": 0,
      "totalVA": 1970
    }
  ],
  "totales": {
    "totalConectadaVA": 3170,
    "demandaEstimadaVA": 3170
  },
  "propuestaCircuitos": [
    {
      "tipo": "ILU",
      "cargaAsignadaVA": 3050,
      "ambientesIncluidos": ["Sala", "Dormitorio 1"],
      "breakerSugerido": "15A // TODO validar RIE RD",
      "calibreSugerido": "AWG 14 // TODO validar RIE RD"
    }
  ],
  "warnings": [],
  "traceId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## 🧮 Motor de Reglas

El sistema utiliza un motor de reglas data-driven para los cálculos normativos:

### Reglas Disponibles

- `LUZ_VA_POR_M2`: VA de iluminación por metro cuadrado
- `TOMA_VA_MAX_POR_CIRCUITO`: VA máximo por circuito de tomacorrientes
- `ILU_VA_MAX_POR_CIRCUITO`: VA máximo por circuito de iluminación
- `FACTOR_DEMANDA_LUZ`: Factor de demanda para iluminación
- `FACTOR_DEMANDA_TOMA`: Factor de demanda para tomacorrientes
- `FACTOR_DEMANDA_CARGAS_FIJAS`: Factor de demanda para cargas fijas

### Gestión de Reglas

```bash
# Ver reglas en la base de datos
mysql -u electridom -p electridom -e "SELECT * FROM norm_rules;"

# Actualizar regla
mysql -u electridom -p electridom -e "UPDATE norm_rules SET numericValue = '120.000' WHERE code = 'LUZ_VA_POR_M2';"
```

## 🧪 Pruebas

### Unitarias

```bash
npm test
npm run test:watch
npm run test:cov
```

### End-to-End

```bash
npm run test:e2e
```

### Cobertura

```bash
npm run test:cov
```

## 🐳 Docker

### Construir imagen

```bash
docker build -t electridom-api .
```

### Ejecutar contenedor

```bash
docker run -p 3000:3000 electridom-api
```

### Docker Compose

```bash
# Desarrollo
docker-compose up -d

# Producción
docker-compose -f docker-compose.prod.yml up -d
```

## 📖 Documentación

- **Swagger UI**: http://localhost:3000/api/docs
- **API JSON**: http://localhost:3000/api/docs-json
- **Health Check**: http://localhost:3000/api/health

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run start:dev          # Iniciar en modo desarrollo
npm run start:debug        # Iniciar con debugger

# Producción
npm run build              # Construir aplicación
npm run start:prod         # Iniciar en producción

# Calidad de código
npm run lint               # Ejecutar ESLint
npm run format             # Formatear con Prettier

# Base de datos
npm run migration:generate # Generar migración
npm run migration:run      # Ejecutar migraciones
npm run migration:revert   # Revertir migración
npm run seed               # Ejecutar seeds

# Pruebas
npm test                   # Pruebas unitarias
npm run test:e2e           # Pruebas e2e
npm run test:cov           # Cobertura de código
```

## 🏗️ Arquitectura

```
src/
├── common/                 # Recursos compartidos
│   ├── filters/           # Filtros globales
│   ├── interceptors/      # Interceptors
│   └── utils/             # Utilidades
├── config/                # Configuraciones
├── modules/
│   ├── rules/             # Motor de reglas
│   │   ├── entities/      # Entidad NormRule
│   │   ├── services/      # RuleProvider
│   │   └── seeds/         # Datos iniciales
│   ├── calculos/          # Cálculos eléctricos
│   │   ├── dtos/          # Data Transfer Objects
│   │   ├── services/      # Lógica de negocio
│   │   └── controllers/   # Endpoints REST
│   └── ...                # Otros módulos
└── database/
    ├── migrations/        # Migraciones TypeORM
    └── seeds/             # Scripts de seed
```

## 🔒 Seguridad

- Validación de entrada con class-validator
- Sanitización de datos
- Manejo seguro de errores
- Logging estructurado
- TraceId para trazabilidad

## 📊 Monitoreo

- Health checks automáticos
- Logs estructurados
- Métricas de rendimiento
- Trazabilidad con traceId

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

- **Documentación**: [Swagger UI](http://localhost:3000/api/docs)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Email**: support@calculadoraelectricrd.com

---

**Desarrollado con ❤️ para la comunidad eléctrica de República Dominicana**
