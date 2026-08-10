package com.clubdeportivo.repository

import com.clubdeportivo.entity.Auditoria
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

@Repository
interface AuditoriaRepository : ReactiveCrudRepository<Auditoria, Long>
