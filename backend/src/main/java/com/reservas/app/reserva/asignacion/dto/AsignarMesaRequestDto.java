package com.reservas.app.reserva.asignacion.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AsignarMesaRequestDto {

    @NotNull
    private Long mesaId;
}
