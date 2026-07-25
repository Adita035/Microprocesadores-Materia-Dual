    CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    rol_id BIGINT NOT NULL,
    FOREIGN KEY (rol_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS actividades (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    fecha DATE,
    hora_inicio TIME,
    hora_fin TIME,
    estado VARCHAR(30)
);

CREATE TABLE IF NOT EXISTS entrenadores (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    especialidad VARCHAR(100),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS actividad_entrenador (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    actividad_id BIGINT NOT NULL,
    entrenador_id BIGINT NOT NULL,
    FOREIGN KEY (actividad_id) REFERENCES actividades(id),
    FOREIGN KEY (entrenador_id) REFERENCES entrenadores(id)
);

CREATE TABLE IF NOT EXISTS asistencias (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    estado VARCHAR(20),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS horarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    dia_semana VARCHAR(20),
    hora_entrada TIME,
    hora_salida TIME,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS instalaciones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    descripcion TEXT,
    capacidad INT,
    disponible BOOLEAN
);

CREATE TABLE IF NOT EXISTS solicitudes_instalacion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    entrenador_id BIGINT NOT NULL,
    instalacion_id BIGINT NOT NULL,
    fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(30),
    FOREIGN KEY (entrenador_id) REFERENCES entrenadores(id),
    FOREIGN KEY (instalacion_id) REFERENCES instalaciones(id)
);

CREATE TABLE IF NOT EXISTS materiales (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    descripcion TEXT,
    cantidad_disponible INT
);

CREATE TABLE IF NOT EXISTS solicitudes_materiales (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    entrenador_id BIGINT NOT NULL,
    material_id BIGINT NOT NULL,
    cantidad INT,
    estado VARCHAR(30),
    fecha_solicitud DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (entrenador_id) REFERENCES entrenadores(id),
    FOREIGN KEY (material_id) REFERENCES materiales(id)
);

CREATE TABLE IF NOT EXISTS incidencias (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    titulo VARCHAR(150),
    descripcion TEXT,
    estado VARCHAR(30),
    fecha_reporte DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS historial_incidencias (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    incidencia_id BIGINT NOT NULL,
    comentario TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (incidencia_id) REFERENCES incidencias(id)
);

CREATE TABLE IF NOT EXISTS reportes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50),
    fecha_generacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    generado_por BIGINT,
    FOREIGN KEY (generado_por) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS membresias (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100),
    descripcion TEXT,
    precio DECIMAL(10,2),
    duracion_dias INT,
    activa BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS usuario_membresia (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    membresia_id BIGINT NOT NULL,
    fecha_inicio DATE,
    fecha_fin DATE,
    estado VARCHAR(30),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (membresia_id) REFERENCES membresias(id)
);

CREATE TABLE IF NOT EXISTS inscripciones_actividades (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    actividad_id BIGINT NOT NULL,
    fecha_inscripcion DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (actividad_id) REFERENCES actividades(id)
);

CREATE TABLE IF NOT EXISTS auditoria (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT,
    accion VARCHAR(200),
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP
);
