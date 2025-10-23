INSERT INTO Barbero (nombre, horario_inicio, horario_fin, dias_laborales, duracion_cita)
VALUES
  ('Octavio Cortez', '09:00', '17:00', '["monday","tuesday","wednesday","thursday","friday"]', 30),
  ('Laura Fade', '10:00', '18:00', '["tuesday","wednesday","thursday","friday","saturday"]', 45);

INSERT INTO Servicio (nombre, duracion, precio)
VALUES
  ('Corte clásico', 30, 15.00),
  ('Afeitado premium', 45, 25.00),
  ('Diseño de barba', 30, 20.00);
