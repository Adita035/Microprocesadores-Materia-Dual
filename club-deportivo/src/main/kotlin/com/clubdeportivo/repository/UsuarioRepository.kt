package com.clubdeportivo.repository

import com.clubdeportivo.entity.Usuario
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository
import reactor.core.publisher.Mono

@Repository
interface UsuarioRepository : ReactiveCrudRepository<Usuario, Long> {
    fun findByCorreo(correo: String): Mono<Usuario>
    fun existsByCorreo(correo: String): Mono<Boolean>
    fun existsByRolId(rolId: Long): Mono<Boolean>
}
