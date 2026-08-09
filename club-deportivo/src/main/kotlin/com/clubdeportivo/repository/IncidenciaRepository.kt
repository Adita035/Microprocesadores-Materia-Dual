package com.clubdeportivo.repository

import com.clubdeportivo.entity.Incidencia
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux

@Repository
interface IncidenciaRepository : ReactiveCrudRepository<Incidencia, Long> {
    fun findByUsuarioId(usuarioId: Long): Flux<Incidencia>
}
