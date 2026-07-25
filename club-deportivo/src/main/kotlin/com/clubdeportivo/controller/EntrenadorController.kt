package com.clubdeportivo.controller

import com.clubdeportivo.dto.ActualizarEntrenadorRequest
import com.clubdeportivo.dto.CrearEntrenadorRequest
import com.clubdeportivo.dto.EntrenadorResponse
import com.clubdeportivo.dto.RegistrarEntrenadorRequest
import com.clubdeportivo.service.EntrenadorService
import jakarta.validation.Valid
import org.springframework.security.access.prepost.PreAuthorize
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
@PreAuthorize("hasRole('ADMINISTRADOR')")
class EntrenadorController(
    private val entrenadorService: EntrenadorService,
) {

    @PostMapping
    fun crear(@Valid @RequestBody request: CrearEntrenadorRequest): Mono<EntrenadorResponse> =
        entrenadorService.crear(request)

    @PostMapping("/registro")
    fun registrar(@Valid @RequestBody request: RegistrarEntrenadorRequest): Mono<EntrenadorResponse> =
        entrenadorService.registrar(request)

    @GetMapping
    fun listar(): Flux<EntrenadorResponse> =
        entrenadorService.listar()

    @GetMapping("/{id}")
    fun buscarPorId(@PathVariable id: Long): Mono<EntrenadorResponse> =
        entrenadorService.buscarPorId(id)

    @PutMapping("/{id}")
    fun actualizar(
        @PathVariable id: Long,
        @Valid @RequestBody request: ActualizarEntrenadorRequest,
    ): Mono<EntrenadorResponse> =
        entrenadorService.actualizar(id, request)
}
