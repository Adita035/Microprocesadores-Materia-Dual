package com.clubdeportivo.repository

import com.clubdeportivo.entity.InscripcionActividad
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Repository
interface InscripcionActividadRepository : ReactiveCrudRepository<InscripcionActividad, Long> {
    fun findByUsuarioId(usuarioId: Long): Flux<InscripcionActividad>
    fun findByActividadId(actividadId: Long): Flux<InscripcionActividad>
    fun findByUsuarioIdAndActividadId(usuarioId: Long, actividadId: Long): Mono<InscripcionActividad>
    fun existsByUsuarioIdAndActividadId(usuarioId: Long, actividadId: Long): Mono<Boolean>
}
