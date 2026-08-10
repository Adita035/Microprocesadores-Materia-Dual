package com.clubdeportivo.service

import com.clubdeportivo.dto.ActualizarEstadoMembresiaRequest
import com.clubdeportivo.dto.ActualizarEstadoMembresiaPorNombreRequest
import com.clubdeportivo.dto.CrearMembresiaRequest
import com.clubdeportivo.dto.MembresiaResponse
import com.clubdeportivo.dto.SeleccionMembresiaResponse
import com.clubdeportivo.dto.SeleccionarMembresiaRequest
import com.clubdeportivo.dto.UsuarioMembresiaResponse
import com.clubdeportivo.entity.Membresia
import com.clubdeportivo.entity.UsuarioMembresia
import com.clubdeportivo.exception.BadRequestException
import com.clubdeportivo.exception.NotFoundException
import com.clubdeportivo.repository.MembresiaRepository
import com.clubdeportivo.repository.RolRepository
import com.clubdeportivo.repository.UsuarioMembresiaRepository
import com.clubdeportivo.repository.UsuarioRepository
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import java.time.LocalDate

@Service
class MembresiaService(
    private val membresiaRepository: MembresiaRepository,
    private val usuarioMembresiaRepository: UsuarioMembresiaRepository,
    private val usuarioRepository: UsuarioRepository,
    private val rolRepository: RolRepository,
    private val auditoriaService: AuditoriaService,
) {
    fun crear(request: CrearMembresiaRequest): Mono<MembresiaResponse> =
        membresiaRepository.save(
            Membresia(
                nombre = request.nombre.trim(),
                descripcion = request.descripcion?.trim(),
                precio = request.precio,
                duracionDias = request.duracionDias,
                activa = request.activa,
            ),
        ).map(::toResponse)

    fun listar(): Flux<MembresiaResponse> =
        membresiaRepository.findAll().map(::toResponse)

    fun listarActivas(): Flux<MembresiaResponse> =
        membresiaRepository.findByActivaTrue().map(::toResponse)

    fun actualizarEstado(id: Long, request: ActualizarEstadoMembresiaRequest): Mono<MembresiaResponse> =
        membresiaRepository.findById(id)
            .switchIfEmpty(Mono.error(NotFoundException("Membresia no encontrada")))
            .flatMap { membresia -> membresiaRepository.save(membresia.copy(activa = request.activa)) }
            .map(::toResponse)

    fun actualizarEstadoPorNombre(request: ActualizarEstadoMembresiaPorNombreRequest): Mono<MembresiaResponse> =
        membresiaRepository.findByNombre(request.nombre.trim())
            .switchIfEmpty(Mono.error(NotFoundException("Membresia no encontrada")))
            .flatMap { membresia -> membresiaRepository.save(membresia.copy(activa = request.activa)) }
            .map(::toResponse)

    fun eliminar(id: Long, correoAdmin: String): Mono<Void> =
        membresiaRepository.findById(id)
            .switchIfEmpty(Mono.error(NotFoundException("Membresia no encontrada")))
            .flatMap { membresia ->
                auditoriaService.registrarEliminacion(correoAdmin, "MEMBRESIA", "id=$id, nombre=${membresia.nombre}")
                    .then(
                        usuarioMembresiaRepository.findByMembresiaId(id)
                    .collectList()
                            .flatMap { relaciones -> usuarioMembresiaRepository.deleteAll(relaciones) },
                    )
                    .then(membresiaRepository.delete(membresia))
            }

    fun seleccionar(correo: String, request: SeleccionarMembresiaRequest): Mono<SeleccionMembresiaResponse> =
        usuarioRepository.findByCorreo(correo)
            .switchIfEmpty(Mono.error(NotFoundException("Usuario no encontrado")))
            .flatMap { usuario ->
                val usuarioId = requireNotNull(usuario.id) { "El usuario debe tener id" }
                rolRepository.findById(usuario.rolId)
                    .flatMap { rol ->
                        if (rol.nombre == "ADMINISTRADOR") {
                            Mono.error(BadRequestException("Los administradores no pueden seleccionar membresias"))
                        } else {
                            membresiaRepository.findById(request.membresiaId)
                                .switchIfEmpty(Mono.error(NotFoundException("Membresia no encontrada")))
                                .flatMap { membresia ->
                                    if (!membresia.activa) {
                                        Mono.error(BadRequestException("La membresia no esta activa"))
                                    } else {
                                        guardarSeleccion(usuarioId, membresia)
                                    }
                                }
                        }
                    }
            }
            .map { usuarioMembresia -> SeleccionMembresiaResponse("Membresia seleccionada", usuarioMembresia) }

    fun obtenerActual(correo: String): Mono<UsuarioMembresiaResponse> =
        usuarioRepository.findByCorreo(correo)
            .switchIfEmpty(Mono.error(NotFoundException("Usuario no encontrado")))
            .flatMap { usuario ->
                val usuarioId = requireNotNull(usuario.id) { "El usuario debe tener id" }
                usuarioMembresiaRepository.findFirstByUsuarioIdAndEstado(usuarioId, "ACTIVA")
                    .switchIfEmpty(Mono.error(NotFoundException("No tienes membresia activa")))
                    .flatMap(::toResponse)
            }

    fun listarPorUsuario(correo: String): Flux<UsuarioMembresiaResponse> =
        usuarioRepository.findByCorreo(correo)
            .switchIfEmpty(Mono.error(NotFoundException("Usuario no encontrado")))
            .flatMapMany { usuario ->
                val usuarioId = requireNotNull(usuario.id) { "El usuario debe tener id" }
                usuarioMembresiaRepository.findByUsuarioId(usuarioId).flatMap(::toResponse)
            }

    private fun guardarSeleccion(usuarioId: Long, membresia: Membresia): Mono<UsuarioMembresiaResponse> {
        val hoy = LocalDate.now()
        val fechaFin = membresia.duracionDias?.let { hoy.plusDays(it.toLong()) }
        val membresiaId = requireNotNull(membresia.id) { "La membresia debe tener id" }
        val nueva = UsuarioMembresia(
            usuarioId = usuarioId,
            membresiaId = membresiaId,
            fechaInicio = hoy,
            fechaFin = fechaFin,
            estado = "ACTIVA",
        )

        return usuarioMembresiaRepository.findFirstByUsuarioIdAndEstado(usuarioId, "ACTIVA")
            .flatMap { activa -> usuarioMembresiaRepository.save(activa.copy(estado = "CANCELADA")) }
            .then(usuarioMembresiaRepository.save(nueva))
            .flatMap(::toResponse)
    }

    private fun toResponse(usuarioMembresia: UsuarioMembresia): Mono<UsuarioMembresiaResponse> =
        membresiaRepository.findById(usuarioMembresia.membresiaId)
            .switchIfEmpty(Mono.error(NotFoundException("Membresia asociada no encontrada")))
            .map { membresia ->
                UsuarioMembresiaResponse(
                    id = requireNotNull(usuarioMembresia.id) { "La relacion debe tener id" },
                    usuarioId = usuarioMembresia.usuarioId,
                    membresia = toResponse(membresia),
                    fechaInicio = usuarioMembresia.fechaInicio,
                    fechaFin = usuarioMembresia.fechaFin,
                    estado = usuarioMembresia.estado,
                )
            }

    private fun toResponse(membresia: Membresia): MembresiaResponse =
        MembresiaResponse(
            id = requireNotNull(membresia.id) { "La membresia debe tener id" },
            nombre = membresia.nombre,
            descripcion = membresia.descripcion,
            precio = membresia.precio,
            duracionDias = membresia.duracionDias,
            activa = membresia.activa,
        )
}
