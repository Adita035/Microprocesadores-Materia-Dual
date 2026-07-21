package com.clubdeportivo.controller

import com.clubdeportivo.dto.ActualizarTrabajadorRequest
import com.clubdeportivo.dto.CrearTrabajadorRequest
import com.clubdeportivo.dto.TrabajadorResponse
import com.clubdeportivo.service.TrabajadorService
import jakarta.validation.Valid
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
@RequestMapping("/api/trabajadores")
@PreAuthorize("hasRole('ADMINISTRADOR')")
class TrabajadorController(
    private val trabajadorService: TrabajadorService,
) {

    @PostMapping
    fun crear(@Valid @RequestBody request: CrearTrabajadorRequest): Mono<TrabajadorResponse> =
        trabajadorService.crear(request)

    @GetMapping
    fun listar(): Flux<TrabajadorResponse> =
        trabajadorService.listar()

    @GetMapping("/{id}")
    fun buscarPorId(@PathVariable id: Long): Mono<TrabajadorResponse> =
        trabajadorService.buscarPorId(id)

    @PutMapping("/{id}")
    fun actualizar(
        @PathVariable id: Long,
        @Valid @RequestBody request: ActualizarTrabajadorRequest,
    ): Mono<TrabajadorResponse> =
        trabajadorService.actualizar(id, request)

    @PatchMapping("/{id}/desactivar")
    fun desactivar(@PathVariable id: Long): Mono<TrabajadorResponse> =
        trabajadorService.desactivar(id)
}
