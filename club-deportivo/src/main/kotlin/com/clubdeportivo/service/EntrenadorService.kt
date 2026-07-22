package com.clubdeportivo.service

import com.clubdeportivo.dto.ActualizarEntrenadorRequest
import com.clubdeportivo.dto.CrearEntrenadorRequest
import com.clubdeportivo.dto.EntrenadorResponse
import com.clubdeportivo.entity.Entrenador
import com.clubdeportivo.entity.Usuario
import com.clubdeportivo.exception.BadRequestException
import com.clubdeportivo.exception.ConflictException
import com.clubdeportivo.exception.NotFoundException
import com.clubdeportivo.mapper.toResponse
import com.clubdeportivo.repository.EntrenadorRepository
import com.clubdeportivo.repository.RolRepository
import com.clubdeportivo.repository.UsuarioRepository
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Service
class EntrenadorService(
    private val entrenadorRepository: EntrenadorRepository,
    private val usuarioRepository: UsuarioRepository,
    private val rolRepository: RolRepository,
) {

    fun crear(request: CrearEntrenadorRequest): Mono<EntrenadorResponse> =
        entrenadorRepository.existsByUsuarioId(request.usuarioId)
            .flatMap { existe ->
                if (existe) {
                    Mono.error(ConflictException("Ese usuario ya tiene ficha de entrenador"))
                } else {
                    obtenerUsuarioEntrenador(request.usuarioId)
                        .flatMap { usuario ->
                            val entrenador = Entrenador(
                                usuarioId = requireNotNull(usuario.id) { "El usuario debe tener id" },
                                especialidad = request.especialidad,
                            )

                            entrenadorRepository.save(entrenador)
                                .flatMap(::toResponse)
                        }
                }
            }

    fun listar(): Flux<EntrenadorResponse> =
        entrenadorRepository.findAll()
            .flatMap(::toResponse)

    fun buscarPorId(id: Long): Mono<EntrenadorResponse> =
        entrenadorRepository.findById(id)
            .switchIfEmpty(Mono.error(NotFoundException("Entrenador no encontrado")))
            .flatMap(::toResponse)

    fun actualizar(id: Long, request: ActualizarEntrenadorRequest): Mono<EntrenadorResponse> =
        entrenadorRepository.findById(id)
            .switchIfEmpty(Mono.error(NotFoundException("Entrenador no encontrado")))
            .flatMap { entrenador ->
                entrenadorRepository.save(
                    entrenador.copy(
                        especialidad = request.especialidad,
                    ),
                )
            }
            .flatMap(::toResponse)

    private fun obtenerUsuarioEntrenador(usuarioId: Long): Mono<Usuario> =
        usuarioRepository.findById(usuarioId)
            .switchIfEmpty(Mono.error(NotFoundException("Usuario no encontrado")))
            .flatMap { usuario ->
                rolRepository.findById(usuario.rolId)
                    .switchIfEmpty(Mono.error(BadRequestException("El usuario no tiene rol valido")))
                    .flatMap { rol ->
                        if (rol.nombre == "ENTRENADOR") {
                            Mono.just(usuario)
                        } else {
                            Mono.error(BadRequestException("El usuario debe tener rol ENTRENADOR"))
                        }
                    }
            }

    private fun toResponse(entrenador: Entrenador): Mono<EntrenadorResponse> =
        usuarioRepository.findById(entrenador.usuarioId)
            .switchIfEmpty(Mono.error(NotFoundException("Usuario del entrenador no encontrado")))
            .flatMap { usuario ->
                rolRepository.findById(usuario.rolId)
                    .map { rol -> usuario.toResponse(rol) }
            }
            .map { usuarioResponse -> entrenador.toResponse(usuarioResponse) }
}
