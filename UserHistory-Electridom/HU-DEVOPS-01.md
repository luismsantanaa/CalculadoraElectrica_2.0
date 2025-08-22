# Historia de Usuario - HU-DEVOPS-01

## 📌 Contexto del Proyecto
El proyecto aún no tiene un pipeline CI formal.  
Es necesario automatizar pruebas, lint y build en cada PR.

---

## 📝 Historia de Usuario
**ID:** HU-DEVOPS-01  
**Título:** Pipeline CI (Lint, Test, Build)  

**Historia:**  
Como *equipo de desarrollo* quiero validar cada PR con linting, unit/e2e y build para garantizar calidad continua.

---

## ✅ Criterios de Aceptación
- Ejecución de lint, unit tests, e2e y build.  
- Soporte matrices de Node LTS (18, 20).  
- Tiempos de ejecución < 8 minutos.  

---

## 🔧 Tareas Técnicas
1. Configuración de workflow (GitHub Actions o Azure DevOps).  
2. Steps: `npm ci`, lint, unit tests, e2e tests, build.  
3. Cache de dependencias.  
4. Badge de estado en README.  

---

## 🏁 Definición de Hecho (DoD)
- [ ] Pipeline ejecuta todas las etapas.  
- [ ] Badge visible en repositorio.  
- [ ] Cobertura mínima 85% como gate.  

---

## 📊 Estimación
**Esfuerzo:** 5 puntos (Alta prioridad).  
