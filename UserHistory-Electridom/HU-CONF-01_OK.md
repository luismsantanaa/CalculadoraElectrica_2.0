# Historia de Usuario - HU-CONF-01

## 📌 Contexto del Proyecto
Actualmente se utilizan archivos `.env` sin validación estricta.  
Es necesario estructurar y validar las configuraciones de entornos `dev/stage/prod`.

---

## 📝 Historia de Usuario
**ID:** HU-CONF-01  
**Título:** Variables de Entorno y Perfiles  

**Historia:**  
Como *DevOps* quiero perfiles `dev/stage/prod` con .env validados para despliegues confiables.

---

## ✅ Criterios de Aceptación
- Validación estricta de variables de entorno en el arranque.  
- Configuración diferenciada para `dev/stage/prod`.  
- Defaults seguros.  

---

## 🔧 Tareas Técnicas
1. Implementar validación con `ConfigModule` y `class-validator`/`zod`.  
2. Crear `.env.example` documentado.  
3. Configurar variables críticas: JWT_SECRET, DB_URL, PORT, LOG_LEVEL, SSL.  
4. Documentar perfiles en README.  

---

## 🏁 Definición de Hecho (DoD)
- [ ] Arranque falla si falta alguna variable crítica.  
- [ ] Documentación completa de `.env`.  
- [ ] Validación automatizada en CI.  

---

## 📊 Estimación
**Esfuerzo:** 3 puntos (Alta prioridad).  
