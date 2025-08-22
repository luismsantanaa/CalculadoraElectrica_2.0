# 🧪 Testing Guide - Calculadora Eléctrica RD

## 📋 **Resumen**

Este documento describe la estrategia de testing implementada para la **Calculadora Eléctrica RD**, incluyendo tests unitarios, e2e, y herramientas de performance.

## 🎯 **Objetivos de Testing**

- ✅ **Cobertura ≥ 90%** para funcionalidades críticas
- ✅ **Tiempo de respuesta < 800ms** para endpoints de cálculos
- ✅ **Validación completa** de payloads y respuestas
- ✅ **Tests de performance** automatizados
- ✅ **Reportes detallados** de cobertura y métricas

## 🏗️ **Arquitectura de Testing**

### **Estructura de Archivos**
```
test/
├── e2e/                          # Tests end-to-end
│   ├── fixtures/                 # Datos de prueba
│   │   ├── calculation-payloads.ts
│   │   └── project-payloads.ts
│   ├── utils/                    # Utilidades de testing
│   │   ├── performance-test.ts
│   │   └── coverage-report.ts
│   ├── calculations.e2e-spec.ts  # Tests e2e de cálculos
│   ├── projects.e2e-spec.ts      # Tests e2e de proyectos
│   ├── test-config.ts           # Configuración de test
│   ├── jest-e2e.json           # Configuración Jest e2e
│   └── jest-e2e.setup.ts       # Setup de tests e2e
├── calculations.spec.ts         # Tests unitarios de cálculos
├── projects.spec.ts             # Tests unitarios de proyectos
└── scripts/
    └── setup-test-db.js        # Script de configuración DB
```

## 🚀 **Scripts Disponibles**

### **Tests Unitarios**
```bash
# Ejecutar todos los tests unitarios
npm test

# Tests específicos de cálculos
npm run test:calculations

# Tests específicos de proyectos
npm run test:projects

# Tests con coverage
npm run test:cov

# Tests en modo watch
npm run test:watch
```

### **Tests E2E**
```bash
# Ejecutar tests e2e
npm run test:e2e

# Tests e2e específicos de cálculos
npm run test:calculations:e2e

# Tests e2e específicos de proyectos
npm run test:projects:e2e

# Tests e2e con coverage
npm run test:e2e:cov

# Setup completo (DB + tests)
npm run test:e2e:setup
```

### **Performance Testing**
```bash
# Tests de performance
npm run test:performance

# Reportes de coverage completos
npm run test:coverage
```

## 📊 **Fixtures de Testing**

### **Payloads de Cálculos**

#### **1. Payload Mínimo**
```typescript
{
  superficies: [{ ambiente: 'Sala', areaM2: 18.5 }],
  consumos: [{ nombre: 'Televisor', ambiente: 'Sala', watts: 120 }],
  opciones: { tensionV: 120, monofasico: true }
}
```

#### **2. Payload Mediano**
- 5 ambientes
- 10 cargas eléctricas
- Casos de uso realistas

#### **3. Payload Grande**
- 20+ ambientes
- 50+ cargas eléctricas
- Testing de performance

#### **4. Payloads Inválidos**
- Superficies vacías
- Valores negativos
- Ambientes duplicados
- Consumos en ambientes inexistentes

### **Payloads de Proyectos**

#### **1. Proyectos Válidos**
```typescript
{
  projectName: 'Proyecto Test',
  description: 'Descripción del proyecto',
  superficies: [{ ambiente: 'Sala', areaM2: 18.5 }],
  consumos: [{ nombre: 'Televisor', ambiente: 'Sala', watts: 120 }],
  opciones: { tensionV: 120, monofasico: true },
  computeNow: true
}
```

#### **2. Proyectos Sin Cálculo**
- Proyectos creados sin ejecutar cálculo inicial
- Para cálculos posteriores

#### **3. Proyectos Inválidos**
- Nombres vacíos o faltantes
- Datos de cálculo inválidos
- Estructuras incorrectas

#### **4. Datos de Versiones**
- Múltiples versiones con cambios incrementales
- Comparación de versiones
- Validación de diferencias

## 🧪 **Tipos de Tests**

