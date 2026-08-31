package com.reservas.app.reserva.dto;

import com.reservas.app.reserva.entity.EstadoReserva;
import com.reservas.app.reserva.pago.entity.EstadoPago;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@AllArgsConstructor
public class ReservaPublicStatusDto {
    private String codigoReserva;
    private EstadoReserva estado;
    private LocalDate fechaReserva;
    private LocalTime horaReserva;
    private Integer cantPersonas;
    private EstadoPago estadoPago;
    private boolean puedeContinuarPago;
    private LocalDateTime fechaLimitePago;
}
