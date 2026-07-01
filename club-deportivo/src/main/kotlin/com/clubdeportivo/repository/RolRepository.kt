package com.clubdeportivo.repository

import com.clubdeportivo.entity.Rol
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Mono

@Repository
interface RolRepository : ReactiveCrudRepository<Rol, Long> {
    fun findByNombre(nombre: String): Mono<Rol>
}
