package com.clubdeportivo.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDateTime

@Table("inscripciones_actividades")
data class InscripcionActividad(
    @Id
    val id: Long? = null,

    @Column("usuario_id")
    val usuarioId: Long,

    @Column("actividad_id")
    val actividadId: Long,

    @Column("fecha_inscripcion")
    val fechaInscripcion: LocalDateTime? = null,
)
