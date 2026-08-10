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

UPDATE membresias
SET nombre = 'Plan Joven',
    descripcion = 'Membresia para socios de 18 a 26 anos con acceso a actividades y beneficios del club.',
    precio = 1181.00,
    duracion_dias = 30,
    activa = TRUE
WHERE nombre = 'Acceso Activo';

UPDATE membresias
SET nombre = 'Plan Individual',
    descripcion = 'Membresia para socios mayores de 27 anos con acceso individual a actividades del club.',
    precio = 1575.00,
    duracion_dias = 30,
    activa = TRUE
WHERE nombre = 'Club Total';

UPDATE membresias
SET nombre = 'Plan Anual',
    descripcion = 'Membresia anual con beneficios extendidos y acceso constante a servicios del club.',
    precio = 2363.00,
    duracion_dias = 365,
    activa = TRUE
WHERE nombre = 'Alto Rendimiento';

INSERT INTO membresias (nombre, descripcion, precio, duracion_dias, activa)
SELECT 'Plan Joven', 'Membresia para socios de 18 a 26 anos con acceso a actividades y beneficios del club.', 1181.00, 30, TRUE
WHERE NOT EXISTS (SELECT 1 FROM membresias m WHERE m.nombre = 'Plan Joven');

INSERT INTO membresias (nombre, descripcion, precio, duracion_dias, activa)
SELECT 'Plan Individual', 'Membresia para socios mayores de 27 anos con acceso individual a actividades del club.', 1575.00, 30, TRUE
WHERE NOT EXISTS (SELECT 1 FROM membresias m WHERE m.nombre = 'Plan Individual');

INSERT INTO membresias (nombre, descripcion, precio, duracion_dias, activa)
SELECT 'Plan Anual', 'Membresia anual con beneficios extendidos y acceso constante a servicios del club.', 2363.00, 365, TRUE
WHERE NOT EXISTS (SELECT 1 FROM membresias m WHERE m.nombre = 'Plan Anual');

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

INSERT INTO horarios (usuario_id, dia_semana, hora_entrada, hora_salida)
SELECT u.id, datos.dia_semana, datos.hora_entrada, datos.hora_salida
FROM usuarios u
JOIN (
    SELECT 'roberto.mendoza@workerclub.com' correo, 'LUNES A VIERNES' dia_semana, '08:00:00' hora_entrada, '16:00:00' hora_salida
    UNION ALL SELECT 'paola.castillo@workerclub.com', 'LUNES A VIERNES', '09:00:00', '17:00:00'
    UNION ALL SELECT 'fernando.reyes@workerclub.com', 'LUNES A VIERNES', '10:00:00', '18:00:00'
    UNION ALL SELECT 'daniela.ortega@workerclub.com', 'MARTES A SABADO', '08:00:00', '16:00:00'
    UNION ALL SELECT 'jorge.navarro@workerclub.com', 'MARTES A SABADO', '11:00:00', '19:00:00'
    UNION ALL SELECT 'camila.vargas@workerclub.com', 'LUNES A VIERNES', '07:00:00', '15:00:00'
    UNION ALL SELECT 'mariana.rios@coachclub.com', 'LUN-MIE-VIE', '07:00:00', '12:00:00'
    UNION ALL SELECT 'carlos.vega@coachclub.com', 'LUN-MIE-VIE', '16:00:00', '21:00:00'
    UNION ALL SELECT 'lucia.montes@coachclub.com', 'MAR-JUE-SAB', '15:00:00', '20:00:00'
    UNION ALL SELECT 'andres.pineda@coachclub.com', 'MARTES A SABADO', '08:00:00', '13:00:00'
    UNION ALL SELECT 'natalia.cruz@coachclub.com', 'LUNES A VIERNES', '14:00:00', '19:00:00'
    UNION ALL SELECT 'emilio.flores@coachclub.com', 'MAR-JUE-SAB', '09:00:00', '14:00:00'
    UNION ALL SELECT 'sergio.acosta@soporterclub.com', 'LUNES A VIERNES', '08:00:00', '16:00:00'
    UNION ALL SELECT 'elena.bravo@soporterclub.com', 'LUNES A VIERNES', '10:00:00', '18:00:00'
    UNION ALL SELECT 'oscar.molina@soporterclub.com', 'MARTES A SABADO', '09:00:00', '17:00:00'
    UNION ALL SELECT 'adriana.nunez@soporterclub.com', 'LUNES A VIERNES', '12:00:00', '20:00:00'
    UNION ALL SELECT 'raul.ibarra@soporterclub.com', 'MARTES A SABADO', '08:00:00', '16:00:00'
    UNION ALL SELECT 'claudia.pacheco@soporterclub.com', 'LUNES A VIERNES', '07:00:00', '15:00:00'
) datos ON datos.correo = u.correo
WHERE NOT EXISTS (
    SELECT 1
    FROM horarios h
    WHERE h.usuario_id = u.id
      AND h.dia_semana = datos.dia_semana
      AND h.hora_entrada = datos.hora_entrada
      AND h.hora_salida = datos.hora_salida
);

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
SELECT datos.nombre, datos.descripcion, datos.fecha, datos.hora_inicio, datos.hora_fin, 'PENDIENTE'
FROM (
    SELECT 'Aerobics' nombre, 'Clase cardiovascular grupal con rutinas dinamicas para mejorar resistencia, coordinacion y energia general.' descripcion, '2026-08-10' fecha, '07:00:00' hora_inicio, '08:00:00' hora_fin
    UNION ALL SELECT 'Box', 'Entrenamiento de boxeo recreativo con tecnica, acondicionamiento y trabajo de golpes controlados.', '2026-08-10', '18:00:00', '19:00:00'
    UNION ALL SELECT 'Calistenia', 'Sesion de fuerza con peso corporal enfocada en control, movilidad y progresion tecnica.', '2026-08-11', '07:30:00', '08:30:00'
    UNION ALL SELECT 'Futbol', 'Entrenamiento tecnico y tactico para mejorar condicion, control de balon y juego en equipo.', '2026-08-11', '17:00:00', '18:30:00'
    UNION ALL SELECT 'Basquetbol', 'Practica deportiva con fundamentos de tiro, pase, defensa y dinamicas de equipo.', '2026-08-12', '17:00:00', '18:30:00'
    UNION ALL SELECT 'Natacion', 'Entrenamiento en alberca para tecnica, respiracion, resistencia y seguridad acuatico-deportiva.', '2026-08-12', '07:00:00', '08:30:00'
    UNION ALL SELECT 'Karate', 'Clase marcial enfocada en disciplina, defensa, tecnica de golpeo y control corporal.', '2026-08-13', '18:00:00', '19:00:00'
    UNION ALL SELECT 'Kung Fu', 'Entrenamiento marcial tradicional con formas, movilidad, coordinacion y tecnica defensiva.', '2026-08-13', '19:15:00', '20:15:00'
    UNION ALL SELECT 'Defensa personal', 'Sesion practica para aprender reaccion, prevencion y tecnicas basicas de proteccion.', '2026-08-14', '18:00:00', '19:00:00'
    UNION ALL SELECT 'Zumba', 'Clase fitness musical con rutinas de baile, cardio y coordinacion para todos los niveles.', '2026-08-14', '19:15:00', '20:15:00'
    UNION ALL SELECT 'Krav Maga', 'Entrenamiento funcional de defensa personal con escenarios reales y respuesta rapida.', '2026-08-15', '08:00:00', '09:00:00'
    UNION ALL SELECT 'Tenis', 'Practica de tecnica, movilidad, saque, golpeo y control de juego en cancha.', '2026-08-15', '09:30:00', '11:00:00'
    UNION ALL SELECT 'Gimnasia', 'Clase de flexibilidad, fuerza, coordinacion y fundamentos gimnasticos progresivos.', '2026-08-16', '08:00:00', '09:00:00'
    UNION ALL SELECT 'Spinning', 'Sesion indoor de ciclismo con resistencia, intervalos y trabajo cardiovascular intenso.', '2026-08-16', '18:00:00', '19:00:00'
    UNION ALL SELECT 'Tae Kwon Do', 'Entrenamiento marcial con pateo, disciplina, elasticidad y tecnica deportiva.', '2026-08-17', '18:00:00', '19:00:00'
    UNION ALL SELECT 'Jazz', 'Clase de danza jazz con tecnica, ritmo, expresion corporal y secuencias coreograficas.', '2026-08-17', '19:15:00', '20:15:00'
    UNION ALL SELECT 'Muay Thai', 'Entrenamiento de striking con tecnica de golpeo, defensa, clinch y acondicionamiento.', '2026-08-18', '18:00:00', '19:00:00'
    UNION ALL SELECT 'Frontenis', 'Practica en cancha con tecnica de golpeo, desplazamiento y estrategia de juego.', '2026-08-18', '19:15:00', '20:15:00'
    UNION ALL SELECT 'Squash', 'Entrenamiento de velocidad, reflejos, tecnica de raqueta y resistencia en cancha cerrada.', '2026-08-19', '18:00:00', '19:00:00'
) datos
WHERE NOT EXISTS (SELECT 1 FROM actividades a WHERE a.nombre = datos.nombre);

