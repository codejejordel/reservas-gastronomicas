package com.reservas.app.reserva.pago.dto;

import com.reservas.app.reserva.entity.EstadoReserva;
import com.reservas.app.reserva.pago.entity.EstadoPago;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PagoReturnResponseDto {
    private String codigoReserva;
    private EstadoReserva estadoReserva;
    private EstadoPago estadoPago;
    private String providerStatus;
    private boolean verified;
    private Outcome outcome;

    public enum Outcome {
        APPROVED,
        PENDING,
        REJECTED,
        EXPIRED,
        UNVERIFIED
    }
}
