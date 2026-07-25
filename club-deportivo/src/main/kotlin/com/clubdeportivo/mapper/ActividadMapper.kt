package com.clubdeportivo.mapper

import com.clubdeportivo.dto.ActividadResponse
import com.clubdeportivo.dto.EntrenadorResponse
import com.clubdeportivo.entity.Actividad

fun Actividad.toResponse(entrenadores: List<EntrenadorResponse>): ActividadResponse =
    ActividadResponse(
        id = requireNotNull(id) { "La actividad debe tener id para exponerse en la API" },
        nombre = nombre,
        descripcion = descripcion,
        fecha = fecha,
        horaInicio = horaInicio,
        horaFin = horaFin,
        estado = estado,
        entrenadores = entrenadores,
    )
