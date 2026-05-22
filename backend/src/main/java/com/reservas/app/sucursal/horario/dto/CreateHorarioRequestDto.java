package com.reservas.app.sucursal.horario.dto;

import com.reservas.app.sucursal.horario.entity.DiaSemana;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
public class CreateHorarioRequestDto {

    @NotNull
    private DiaSemana diaSemana;

    @Min(1)
    private Integer ordenTurno = 1;

    @Size(max = 50)
    private String etiqueta;

    @NotNull
    private LocalTime horaApertura;

    @NotNull
    private LocalTime horaCierre;
}