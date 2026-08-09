package com.clubdeportivo.dto

import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import java.time.LocalDateTime

data class CrearMaterialRequest(
    @field:NotBlank
    val nombre: String,

    val descripcion: String? = null,

    @field:Min(0)
    val cantidadDisponible: Int = 0,
)

data class CrearSolicitudMaterialRequest(
    @field:NotNull
    val materialId: Long,

    @field:Min(1)
    val cantidad: Int,
)

data class ActualizarEstadoSolicitudMaterialRequest(
    @field:NotBlank
    val estado: String,
)

data class MaterialResponse(
    val id: Long,
    val nombre: String,
    val descripcion: String?,
    val cantidadDisponible: Int,
)

data class SolicitudMaterialResponse(
    val id: Long,
    val entrenadorId: Long,
    val entrenador: String,
    val entrenadorCorreo: String,
    val material: MaterialResponse,
    val cantidad: Int,
    val estado: String,
    val fechaSolicitud: LocalDateTime?,
)
