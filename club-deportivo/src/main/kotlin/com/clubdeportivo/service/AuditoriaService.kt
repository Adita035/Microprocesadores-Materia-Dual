package com.clubdeportivo.service

import com.clubdeportivo.entity.Auditoria
import com.clubdeportivo.repository.AuditoriaRepository
import com.clubdeportivo.repository.UsuarioRepository
import org.springframework.stereotype.Service
import reactor.core.publisher.Mono

@Service
class AuditoriaService(
    private val auditoriaRepository: AuditoriaRepository,
    private val usuarioRepository: UsuarioRepository,
) {
    fun registrarEliminacion(correoAdmin: String, tipo: String, detalle: String): Mono<Void> =
        usuarioRepository.findByCorreo(correoAdmin)
            .flatMap { usuarioId ->
                guardar(usuarioId.id, tipo, detalle)
            }
            .switchIfEmpty(guardar(null, tipo, detalle))
            .then()

    private fun guardar(usuarioId: Long?, tipo: String, detalle: String): Mono<Auditoria> =
        auditoriaRepository.save(
            Auditoria(
                usuarioId = usuarioId,
                accion = "ELIMINACION $tipo: ${detalle.take(170)}",
            ),
        )
}
