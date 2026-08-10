package com.clubdeportivo.controller

import com.clubdeportivo.dto.CrearMembresiaRequest
import com.clubdeportivo.dto.ActualizarEstadoMembresiaRequest
import com.clubdeportivo.dto.ActualizarEstadoMembresiaPorNombreRequest
import com.clubdeportivo.dto.MembresiaResponse
import com.clubdeportivo.dto.SeleccionMembresiaResponse
import com.clubdeportivo.dto.SeleccionarMembresiaRequest
import com.clubdeportivo.dto.UsuarioMembresiaResponse
import com.clubdeportivo.service.MembresiaService
import jakarta.validation.Valid
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.DeleteMapping
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
@RequestMapping("/api/membresias")
class MembresiaController(
    private val membresiaService: MembresiaService,
) {
    @GetMapping("/publicas")
    fun listarPublicas(): Flux<MembresiaResponse> =
        membresiaService.listarActivas()

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    fun listar(): Flux<MembresiaResponse> =
        membresiaService.listar()

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    fun crear(@Valid @RequestBody request: CrearMembresiaRequest): Mono<MembresiaResponse> =
        membresiaService.crear(request)

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    fun actualizarEstado(
        @PathVariable id: Long,
        @Valid @RequestBody request: ActualizarEstadoMembresiaRequest,
    ): Mono<MembresiaResponse> =
        membresiaService.actualizarEstado(id, request)

    @PatchMapping("/por-nombre/estado")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    fun actualizarEstadoPorNombre(
        @Valid @RequestBody request: ActualizarEstadoMembresiaPorNombreRequest,
    ): Mono<MembresiaResponse> =
        membresiaService.actualizarEstadoPorNombre(request)

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    fun eliminar(@PathVariable id: Long, authentication: Authentication): Mono<Void> =
        membresiaService.eliminar(id, authentication.name)

    @PostMapping("/seleccion")
    @PreAuthorize("isAuthenticated()")
    fun seleccionar(
        authentication: Authentication,
        @Valid @RequestBody request: SeleccionarMembresiaRequest,
    ): Mono<SeleccionMembresiaResponse> =
        membresiaService.seleccionar(authentication.name, request)

    @GetMapping("/mi-membresia")
    @PreAuthorize("isAuthenticated()")
    fun obtenerActual(authentication: Authentication): Mono<UsuarioMembresiaResponse> =
        membresiaService.obtenerActual(authentication.name)

    @GetMapping("/mis-membresias")
    @PreAuthorize("isAuthenticated()")
    fun listarMisMembresias(authentication: Authentication): Flux<UsuarioMembresiaResponse> =
        membresiaService.listarPorUsuario(authentication.name)
}
