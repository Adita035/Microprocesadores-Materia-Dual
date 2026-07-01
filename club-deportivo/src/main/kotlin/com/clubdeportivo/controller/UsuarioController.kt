package com.clubdeportivo.controller

import com.clubdeportivo.dto.CrearAdminRequest
import com.clubdeportivo.dto.UsuarioResponse
import jakarta.validation.Valid
import com.clubdeportivo.service.UsuarioService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api/usuarios")
class UsuarioController(
    private val usuarioService: UsuarioService,
) {

    @PostMapping("/admin")
    fun crearAdministrador(@Valid @RequestBody request: CrearAdminRequest): Mono<UsuarioResponse> =
        usuarioService.crearAdministrador(request)

    @GetMapping
    fun listar(): Flux<UsuarioResponse> = usuarioService.listar()
}
