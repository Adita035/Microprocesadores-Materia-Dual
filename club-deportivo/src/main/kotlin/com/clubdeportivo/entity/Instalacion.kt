package com.clubdeportivo.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table

@Table("instalaciones")
data class Instalacion(
    @Id
    val id: Long? = null,

    @Column("nombre")
    val nombre: String,

    @Column("descripcion")
    val descripcion: String? = null,

    @Column("capacidad")
    val capacidad: Int? = null,

    @Column("disponible")
    val disponible: Boolean = true,
)
