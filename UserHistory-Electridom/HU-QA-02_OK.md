# Historia de Usuario - HU-QA-02

## 📌 Contexto del Proyecto
El proyecto **Calculadora Eléctrica RD** se desarrolla en **NestJS + TypeScript + MariaDB**.  
El módulo **Projects** ya está implementado (creación, versiones, exportaciones).  
Ahora se busca garantizar su estabilidad con pruebas e2e.

---

## 📝 Historia de Usuario
**ID:** HU-QA-02  
**Título:** e2e Proyectos y Versionado  

**Historia:**  
Como *usuario final* quiero garantizar que la creación y versionado de proyectos es estable para mantener históricos.

---

## ✅ Criterios de Aceptación
- Crear proyecto, crear versión, obtener versión, exportar JSON.  
- Comparar versiones devuelve diff estructurado.  

---

## 🔧 Tareas Técnicas
1. Semilla de usuario y roles de prueba.  
2. Casos CRUD básicos (crear, obtener, actualizar, eliminar proyecto).  
3. Crear versiones y recuperar versiones anteriores.  
4. Probar exportación de proyecto.  
5. Validar diff de versiones con cambios.  
6. Integrar cobertura e2e en CI.

---

## 🏁 Definición de Hecho (DoD)
- [ ] Cobertura ≥ 85% ProjectsModule.  
- [ ] Pruebas snapshot aprobadas.  
- [ ] Documentación en README e2e.  

---

## 📊 Estimación
**Esfuerzo:** 5 puntos (Alta prioridad).  
