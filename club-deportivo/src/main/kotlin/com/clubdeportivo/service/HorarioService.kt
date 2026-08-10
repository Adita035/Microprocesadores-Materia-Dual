package com.clubdeportivo.service

import com.clubdeportivo.dto.HorarioResponse
import com.clubdeportivo.exception.NotFoundException
import com.clubdeportivo.mapper.toResponse
import com.clubdeportivo.repository.HorarioRepository
import com.clubdeportivo.repository.RolRepository
import com.clubdeportivo.repository.UsuarioRepository
import org.springframework.stereotype.Service
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Service
class HorarioService(
    private val horarioRepository: HorarioRepository,
    private val usuarioRepository: UsuarioRepository,
    private val rolRepository: RolRepository,
) {
    fun listarPropios(correo: String): Flux<HorarioResponse> =
        usuarioRepository.findByCorreo(correo)
            .switchIfEmpty(Mono.error(NotFoundException("Usuario no encontrado")))
            .flatMapMany { usuario -> horarioRepository.findByUsuarioId(requireNotNull(usuario.id) { "El usuario debe tener id" }) }
            .flatMap(::toResponse)

    private fun toResponse(horario: com.clubdeportivo.entity.Horario): Mono<HorarioResponse> =
        usuarioRepository.findById(horario.usuarioId)
            .switchIfEmpty(Mono.error(NotFoundException("Usuario del horario no encontrado")))
            .flatMap { usuario ->
                rolRepository.findById(usuario.rolId)
                    .map { rol -> usuario.toResponse(rol) }
            }
            .map { usuario ->
                HorarioResponse(
                    id = requireNotNull(horario.id) { "El horario debe tener id" },
                    usuario = usuario,
                    diaSemana = horario.diaSemana,
                    horaEntrada = horario.horaEntrada,
                    horaSalida = horario.horaSalida,
                )
            }
}
