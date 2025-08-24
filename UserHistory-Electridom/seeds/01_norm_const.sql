-- Parámetros normativos (ajustables a RIE RD). Marcar TODO_RIE donde aplique.
INSERT INTO norm_const (key, value, unit, notes) VALUES
('lighting_va_per_m2', '32.3', 'VA/m2', 'TODO_RIE: valor base; origen NEC 3VA/ft2 aprox.'),
('socket_max_va_per_circuit', '1800', 'VA', 'TODO_RIE'),
('circuit_max_utilization', '0.8', 'ratio', '80%'),
('vd_branch_limit_pct', '3', '%', 'Límite recomendado'),
('vd_total_limit_pct', '5', '%', 'Límite recomendado'),
('system_type', '1', 'ph', '1=monofásico,3=trifásico');
