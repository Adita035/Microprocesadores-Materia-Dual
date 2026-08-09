package com.clubdeportivo.config

import com.clubdeportivo.security.JwtAuthenticationWebFilter
import com.clubdeportivo.security.JwtProperties
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.http.HttpStatus
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity
import org.springframework.security.config.web.server.SecurityWebFiltersOrder
import org.springframework.security.config.web.server.ServerHttpSecurity
import org.springframework.security.core.userdetails.MapReactiveUserDetailsService
import org.springframework.security.core.userdetails.User
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.server.authentication.HttpStatusServerEntryPoint
import org.springframework.security.web.server.authorization.HttpStatusServerAccessDeniedHandler
import org.springframework.security.web.server.SecurityWebFilterChain

@Configuration
@EnableReactiveMethodSecurity
@EnableConfigurationProperties(JwtProperties::class)
class SecurityConfig {

    @Bean
    fun securityWebFilterChain(
        http: ServerHttpSecurity,
        jwtAuthenticationWebFilter: JwtAuthenticationWebFilter,
    ): SecurityWebFilterChain =
        http
            .csrf { it.disable() }
            .httpBasic { it.disable() }
            .formLogin { it.disable() }
            .exceptionHandling {
                it.authenticationEntryPoint(HttpStatusServerEntryPoint(HttpStatus.UNAUTHORIZED))
                it.accessDeniedHandler(HttpStatusServerAccessDeniedHandler(HttpStatus.FORBIDDEN))
            }
            .authorizeExchange {
                it.pathMatchers("/", "/index.html", "/admin.html", "/entrenador.html", "/membresias.html", "/styles.css", "/app.js", "/admin.js", "/entrenador.js", "/membresias.js", "/favicon.ico", "/assets/**").permitAll()
                it.pathMatchers(HttpMethod.GET, "/api/actividades/publicas", "/api/actividades/publicas/**").permitAll()
                it.pathMatchers(HttpMethod.GET, "/api/membresias/publicas").permitAll()
                it.pathMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                it.pathMatchers(HttpMethod.POST, "/api/usuarios/admin").permitAll()
                it.pathMatchers(HttpMethod.POST, "/api/usuarios/registro").permitAll()
                it.pathMatchers("/actuator/health").permitAll()
                it.anyExchange().authenticated()
            }
            .addFilterAt(jwtAuthenticationWebFilter, SecurityWebFiltersOrder.AUTHENTICATION)
            .build()

    @Bean
    fun passwordEncoder(): PasswordEncoder = BCryptPasswordEncoder()

    @Bean
    fun reactiveUserDetailsService(): MapReactiveUserDetailsService =
        MapReactiveUserDetailsService(
            User.withUsername("jwt-only")
                .password("{noop}disabled")
                .roles("DISABLED")
                .disabled(true)
                .build(),
        )
}
