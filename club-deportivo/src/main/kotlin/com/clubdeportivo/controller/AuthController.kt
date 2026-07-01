package com.clubdeportivo.controller

import com.clubdeportivo.dto.AuthResponse
import com.clubdeportivo.dto.LoginRequest
import com.clubdeportivo.service.AuthService
import jakarta.validation.Valid
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import reactor.core.publisher.Mono

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val authService: AuthService,
) {

    @PostMapping("/login")
    fun login(@Valid @RequestBody request: LoginRequest): Mono<AuthResponse> =
        authService.login(request)
}
