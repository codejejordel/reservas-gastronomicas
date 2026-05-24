package com.reservas.app.listaespera.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ConvertirReservaRequestDto {

    @NotNull
    private Long reservaId;
}
