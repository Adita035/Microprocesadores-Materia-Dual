package com.clubdeportivo.controller

import com.clubdeportivo.dto.HorarioResponse
import com.clubdeportivo.service.HorarioService
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.security.core.Authentication
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Flux

@RestController
@RequestMapping("/api/horarios")
class HorarioController(
    private val horarioService: HorarioService,
) {
    @GetMapping("/mis-horarios")
    @PreAuthorize("hasAnyRole('TRABAJADOR', 'ENTRENADOR', 'SOPORTE_TECNICO')")
    fun listarPropios(authentication: Authentication): Flux<HorarioResponse> =
        horarioService.listarPropios(authentication.name)
}
