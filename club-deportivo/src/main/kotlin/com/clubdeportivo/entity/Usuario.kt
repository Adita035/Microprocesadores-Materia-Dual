package com.clubdeportivo.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table

@Table("usuarios")
data class Usuario(
    @Id
    val id: Long? = null,

    @Column("nombre")
    val nombre: String,

    @Column("apellido")
    val apellido: String,

    @Column("correo")
    val correo: String,

    @Column("password")
    val password: String,

    @Column("telefono")
    val telefono: String? = null,

    @Column("rol_id")
    val rolId: Long,

    @Column("activo")
    val activo: Boolean = true,
)
