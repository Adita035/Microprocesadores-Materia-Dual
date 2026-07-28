package com.clubdeportivo.service

import com.clubdeportivo.dto.ActividadResponse
import com.clubdeportivo.dto.ActualizarActividadRequest
import com.clubdeportivo.dto.ActualizarEstadoActividadRequest
import com.clubdeportivo.dto.AsignarEntrenadorRequest
import com.clubdeportivo.dto.CrearActividadRequest
import com.clubdeportivo.dto.InscripcionActividadResponse
import com.clubdeportivo.entity.Actividad
import com.clubdeportivo.entity.ActividadEntrenador
import com.clubdeportivo.entity.Entrenador
import com.clubdeportivo.entity.InscripcionActividad
import com.clubdeportivo.exception.BadRequestException
import com.clubdeportivo.exception.ConflictException
import com.clubdeportivo.exception.NotFoundException
import com.clubdeportivo.mapper.toResponse
import com.clubdeportivo.repository.ActividadEntrenadorRepository
import com.clubdeportivo.repository.ActividadRepository
import com.clubdeportivo.repository.EntrenadorRepository
import com.clubdeportivo.repository.InscripcionActividadRepository
import com.clubdeportivo.repository.RolRepository
import com.clubdeportivo.repository.UsuarioRepository
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Service
class ActividadService(
    private val actividadRepository: ActividadRepository,
    private val actividadEntrenadorRepository: ActividadEntrenadorRepository,
    private val entrenadorRepository: EntrenadorRepository,
    private val inscripcionActividadRepository: InscripcionActividadRepository,
    private val usuarioRepository: UsuarioRepository,
    private val rolRepository: RolRepository,
) {
    private val estadosPermitidos = setOf("PENDIENTE", "EN_PROCESO", "FINALIZADA", "CANCELADA")

    fun crear(request: CrearActividadRequest): Mono<ActividadResponse> =
        actividadRepository.save(
            Actividad(
                nombre = request.nombre,
                descripcion = request.descripcion,
                fecha = request.fecha,
                horaInicio = request.horaInicio,
                horaFin = request.horaFin,
                estado = normalizarEstado(request.estado),
            ),
        ).flatMap(::toResponse)

    fun listar(): Flux<ActividadResponse> =
        actividadRepository.findAll()
            .flatMap(::toResponse)

    fun listarPorEntrenador(entrenadorId: Long): Flux<ActividadResponse> =
        entrenadorRepository.findById(entrenadorId)
            .switchIfEmpty(Mono.error(NotFoundException("Entrenador no encontrado")))
            .flatMapMany {
                actividadEntrenadorRepository.findByEntrenadorId(entrenadorId)
                    .flatMap { relacion -> actividadRepository.findById(relacion.actividadId) }
                    .flatMap(::toResponse)
            }

    fun buscarPorId(id: Long): Mono<ActividadResponse> =
        actividadRepository.findById(id)
            .switchIfEmpty(Mono.error(NotFoundException("Actividad no encontrada")))
            .flatMap(::toResponse)

    fun listarInscritas(correo: String): Flux<ActividadResponse> =
        usuarioRepository.findByCorreo(correo)
            .switchIfEmpty(Mono.error(NotFoundException("Usuario no encontrado")))
            .flatMapMany { usuario ->
                inscripcionActividadRepository.findByUsuarioId(requireNotNull(usuario.id) { "El usuario debe tener id" })
                    .flatMap { inscripcion -> actividadRepository.findById(inscripcion.actividadId) }
                    .flatMap(::toResponse)
            }

    fun actualizar(id: Long, request: ActualizarActividadRequest): Mono<ActividadResponse> =
        actividadRepository.findById(id)
            .switchIfEmpty(Mono.error(NotFoundException("Actividad no encontrada")))
            .flatMap { actividad ->
                actividadRepository.save(
                    actividad.copy(
                        nombre = request.nombre,
                        descripcion = request.descripcion,
                        fecha = request.fecha,
                        horaInicio = request.horaInicio,
                        horaFin = request.horaFin,
                        estado = normalizarEstado(request.estado),
                    ),
                )
            }
            .flatMap(::toResponse)

    fun actualizarEstado(id: Long, request: ActualizarEstadoActividadRequest): Mono<ActividadResponse> =
        actividadRepository.findById(id)
            .switchIfEmpty(Mono.error(NotFoundException("Actividad no encontrada")))
            .flatMap { actividad ->
                actividadRepository.save(actividad.copy(estado = normalizarEstado(request.estado)))
            }
            .flatMap(::toResponse)

    fun asignarEntrenador(id: Long, request: AsignarEntrenadorRequest): Mono<ActividadResponse> =
        actividadRepository.findById(id)
            .switchIfEmpty(Mono.error(NotFoundException("Actividad no encontrada")))
            .flatMap { actividad ->
                entrenadorRepository.findById(request.entrenadorId)
                    .switchIfEmpty(Mono.error(NotFoundException("Entrenador no encontrado")))
                    .flatMap {
                        actividadEntrenadorRepository.existsByActividadIdAndEntrenadorId(id, request.entrenadorId)
                    }
                    .flatMap { existe ->
                        if (existe) {
                            Mono.error(ConflictException("El entrenador ya esta asignado a la actividad"))
                        } else {
                            actividadEntrenadorRepository.save(
                                ActividadEntrenador(
                                    actividadId = id,
                                    entrenadorId = request.entrenadorId,
                                ),
                            ).thenReturn(actividad)
                        }
                    }
            }
            .flatMap(::toResponse)

    fun inscribir(id: Long, correo: String): Mono<InscripcionActividadResponse> =
        actividadRepository.findById(id)
            .switchIfEmpty(Mono.error(NotFoundException("Actividad no encontrada")))
            .flatMap { actividad ->
                usuarioRepository.findByCorreo(correo)
                    .switchIfEmpty(Mono.error(NotFoundException("Usuario no encontrado")))
                    .flatMap { usuario ->
                        val usuarioId = requireNotNull(usuario.id) { "El usuario debe tener id" }
                        inscripcionActividadRepository.existsByUsuarioIdAndActividadId(usuarioId, id)
                            .flatMap { existe ->
                                if (existe) {
                                    Mono.error(ConflictException("Ya estas inscrito en esta actividad"))
                                } else {
                                    inscripcionActividadRepository.save(
                                        InscripcionActividad(
                                            usuarioId = usuarioId,
                                            actividadId = id,
                                        ),
                                    ).thenReturn(actividad)
                                }
                            }
                    }
            }
            .flatMap(::toResponse)
            .map { actividad -> InscripcionActividadResponse("Inscripcion registrada", actividad) }

    private fun normalizarEstado(estado: String?): String {
        val normalizado = estado?.trim()?.uppercase().takeUnless { it.isNullOrBlank() } ?: "PENDIENTE"
        if (normalizado !in estadosPermitidos) {
            throw BadRequestException("Estado no permitido: $estado")
        }
        return normalizado
    }

    private fun toResponse(actividad: Actividad): Mono<ActividadResponse> =
        actividadEntrenadorRepository.findByActividadId(requireNotNull(actividad.id) { "La actividad debe tener id" })
            .flatMap { relacion -> obtenerEntrenadorResponse(relacion.entrenadorId) }
            .collectList()
            .map { entrenadores -> actividad.toResponse(entrenadores) }

    private fun obtenerEntrenadorResponse(entrenadorId: Long): Mono<com.clubdeportivo.dto.EntrenadorResponse> =
        entrenadorRepository.findById(entrenadorId)
            .switchIfEmpty(Mono.error(NotFoundException("Entrenador asignado no encontrado")))
            .flatMap { entrenador: Entrenador ->
                usuarioRepository.findById(entrenador.usuarioId)
                    .switchIfEmpty(Mono.error(NotFoundException("Usuario del entrenador no encontrado")))
                    .flatMap { usuario ->
                        rolRepository.findById(usuario.rolId)
                            .map { rol -> usuario.toResponse(rol) }
                    }
                    .map { usuarioResponse -> entrenador.toResponse(usuarioResponse) }
            }
}
