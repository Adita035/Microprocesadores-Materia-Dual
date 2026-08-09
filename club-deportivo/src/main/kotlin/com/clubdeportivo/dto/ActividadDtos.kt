package com.clubdeportivo.dto

import jakarta.validation.constraints.NotBlank
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.LocalTime

data class CrearActividadRequest(
    @field:NotBlank
    val nombre: String,

    val descripcion: String? = null,
    val fecha: LocalDate? = null,
    val horaInicio: LocalTime? = null,
    val horaFin: LocalTime? = null,
    val estado: String? = "PENDIENTE",
)

data class ActualizarActividadRequest(
    @field:NotBlank
    val nombre: String,

    val descripcion: String? = null,
    val fecha: LocalDate? = null,
    val horaInicio: LocalTime? = null,
    val horaFin: LocalTime? = null,
    val estado: String? = "PENDIENTE",
)

data class ActualizarEstadoActividadRequest(
    @field:NotBlank
    val estado: String,
)

data class AsignarEntrenadorRequest(
    val entrenadorId: Long,
)

data class ActividadResponse(
    val id: Long,
    val nombre: String,
    val descripcion: String?,
    val fecha: LocalDate?,
    val horaInicio: LocalTime?,
    val horaFin: LocalTime?,
    val estado: String?,
    val entrenadores: List<EntrenadorResponse>,
)

data class InscripcionActividadResponse(
    val mensaje: String,
    val actividad: ActividadResponse,
)

data class AlumnoActividadResponse(
    val usuario: UsuarioResponse,
    val fechaInscripcion: LocalDateTime?,
)
