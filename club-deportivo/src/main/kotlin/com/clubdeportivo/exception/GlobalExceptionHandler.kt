package com.clubdeportivo.exception

import org.slf4j.LoggerFactory
import org.springframework.dao.DataAccessException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.support.WebExchangeBindException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class GlobalExceptionHandler {
    private val logger = LoggerFactory.getLogger(GlobalExceptionHandler::class.java)

    @ExceptionHandler(AuthException::class)
    fun handleAuthException(exception: AuthException): ResponseEntity<ApiError> =
        ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(ApiError(exception.message ?: "Credenciales invalidas"))

    @ExceptionHandler(ConflictException::class)
    fun handleConflictException(exception: ConflictException): ResponseEntity<ApiError> =
        ResponseEntity.status(HttpStatus.CONFLICT)
            .body(ApiError(exception.message ?: "El recurso ya existe"))

    @ExceptionHandler(WebExchangeBindException::class)
    fun handleValidationException(exception: WebExchangeBindException): ResponseEntity<ApiError> =
        ResponseEntity.badRequest()
            .body(ApiError(exception.fieldErrors.firstOrNull()?.defaultMessage ?: "Solicitud invalida"))

    @ExceptionHandler(DataAccessException::class)
    fun handleDataAccessException(exception: DataAccessException): ResponseEntity<ApiError> {
        logger.error("Error de base de datos", exception)
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiError("Error de base de datos: ${exception.mostSpecificCause.message}"))
    }

    @ExceptionHandler(Exception::class)
    fun handleException(exception: Exception): ResponseEntity<ApiError> {
        logger.error("Error no controlado", exception)
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiError("Error interno: ${exception.message ?: exception.javaClass.simpleName}"))
    }
}

data class ApiError(
    val mensaje: String,
)
