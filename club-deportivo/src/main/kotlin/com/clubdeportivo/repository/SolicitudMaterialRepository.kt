package com.clubdeportivo.repository

import com.clubdeportivo.entity.SolicitudMaterial
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux

@Repository
interface SolicitudMaterialRepository : ReactiveCrudRepository<SolicitudMaterial, Long> {
    fun findByEntrenadorId(entrenadorId: Long): Flux<SolicitudMaterial>
}
