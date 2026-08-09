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

INSERT INTO instalaciones (nombre, descripcion, capacidad, disponible)
SELECT 'Alberca semiolimpica', 'Carriles para entrenamiento tecnico, resistencia y sesiones de natacion.', 30, TRUE
WHERE NOT EXISTS (SELECT 1 FROM instalaciones i WHERE i.nombre = 'Alberca semiolimpica');

INSERT INTO instalaciones (nombre, descripcion, capacidad, disponible)
SELECT 'Sala wellness', 'Espacio para yoga, movilidad, recuperacion activa y clases de baja intensidad.', 24, TRUE
WHERE NOT EXISTS (SELECT 1 FROM instalaciones i WHERE i.nombre = 'Sala wellness');

INSERT INTO instalaciones (nombre, descripcion, capacidad, disponible)
SELECT 'Zona funcional', 'Area equipada para fuerza funcional, circuitos y acondicionamiento.', 35, TRUE
WHERE NOT EXISTS (SELECT 1 FROM instalaciones i WHERE i.nombre = 'Zona funcional');

INSERT INTO materiales (nombre, descripcion, cantidad_disponible)
SELECT 'Tapetes premium', 'Tapetes antiderrapantes para yoga, movilidad y recuperacion.', 24
WHERE NOT EXISTS (SELECT 1 FROM materiales m WHERE m.nombre = 'Tapetes premium');

INSERT INTO materiales (nombre, descripcion, cantidad_disponible)
SELECT 'Mancuernas ajustables', 'Equipo de fuerza para sesiones funcionales y acondicionamiento.', 18
WHERE NOT EXISTS (SELECT 1 FROM materiales m WHERE m.nombre = 'Mancuernas ajustables');

INSERT INTO materiales (nombre, descripcion, cantidad_disponible)
SELECT 'Bandas de resistencia', 'Bandas elasticas para calentamiento, movilidad y fuerza accesoria.', 40
WHERE NOT EXISTS (SELECT 1 FROM materiales m WHERE m.nombre = 'Bandas de resistencia');

INSERT INTO materiales (nombre, descripcion, cantidad_disponible)
SELECT 'Tablas de natacion', 'Tablas para tecnica de patada y entrenamiento en alberca.', 20
WHERE NOT EXISTS (SELECT 1 FROM materiales m WHERE m.nombre = 'Tablas de natacion');

INSERT INTO materiales (nombre, descripcion, cantidad_disponible)
SELECT 'Cronometros deportivos', 'Cronometros para control de tiempos en entrenamientos dirigidos.', 12
WHERE NOT EXISTS (SELECT 1 FROM materiales m WHERE m.nombre = 'Cronometros deportivos');

INSERT INTO usuarios (nombre, apellido, correo, password, telefono, activo, rol_id)
SELECT datos.nombre, datos.apellido, datos.correo, '$2a$10$gSFgzmuTfV8/qeasQBBlBOnAy6mDmLdv.T1Fz51.leK0ichTwpujW', datos.telefono, TRUE, r.id
FROM roles r
JOIN (
    SELECT 'Ana' nombre, 'Garcia' apellido, 'ana.garcia@userclub.com' correo, '555200101' telefono
    UNION ALL SELECT 'Luis', 'Hernandez', 'luis.hernandez@userclub.com', '555200102'
    UNION ALL SELECT 'Sofia', 'Martinez', 'sofia.martinez@userclub.com', '555200103'
    UNION ALL SELECT 'Diego', 'Lopez', 'diego.lopez@userclub.com', '555200104'
    UNION ALL SELECT 'Valeria', 'Santos', 'valeria.santos@userclub.com', '555200105'
    UNION ALL SELECT 'Mateo', 'Ramirez', 'mateo.ramirez@userclub.com', '555200106'
) datos
WHERE r.nombre = 'USUARIO'
  AND NOT EXISTS (SELECT 1 FROM usuarios u WHERE u.correo = datos.correo);

