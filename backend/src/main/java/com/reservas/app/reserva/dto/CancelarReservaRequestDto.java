package com.reservas.app.reserva.dto;

import com.reservas.app.reserva.entity.CanceladaPor;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CancelarReservaRequestDto {

    @NotNull
    private CanceladaPor canceladaPor;

    @Size(max = 255)
    private String motivo;
}
