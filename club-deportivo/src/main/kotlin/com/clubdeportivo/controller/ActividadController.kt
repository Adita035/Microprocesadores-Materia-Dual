package com.clubdeportivo.controller

import com.clubdeportivo.dto.ActividadResponse
import com.clubdeportivo.dto.ActualizarActividadRequest
import com.clubdeportivo.dto.ActualizarEstadoActividadRequest
import com.clubdeportivo.dto.AsignarEntrenadorRequest
import com.clubdeportivo.dto.CrearActividadRequest
import com.clubdeportivo.dto.InscripcionActividadResponse
import com.clubdeportivo.service.ActividadService
import jakarta.validation.Valid
import org.springframework.security.core.Authentication
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PatchMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api/actividades")
class ActividadController(
    private val actividadService: ActividadService,
) {

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    fun crear(@Valid @RequestBody request: CrearActividadRequest): Mono<ActividadResponse> =
        actividadService.crear(request)

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ENTRENADOR')")
    fun listar(): Flux<ActividadResponse> =
        actividadService.listar()

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ENTRENADOR')")
    fun buscarPorId(@PathVariable id: Long): Mono<ActividadResponse> =
        actividadService.buscarPorId(id)

    @GetMapping("/publicas")
    fun listarPublicas(): Flux<ActividadResponse> =
        actividadService.listar()

    @GetMapping("/publicas/{id}")
    fun buscarPublicaPorId(@PathVariable id: Long): Mono<ActividadResponse> =
        actividadService.buscarPorId(id)

    @GetMapping("/mis-inscripciones")
    @PreAuthorize("isAuthenticated()")
    fun listarMisInscripciones(authentication: Authentication): Flux<ActividadResponse> =
        actividadService.listarInscritas(authentication.name)

    @GetMapping("/entrenador/{entrenadorId}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ENTRENADOR')")
    fun listarPorEntrenador(@PathVariable entrenadorId: Long): Flux<ActividadResponse> =
        actividadService.listarPorEntrenador(entrenadorId)

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    fun actualizar(
        @PathVariable id: Long,
        @Valid @RequestBody request: ActualizarActividadRequest,
    ): Mono<ActividadResponse> =
        actividadService.actualizar(id, request)

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ENTRENADOR')")
    fun actualizarEstado(
        @PathVariable id: Long,
        @Valid @RequestBody request: ActualizarEstadoActividadRequest,
    ): Mono<ActividadResponse> =
        actividadService.actualizarEstado(id, request)

    @PostMapping("/{id}/entrenadores")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    fun asignarEntrenador(
        @PathVariable id: Long,
        @Valid @RequestBody request: AsignarEntrenadorRequest,
    ): Mono<ActividadResponse> =
        actividadService.asignarEntrenador(id, request)

    @PostMapping("/{id}/inscripcion")
    @PreAuthorize("isAuthenticated()")
    fun inscribir(
        @PathVariable id: Long,
        authentication: Authentication,
    ): Mono<InscripcionActividadResponse> =
        actividadService.inscribir(id, authentication.name)
}
