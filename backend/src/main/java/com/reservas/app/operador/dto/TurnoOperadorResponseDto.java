package com.reservas.app.operador.dto;

import com.reservas.app.sucursal.horario.entity.DiaSemana;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;

@Getter
@Setter
@AllArgsConstructor
public class TurnoOperadorResponseDto {

    private Long id;
    private DiaSemana diaSemana;
    private Integer ordenTurno;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private Boolean cruzaMedianoche;
}
