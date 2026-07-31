package com.clubdeportivo.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table
import java.math.BigDecimal

@Table("membresias")
data class Membresia(
    @Id
    val id: Long? = null,

    @Column("nombre")
    val nombre: String,

    @Column("descripcion")
    val descripcion: String? = null,

    @Column("precio")
    val precio: BigDecimal? = null,

    @Column("duracion_dias")
    val duracionDias: Int? = null,

    @Column("activa")
    val activa: Boolean = true,
)
