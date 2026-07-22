package com.clubdeportivo.mapper

import com.clubdeportivo.dto.EntrenadorResponse
import com.clubdeportivo.dto.UsuarioResponse
import com.clubdeportivo.entity.Entrenador

fun Entrenador.toResponse(usuario: UsuarioResponse): EntrenadorResponse =
    EntrenadorResponse(
        id = requireNotNull(id) { "El entrenador debe tener id para exponerse en la API" },
        usuario = usuario,
        especialidad = especialidad,
    )
