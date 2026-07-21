package com.clubdeportivo.repository

import com.clubdeportivo.entity.Trabajador
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Mono

@Repository
interface TrabajadorRepository : ReactiveCrudRepository<Trabajador, Long> {
    fun findByUsuarioId(usuarioId: Long): Mono<Trabajador>
    fun existsByUsuarioId(usuarioId: Long): Mono<Boolean>
}
