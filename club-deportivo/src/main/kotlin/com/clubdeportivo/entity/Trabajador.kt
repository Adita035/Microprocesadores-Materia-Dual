package com.clubdeportivo.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table
import java.math.BigDecimal
import java.time.LocalDate

@Table("trabajadores")
data class Trabajador(
    @Id
    val id: Long? = null,

    @Column("usuario_id")
    val usuarioId: Long,

    @Column("puesto")
    val puesto: String,

    @Column("salario")
    val salario: BigDecimal? = null,

    @Column("fecha_contratacion")
    val fechaContratacion: LocalDate? = null,

    @Column("activo")
    val activo: Boolean = true,
)
