package com.clubdeportivo.repository

import com.clubdeportivo.entity.Horario
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux

@Repository
interface HorarioRepository : ReactiveCrudRepository<Horario, Long> {
    fun findByUsuarioId(usuarioId: Long): Flux<Horario>
}
