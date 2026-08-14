package com.reservas.app.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Auth
                        .requestMatchers("/auth/**").permitAll()
                        // Swagger / OpenAPI
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                        // Actuator
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()

                        //Usuario
                        .requestMatchers(HttpMethod.POST, "/usuario").permitAll()

                        //Cliente
                        .requestMatchers(HttpMethod.POST, "/cliente").permitAll()
                        
                        // Reserva pública
                        .requestMatchers(HttpMethod.POST, "/reserva/public").permitAll()
                        .requestMatchers(HttpMethod.GET, "/reserva/codigo/**").permitAll()
                        .requestMatchers(HttpMethod.PATCH, "/reserva/*/cancelar").permitAll()

                        // Webhook MercadoPago
                        .requestMatchers(HttpMethod.POST, "/pagos/webhook/**").permitAll()

                        // Restaurante público (por slug)
                        .requestMatchers(HttpMethod.GET, "/restaurante/slug/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/restaurante/slug/**").permitAll()

                        // Sucursal pública
                        .requestMatchers(HttpMethod.GET, "/sucursal/restaurante/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/sucursal/*/disponibilidad").permitAll()

                        //Sucursal
                        .requestMatchers(HttpMethod.GET, "/sucursal/*/horario/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/sucursal/*/bloqueo/vigentes").permitAll()
                        .requestMatchers(HttpMethod.GET, "/sucursal/*/resena").permitAll()
                        .requestMatchers(HttpMethod.GET, "/sucursal/*/foto").permitAll()

                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
