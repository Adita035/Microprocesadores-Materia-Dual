package com.clubdeportivo.dto

import jakarta.validation.constraints.NotNull

data class CrearEntrenadorRequest(
    @field:NotNull
    val usuarioId: Long,

    val especialidad: String? = null,
)

data class ActualizarEntrenadorRequest(
    val especialidad: String? = null,
)

data class EntrenadorResponse(
    val id: Long,
    val usuario: UsuarioResponse,
    val especialidad: String?,
)
