package com.clubdeportivo.service

import com.clubdeportivo.dto.AuthResponse
import com.clubdeportivo.dto.LoginRequest
import com.clubdeportivo.exception.AuthException
import com.clubdeportivo.mapper.toResponse
import com.clubdeportivo.repository.RolRepository
import com.clubdeportivo.repository.UsuarioRepository
import com.clubdeportivo.security.JwtService
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class AuthService(
    private val usuarioRepository: UsuarioRepository,
    private val rolRepository: RolRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService,
) {

    fun login(request: LoginRequest): Mono<AuthResponse> =
        usuarioRepository.findByCorreo(request.correo)
            .switchIfEmpty(Mono.error(AuthException("Credenciales invalidas")))
            .flatMap { usuario ->
                if (!usuario.activo || !passwordEncoder.matches(request.password, usuario.password)) {
                    Mono.error(AuthException("Credenciales invalidas"))
                } else {
                    rolRepository.findById(usuario.rolId)
                        .map { rol ->
                            AuthResponse(
                                token = jwtService.generateToken(usuario, rol),
                                usuario = usuario.toResponse(rol),
                            )
                        }
                }
            }
}
