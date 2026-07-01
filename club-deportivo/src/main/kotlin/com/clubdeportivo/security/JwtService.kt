package com.clubdeportivo.security

import com.clubdeportivo.entity.Rol
import com.clubdeportivo.entity.Usuario
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.stereotype.Service
import tools.jackson.databind.ObjectMapper
import java.nio.charset.StandardCharsets
import java.time.Instant
import java.util.Base64
import javax.crypto.Mac
import javax.crypto.spec.SecretKeySpec

@Service
class JwtService(
    private val properties: JwtProperties,
    private val objectMapper: ObjectMapper,
) {
    private val encoder: Base64.Encoder = Base64.getUrlEncoder().withoutPadding()
    private val decoder: Base64.Decoder = Base64.getUrlDecoder()

    fun generateToken(usuario: Usuario, rol: Rol): String {
        val now = Instant.now()
        val header = mapOf("alg" to "HS256", "typ" to "JWT")
        val payload = mapOf(
            "sub" to usuario.correo,
            "uid" to usuario.id,
            "rol" to rol.nombre,
            "iat" to now.epochSecond,
            "exp" to now.plusSeconds(properties.expirationMinutes * 60).epochSecond,
        )

        val headerPart = encodeJson(header)
        val payloadPart = encodeJson(payload)
        val signature = sign("$headerPart.$payloadPart")

        return "$headerPart.$payloadPart.$signature"
    }

    fun validateToken(token: String): JwtClaims? {
        val parts = token.split(".")
        if (parts.size != 3) return null

        val expectedSignature = sign("${parts[0]}.${parts[1]}")
        if (expectedSignature != parts[2]) return null

        val payload = runCatching {
            objectMapper.readValue(decoder.decode(parts[1]), Map::class.java)
        }.getOrNull() ?: return null

        val exp = (payload["exp"] as? Number)?.toLong() ?: return null
        if (Instant.now().epochSecond >= exp) return null

        val correo = payload["sub"] as? String ?: return null
        val rol = payload["rol"] as? String ?: return null
        val uid = (payload["uid"] as? Number)?.toLong() ?: return null

        return JwtClaims(usuarioId = uid, correo = correo, rol = rol)
    }

    fun toAuthentication(claims: JwtClaims): Authentication =
        UsernamePasswordAuthenticationToken(
            claims.correo,
            null,
            listOf(SimpleGrantedAuthority("ROLE_${claims.rol}")),
        )

    private fun encodeJson(value: Any): String =
        encoder.encodeToString(objectMapper.writeValueAsBytes(value))

    private fun sign(value: String): String {
        val key = SecretKeySpec(properties.secret.toByteArray(StandardCharsets.UTF_8), "HmacSHA256")
        val mac = Mac.getInstance("HmacSHA256")
        mac.init(key)
        return encoder.encodeToString(mac.doFinal(value.toByteArray(StandardCharsets.UTF_8)))
    }
}

data class JwtClaims(
    val usuarioId: Long,
    val correo: String,
    val rol: String,
)
