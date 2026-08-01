package com.clubdeportivo.dto

import jakarta.validation.constraints.Min
import jakarta.validation.constraints.NotBlank
import java.math.BigDecimal
import java.time.LocalDate

data class CrearMembresiaRequest(
    @field:NotBlank
    val nombre: String,

    val descripcion: String? = null,

    @field:Min(0)
    val precio: BigDecimal? = null,

    @field:Min(1)
    val duracionDias: Int? = null,

    val activa: Boolean = true,
)

data class SeleccionarMembresiaRequest(
    val membresiaId: Long,
)

data class ActualizarEstadoMembresiaRequest(
    val activa: Boolean,
)

data class MembresiaResponse(
    val id: Long,
    val nombre: String,
    val descripcion: String?,
    val precio: BigDecimal?,
    val duracionDias: Int?,
    val activa: Boolean,
)

data class UsuarioMembresiaResponse(
    val id: Long,
    val usuarioId: Long,
    val membresia: MembresiaResponse,
    val fechaInicio: LocalDate?,
    val fechaFin: LocalDate?,
    val estado: String?,
)

data class SeleccionMembresiaResponse(
    val mensaje: String,
    val usuarioMembresia: UsuarioMembresiaResponse,
)
