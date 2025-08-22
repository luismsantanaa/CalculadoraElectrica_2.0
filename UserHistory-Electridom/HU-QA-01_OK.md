# Historia de Usuario - HU-QA-01

## 📌 Contexto del Proyecto
El proyecto **Calculadora Eléctrica RD** se desarrolla en **NestJS + TypeScript + MariaDB**, bajo arquitectura modular y principios SOLID.  
El backend ya dispone de los módulos principales (auth, usuarios, proyectos, cálculos, reglas, ambientes, cargas, etc.).  
En este punto se requiere extender la calidad del sistema mediante **pruebas e2e**.

---

## 📝 Historia de Usuario
**ID:** HU-QA-01  
**Título:** Cobertura de pruebas e2e para Cálculos  

**Historia:**  
Como *QA/PO* quiero pruebas end-to-end del flujo de cálculos (preview, validaciones normativas, propuesta de circuitos) para asegurar regresiones cero.

---

## ✅ Criterios de Aceptación
- Dado un payload válido, cuando llamo `POST /v1/calculations/preview`, entonces obtengo 200 con propuesta consistente y firma de reglas.  
- Dado payloads inválidos (áreas/cargas negativas, tipos inexistentes), retorna 400 con mensajes específicos.  
- Tiempos de respuesta < 800ms en dataset mediano.  

---

## 🔧 Tareas Técnicas
1. Crear proyecto **e2e tests** en NestJS con Jest + Supertest.  
2. Preparar fixtures de payloads:  
   - Mínimo (1 ambiente, 1 carga).  
   - Mediano (5 ambientes, 10 cargas).  
   - Grande (20+ ambientes, 50+ cargas).  
3. Validar respuesta:  
   - Estructura JSON esperada.  
   - Firma de reglas activas (`rulesSignature`).  
   - Propuesta de circuitos no vacía.  
4. Incluir casos de error (área negativa, ambiente inexistente, carga inválida).  
5. Implementar **test de performance básico** con umbral 800ms.  
6. Integrar con CI para reporte automático de cobertura.

---

## 🏁 Definición de Hecho (DoD)
- [ ] Cobertura de rutas de cálculo ≥ 90%.  
- [ ] Reportes de cobertura generados en CI.  
- [ ] Documentación en README e2e.  
- [ ] Todos los tests pasan en pipelines sin flaky tests.  

---

## 📊 Estimación
**Esfuerzo:** 8 puntos (Alta prioridad).  

---

## 📌 Notas
- Esta HU es requisito previo para habilitar las historias de IA.  
- Debe ejecutarse en conjunto con HU-QA-02 (Proyectos y Versionado) para asegurar trazabilidad completa.

