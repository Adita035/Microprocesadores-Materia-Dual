package com.clubdeportivo.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import java.math.BigDecimal
import java.time.LocalDate

data class CrearTrabajadorRequest(
    @field:NotNull
    val usuarioId: Long,

    @field:NotBlank
    val puesto: String,

    @field:Positive
    val salario: BigDecimal? = null,

    val fechaContratacion: LocalDate? = null,
)

data class ActualizarTrabajadorRequest(
    @field:NotBlank
    val puesto: String,

    @field:Positive
    val salario: BigDecimal? = null,

    val fechaContratacion: LocalDate? = null,

    val activo: Boolean = true,
)

data class TrabajadorResponse(
    val id: Long,
    val usuario: UsuarioResponse,
    val puesto: String,
    val salario: BigDecimal?,
    val fechaContratacion: LocalDate?,
    val activo: Boolean,
)
