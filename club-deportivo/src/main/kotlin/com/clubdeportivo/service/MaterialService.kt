package com.clubdeportivo.service

import com.clubdeportivo.dto.ActualizarEstadoSolicitudMaterialRequest
import com.clubdeportivo.dto.CrearMaterialRequest
import com.clubdeportivo.dto.CrearSolicitudMaterialRequest
import com.clubdeportivo.dto.MaterialResponse
import com.clubdeportivo.dto.SolicitudMaterialResponse
import com.clubdeportivo.entity.Material
import com.clubdeportivo.entity.SolicitudMaterial
import com.clubdeportivo.exception.BadRequestException
import com.clubdeportivo.exception.NotFoundException
import com.clubdeportivo.repository.EntrenadorRepository
import com.clubdeportivo.repository.MaterialRepository
import com.clubdeportivo.repository.SolicitudMaterialRepository
import com.clubdeportivo.repository.UsuarioRepository
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Service
class MaterialService(
    private val materialRepository: MaterialRepository,
    private val solicitudMaterialRepository: SolicitudMaterialRepository,
    private val usuarioRepository: UsuarioRepository,
    private val entrenadorRepository: EntrenadorRepository,
) {
    private val estadosSolicitud = setOf("PENDIENTE", "APROBADA", "RECHAZADA", "ENTREGADA")

    fun crear(request: CrearMaterialRequest): Mono<MaterialResponse> =
        materialRepository.save(
            Material(
                nombre = request.nombre.trim(),
                descripcion = request.descripcion?.trim(),
                cantidadDisponible = request.cantidadDisponible,
            ),
        ).map(::toResponse)

    fun listar(): Flux<MaterialResponse> =
        materialRepository.findAll().map(::toResponse)

    fun solicitar(request: CrearSolicitudMaterialRequest, correoEntrenador: String): Mono<SolicitudMaterialResponse> =
        if (request.cantidad < 1) {
            return Mono.error(BadRequestException("La cantidad debe ser mayor a cero"))
        } else {
            return obtenerEntrenadorId(correoEntrenador)
                .flatMap { entrenadorId ->
                    materialRepository.findById(request.materialId)
                        .switchIfEmpty(Mono.error(NotFoundException("Material no encontrado")))
                        .flatMap { material ->
                            if (request.cantidad > material.cantidadDisponible) {
                                Mono.error(BadRequestException("La cantidad solicitada supera la disponibilidad del material"))
                            } else {
                                materialRepository.save(
                                    material.copy(cantidadDisponible = material.cantidadDisponible - request.cantidad),
                                ).then(
                                    solicitudMaterialRepository.save(
                                        SolicitudMaterial(
                                            entrenadorId = entrenadorId,
                                            materialId = request.materialId,
                                            cantidad = request.cantidad,
                                            estado = "PENDIENTE",
                                        ),
                                    ),
                                )
                            }
                        }
                }
                .flatMap(::toResponse)
        }

    fun listarSolicitudes(): Flux<SolicitudMaterialResponse> =
        solicitudMaterialRepository.findAll().flatMap(::toResponse)

    fun listarMisSolicitudes(correoEntrenador: String): Flux<SolicitudMaterialResponse> =
        obtenerEntrenadorId(correoEntrenador)
            .flatMapMany { entrenadorId -> solicitudMaterialRepository.findByEntrenadorId(entrenadorId) }
            .flatMap(::toResponse)

    fun actualizarEstadoSolicitud(
        id: Long,
        request: ActualizarEstadoSolicitudMaterialRequest,
    ): Mono<SolicitudMaterialResponse> {
        val estado = normalizarEstado(request.estado)

        return solicitudMaterialRepository.findById(id)
            .switchIfEmpty(Mono.error(NotFoundException("Solicitud de material no encontrada")))
            .flatMap { solicitud ->
                actualizarInventarioPorCambioEstado(solicitud, estado)
                    .then(solicitudMaterialRepository.save(solicitud.copy(estado = estado)))
            }
            .flatMap(::toResponse)
    }

    private fun obtenerEntrenadorId(correo: String): Mono<Long> =
        usuarioRepository.findByCorreo(correo)
            .switchIfEmpty(Mono.error(NotFoundException("Usuario no encontrado")))
            .flatMap { usuario ->
                entrenadorRepository.findByUsuarioId(requireNotNull(usuario.id) { "El usuario debe tener id" })
                    .switchIfEmpty(Mono.error(NotFoundException("Perfil de entrenador no encontrado")))
            }
            .map { entrenador -> requireNotNull(entrenador.id) { "El entrenador debe tener id" } }

    private fun toResponse(material: Material): MaterialResponse =
        MaterialResponse(
            id = requireNotNull(material.id) { "El material debe tener id" },
            nombre = material.nombre,
            descripcion = material.descripcion,
            cantidadDisponible = material.cantidadDisponible,
        )

    private fun toResponse(solicitud: SolicitudMaterial): Mono<SolicitudMaterialResponse> =
        Mono.zip(
            entrenadorRepository.findById(solicitud.entrenadorId)
                .switchIfEmpty(Mono.error(NotFoundException("Entrenador de la solicitud no encontrado"))),
            materialRepository.findById(solicitud.materialId)
                .switchIfEmpty(Mono.error(NotFoundException("Material de la solicitud no encontrado"))),
        ).flatMap { tuple ->
            val entrenador = tuple.t1
            val material = tuple.t2
            usuarioRepository.findById(entrenador.usuarioId)
                .switchIfEmpty(Mono.error(NotFoundException("Usuario del entrenador no encontrado")))
                .map { usuario ->
                    SolicitudMaterialResponse(
                        id = requireNotNull(solicitud.id) { "La solicitud debe tener id" },
                        entrenadorId = solicitud.entrenadorId,
                        entrenador = "${usuario.nombre} ${usuario.apellido}".trim(),
                        entrenadorCorreo = usuario.correo,
                        material = toResponse(material),
                        cantidad = solicitud.cantidad,
                        estado = solicitud.estado,
                        fechaSolicitud = solicitud.fechaSolicitud,
                    )
                }
        }

    private fun actualizarInventarioPorCambioEstado(solicitud: SolicitudMaterial, nuevoEstado: String): Mono<Void> {
        val estadoActual = solicitud.estado.uppercase()
        val liberaMaterial = nuevoEstado == "RECHAZADA" && estadoActual != "RECHAZADA"
        val vuelveAReservar = nuevoEstado != "RECHAZADA" && estadoActual == "RECHAZADA"

        if (!liberaMaterial && !vuelveAReservar) {
            return Mono.empty()
        }

        return materialRepository.findById(solicitud.materialId)
            .switchIfEmpty(Mono.error(NotFoundException("Material de la solicitud no encontrado")))
            .flatMap { material ->
                val nuevaCantidad = if (liberaMaterial) {
                    material.cantidadDisponible + solicitud.cantidad
                } else {
                    if (solicitud.cantidad > material.cantidadDisponible) {
                        return@flatMap Mono.error<Material>(BadRequestException("No hay suficiente material disponible para reactivar la solicitud"))
                    }
                    material.cantidadDisponible - solicitud.cantidad
                }

                materialRepository.save(material.copy(cantidadDisponible = nuevaCantidad))
            }
            .then()
    }

    private fun normalizarEstado(estado: String): String {
        val normalizado = estado.trim().uppercase()
        if (normalizado !in estadosSolicitud) {
            throw BadRequestException("Estado de solicitud no permitido: $estado")
        }
        return normalizado
    }
}
