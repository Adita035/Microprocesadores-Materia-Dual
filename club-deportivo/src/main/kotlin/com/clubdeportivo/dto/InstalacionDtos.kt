package com.clubdeportivo.dto

import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank

data class CrearInstalacionRequest(
    @field:NotBlank
    val nombre: String,

    val descripcion: String? = null,

    @field:Min(1)
    val capacidad: Int? = null,

    val disponible: Boolean = true,
)

data class ActualizarDisponibilidadInstalacionRequest(
    val disponible: Boolean,
)

data class InstalacionResponse(
    val id: Long,
    val nombre: String,
    val descripcion: String?,
    val capacidad: Int?,
    val disponible: Boolean,
)
