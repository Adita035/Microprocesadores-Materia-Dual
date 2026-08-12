# Sistema de Gestión para Club Deportivo

Aplicación web para administrar los procesos principales de un club deportivo. El sistema centraliza usuarios, roles, entrenadores, actividades, membresías, instalaciones, materiales deportivos, horarios e incidencias mediante una API REST protegida con JWT y una interfaz web organizada por perfiles de usuario.

## Descripción

El proyecto está desarrollado como una aplicación cliente-servidor. El backend se encarga de la lógica de negocio, seguridad y persistencia de datos, mientras que el frontend se sirve como contenido estático desde Spring Boot y consume la API mediante JavaScript.

La plataforma permite que cada tipo de usuario acceda únicamente a las funciones correspondientes a su rol dentro del club:

- `ADMINISTRADOR`: gestión general de usuarios, entrenadores, actividades, membresías, instalaciones y materiales.
- `ENTRENADOR`: consulta de actividades asignadas, alumnos inscritos, horarios y solicitudes de material.
- `TRABAJADOR`: consulta operativa de materiales, instalaciones, solicitudes y horarios.
- `SOPORTE_TECNICO`: seguimiento de incidencias, actualización de estados y comentarios.
- `USUARIO`: consulta pública, selección de membresía e inscripción a actividades.
- `Contraseña`:123456

## Tecnologías

### Backend

- Kotlin 2.3.21
- Java 21
- Spring Boot 4.1.0
- Spring WebFlux
- Spring Security
- Spring Data R2DBC
- Spring Validation
- Spring Actuator
- Project Reactor
- Jackson Kotlin

### Base de datos

- MySQL
- R2DBC MySQL
- Scripts SQL de inicialización en `src/main/resources/db`

### Frontend

- HTML
- CSS
- JavaScript
- Consumo de API mediante `fetch`
- Manejo de sesión con JWT en `localStorage`

## Arquitectura

El backend está organizado por capas:

- `controller`: endpoints REST.
- `service`: lógica de negocio.
- `repository`: acceso reactivo a datos.
- `entity`: representación de tablas.
- `dto`: objetos de entrada y salida de la API.
- `mapper`: conversión entre entidades y respuestas.
- `security`: generación y validación de JWT.
- `exception`: manejo centralizado de errores.
- `util`: utilidades de validación y resolución de roles.

Estructura principal:

```text
src/main/kotlin/com/clubdeportivo
├── config
├── controller
├── dto
├── entity
├── exception
├── mapper
├── repository
├── security
├── service
└── util
```

## Funcionalidades Implementadas

### Autenticación y seguridad

- Inicio de sesión en `/api/auth/login`.
- Autenticación basada en JWT.
- Contraseñas cifradas con BCrypt.
- Autorización por roles con `@PreAuthorize`.
- Rutas públicas para login, registro, actividades públicas y membresías públicas.

### Usuarios y roles

- Registro público de usuarios.
- Creación inicial de administrador.
- Creación de usuarios desde el panel administrador.
- Listado general de usuarios.
- Filtrado de usuarios por rol.
- Eliminación de usuarios.
- Validación de rol por dominio de correo:
  - `userclub.com`
  - `workerclub.com`
  - `coachclub.com`
  - `adminclub.com`
  - `soporterclub.com`

### Entrenadores

- Registro y administración de entrenadores.
- Consulta de actividades asignadas.
- Consulta de alumnos inscritos por actividad.
- Actualización y eliminación desde el rol administrador.

### Actividades deportivas

- Creación, consulta, actualización y eliminación de actividades.
- Consulta pública de actividades disponibles.
- Asignación de entrenadores a actividades.
- Inscripción de usuarios autenticados.
- Cancelación de inscripciones.
- Actualización de estado de actividad.

### Membresías

- Consulta pública de planes activos.
- Creación y administración de membresías.
- Activación o desactivación por ID o por nombre.
- Selección de membresía por usuario autenticado.
- Consulta de membresía actual e historial del usuario.

### Instalaciones

- Registro de instalaciones.
- Consulta de instalaciones disponibles.
- Actualización de disponibilidad por ID o por nombre.
- Eliminación desde el rol administrador.

### Materiales deportivos

- Registro de materiales.
- Consulta de inventario.
- Solicitudes de material por entrenadores.
- Consulta y actualización de solicitudes por administradores y trabajadores.

### Incidencias

- Creación de incidencias por usuarios autenticados.
- Consulta de incidencias propias.
- Consulta general por soporte técnico.
- Actualización de estado.
- Registro de comentarios en historial.

### Horarios

- Consulta de horarios propios para trabajadores, entrenadores y soporte técnico.

## Interfaces Disponibles

Las pantallas se encuentran en `src/main/resources/static`:

```text
static
├── index.html
├── styles.css
├── public/app.js
├── admin/admin.html
├── admin/admin.js
├── entrenador/entrenador.html
├── entrenador/entrenador.js
├── trabajador/trabajador.html
├── trabajador/trabajador.js
├── soporte/soporte.html
├── soporte/soporte.js
├── membresias/membresias.html
└── membresias/membresias.js
```

Rutas principales del frontend:

- `/`: página pública, login, registro y actividades.
- `/membresias/membresias.html`: consulta y selección de membresías.
- `/admin/admin.html`: panel de administración.
- `/entrenador/entrenador.html`: panel de entrenador.
- `/trabajador/trabajador.html`: panel de trabajador.
- `/soporte/soporte.html`: panel de soporte técnico.

## Endpoints Principales

### Autenticación

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Iniciar sesión |

