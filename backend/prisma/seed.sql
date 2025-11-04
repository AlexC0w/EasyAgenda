INSERT INTO User (username, passwordHash, passwordPlain, telefono, role)
VALUES
  ('admin', '$2b$10$rhFtvz6JVIqAQm7kyT.hneOdWfR6vZLgppqNEG8LLYHu19hHcxlu.', 'admin123', '+52 555 010 9999', 'ADMIN'),
  ('carlos', '$2b$10$M55guaZS2YlNyrFvrSAEKeKCV7yZvjkpbgQOUMuudxxkE9h1yebb6', 'carlos2024', '+52 555 010 1111', 'BARBER');

INSERT INTO Barbero (nombre, horario_inicio, horario_fin, dias_laborales, duracion_cita, userId)
VALUES
  ('Octavio Cortez', '09:00', '17:00', '["monday","tuesday","wednesday","thursday","friday"]', 30, 2),
  ('Laura Fade', '10:00', '18:00', '["tuesday","wednesday","thursday","friday","saturday"]', 45, NULL);

INSERT INTO Servicio (nombre, duracion, descripcion, precio)
VALUES
  ('Corte clásico', 30, 'Corte tradicional con acabado pulcro.', 15.00),
  ('Afeitado premium', 45, 'Tratamiento completo con toalla caliente.', 25.00),
  ('Diseño de barba', 30, 'Perfilado detallado y definición de contornos.', 20.00);

INSERT INTO BusinessSetting (`key`, `value`)
VALUES
  ('businessName', 'Agenda Octane Studio'),
  ('businessPhone', '+52 555 010 7777'),
  ('businessAddress', 'Av. Revolución 123, CDMX'),
  ('whatsappSender', '+52 555 010 8888');
