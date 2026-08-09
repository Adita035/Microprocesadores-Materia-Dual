package com.clubdeportivo.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDateTime

@Table("solicitudes_materiales")
data class SolicitudMaterial(
    @Id
    val id: Long? = null,

    @Column("entrenador_id")
    val entrenadorId: Long,

    @Column("material_id")
    val materialId: Long,

    @Column("cantidad")
    val cantidad: Int,

    @Column("estado")
    val estado: String = "PENDIENTE",

    @Column("fecha_solicitud")
    val fechaSolicitud: LocalDateTime? = null,
)
