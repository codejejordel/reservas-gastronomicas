package com.reservas.app.onboarding.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class OnboardingStatusResponseDto {

    private Long usuarioId;
    private Integer pasoActual;
    private Boolean completado;
    private JsonNode datos;
}
