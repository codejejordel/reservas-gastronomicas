package com.reservas.app.usuario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class PasswordResetVerifyRequestDto {

    @NotNull
    private UUID challengeId;

    @NotBlank
    private String code;
}
