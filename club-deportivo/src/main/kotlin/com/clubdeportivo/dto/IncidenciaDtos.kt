package com.clubdeportivo.dto

import jakarta.validation.constraints.NotBlank
import java.time.LocalDateTime

data class CrearIncidenciaRequest(
    @field:NotBlank
    val titulo: String,

    @field:NotBlank
    val descripcion: String,
)

data class ActualizarEstadoIncidenciaRequest(
    @field:NotBlank
    val estado: String,
)

data class AgregarComentarioIncidenciaRequest(
    @field:NotBlank
    val comentario: String,
)

data class HistorialIncidenciaResponse(
    val id: Long,
    val comentario: String?,
    val fecha: LocalDateTime?,
)

data class IncidenciaResponse(
    val id: Long,
    val usuario: UsuarioResponse,
    val titulo: String?,
    val descripcion: String?,
    val estado: String,
    val fechaReporte: LocalDateTime?,
    val historial: List<HistorialIncidenciaResponse>,
)
