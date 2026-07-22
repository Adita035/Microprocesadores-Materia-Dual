package com.clubdeportivo.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table

@Table("entrenadores")
data class Entrenador(
    @Id
    val id: Long? = null,

    @Column("usuario_id")
    val usuarioId: Long,

    @Column("especialidad")
    val especialidad: String? = null,
)
