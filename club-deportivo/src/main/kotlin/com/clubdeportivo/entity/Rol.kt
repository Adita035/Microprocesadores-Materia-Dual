package com.clubdeportivo.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table

@Table("roles")
data class Rol(
    @Id
    val id: Long? = null,

    @Column("nombre")
    val nombre: String,
)
