package com.clubdeportivo.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDateTime

@Table("incidencias")
data class Incidencia(
    @Id
    val id: Long? = null,

    @Column("usuario_id")
    val usuarioId: Long,

    @Column("titulo")
    val titulo: String? = null,

    @Column("descripcion")
    val descripcion: String? = null,

    @Column("estado")
    val estado: String = "PENDIENTE",

    @Column("fecha_reporte")
    val fechaReporte: LocalDateTime? = null,
)
