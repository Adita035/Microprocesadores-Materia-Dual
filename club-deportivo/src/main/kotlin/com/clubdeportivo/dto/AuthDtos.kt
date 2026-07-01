package com.clubdeportivo.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class LoginRequest(
    @field:Email
    @field:NotBlank
    val correo: String,

    @field:NotBlank
    val password: String,
)

data class AuthResponse(
    val token: String,
    val tipo: String = "Bearer",
    val usuario: UsuarioResponse,
)

data class CrearAdminRequest(
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
)

data class CrearUsuarioRequest(
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

    @field:NotBlank
    val rol: String,
)

data class UsuarioResponse(
    val id: Long,
    val nombre: String,
    val apellido: String,
    val correo: String,
    val telefono: String?,
    val rol: String,
)
