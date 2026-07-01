package com.clubdeportivo.mapper

import com.clubdeportivo.dto.UsuarioResponse
import com.clubdeportivo.entity.Rol
import com.clubdeportivo.entity.Usuario

fun Usuario.toResponse(rol: Rol): UsuarioResponse =
    UsuarioResponse(
        id = requireNotNull(id) { "El usuario debe tener id para exponerse en la API" },
        nombre = nombre,
        apellido = apellido,
        correo = correo,
        telefono = telefono,
        rol = rol.nombre,
    )
