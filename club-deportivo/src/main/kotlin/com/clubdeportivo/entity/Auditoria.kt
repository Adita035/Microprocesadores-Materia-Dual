package com.clubdeportivo.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDateTime

@Table("auditoria")
data class Auditoria(
    @Id
    val id: Long? = null,

    @Column("usuario_id")
    val usuarioId: Long? = null,

    @Column("accion")
    val accion: String,

    @Column("fecha")
    val fecha: LocalDateTime? = null,
)
