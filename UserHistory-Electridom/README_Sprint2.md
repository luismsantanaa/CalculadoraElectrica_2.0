# Sprint 2 — Calculadora Eléctrica RD (Backlog + Utilitarios)
**Última actualización:** 2025-08-23

## Contenido
- `stories/` — Historias de usuario CE‑01..CE‑07.
- `schemas/` — JSON Schemas (input/output).
- `seeds/` — SQL para tablas normativas (parametrizables para RIE RD).
- `samples/` — Payload de ejemplo.
- `utils/` — Helpers TS, Postman y plantillas.
- `cursor_prompts/` — Prompts listos para Cursor.

## Uso rápido
1. Cargar semillas en MariaDB (ajusta nombres de tablas según tus entidades).
2. Implementar historias con los prompts de `cursor_prompts/`.
3. Probar con `samples/input_example.json`.
4. Validar contrato con `openapi/calc.yaml`.
