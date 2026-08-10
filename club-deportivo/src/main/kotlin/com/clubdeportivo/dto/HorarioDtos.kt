package com.clubdeportivo.dto

import java.time.LocalTime

data class HorarioResponse(
    val id: Long,
    val usuario: UsuarioResponse,
    val diaSemana: String?,
    val horaEntrada: LocalTime?,
    val horaSalida: LocalTime?,
)
