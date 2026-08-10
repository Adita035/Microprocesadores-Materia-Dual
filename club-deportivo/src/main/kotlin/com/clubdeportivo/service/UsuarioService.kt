package com.clubdeportivo.service

import com.clubdeportivo.dto.CrearAdminRequest
import com.clubdeportivo.dto.CrearUsuarioRequest
import com.clubdeportivo.dto.UsuarioResponse
import com.clubdeportivo.entity.Rol
import com.clubdeportivo.entity.Usuario
import com.clubdeportivo.entity.UsuarioMembresia
import com.clubdeportivo.exception.BadRequestException
import com.clubdeportivo.exception.ConflictException
import com.clubdeportivo.exception.NotFoundException
import com.clubdeportivo.mapper.toResponse
import com.clubdeportivo.repository.MembresiaRepository
import com.clubdeportivo.repository.ActividadEntrenadorRepository
import com.clubdeportivo.repository.EntrenadorRepository
import com.clubdeportivo.repository.HistorialIncidenciaRepository
import com.clubdeportivo.repository.HorarioRepository
import com.clubdeportivo.repository.IncidenciaRepository
import com.clubdeportivo.repository.InscripcionActividadRepository
import com.clubdeportivo.repository.RolRepository
import com.clubdeportivo.repository.SolicitudInstalacionRepository
import com.clubdeportivo.repository.SolicitudMaterialRepository
import com.clubdeportivo.repository.UsuarioMembresiaRepository
import com.clubdeportivo.repository.UsuarioRepository
import com.clubdeportivo.util.CorreoRolResolver
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.LocalDate
import java.time.temporal.ChronoUnit

