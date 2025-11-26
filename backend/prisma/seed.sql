INSERT INTO Business (id, name, slug) VALUES (1, 'Agenda Octane Studio', 'demo');

INSERT INTO User (username, passwordHash, passwordPlain, telefono, role, businessId)
VALUES
  ('admin', '$2b$10$rhFtvz6JVIqAQm7kyT.hneOdWfR6vZLgppqNEG8LLYHu19hHcxlu.', 'admin123', '+52 555 010 9999', 'ADMIN', 1),
  ('carlos', '$2b$10$M55guaZS2YlNyrFvrSAEKeKCV7yZvjkpbgQOUMuudxxkE9h1yebb6', 'carlos2024', '+52 555 010 1111', 'BARBER', 1);

INSERT INTO Barbero (nombre, horario_inicio, horario_fin, dias_laborales, duracion_cita, userId, businessId)
VALUES
  ('Octavio Cortez', '09:00', '17:00', '["monday","tuesday","wednesday","thursday","friday"]', 30, 2, 1),
  ('Laura Fade', '10:00', '18:00', '["tuesday","wednesday","thursday","friday","saturday"]', 45, NULL, 1);

INSERT INTO Servicio (nombre, duracion, precio, businessId)
VALUES
  ('Corte clásico', 30, 15.00, 1),
  ('Afeitado premium', 45, 25.00, 1),
  ('Diseño de barba', 30, 20.00, 1);

INSERT INTO BusinessSetting (`key`, `value`, businessId)
VALUES
  ('businessName', 'Agenda Octane Studio', 1),
  ('businessPhone', '+52 555 010 7777', 1),
  ('businessAddress', 'Av. Revolución 123, CDMX', 1),
  ('whatsappSender', '+52 555 010 8888', 1);
