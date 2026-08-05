package com.clubdeportivo.repository

import com.clubdeportivo.entity.Instalacion
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux

@Repository
interface InstalacionRepository : ReactiveCrudRepository<Instalacion, Long> {
    fun findByDisponibleTrue(): Flux<Instalacion>
}
