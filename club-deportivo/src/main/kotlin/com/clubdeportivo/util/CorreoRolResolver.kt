package com.clubdeportivo.util

import com.clubdeportivo.exception.BadRequestException

object CorreoRolResolver {
    private val dominioPorRol = mapOf(
        "USUARIO" to "userclub.com",
        "TRABAJADOR" to "workerclub.com",
        "ENTRENADOR" to "coachclub.com",
        "ADMINISTRADOR" to "adminclub.com",
        "SOPORTE_TECNICO" to "soporterclub.com",
    )

    fun resolverRol(correo: String): String {
        val dominio = correo.substringAfter("@", missingDelimiterValue = "").lowercase()
        return dominioPorRol.entries.firstOrNull { (_, permitido) -> dominio == permitido }?.key
            ?: throw BadRequestException(
                "Dominio de correo no permitido. Usa: ${dominioPorRol.values.joinToString(", ")}",
            )
    }

    fun validarRol(correo: String, rol: String) {
        val rolPorCorreo = resolverRol(correo)
        if (rolPorCorreo != rol) {
            throw BadRequestException("El correo pertenece al rol $rolPorCorreo y no a $rol")
        }
    }
}
