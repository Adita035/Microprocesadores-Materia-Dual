package com.clubdeportivo.repository

import com.clubdeportivo.entity.Material
import org.springframework.data.repository.reactive.ReactiveCrudRepository
import org.springframework.stereotype.Repository

@Repository
interface MaterialRepository : ReactiveCrudRepository<Material, Long>
