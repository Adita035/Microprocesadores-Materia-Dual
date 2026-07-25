package com.clubdeportivo.repository

import com.clubdeportivo.entity.Actividad
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

@Repository
interface ActividadRepository : ReactiveCrudRepository<Actividad, Long>
