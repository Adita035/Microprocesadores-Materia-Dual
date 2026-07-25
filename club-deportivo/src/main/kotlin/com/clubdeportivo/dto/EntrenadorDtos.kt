package com.clubdeportivo.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size

data class CrearEntrenadorRequest(
    @field:NotNull
    val usuarioId: Long,

    val especialidad: String? = null,
)

data class RegistrarEntrenadorRequest(
    @field:NotBlank
    val nombre: String,

    @field:NotBlank
    val apellido: String,

    @field:Email
    @field:NotBlank
    val correo: String,

    val telefono: String? = null,

    @field:NotBlank
    @field:Size(min = 6)
    val password: String,

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
