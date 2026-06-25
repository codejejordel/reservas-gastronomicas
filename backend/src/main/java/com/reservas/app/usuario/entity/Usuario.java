package com.reservas.app.usuario.entity;

import com.reservas.app.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "usuario")
@Inheritance(strategy = InheritanceType.JOINED)
public class Usuario extends BaseEntity {

    @Column(name = "nombre_completo", nullable = false, length = 200)
    private String nombreCompleto;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(length = 50)
    private String telefono;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private RolUsuario rol;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(unique = true, length = 20)
    private String dni;

    @Column(name = "onboarding_completo", nullable = false)
    private Boolean onboardingCompleto = false;

    @Column(name = "google_id", unique = true)
    private String googleId;
}