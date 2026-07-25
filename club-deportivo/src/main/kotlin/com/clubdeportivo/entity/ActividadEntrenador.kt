package com.clubdeportivo.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table

@Table("actividad_entrenador")
data class ActividadEntrenador(
    @Id
    val id: Long? = null,

    @Column("actividad_id")
    val actividadId: Long,

    @Column("entrenador_id")
    val entrenadorId: Long,
)
