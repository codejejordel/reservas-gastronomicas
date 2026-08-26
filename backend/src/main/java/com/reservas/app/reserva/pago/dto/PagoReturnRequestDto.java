package com.reservas.app.reserva.pago.dto;

import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PagoReturnRequestDto {

    @Pattern(regexp = "[1-9][0-9]{0,18}", message = "paymentId inválido")
    private String paymentId;
}
