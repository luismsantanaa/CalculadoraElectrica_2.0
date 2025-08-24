# CE-06 — Reporte Técnico y Cuadro de Cargas (PDF/Excel)
**Objetivo:** Generar reporte con tabla de cargas, lista de circuitos, tablero, alimentador y tierra.

## Criterios de Aceptación
- Exportar PDF (puppeteer) y Excel (xlsx) con plantillas (`utils/templates/`).
- Incluir sello de tiempo, versión de normas (hash de semillas).
- Endpoint `POST /calc/report` que recibe el `calculationId` (o el payload completo en modo stateless).
- Tests de snapshot para PDF (hash MD5) y validación de columnas en Excel.