INSERT INTO usuarios (nombre, apellido, correo, password, telefono, activo, rol_id)
SELECT datos.nombre, datos.apellido, datos.correo, '$2a$10$gSFgzmuTfV8/qeasQBBlBOnAy6mDmLdv.T1Fz51.leK0ichTwpujW', datos.telefono, TRUE, r.id
FROM roles r
JOIN (
    SELECT 'Roberto' nombre, 'Mendoza' apellido, 'roberto.mendoza@workerclub.com' correo, '555200201' telefono
    UNION ALL SELECT 'Paola', 'Castillo', 'paola.castillo@workerclub.com', '555200202'
    UNION ALL SELECT 'Fernando', 'Reyes', 'fernando.reyes@workerclub.com', '555200203'
    UNION ALL SELECT 'Daniela', 'Ortega', 'daniela.ortega@workerclub.com', '555200204'
    UNION ALL SELECT 'Jorge', 'Navarro', 'jorge.navarro@workerclub.com', '555200205'
    UNION ALL SELECT 'Camila', 'Vargas', 'camila.vargas@workerclub.com', '555200206'
) datos
WHERE r.nombre = 'TRABAJADOR'
  AND NOT EXISTS (SELECT 1 FROM usuarios u WHERE u.correo = datos.correo);

INSERT INTO usuarios (nombre, apellido, correo, password, telefono, activo, rol_id)
SELECT datos.nombre, datos.apellido, datos.correo, '$2a$10$gSFgzmuTfV8/qeasQBBlBOnAy6mDmLdv.T1Fz51.leK0ichTwpujW', datos.telefono, TRUE, r.id
FROM roles r
JOIN (
    SELECT 'Mariana' nombre, 'Rios' apellido, 'mariana.rios@coachclub.com' correo, '555200301' telefono
    UNION ALL SELECT 'Carlos', 'Vega', 'carlos.vega@coachclub.com', '555200302'
    UNION ALL SELECT 'Lucia', 'Montes', 'lucia.montes@coachclub.com', '555200303'
    UNION ALL SELECT 'Andres', 'Pineda', 'andres.pineda@coachclub.com', '555200304'
    UNION ALL SELECT 'Natalia', 'Cruz', 'natalia.cruz@coachclub.com', '555200305'
    UNION ALL SELECT 'Emilio', 'Flores', 'emilio.flores@coachclub.com', '555200306'
) datos
WHERE r.nombre = 'ENTRENADOR'
  AND NOT EXISTS (SELECT 1 FROM usuarios u WHERE u.correo = datos.correo);

INSERT INTO usuarios (nombre, apellido, correo, password, telefono, activo, rol_id)
SELECT datos.nombre, datos.apellido, datos.correo, '$2a$10$gSFgzmuTfV8/qeasQBBlBOnAy6mDmLdv.T1Fz51.leK0ichTwpujW', datos.telefono, TRUE, r.id
FROM roles r
JOIN (
    SELECT 'Alejandro' nombre, 'Morales' apellido, 'alejandro.morales@adminclub.com' correo, '555200401' telefono
    UNION ALL SELECT 'Patricia', 'Luna', 'patricia.luna@adminclub.com', '555200402'
    UNION ALL SELECT 'Ricardo', 'Salazar', 'ricardo.salazar@adminclub.com', '555200403'
    UNION ALL SELECT 'Monica', 'Campos', 'monica.campos@adminclub.com', '555200404'
    UNION ALL SELECT 'Hector', 'Delgado', 'hector.delgado@adminclub.com', '555200405'
    UNION ALL SELECT 'Gabriela', 'Fuentes', 'gabriela.fuentes@adminclub.com', '555200406'
) datos
WHERE r.nombre = 'ADMINISTRADOR'
  AND NOT EXISTS (SELECT 1 FROM usuarios u WHERE u.correo = datos.correo);

