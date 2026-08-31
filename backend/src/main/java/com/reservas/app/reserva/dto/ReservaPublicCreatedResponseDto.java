package com.reservas.app.reserva.dto;

import com.reservas.app.reserva.entity.EstadoReserva;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@AllArgsConstructor
public class ReservaPublicCreatedResponseDto {
    private String codigoReserva;
    private EstadoReserva estado;
    private LocalDate fechaReserva;
    private LocalTime horaReserva;
    private Integer cantPersonas;
    private String accessToken;
    private LocalDateTime fechaLimitePago;
}
