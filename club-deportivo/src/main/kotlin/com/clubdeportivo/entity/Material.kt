package com.clubdeportivo.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table

@Table("materiales")
data class Material(
    @Id
    val id: Long? = null,

    @Column("nombre")
    val nombre: String,

    @Column("descripcion")
    val descripcion: String? = null,

    @Column("cantidad_disponible")
    val cantidadDisponible: Int = 0,
)
