package com.clubdeportivo.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDate

@Table("usuario_membresia")
data class UsuarioMembresia(
    @Id
    val id: Long? = null,

    @Column("usuario_id")
    val usuarioId: Long,

    @Column("membresia_id")
    val membresiaId: Long,

    @Column("fecha_inicio")
    val fechaInicio: LocalDate? = null,

    @Column("fecha_fin")
    val fechaFin: LocalDate? = null,

    @Column("estado")
    val estado: String? = "ACTIVA",
)
