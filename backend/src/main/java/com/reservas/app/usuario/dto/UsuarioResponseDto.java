package com.reservas.app.usuario.dto;

import com.reservas.app.usuario.entity.RolUsuario;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UsuarioResponseDto {
    private Long id;
    private String nombreCompleto;
    private String email;
    private String telefono;
    private RolUsuario rol;
    private Boolean activo;
    private Boolean onboardingCompleto;
}