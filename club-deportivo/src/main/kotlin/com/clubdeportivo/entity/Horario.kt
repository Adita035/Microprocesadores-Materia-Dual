package com.clubdeportivo.entity

import org.springframework.data.annotation.Id
import org.springframework.data.relational.core.mapping.Column
import org.springframework.data.relational.core.mapping.Table
import java.time.LocalTime

@Table("horarios")
data class Horario(
    @Id
    val id: Long? = null,

    @Column("usuario_id")
    val usuarioId: Long,

    @Column("dia_semana")
    val diaSemana: String? = null,

    @Column("hora_entrada")
    val horaEntrada: LocalTime? = null,

    @Column("hora_salida")
    val horaSalida: LocalTime? = null,
)
