package com.clubdeportivo.controller

import com.clubdeportivo.dto.ActualizarEstadoSolicitudMaterialRequest
import com.clubdeportivo.dto.CrearMaterialRequest
import com.clubdeportivo.dto.CrearSolicitudMaterialRequest
import com.clubdeportivo.dto.MaterialResponse
import com.clubdeportivo.dto.SolicitudMaterialResponse
import com.clubdeportivo.service.MaterialService
import jakarta.validation.Valid
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api/materiales")
class MaterialController(
    private val materialService: MaterialService,
) {
    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    fun crear(@Valid @RequestBody request: CrearMaterialRequest): Mono<MaterialResponse> =
        materialService.crear(request)

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ENTRENADOR', 'TRABAJADOR')")
    fun listar(): Flux<MaterialResponse> =
        materialService.listar()

    @PostMapping("/solicitudes")
    @PreAuthorize("hasRole('ENTRENADOR')")
    fun solicitar(
        @Valid @RequestBody request: CrearSolicitudMaterialRequest,
        authentication: Authentication,
    ): Mono<SolicitudMaterialResponse> =
        materialService.solicitar(request, authentication.name)

    @GetMapping("/solicitudes")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'TRABAJADOR')")
    fun listarSolicitudes(): Flux<SolicitudMaterialResponse> =
        materialService.listarSolicitudes()

    @PatchMapping("/solicitudes/{id}/estado")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'TRABAJADOR')")
    fun actualizarEstadoSolicitud(
        @PathVariable id: Long,
        @Valid @RequestBody request: ActualizarEstadoSolicitudMaterialRequest,
    ): Mono<SolicitudMaterialResponse> =
        materialService.actualizarEstadoSolicitud(id, request)

    @GetMapping("/mis-solicitudes")
    @PreAuthorize("hasRole('ENTRENADOR')")
    fun listarMisSolicitudes(authentication: Authentication): Flux<SolicitudMaterialResponse> =
        materialService.listarMisSolicitudes(authentication.name)
}
