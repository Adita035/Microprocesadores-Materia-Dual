package com.clubdeportivo.repository

import com.clubdeportivo.entity.Actividad
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Mono

@Repository
interface ActividadRepository : ReactiveCrudRepository<Actividad, Long> {
    fun findByNombre(nombre: String): Mono<Actividad>
}
