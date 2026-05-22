package com.reservas.app.sucursal.horario.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
public class UpdateHorarioRequestDto {

    @Min(1)
    private Integer ordenTurno;

    @Size(max = 50)
    private String etiqueta;

    private LocalTime horaApertura;

    private LocalTime horaCierre;

    private Boolean activo;
}