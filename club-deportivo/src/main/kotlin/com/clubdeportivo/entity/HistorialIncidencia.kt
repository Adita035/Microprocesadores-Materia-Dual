package com.clubdeportivo.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDateTime

@Table("historial_incidencias")
data class HistorialIncidencia(
    @Id
    val id: Long? = null,

    @Column("incidencia_id")
    val incidenciaId: Long,

    @Column("comentario")
    val comentario: String? = null,

    @Column("fecha")
    val fecha: LocalDateTime? = null,
)
