INSERT INTO roles (nombre)
VALUES ('USUARIO')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO roles (nombre)
VALUES ('TRABAJADOR')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO roles (nombre)
VALUES ('ENTRENADOR')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO roles (nombre)
VALUES ('ADMINISTRADOR')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO roles (nombre)
VALUES ('SOPORTE_TECNICO')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO membresias (nombre, descripcion, precio, duracion_dias, activa)
SELECT 'Acceso Activo', 'Entrenamiento regular, consulta de actividades y acceso a beneficios iniciales del club.', 399.00, 30, TRUE
WHERE NOT EXISTS (SELECT 1 FROM membresias m WHERE m.nombre = 'Acceso Activo');

INSERT INTO membresias (nombre, descripcion, precio, duracion_dias, activa)
SELECT 'Club Total', 'Prioridad en inscripciones, actividades seleccionadas y mejores beneficios para socios constantes.', 699.00, 30, TRUE
WHERE NOT EXISTS (SELECT 1 FROM membresias m WHERE m.nombre = 'Club Total');

INSERT INTO membresias (nombre, descripcion, precio, duracion_dias, activa)
SELECT 'Alto Rendimiento', 'Agenda completa, beneficios extendidos y perfil ideal para usuarios de entrenamiento intensivo.', 999.00, 30, TRUE
WHERE NOT EXISTS (SELECT 1 FROM membresias m WHERE m.nombre = 'Alto Rendimiento');

INSERT INTO usuarios (nombre, apellido, correo, password, telefono, activo, rol_id)
SELECT 'Mariana', 'Rios', 'mariana.rios@club.test', '$2a$10$gSFgzmuTfV8/qeasQBBlBOnAy6mDmLdv.T1Fz51.leK0ichTwpujW', '5551002001', TRUE, r.id
FROM roles r
WHERE r.nombre = 'ENTRENADOR'
  AND NOT EXISTS (SELECT 1 FROM usuarios u WHERE u.correo = 'mariana.rios@club.test');

INSERT INTO usuarios (nombre, apellido, correo, password, telefono, activo, rol_id)
SELECT 'Carlos', 'Vega', 'carlos.vega@club.test', '$2a$10$gSFgzmuTfV8/qeasQBBlBOnAy6mDmLdv.T1Fz51.leK0ichTwpujW', '5551002002', TRUE, r.id
FROM roles r
WHERE r.nombre = 'ENTRENADOR'
  AND NOT EXISTS (SELECT 1 FROM usuarios u WHERE u.correo = 'carlos.vega@club.test');

INSERT INTO usuarios (nombre, apellido, correo, password, telefono, activo, rol_id)
SELECT 'Lucia', 'Montes', 'lucia.montes@club.test', '$2a$10$gSFgzmuTfV8/qeasQBBlBOnAy6mDmLdv.T1Fz51.leK0ichTwpujW', '5551002003', TRUE, r.id
FROM roles r
WHERE r.nombre = 'ENTRENADOR'
  AND NOT EXISTS (SELECT 1 FROM usuarios u WHERE u.correo = 'lucia.montes@club.test');

INSERT INTO entrenadores (usuario_id, especialidad)
SELECT u.id, 'Natacion'
FROM usuarios u
WHERE u.correo = 'mariana.rios@club.test'
  AND NOT EXISTS (SELECT 1 FROM entrenadores e WHERE e.usuario_id = u.id);

INSERT INTO entrenadores (usuario_id, especialidad)
SELECT u.id, 'Fuerza funcional'
FROM usuarios u
WHERE u.correo = 'carlos.vega@club.test'
  AND NOT EXISTS (SELECT 1 FROM entrenadores e WHERE e.usuario_id = u.id);

INSERT INTO entrenadores (usuario_id, especialidad)
SELECT u.id, 'Yoga y movilidad'
FROM usuarios u
WHERE u.correo = 'lucia.montes@club.test'
  AND NOT EXISTS (SELECT 1 FROM entrenadores e WHERE e.usuario_id = u.id);

INSERT INTO actividades (nombre, descripcion, fecha, hora_inicio, hora_fin, estado)
SELECT 'Natacion premium', 'Entrenamiento tecnico en alberca semiolimpica con enfoque en resistencia, respiracion y tecnica.', '2026-08-03', '07:00:00', '08:30:00', 'PENDIENTE'
WHERE NOT EXISTS (SELECT 1 FROM actividades a WHERE a.nombre = 'Natacion premium');

INSERT INTO actividades (nombre, descripcion, fecha, hora_inicio, hora_fin, estado)
SELECT 'Fuerza funcional', 'Circuito de fuerza, movilidad y acondicionamiento para mejorar rendimiento general.', '2026-08-04', '18:00:00', '19:15:00', 'PENDIENTE'
WHERE NOT EXISTS (SELECT 1 FROM actividades a WHERE a.nombre = 'Fuerza funcional');

INSERT INTO actividades (nombre, descripcion, fecha, hora_inicio, hora_fin, estado)
SELECT 'Yoga restaurativo', 'Sesion de movilidad, respiracion y recuperacion activa en sala wellness.', '2026-08-05', '19:30:00', '20:30:00', 'PENDIENTE'
WHERE NOT EXISTS (SELECT 1 FROM actividades a WHERE a.nombre = 'Yoga restaurativo');

INSERT INTO actividad_entrenador (actividad_id, entrenador_id)
SELECT a.id, e.id
FROM actividades a
JOIN usuarios u ON u.correo = 'mariana.rios@club.test'
JOIN entrenadores e ON e.usuario_id = u.id
WHERE a.nombre = 'Natacion premium'
  AND NOT EXISTS (
      SELECT 1 FROM actividad_entrenador ae
      WHERE ae.actividad_id = a.id AND ae.entrenador_id = e.id
  );

INSERT INTO actividad_entrenador (actividad_id, entrenador_id)
SELECT a.id, e.id
FROM actividades a
JOIN usuarios u ON u.correo = 'carlos.vega@club.test'
JOIN entrenadores e ON e.usuario_id = u.id
WHERE a.nombre = 'Fuerza funcional'
  AND NOT EXISTS (
      SELECT 1 FROM actividad_entrenador ae
      WHERE ae.actividad_id = a.id AND ae.entrenador_id = e.id
  );

INSERT INTO actividad_entrenador (actividad_id, entrenador_id)
SELECT a.id, e.id
FROM actividades a
JOIN usuarios u ON u.correo = 'lucia.montes@club.test'
JOIN entrenadores e ON e.usuario_id = u.id
WHERE a.nombre = 'Yoga restaurativo'
  AND NOT EXISTS (
      SELECT 1 FROM actividad_entrenador ae
      WHERE ae.actividad_id = a.id AND ae.entrenador_id = e.id
  );