### Usuarios

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/api/usuarios/admin` | Crear administrador inicial |
| `POST` | `/api/usuarios/administradores` | Crear administrador adicional |
| `POST` | `/api/usuarios/registro` | Registro público |
| `POST` | `/api/usuarios` | Crear usuario |
| `GET` | `/api/usuarios` | Listar usuarios |
| `GET` | `/api/usuarios/administradores/listar` | Listar administradores |
| `GET` | `/api/usuarios/rol/{rol}` | Listar por rol |
| `DELETE` | `/api/usuarios/{id}` | Eliminar usuario |

### Entrenadores

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/api/entrenadores` | Crear entrenador |
| `POST` | `/api/entrenadores/registro` | Registrar entrenador con usuario |
| `GET` | `/api/entrenadores` | Listar entrenadores |
| `GET` | `/api/entrenadores/{id}` | Consultar entrenador |
| `PUT` | `/api/entrenadores/{id}` | Actualizar entrenador |
| `DELETE` | `/api/entrenadores/{id}` | Eliminar entrenador |
| `GET` | `/api/entrenadores/mis-actividades` | Consultar actividades asignadas |
| `GET` | `/api/entrenadores/actividades/{actividadId}/alumnos` | Consultar alumnos inscritos |

### Actividades

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/actividades/publicas` | Listar actividades públicas |
| `GET` | `/api/actividades/publicas/{id}` | Consultar actividad pública |
| `POST` | `/api/actividades` | Crear actividad |
| `GET` | `/api/actividades` | Listar actividades |
| `PUT` | `/api/actividades/{id}` | Actualizar actividad |
| `PATCH` | `/api/actividades/{id}/estado` | Actualizar estado |
| `POST` | `/api/actividades/{id}/entrenadores` | Asignar entrenador |
| `POST` | `/api/actividades/asignaciones/por-nombre` | Asignar entrenador por nombre |
| `POST` | `/api/actividades/{id}/inscripcion` | Inscribirse |
| `DELETE` | `/api/actividades/{id}/inscripcion` | Cancelar inscripción |

### Membresías

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/membresias/publicas` | Listar membresías activas |
| `GET` | `/api/membresias` | Listar membresías |
| `POST` | `/api/membresias` | Crear membresía |
| `PATCH` | `/api/membresias/{id}/estado` | Cambiar estado |
| `PATCH` | `/api/membresias/por-nombre/estado` | Cambiar estado por nombre |
| `DELETE` | `/api/membresias/{id}` | Eliminar membresía |
| `POST` | `/api/membresias/seleccion` | Seleccionar membresía |
| `GET` | `/api/membresias/mi-membresia` | Consultar membresía actual |
| `GET` | `/api/membresias/mis-membresias` | Consultar historial |

### Instalaciones

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/api/instalaciones` | Crear instalación |
| `GET` | `/api/instalaciones` | Listar instalaciones |
| `GET` | `/api/instalaciones/disponibles` | Listar disponibles |
| `PATCH` | `/api/instalaciones/{id}/disponibilidad` | Cambiar disponibilidad |
| `PATCH` | `/api/instalaciones/por-nombre/disponibilidad` | Cambiar disponibilidad por nombre |
| `DELETE` | `/api/instalaciones/{id}` | Eliminar instalación |

### Materiales

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/api/materiales` | Crear material |
| `GET` | `/api/materiales` | Listar materiales |
| `POST` | `/api/materiales/solicitudes` | Solicitar material |
| `GET` | `/api/materiales/solicitudes` | Listar solicitudes |
| `PATCH` | `/api/materiales/solicitudes/{id}/estado` | Actualizar solicitud |
| `GET` | `/api/materiales/mis-solicitudes` | Consultar solicitudes propias |

### Incidencias y horarios

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/api/incidencias` | Crear incidencia |
| `GET` | `/api/incidencias` | Listar incidencias |
| `GET` | `/api/incidencias/mis-incidencias` | Consultar incidencias propias |
| `PATCH` | `/api/incidencias/{id}/estado` | Actualizar estado |
| `POST` | `/api/incidencias/{id}/comentarios` | Agregar comentario |
| `GET` | `/api/horarios/mis-horarios` | Consultar horarios propios |

## Modelo de Datos

El sistema usa una base de datos relacional con las siguientes tablas principales:

- `roles`
- `usuarios`
- `entrenadores`
- `actividades`
- `actividad_entrenador`
- `inscripciones_actividades`
- `membresias`
- `usuario_membresia`
- `instalaciones`
- `solicitudes_instalacion`
- `materiales`
- `solicitudes_materiales`
- `incidencias`
- `historial_incidencias`
- `horarios`
- `auditoria`

Los scripts de creación e inicialización están en:

- `src/main/resources/db/schema.sql`
- `src/main/resources/db/data.sql`

## Configuración

La configuración principal se encuentra en `src/main/resources/application.yml`.

Variables importantes:

```yaml
spring:
  r2dbc:
    url: r2dbc:mysql://localhost:3306/club_deportivo
    username: root
    password: <tu-password>

app:
  jwt:
    secret: <clave-secreta-de-al-menos-32-caracteres>
    expiration-minutes: 120
```

Antes de ejecutar el sistema, asegúrate de tener creada la base de datos:

```sql
CREATE DATABASE club_deportivo;
```

## Ejecución Local

### Requisitos

- Java 21
- MySQL en ejecución
- Base de datos `club_deportivo`

La aplicación queda disponible en:

```text
http://localhost:8080
```

## Estado del Proyecto

El sistema se encuentra en desarrollo funcional. Actualmente cuenta con módulos operativos para autenticación, usuarios, roles, entrenadores, actividades, membresías, instalaciones, materiales, horarios e incidencias.



## Autor

Proyecto desarrollado por Adair Gámez Jiménez.
