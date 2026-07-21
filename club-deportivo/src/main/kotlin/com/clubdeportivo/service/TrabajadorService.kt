package com.clubdeportivo.service

import com.clubdeportivo.dto.ActualizarTrabajadorRequest
import com.clubdeportivo.dto.CrearTrabajadorRequest
import com.clubdeportivo.dto.TrabajadorResponse
import com.clubdeportivo.entity.Trabajador
import com.clubdeportivo.entity.Usuario
import com.clubdeportivo.exception.BadRequestException
import com.clubdeportivo.exception.ConflictException
import com.clubdeportivo.exception.NotFoundException
import com.clubdeportivo.mapper.toResponse
import com.clubdeportivo.repository.RolRepository
import com.clubdeportivo.repository.TrabajadorRepository
import com.clubdeportivo.repository.UsuarioRepository
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Service
class TrabajadorService(
    private val trabajadorRepository: TrabajadorRepository,
    private val usuarioRepository: UsuarioRepository,
    private val rolRepository: RolRepository,
) {

    fun crear(request: CrearTrabajadorRequest): Mono<TrabajadorResponse> =
        trabajadorRepository.existsByUsuarioId(request.usuarioId)
            .flatMap { existe ->
                if (existe) {
                    Mono.error(ConflictException("Ese usuario ya tiene ficha de trabajador"))
                } else {
                    obtenerUsuarioTrabajador(request.usuarioId)
                        .flatMap { usuario ->
                            val trabajador = Trabajador(
                                usuarioId = requireNotNull(usuario.id) { "El usuario debe tener id" },
                                puesto = request.puesto,
                                salario = request.salario,
                                fechaContratacion = request.fechaContratacion,
                                activo = true,
                            )

                            trabajadorRepository.save(trabajador)
                                .flatMap(::toResponse)
                        }
                }
            }

    fun listar(): Flux<TrabajadorResponse> =
        trabajadorRepository.findAll()
            .flatMap(::toResponse)

    fun buscarPorId(id: Long): Mono<TrabajadorResponse> =
        trabajadorRepository.findById(id)
            .switchIfEmpty(Mono.error(NotFoundException("Trabajador no encontrado")))
            .flatMap(::toResponse)

    fun actualizar(id: Long, request: ActualizarTrabajadorRequest): Mono<TrabajadorResponse> =
        trabajadorRepository.findById(id)
            .switchIfEmpty(Mono.error(NotFoundException("Trabajador no encontrado")))
            .flatMap { trabajador ->
                trabajadorRepository.save(
                    trabajador.copy(
                        puesto = request.puesto,
                        salario = request.salario,
                        fechaContratacion = request.fechaContratacion,
                        activo = request.activo,
                    ),
                )
            }
            .flatMap(::toResponse)

    fun desactivar(id: Long): Mono<TrabajadorResponse> =
        trabajadorRepository.findById(id)
            .switchIfEmpty(Mono.error(NotFoundException("Trabajador no encontrado")))
            .flatMap { trabajador ->
                trabajadorRepository.save(trabajador.copy(activo = false))
            }
            .flatMap(::toResponse)

    private fun obtenerUsuarioTrabajador(usuarioId: Long): Mono<Usuario> =
        usuarioRepository.findById(usuarioId)
            .switchIfEmpty(Mono.error(NotFoundException("Usuario no encontrado")))
            .flatMap { usuario ->
                rolRepository.findById(usuario.rolId)
                    .switchIfEmpty(Mono.error(BadRequestException("El usuario no tiene rol valido")))
                    .flatMap { rol ->
                        if (rol.nombre == "TRABAJADOR") {
                            Mono.just(usuario)
                        } else {
                            Mono.error(BadRequestException("El usuario debe tener rol TRABAJADOR"))
                        }
                    }
            }

    private fun toResponse(trabajador: Trabajador): Mono<TrabajadorResponse> =
        usuarioRepository.findById(trabajador.usuarioId)
            .switchIfEmpty(Mono.error(NotFoundException("Usuario del trabajador no encontrado")))
            .flatMap { usuario ->
                rolRepository.findById(usuario.rolId)
                    .map { rol -> usuario.toResponse(rol) }
            }
            .map { usuarioResponse -> trabajador.toResponse(usuarioResponse) }
}
