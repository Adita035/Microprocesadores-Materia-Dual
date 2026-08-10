package com.clubdeportivo.repository

import com.clubdeportivo.entity.SolicitudInstalacion
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux

@Repository
interface SolicitudInstalacionRepository : ReactiveCrudRepository<SolicitudInstalacion, Long> {
    fun findByEntrenadorId(entrenadorId: Long): Flux<SolicitudInstalacion>
    fun findByInstalacionId(instalacionId: Long): Flux<SolicitudInstalacion>
}
