package com.clubdeportivo.controller

import com.clubdeportivo.dto.ActualizarDisponibilidadInstalacionRequest
import com.clubdeportivo.dto.CrearInstalacionRequest
import com.clubdeportivo.dto.InstalacionResponse
import com.clubdeportivo.service.InstalacionService
import jakarta.validation.Valid
import org.springframework.security.access.prepost.PreAuthorize
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
@RequestMapping("/api/instalaciones")
class InstalacionController(
    private val instalacionService: InstalacionService,
) {
    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    fun crear(@Valid @RequestBody request: CrearInstalacionRequest): Mono<InstalacionResponse> =
        instalacionService.crear(request)

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ENTRENADOR', 'TRABAJADOR')")
    fun listar(): Flux<InstalacionResponse> =
        instalacionService.listar()

    @GetMapping("/disponibles")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ENTRENADOR', 'TRABAJADOR')")
    fun listarDisponibles(): Flux<InstalacionResponse> =
        instalacionService.listarDisponibles()

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ENTRENADOR', 'TRABAJADOR')")
    fun buscarPorId(@PathVariable id: Long): Mono<InstalacionResponse> =
        instalacionService.buscarPorId(id)

    @PatchMapping("/{id}/disponibilidad")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'TRABAJADOR')")
    fun actualizarDisponibilidad(
        @PathVariable id: Long,
        @Valid @RequestBody request: ActualizarDisponibilidadInstalacionRequest,
    ): Mono<InstalacionResponse> =
        instalacionService.actualizarDisponibilidad(id, request)
}
