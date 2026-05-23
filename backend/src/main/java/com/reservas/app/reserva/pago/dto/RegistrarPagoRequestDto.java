package com.reservas.app.reserva.pago.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class RegistrarPagoRequestDto {

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal monto;

    private LocalDateTime fechaExpiracion;
}