INSERT INTO actividad_entrenador (actividad_id, entrenador_id)
SELECT a.id, e.id
FROM actividades a
JOIN (
    SELECT 'Aerobics' actividad, 'lucia.montes@coachclub.com' correo
    UNION ALL SELECT 'Box', 'carlos.vega@coachclub.com'
    UNION ALL SELECT 'Calistenia', 'natalia.cruz@coachclub.com'
    UNION ALL SELECT 'Futbol', 'andres.pineda@coachclub.com'
    UNION ALL SELECT 'Basquetbol', 'emilio.flores@coachclub.com'
    UNION ALL SELECT 'Natacion', 'mariana.rios@coachclub.com'
    UNION ALL SELECT 'Karate', 'lucia.montes@coachclub.com'
    UNION ALL SELECT 'Kung Fu', 'emilio.flores@coachclub.com'
    UNION ALL SELECT 'Defensa personal', 'carlos.vega@coachclub.com'
    UNION ALL SELECT 'Zumba', 'natalia.cruz@coachclub.com'
    UNION ALL SELECT 'Krav Maga', 'carlos.vega@coachclub.com'
    UNION ALL SELECT 'Tenis', 'andres.pineda@coachclub.com'
    UNION ALL SELECT 'Gimnasia', 'lucia.montes@coachclub.com'
    UNION ALL SELECT 'Spinning', 'natalia.cruz@coachclub.com'
    UNION ALL SELECT 'Tae Kwon Do', 'emilio.flores@coachclub.com'
    UNION ALL SELECT 'Jazz', 'lucia.montes@coachclub.com'
    UNION ALL SELECT 'Muay Thai', 'carlos.vega@coachclub.com'
    UNION ALL SELECT 'Frontenis', 'andres.pineda@coachclub.com'
    UNION ALL SELECT 'Squash', 'andres.pineda@coachclub.com'
) asignacion ON asignacion.actividad = a.nombre
JOIN usuarios u ON u.correo = asignacion.correo
JOIN entrenadores e ON e.usuario_id = u.id
WHERE NOT EXISTS (
    SELECT 1
    FROM actividad_entrenador ae
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
