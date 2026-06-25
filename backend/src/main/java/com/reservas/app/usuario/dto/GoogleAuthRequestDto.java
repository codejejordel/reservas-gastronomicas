package com.reservas.app.usuario.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class GoogleAuthRequestDto {

    @NotBlank
    private String idToken;
}
