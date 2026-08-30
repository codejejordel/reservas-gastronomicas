package com.reservas.app.operador.dto;

import com.reservas.app.sucursal.horario.entity.DiaSemana;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalTime;

@Getter
@Setter
public class TurnoOperadorRequestDto {

    @NotNull
    private DiaSemana diaSemana;

    @Min(1)
    private Integer ordenTurno = 1;

    @Schema(type = "string", example = "09:30:00", pattern = "HH:mm:ss")
    @NotNull
    private LocalTime horaInicio;

    @Schema(type = "string", example = "18:30:00", pattern = "HH:mm:ss")
    @NotNull
    private LocalTime horaFin;
}
