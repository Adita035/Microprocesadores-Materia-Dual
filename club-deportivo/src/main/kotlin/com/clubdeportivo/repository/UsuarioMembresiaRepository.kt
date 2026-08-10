package com.clubdeportivo.repository

import com.clubdeportivo.entity.UsuarioMembresia
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono

@Repository
interface UsuarioMembresiaRepository : ReactiveCrudRepository<UsuarioMembresia, Long> {
    fun findByUsuarioId(usuarioId: Long): Flux<UsuarioMembresia>
    fun findByMembresiaId(membresiaId: Long): Flux<UsuarioMembresia>
    fun findFirstByUsuarioIdAndEstado(usuarioId: Long, estado: String): Mono<UsuarioMembresia>
}
