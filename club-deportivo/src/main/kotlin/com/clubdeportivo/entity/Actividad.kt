package com.clubdeportivo.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalDate
import java.time.LocalTime

@Table("actividades")
data class Actividad(
    @Id
    val id: Long? = null,

    @Column("nombre")
    val nombre: String,

    @Column("descripcion")
    val descripcion: String? = null,

    @Column("fecha")
    val fecha: LocalDate? = null,

    @Column("hora_inicio")
    val horaInicio: LocalTime? = null,

    @Column("hora_fin")
    val horaFin: LocalTime? = null,

    @Column("estado")
    val estado: String? = "PENDIENTE",
)
