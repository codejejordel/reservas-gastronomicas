package com.reservas.app.usuario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PasswordResetConfirmRequestDto {

    @NotBlank
    private String resetToken;

    @NotBlank
    @Size(min = 8, max = 128)
    private String password;
}
