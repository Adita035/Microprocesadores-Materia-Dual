package com.clubdeportivo.controller

import com.clubdeportivo.dto.ActualizarEstadoIncidenciaRequest
import com.clubdeportivo.dto.AgregarComentarioIncidenciaRequest
import com.clubdeportivo.dto.CrearIncidenciaRequest
import com.clubdeportivo.dto.IncidenciaResponse
import com.clubdeportivo.service.IncidenciaService
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
@RequestMapping("/api/incidencias")
class IncidenciaController(
    private val incidenciaService: IncidenciaService,
) {
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    fun crear(
        @Valid @RequestBody request: CrearIncidenciaRequest,
        authentication: Authentication,
    ): Mono<IncidenciaResponse> =
        incidenciaService.crear(request, authentication.name)

    @GetMapping
    @PreAuthorize("hasRole('SOPORTE_TECNICO')")
    fun listar(): Flux<IncidenciaResponse> =
        incidenciaService.listar()

    @GetMapping("/mis-incidencias")
    @PreAuthorize("isAuthenticated()")
    fun listarPropias(authentication: Authentication): Flux<IncidenciaResponse> =
        incidenciaService.listarPropias(authentication.name)

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('SOPORTE_TECNICO')")
    fun actualizarEstado(
        @PathVariable id: Long,
        @Valid @RequestBody request: ActualizarEstadoIncidenciaRequest,
    ): Mono<IncidenciaResponse> =
        incidenciaService.actualizarEstado(id, request)

    @PostMapping("/{id}/comentarios")
    @PreAuthorize("hasRole('SOPORTE_TECNICO')")
    fun agregarComentario(
        @PathVariable id: Long,
        @Valid @RequestBody request: AgregarComentarioIncidenciaRequest,
    ): Mono<IncidenciaResponse> =
        incidenciaService.agregarComentario(id, request)
}
