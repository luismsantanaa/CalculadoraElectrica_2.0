# Historia de Usuario - HU-SEC-01

## 📌 Contexto del Proyecto
Actualmente se utiliza **bcrypt** para hashing de contraseñas.  
Se busca elevar la seguridad migrando a **Argon2id**.

---

## 📝 Historia de Usuario
**ID:** HU-SEC-01  
**Título:** Hashing con Argon2id  

**Historia:**  
Como *equipo de seguridad* quiero implementar Argon2id para endurecer el almacenamiento de contraseñas y cumplir buenas prácticas OWASP.

---

## ✅ Criterios de Aceptación
- Nuevos registros usan Argon2id.  
- Logins migran automáticamente contraseñas antiguas (bcrypt → Argon2id).  
- Rendimiento aceptable (< 500ms por hash).  

---

## 🔧 Tareas Técnicas
1. Instalar librería `argon2`.  
2. Modificar servicio Auth para hashear con Argon2id.  
3. Implementar migración silenciosa: al login con bcrypt válido → rehash con Argon2id.  
4. Tests unitarios para tiempos y consistencia.  

---

## 🏁 Definición de Hecho (DoD)
- [ ] Contraseñas nuevas y migradas almacenadas con Argon2id.  
- [ ] Documentación de política de contraseñas.  
- [ ] Cobertura de pruebas ≥ 85%.  

---

## 📊 Estimación
**Esfuerzo:** 3 puntos (Alta prioridad).  
