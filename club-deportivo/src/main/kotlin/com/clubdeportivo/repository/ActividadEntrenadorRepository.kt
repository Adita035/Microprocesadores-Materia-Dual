package com.clubdeportivo.repository

import com.clubdeportivo.entity.ActividadEntrenador
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Repository
interface ActividadEntrenadorRepository : ReactiveCrudRepository<ActividadEntrenador, Long> {
    fun findByActividadId(actividadId: Long): Flux<ActividadEntrenador>
    fun findByEntrenadorId(entrenadorId: Long): Flux<ActividadEntrenador>
    fun existsByActividadIdAndEntrenadorId(actividadId: Long, entrenadorId: Long): Mono<Boolean>
}
