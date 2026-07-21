package com.clubdeportivo.mapper

import com.clubdeportivo.dto.TrabajadorResponse
import com.clubdeportivo.dto.UsuarioResponse
import com.clubdeportivo.entity.Trabajador

fun Trabajador.toResponse(usuario: UsuarioResponse): TrabajadorResponse =
    TrabajadorResponse(
        id = requireNotNull(id) { "El trabajador debe tener id para exponerse en la API" },
        usuario = usuario,
        puesto = puesto,
        salario = salario,
        fechaContratacion = fechaContratacion,
        activo = activo,
    )
