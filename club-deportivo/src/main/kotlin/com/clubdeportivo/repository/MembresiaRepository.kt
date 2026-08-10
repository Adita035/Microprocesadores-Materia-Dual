package com.clubdeportivo.repository

import com.clubdeportivo.entity.Membresia
import org.springframework.data.r2dbc.repository.Query
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Repository
interface MembresiaRepository : ReactiveCrudRepository<Membresia, Long> {
    @Query("SELECT * FROM membresias WHERE activa = TRUE")
    fun findByActivaTrue(): Flux<Membresia>

    fun findByNombre(nombre: String): Mono<Membresia>
}