@Service
class UsuarioService(
    private val usuarioRepository: UsuarioRepository,
    private val rolRepository: RolRepository,
    private val passwordEncoder: PasswordEncoder,
    private val usuarioMembresiaRepository: UsuarioMembresiaRepository,
    private val membresiaRepository: MembresiaRepository,
    private val entrenadorRepository: EntrenadorRepository,
    private val actividadEntrenadorRepository: ActividadEntrenadorRepository,
    private val solicitudMaterialRepository: SolicitudMaterialRepository,
    private val solicitudInstalacionRepository: SolicitudInstalacionRepository,
    private val inscripcionActividadRepository: InscripcionActividadRepository,
    private val horarioRepository: HorarioRepository,
    private val incidenciaRepository: IncidenciaRepository,
    private val historialIncidenciaRepository: HistorialIncidenciaRepository,
    private val auditoriaService: AuditoriaService,
) {
    private val rolesPermitidos = setOf(
        "USUARIO",
        "TRABAJADOR",
        "ENTRENADOR",
        "ADMINISTRADOR",
        "SOPORTE_TECNICO",
    )

    fun listar(): Flux<UsuarioResponse> =
        usuarioRepository.findAll()
            .flatMap { usuario ->
                rolRepository.findById(usuario.rolId)
                    .map { rol -> usuario.toResponse(rol) }
                    .flatMap { response -> agregarMembresiaActiva(usuario, response) }
            }

    fun listarAdministradores(): Flux<UsuarioResponse> =
        listarPorRol("ADMINISTRADOR")

    fun listarPorRol(nombreRol: String): Flux<UsuarioResponse> =
        obtenerRolPermitido(nombreRol)
            .flatMapMany { rol ->
                usuarioRepository.findByRolId(requireNotNull(rol.id) { "El rol $nombreRol debe tener id" })
                    .map { usuario -> usuario.toResponse(rol) }
                    .flatMap { response ->
                        usuarioRepository.findById(response.id)
                            .flatMap { usuario -> agregarMembresiaActiva(usuario, response) }
                            .defaultIfEmpty(response)
                    }
            }

    fun crearAdministrador(request: CrearAdminRequest): Mono<UsuarioResponse> =
        Mono.fromCallable { CorreoRolResolver.validarRol(request.correo, "ADMINISTRADOR") }
            .then(obtenerRol("ADMINISTRADOR"))
            .flatMap { rol ->
                usuarioRepository.existsByRolId(requireNotNull(rol.id) { "El rol ADMINISTRADOR debe tener id" })
                    .flatMap { existeAdmin ->
                        if (existeAdmin) {
                            Mono.error(ConflictException("Ya existe un administrador inicial"))
                        } else {
                            crearUsuarioConRol(
                                nombre = request.nombre,
                                apellido = request.apellido,
                                correo = request.correo,
                                telefono = request.telefono,
                                password = request.password,
                                rol = rol,
                            )
                        }
                    }
            }

    fun crearAdministradorAdicional(request: CrearAdminRequest): Mono<UsuarioResponse> =
        Mono.error(BadRequestException("Los administradores se crean directamente en la base de datos"))

    fun registrarUsuarioPublico(request: CrearAdminRequest): Mono<UsuarioResponse> =
        Mono.fromCallable { CorreoRolResolver.validarRol(request.correo, "USUARIO") }
            .then(obtenerRolPermitido("USUARIO"))
            .flatMap { rol ->
                crearUsuarioConRol(
                    nombre = request.nombre,
                    apellido = request.apellido,
                    correo = request.correo,
                    telefono = request.telefono,
                    password = request.password,
                    rol = rol,
                )
            }

    fun crearUsuario(request: CrearUsuarioRequest): Mono<UsuarioResponse> =
        Mono.fromCallable {
            val rolPorDominio = CorreoRolResolver.resolverRol(request.correo)
            if (rolPorDominio == "USUARIO") {
                throw BadRequestException("El administrador no puede crear usuarios normales")
            }
            if (rolPorDominio == "ADMINISTRADOR") {
                throw BadRequestException("Los administradores se crean directamente en la base de datos")
            }
            request.rol?.takeUnless { it.isBlank() }?.let { rolSolicitado ->
                if (rolSolicitado.trim().uppercase() != rolPorDominio) {
                    throw BadRequestException("El rol seleccionado no coincide con el dominio del correo")
                }
            }
            rolPorDominio
        }
            .flatMap(::obtenerRolPermitido)
            .flatMap { rol ->
                crearUsuarioConRol(
                    nombre = request.nombre,
                    apellido = request.apellido,
                    correo = request.correo,
                    telefono = request.telefono,
                    password = request.password,
                    rol = rol,
                )
            }

    fun eliminar(id: Long, correoAdmin: String): Mono<Void> =
        usuarioRepository.findById(id)
            .switchIfEmpty(Mono.error(NotFoundException("Usuario no encontrado")))
            .flatMap { usuario ->
                rolRepository.findById(usuario.rolId)
                    .switchIfEmpty(Mono.error(BadRequestException("El usuario no tiene rol valido")))
                    .flatMap { rol ->
                        if (rol.nombre == "ADMINISTRADOR") {
                            Mono.error<Void>(BadRequestException("No se pueden eliminar administradores desde el sistema"))
                        } else {
                            auditoriaService.registrarEliminacion(
                                correoAdmin,
                                "USUARIO",
                                "id=$id, nombre=${usuario.nombre} ${usuario.apellido}, correo=${usuario.correo}, rol=${rol.nombre}",
                            )
                                .then(eliminarDependenciasDeUsuario(id))
                                .then(usuarioRepository.delete(usuario))
                        }
                    }
            }

    private fun crearUsuarioConRol(
        nombre: String,
        apellido: String,
        correo: String,
        telefono: String?,
        password: String,
        rol: Rol,
    ): Mono<UsuarioResponse> =
        usuarioRepository.existsByCorreo(correo)
            .flatMap { existe ->
                if (existe) {
                    Mono.error(ConflictException("Ya existe un usuario con ese correo"))
                } else {
                    val usuario = Usuario(
                        nombre = nombre,
                        apellido = apellido,
                        correo = correo,
                        password = requireNotNull(passwordEncoder.encode(password)) {
                            "No se pudo encriptar la contrasena"
                        },
                        telefono = telefono,
                        rolId = requireNotNull(rol.id) { "El rol debe tener id" },
                        activo = true,
                    )

                    usuarioRepository.save(usuario)
                        .map { creado -> creado.toResponse(rol) }
                }
            }

    private fun obtenerRol(nombre: String): Mono<Rol> =
        rolRepository.findByNombre(nombre)
            .switchIfEmpty(rolRepository.save(Rol(nombre = nombre)))

    private fun obtenerRolPermitido(nombre: String): Mono<Rol> {
        val rolNormalizado = nombre.trim().uppercase()
        if (rolNormalizado !in rolesPermitidos) {
            return Mono.error(BadRequestException("Rol no permitido: $nombre"))
        }

        return rolRepository.findByNombre(rolNormalizado)
            .switchIfEmpty(Mono.error(BadRequestException("El rol $rolNormalizado no existe en la base de datos")))
    }

    private fun agregarMembresiaActiva(usuario: Usuario, response: UsuarioResponse): Mono<UsuarioResponse> {
        val usuarioId = usuario.id ?: return Mono.just(response)
        return usuarioMembresiaRepository.findFirstByUsuarioIdAndEstado(usuarioId, "ACTIVA")
            .flatMap { relacion -> construirRespuestaConMembresia(response, relacion) }
            .defaultIfEmpty(response)
    }

    private fun construirRespuestaConMembresia(
        response: UsuarioResponse,
        relacion: UsuarioMembresia,
    ): Mono<UsuarioResponse> =
        membresiaRepository.findById(relacion.membresiaId)
            .map { membresia ->
                response.copy(
                    tieneMembresia = true,
                    membresia = membresia.nombre,
                    membresiaEstado = relacion.estado,
                    membresiaFechaFin = relacion.fechaFin,
                    diasParaRenovar = calcularDiasParaRenovar(relacion.fechaFin),
                )
            }
            .defaultIfEmpty(
                response.copy(
                    tieneMembresia = true,
                    membresiaEstado = relacion.estado,
                    membresiaFechaFin = relacion.fechaFin,
                    diasParaRenovar = calcularDiasParaRenovar(relacion.fechaFin),
                ),
            )

    private fun calcularDiasParaRenovar(fechaFin: LocalDate?): Long? =
        fechaFin?.let { ChronoUnit.DAYS.between(LocalDate.now(), it).coerceAtLeast(0) }

    private fun eliminarDependenciasDeUsuario(usuarioId: Long): Mono<Void> =
        entrenadorRepository.findByUsuarioId(usuarioId)
            .flatMap { entrenador ->
                val entrenadorId = requireNotNull(entrenador.id) { "El entrenador debe tener id" }
                solicitudMaterialRepository.findByEntrenadorId(entrenadorId)
                    .collectList()
                    .flatMap { solicitudes -> solicitudMaterialRepository.deleteAll(solicitudes) }
                    .then(
                        solicitudInstalacionRepository.findByEntrenadorId(entrenadorId)
                            .collectList()
                            .flatMap { solicitudes -> solicitudInstalacionRepository.deleteAll(solicitudes) },
                    )
                    .then(
                        actividadEntrenadorRepository.findByEntrenadorId(entrenadorId)
                            .collectList()
                            .flatMap { asignaciones -> actividadEntrenadorRepository.deleteAll(asignaciones) },
                    )
                    .then(entrenadorRepository.delete(entrenador))
            }
            .then(
                inscripcionActividadRepository.findByUsuarioId(usuarioId)
                    .collectList()
                    .flatMap { inscripciones -> inscripcionActividadRepository.deleteAll(inscripciones) },
            )
            .then(
                usuarioMembresiaRepository.findByUsuarioId(usuarioId)
                    .collectList()
                    .flatMap { membresias -> usuarioMembresiaRepository.deleteAll(membresias) },
            )
            .then(
                horarioRepository.findByUsuarioId(usuarioId)
                    .collectList()
                    .flatMap { horarios -> horarioRepository.deleteAll(horarios) },
            )
            .then(eliminarIncidenciasDeUsuario(usuarioId))

    private fun eliminarIncidenciasDeUsuario(usuarioId: Long): Mono<Void> =
        incidenciaRepository.findByUsuarioId(usuarioId)
            .flatMap { incidencia ->
                val incidenciaId = requireNotNull(incidencia.id) { "La incidencia debe tener id" }
                historialIncidenciaRepository.findByIncidenciaId(incidenciaId)
                    .collectList()
                    .flatMap { historial -> historialIncidenciaRepository.deleteAll(historial) }
                    .then(incidenciaRepository.delete(incidencia))
            }
            .then()
}