INSERT INTO usuarios (nombre, apellido, correo, password, telefono, activo, rol_id)
SELECT datos.nombre, datos.apellido, datos.correo, '$2a$10$gSFgzmuTfV8/qeasQBBlBOnAy6mDmLdv.T1Fz51.leK0ichTwpujW', datos.telefono, TRUE, r.id
FROM roles r
JOIN (
    SELECT 'Sergio' nombre, 'Acosta' apellido, 'sergio.acosta@soporterclub.com' correo, '555200501' telefono
    UNION ALL SELECT 'Elena', 'Bravo', 'elena.bravo@soporterclub.com', '555200502'
    UNION ALL SELECT 'Oscar', 'Molina', 'oscar.molina@soporterclub.com', '555200503'
    UNION ALL SELECT 'Adriana', 'Nunez', 'adriana.nunez@soporterclub.com', '555200504'
    UNION ALL SELECT 'Raul', 'Ibarra', 'raul.ibarra@soporterclub.com', '555200505'
    UNION ALL SELECT 'Claudia', 'Pacheco', 'claudia.pacheco@soporterclub.com', '555200506'
) datos
WHERE r.nombre = 'SOPORTE_TECNICO'
  AND NOT EXISTS (SELECT 1 FROM usuarios u WHERE u.correo = datos.correo);

INSERT INTO entrenadores (usuario_id, especialidad)
SELECT u.id,
    CASE
        WHEN u.correo IN ('mariana.rios@coachclub.com', 'andres.pineda@coachclub.com') THEN 'Natacion'
        WHEN u.correo IN ('carlos.vega@coachclub.com', 'natalia.cruz@coachclub.com') THEN 'Fuerza funcional'
        ELSE 'Yoga y movilidad'
    END
FROM usuarios u
WHERE u.correo IN (
    'mariana.rios@coachclub.com',
    'carlos.vega@coachclub.com',
    'lucia.montes@coachclub.com',
    'andres.pineda@coachclub.com',
    'natalia.cruz@coachclub.com',
    'emilio.flores@coachclub.com'
)
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
JOIN usuarios u ON u.correo = 'mariana.rios@coachclub.com'
JOIN entrenadores e ON e.usuario_id = u.id
WHERE a.nombre = 'Natacion premium'
  AND NOT EXISTS (
      SELECT 1 FROM actividad_entrenador ae
      WHERE ae.actividad_id = a.id AND ae.entrenador_id = e.id
  );

INSERT INTO actividad_entrenador (actividad_id, entrenador_id)
SELECT a.id, e.id
FROM actividades a
JOIN usuarios u ON u.correo = 'carlos.vega@coachclub.com'
JOIN entrenadores e ON e.usuario_id = u.id
WHERE a.nombre = 'Fuerza funcional'
  AND NOT EXISTS (
      SELECT 1 FROM actividad_entrenador ae
      WHERE ae.actividad_id = a.id AND ae.entrenador_id = e.id
  );

INSERT INTO actividad_entrenador (actividad_id, entrenador_id)
SELECT a.id, e.id
FROM actividades a
JOIN usuarios u ON u.correo = 'lucia.montes@coachclub.com'
JOIN entrenadores e ON e.usuario_id = u.id
WHERE a.nombre = 'Yoga restaurativo'
  AND NOT EXISTS (
      SELECT 1 FROM actividad_entrenador ae
      WHERE ae.actividad_id = a.id AND ae.entrenador_id = e.id
  );

INSERT INTO incidencias (usuario_id, titulo, descripcion, estado)
SELECT u.id, 'Acceso a membresia', 'El usuario no visualiza su membresia activa en la vista principal.', 'PENDIENTE'
FROM usuarios u
WHERE u.correo = 'ana.garcia@userclub.com'
  AND NOT EXISTS (SELECT 1 FROM incidencias i WHERE i.titulo = 'Acceso a membresia' AND i.usuario_id = u.id);

INSERT INTO incidencias (usuario_id, titulo, descripcion, estado)
SELECT u.id, 'Error al consultar actividades', 'La agenda tarda en cargar despues de iniciar sesion.', 'EN_PROCESO'
FROM usuarios u
WHERE u.correo = 'luis.hernandez@userclub.com'
  AND NOT EXISTS (SELECT 1 FROM incidencias i WHERE i.titulo = 'Error al consultar actividades' AND i.usuario_id = u.id);

INSERT INTO incidencias (usuario_id, titulo, descripcion, estado)
SELECT u.id, 'Actualizacion de telefono', 'El usuario solicita validar el cambio de numero en su perfil.', 'RESUELTA'
FROM usuarios u
WHERE u.correo = 'sofia.martinez@userclub.com'
  AND NOT EXISTS (SELECT 1 FROM incidencias i WHERE i.titulo = 'Actualizacion de telefono' AND i.usuario_id = u.id);
