package com.clubdeportivo.repository

import com.clubdeportivo.entity.HistorialIncidencia
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux

@Repository
interface HistorialIncidenciaRepository : ReactiveCrudRepository<HistorialIncidencia, Long> {
    fun findByIncidenciaId(incidenciaId: Long): Flux<HistorialIncidencia>
}
