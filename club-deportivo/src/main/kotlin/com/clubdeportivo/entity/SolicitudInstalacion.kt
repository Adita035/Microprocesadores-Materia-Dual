package com.clubdeportivo.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDateTime

@Table("solicitudes_instalacion")
data class SolicitudInstalacion(
    @Id
    val id: Long? = null,

    @Column("entrenador_id")
    val entrenadorId: Long,

    @Column("instalacion_id")
    val instalacionId: Long,

    @Column("fecha_solicitud")
    val fechaSolicitud: LocalDateTime? = null,

    @Column("estado")
    val estado: String? = null,
)
