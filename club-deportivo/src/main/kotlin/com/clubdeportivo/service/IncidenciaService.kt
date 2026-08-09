package com.clubdeportivo.service

import com.clubdeportivo.dto.ActualizarEstadoIncidenciaRequest
import com.clubdeportivo.dto.AgregarComentarioIncidenciaRequest
import com.clubdeportivo.dto.CrearIncidenciaRequest
import com.clubdeportivo.dto.HistorialIncidenciaResponse
import com.clubdeportivo.dto.IncidenciaResponse
import com.clubdeportivo.entity.HistorialIncidencia
import com.clubdeportivo.entity.Incidencia
import com.clubdeportivo.exception.BadRequestException
import com.clubdeportivo.exception.NotFoundException
import com.clubdeportivo.mapper.toResponse
import com.clubdeportivo.repository.HistorialIncidenciaRepository
import com.clubdeportivo.repository.IncidenciaRepository
import com.clubdeportivo.repository.RolRepository
import com.clubdeportivo.repository.UsuarioRepository
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Service
class IncidenciaService(
    private val incidenciaRepository: IncidenciaRepository,
    private val historialIncidenciaRepository: HistorialIncidenciaRepository,
    private val usuarioRepository: UsuarioRepository,
    private val rolRepository: RolRepository,
) {
    private val estadosPermitidos = setOf("PENDIENTE", "EN_PROCESO", "RESUELTA", "CANCELADA")

    fun crear(request: CrearIncidenciaRequest, correoUsuario: String): Mono<IncidenciaResponse> =
        usuarioRepository.findByCorreo(correoUsuario)
            .switchIfEmpty(Mono.error(NotFoundException("Usuario no encontrado")))
            .flatMap { usuario ->
                incidenciaRepository.save(
                    Incidencia(
                        usuarioId = requireNotNull(usuario.id) { "El usuario debe tener id" },
                        titulo = request.titulo.trim(),
                        descripcion = request.descripcion.trim(),
                        estado = "PENDIENTE",
                    ),
                )
            }
            .flatMap(::toResponse)

    fun listar(): Flux<IncidenciaResponse> =
        incidenciaRepository.findAll().flatMap(::toResponse)

    fun listarPropias(correoUsuario: String): Flux<IncidenciaResponse> =
        usuarioRepository.findByCorreo(correoUsuario)
            .switchIfEmpty(Mono.error(NotFoundException("Usuario no encontrado")))
            .flatMapMany { usuario -> incidenciaRepository.findByUsuarioId(requireNotNull(usuario.id) { "El usuario debe tener id" }) }
            .flatMap(::toResponse)

    fun actualizarEstado(id: Long, request: ActualizarEstadoIncidenciaRequest): Mono<IncidenciaResponse> {
        val estado = normalizarEstado(request.estado)

        return incidenciaRepository.findById(id)
            .switchIfEmpty(Mono.error(NotFoundException("Incidencia no encontrada")))
            .flatMap { incidencia -> incidenciaRepository.save(incidencia.copy(estado = estado)) }
            .flatMap(::toResponse)
    }

    fun agregarComentario(id: Long, request: AgregarComentarioIncidenciaRequest): Mono<IncidenciaResponse> =
        incidenciaRepository.findById(id)
            .switchIfEmpty(Mono.error(NotFoundException("Incidencia no encontrada")))
            .flatMap { incidencia ->
                historialIncidenciaRepository.save(
                    HistorialIncidencia(
                        incidenciaId = requireNotNull(incidencia.id) { "La incidencia debe tener id" },
                        comentario = request.comentario.trim(),
                    ),
                ).thenReturn(incidencia)
            }
            .flatMap(::toResponse)

    private fun toResponse(incidencia: Incidencia): Mono<IncidenciaResponse> =
        usuarioRepository.findById(incidencia.usuarioId)
            .switchIfEmpty(Mono.error(NotFoundException("Usuario de la incidencia no encontrado")))
            .flatMap { usuario ->
                rolRepository.findById(usuario.rolId)
                    .map { rol -> usuario.toResponse(rol) }
            }
            .zipWith(
                historialIncidenciaRepository.findByIncidenciaId(requireNotNull(incidencia.id) { "La incidencia debe tener id" })
                    .map { historial ->
                        HistorialIncidenciaResponse(
                            id = requireNotNull(historial.id) { "El historial debe tener id" },
                            comentario = historial.comentario,
                            fecha = historial.fecha,
                        )
                    }
                    .collectList(),
            )
            .map { tuple ->
                IncidenciaResponse(
                    id = requireNotNull(incidencia.id) { "La incidencia debe tener id" },
                    usuario = tuple.t1,
                    titulo = incidencia.titulo,
                    descripcion = incidencia.descripcion,
                    estado = incidencia.estado,
                    fechaReporte = incidencia.fechaReporte,
                    historial = tuple.t2,
                )
            }

    private fun normalizarEstado(estado: String): String {
        val normalizado = estado.trim().uppercase()
        if (normalizado !in estadosPermitidos) {
            throw BadRequestException("Estado de incidencia no permitido: $estado")
        }
        return normalizado
    }
}
