package com.clubdeportivo.service

import com.clubdeportivo.dto.CrearAdminRequest
import com.clubdeportivo.dto.CrearUsuarioRequest
import com.clubdeportivo.dto.UsuarioResponse
import com.clubdeportivo.entity.Rol
import com.clubdeportivo.entity.Usuario
import com.clubdeportivo.exception.BadRequestException
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
    private val rolesPermitidos = setOf(
        "USUARIO",
        "TRABAJADOR",
        "ENTRENADOR",
        "ADMINISTRADOR",
        "SOPORTE_TECNICO",
    )

    fun listar(): Flux<UsuarioResponse> =
        usuarioRepository.findAll()
            .flatMap { usuario ->
                rolRepository.findById(usuario.rolId)
                    .map { rol -> usuario.toResponse(rol) }
            }

    fun crearAdministrador(request: CrearAdminRequest): Mono<UsuarioResponse> =
        obtenerRol("ADMINISTRADOR")
            .flatMap { rol ->
                usuarioRepository.existsByRolId(requireNotNull(rol.id) { "El rol ADMINISTRADOR debe tener id" })
                    .flatMap { existeAdmin ->
                        if (existeAdmin) {
                            Mono.error(ConflictException("Ya existe un administrador inicial"))
                        } else {
                            crearUsuarioConRol(
                                nombre = request.nombre,
                                apellido = request.apellido,
                                correo = request.correo,
                                telefono = request.telefono,
                                password = request.password,
                                rol = rol,
                            )
                        }
                    }
            }

    fun crearUsuario(request: CrearUsuarioRequest): Mono<UsuarioResponse> =
        obtenerRolPermitido(request.rol)
            .flatMap { rol ->
                crearUsuarioConRol(
                    nombre = request.nombre,
                    apellido = request.apellido,
                    correo = request.correo,
                    telefono = request.telefono,
                    password = request.password,
                    rol = rol,
                )
            }

    private fun crearUsuarioConRol(
        nombre: String,
        apellido: String,
        correo: String,
        telefono: String?,
        password: String,
        rol: Rol,
    ): Mono<UsuarioResponse> =
        usuarioRepository.existsByCorreo(correo)
            .flatMap { existe ->
                if (existe) {
                    Mono.error(ConflictException("Ya existe un usuario con ese correo"))
                } else {
                    val usuario = Usuario(
                        nombre = nombre,
                        apellido = apellido,
                        correo = correo,
                        password = requireNotNull(passwordEncoder.encode(password)) {
                            "No se pudo encriptar la contrasena"
                        },
                        telefono = telefono,
                        rolId = requireNotNull(rol.id) { "El rol debe tener id" },
                        activo = true,
                    )

                    usuarioRepository.save(usuario)
                        .map { creado -> creado.toResponse(rol) }
                }
            }

    private fun obtenerRol(nombre: String): Mono<Rol> =
        rolRepository.findByNombre(nombre)
            .switchIfEmpty(rolRepository.save(Rol(nombre = nombre)))

    private fun obtenerRolPermitido(nombre: String): Mono<Rol> {
        val rolNormalizado = nombre.trim().uppercase()
        if (rolNormalizado !in rolesPermitidos) {
            return Mono.error(BadRequestException("Rol no permitido: $nombre"))
        }

        return rolRepository.findByNombre(rolNormalizado)
            .switchIfEmpty(Mono.error(BadRequestException("El rol $rolNormalizado no existe en la base de datos")))
    }
}