### **1. Tests de Validación**
- ✅ Estructura de payload
- ✅ Valores numéricos válidos
- ✅ Referencias entre entidades
- ✅ Campos requeridos

### **2. Tests de Lógica de Negocio**
- ✅ Cálculo de factorUso
- ✅ Validación de tensión
- ✅ Estructura de respuesta
- ✅ Tipos de datos

### **3. Tests de Performance**
- ✅ Tiempo de respuesta < 800ms
- ✅ Tests concurrentes
- ✅ Métricas de rendimiento
- ✅ Umbrales configurables

### **4. Tests E2E**
- ✅ Flujo completo de cálculos
- ✅ Flujo completo de proyectos
- ✅ Integración con base de datos
- ✅ Headers de respuesta
- ✅ Manejo de errores

### **5. Tests de Proyectos**
- ✅ CRUD completo de proyectos
- ✅ Creación y gestión de versiones
- ✅ Exportación de proyectos
- ✅ Validación de datos de entrada
- ✅ Manejo de estados (ACTIVE/ARCHIVED)

## 📈 **Métricas y Reportes**

### **Cobertura de Código**
- **Objetivo**: ≥ 90%
- **Reportes**: HTML, LCOV, Texto
- **Categorías**: Happy Path, Errores, Performance

### **Performance**
- **Umbral**: < 800ms por request
- **Métricas**: Promedio, Máximo, Mínimo
- **Concurrencia**: 5 requests simultáneos

### **Calidad**
- **Tests Unitarios**: 24+ tests (10 cálculos + 14 proyectos)
- **Tests E2E**: 16+ tests (8 cálculos + 8 proyectos)
- **Fixtures**: 8 categorías principales

## 🔧 **Configuración**

### **Variables de Entorno**
```bash
# Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=electridom
DB_PASS=electridom
DB_NAME=electridom

# Testing
NODE_ENV=test
PORT=3001
```

### **Jest Configuration**
- **Timeout**: 30 segundos para e2e
- **Environment**: Node.js
- **Coverage**: HTML, LCOV, Texto
- **Setup**: Configuración automática de DB

## 🚨 **Solución de Problemas**

### **Error: Base de Datos No Disponible**
```bash
# Verificar que MariaDB esté corriendo
sudo systemctl status mariadb

# Crear base de datos de test
npm run setup:test-db
```

### **Error: Tests E2E Fallan**
```bash
# Verificar configuración
npm run test:e2e:setup

# Ejecutar con más tiempo
jest --config ./test/jest-e2e.json --testTimeout=60000
```

### **Error: Performance Tests Fallan**
```bash
# Verificar recursos del sistema
# Aumentar umbral temporalmente
# Revisar logs de aplicación
```

## 📝 **Mejores Prácticas**

### **1. Escribir Tests**
- ✅ Un test por funcionalidad
- ✅ Nombres descriptivos
- ✅ Arrange-Act-Assert pattern
- ✅ Fixtures reutilizables

### **2. Mantener Tests**
- ✅ Actualizar fixtures cuando cambie la API
- ✅ Revisar coverage regularmente
- ✅ Optimizar performance tests
- ✅ Documentar casos edge

### **3. CI/CD Integration**
- ✅ Tests automáticos en cada commit
- ✅ Reportes de coverage
- ✅ Alertas de performance
- ✅ Tests de regresión

## 🎯 **Próximos Pasos**

### **Corto Plazo**
- [ ] Configurar base de datos de test separada
- [ ] Implementar tests de autenticación
- [ ] Agregar tests de reglas administrativas
- [ ] Optimizar performance tests

### **Mediano Plazo**
- [ ] Tests de integración con frontend
- [ ] Tests de carga (stress testing)
- [ ] Tests de seguridad
- [ ] Automatización de reportes

### **Largo Plazo**
- [ ] Tests de microservicios
- [ ] Tests de infraestructura
- [ ] Tests de accesibilidad
- [ ] Tests de internacionalización

---

**📊 Última Actualización**: Implementación HU-QA-02 completada
**🎯 Cobertura Actual**: 24 tests unitarios + 16 tests e2e
**⚡ Performance**: < 800ms objetivo cumplido
**🔧 Estado**: Funcional y documentado
