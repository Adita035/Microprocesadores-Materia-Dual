package com.clubdeportivo.service

import com.clubdeportivo.dto.ActualizarDisponibilidadInstalacionRequest
import com.clubdeportivo.dto.ActualizarDisponibilidadInstalacionPorNombreRequest
import com.clubdeportivo.dto.CrearInstalacionRequest
import com.clubdeportivo.dto.InstalacionResponse
import com.clubdeportivo.entity.Instalacion
import com.clubdeportivo.exception.NotFoundException
import com.clubdeportivo.repository.InstalacionRepository
import com.clubdeportivo.repository.SolicitudInstalacionRepository
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Service
class InstalacionService(
    private val instalacionRepository: InstalacionRepository,
    private val solicitudInstalacionRepository: SolicitudInstalacionRepository,
    private val auditoriaService: AuditoriaService,
) {
    fun crear(request: CrearInstalacionRequest): Mono<InstalacionResponse> =
        instalacionRepository.save(
            Instalacion(
                nombre = request.nombre.trim(),
                descripcion = request.descripcion?.trim(),
                capacidad = request.capacidad,
                disponible = request.disponible,
            ),
        ).map(::toResponse)

    fun listar(): Flux<InstalacionResponse> =
        instalacionRepository.findAll().map(::toResponse)

    fun listarDisponibles(): Flux<InstalacionResponse> =
        instalacionRepository.findByDisponibleTrue().map(::toResponse)

    fun buscarPorId(id: Long): Mono<InstalacionResponse> =
        instalacionRepository.findById(id)
            .switchIfEmpty(Mono.error(NotFoundException("Instalacion no encontrada")))
            .map(::toResponse)

    fun actualizarDisponibilidad(
        id: Long,
        request: ActualizarDisponibilidadInstalacionRequest,
    ): Mono<InstalacionResponse> =
        instalacionRepository.findById(id)
            .switchIfEmpty(Mono.error(NotFoundException("Instalacion no encontrada")))
            .flatMap { instalacion -> instalacionRepository.save(instalacion.copy(disponible = request.disponible)) }
            .map(::toResponse)

    fun actualizarDisponibilidadPorNombre(
        request: ActualizarDisponibilidadInstalacionPorNombreRequest,
    ): Mono<InstalacionResponse> =
        instalacionRepository.findByNombre(request.nombre.trim())
            .switchIfEmpty(Mono.error(NotFoundException("Instalacion no encontrada")))
            .flatMap { instalacion -> instalacionRepository.save(instalacion.copy(disponible = request.disponible)) }
            .map(::toResponse)

    fun eliminar(id: Long, correoAdmin: String): Mono<Void> =
        instalacionRepository.findById(id)
            .switchIfEmpty(Mono.error(NotFoundException("Instalacion no encontrada")))
            .flatMap { instalacion ->
                auditoriaService.registrarEliminacion(correoAdmin, "INSTALACION", "id=$id, nombre=${instalacion.nombre}")
                    .then(
                        solicitudInstalacionRepository.findByInstalacionId(id)
                    .collectList()
                            .flatMap { solicitudes -> solicitudInstalacionRepository.deleteAll(solicitudes) },
                    )
                    .then(instalacionRepository.delete(instalacion))
            }

    private fun toResponse(instalacion: Instalacion): InstalacionResponse =
        InstalacionResponse(
            id = requireNotNull(instalacion.id) { "La instalacion debe tener id" },
            nombre = instalacion.nombre,
            descripcion = instalacion.descripcion,
            capacidad = instalacion.capacidad,
            disponible = instalacion.disponible,
        )
}
