package com.reservas.app.usuario.dto;

import com.reservas.app.usuario.entity.RolUsuario;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponseDto {
    private String token;
    private String tipo;
    private Long id;
    private String email;
    private String nombreCompleto;
    private RolUsuario rol;
    private Boolean onboardingCompleto;
}