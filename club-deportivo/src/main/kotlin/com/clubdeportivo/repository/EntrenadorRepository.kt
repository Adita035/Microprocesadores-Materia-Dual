package com.clubdeportivo.repository

import com.clubdeportivo.entity.Entrenador
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Mono

@Repository
interface EntrenadorRepository : ReactiveCrudRepository<Entrenador, Long> {
    fun findByUsuarioId(usuarioId: Long): Mono<Entrenador>
    fun existsByUsuarioId(usuarioId: Long): Mono<Boolean>
}
