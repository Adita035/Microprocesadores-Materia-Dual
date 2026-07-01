package com.clubdeportivo.security

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "app.jwt")
data class JwtProperties(
    val secret: String = "cambia-este-secreto-en-produccion-con-minimo-32-caracteres",
    val expirationMinutes: Long = 120,
)
