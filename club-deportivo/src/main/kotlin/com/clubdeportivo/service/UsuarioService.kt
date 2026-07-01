package com.clubdeportivo.service

import com.clubdeportivo.dto.CrearAdminRequest
import com.clubdeportivo.dto.UsuarioResponse
import com.clubdeportivo.entity.Rol
import com.clubdeportivo.entity.Usuario
import com.clubdeportivo.exception.ConflictException
import com.clubdeportivo.mapper.toResponse
import com.clubdeportivo.repository.RolRepository
import com.clubdeportivo.repository.UsuarioRepository
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Service
class UsuarioService(
    private val usuarioRepository: UsuarioRepository,
    private val rolRepository: RolRepository,
    private val passwordEncoder: PasswordEncoder,
) {

    fun listar(): Flux<UsuarioResponse> =
        usuarioRepository.findAll()
            .flatMap { usuario ->
                rolRepository.findById(usuario.rolId)
                    .map { rol -> usuario.toResponse(rol) }
            }

    fun crearAdministrador(request: CrearAdminRequest): Mono<UsuarioResponse> =
        usuarioRepository.existsByCorreo(request.correo)
            .flatMap { existe ->
                if (existe) {
                    Mono.error(ConflictException("Ya existe un usuario con ese correo"))
                } else {
                    obtenerRolAdmin()
                        .flatMap { rol ->
                            val usuario = Usuario(
                                nombre = request.nombre,
                                apellido = request.apellido,
                                correo = request.correo,
                                password = requireNotNull(passwordEncoder.encode(request.password)) {
                                    "No se pudo encriptar la contrasena"
                                },
                                telefono = request.telefono,
                                rolId = requireNotNull(rol.id) { "El rol ADMIN debe tener id" },
                                activo = true,
                            )

                            usuarioRepository.save(usuario)
                                .map { creado -> creado.toResponse(rol) }
                        }
                }
            }

    private fun obtenerRolAdmin(): Mono<Rol> =
        rolRepository.findByNombre("ADMINISTRADOR")
            .switchIfEmpty(rolRepository.save(Rol(nombre = "ADMINISTRADOR")))
}
