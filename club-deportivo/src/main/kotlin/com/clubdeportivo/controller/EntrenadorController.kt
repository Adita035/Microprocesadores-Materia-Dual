package com.clubdeportivo.controller

import com.clubdeportivo.dto.ActualizarEntrenadorRequest
import com.clubdeportivo.dto.ActividadResponse
import com.clubdeportivo.dto.AlumnoActividadResponse
import com.clubdeportivo.dto.CrearEntrenadorRequest
import com.clubdeportivo.dto.EntrenadorResponse
import com.clubdeportivo.dto.RegistrarEntrenadorRequest
import com.clubdeportivo.service.ActividadService
import com.clubdeportivo.service.EntrenadorService
import jakarta.validation.Valid
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api/entrenadores")
class EntrenadorController(
    private val entrenadorService: EntrenadorService,
    private val actividadService: ActividadService,
) {

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    fun crear(@Valid @RequestBody request: CrearEntrenadorRequest): Mono<EntrenadorResponse> =
        entrenadorService.crear(request)

    @PostMapping("/registro")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    fun registrar(@Valid @RequestBody request: RegistrarEntrenadorRequest): Mono<EntrenadorResponse> =
        entrenadorService.registrar(request)

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    fun listar(): Flux<EntrenadorResponse> =
        entrenadorService.listar()

    @GetMapping("/mis-actividades")
    @PreAuthorize("hasRole('ENTRENADOR')")
    fun listarMisActividades(authentication: Authentication): Flux<ActividadResponse> =
        actividadService.listarDelEntrenador(authentication.name)

    @GetMapping("/actividades/{actividadId}/alumnos")
    @PreAuthorize("hasRole('ENTRENADOR')")
    fun listarAlumnosDeActividad(
        @PathVariable actividadId: Long,
        authentication: Authentication,
    ): Flux<AlumnoActividadResponse> =
        actividadService.listarAlumnosDeActividad(actividadId, authentication.name)

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    fun buscarPorId(@PathVariable id: Long): Mono<EntrenadorResponse> =
        entrenadorService.buscarPorId(id)

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    fun actualizar(
        @PathVariable id: Long,
        @Valid @RequestBody request: ActualizarEntrenadorRequest,
    ): Mono<EntrenadorResponse> =
        entrenadorService.actualizar(id, request)
}
