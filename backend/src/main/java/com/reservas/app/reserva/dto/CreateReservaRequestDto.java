package com.reservas.app.reserva.dto;

import com.reservas.app.common.CanalNotif;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class CreateReservaRequestDto {

    @NotNull
    private Long sucursalId;

    @NotNull
    private Long clienteId;

    @NotNull
    private LocalDate fechaReserva;

    @NotNull
    private LocalTime horaReserva;

    @NotNull
    @Min(1)
    private Integer cantPersonas;

    @Size(max = 500)
    private String observaciones;

    private CanalNotif canalNotif;
}
