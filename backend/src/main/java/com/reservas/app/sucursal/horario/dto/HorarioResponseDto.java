package com.reservas.app.sucursal.horario.dto;

import com.reservas.app.sucursal.horario.entity.DiaSemana;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@AllArgsConstructor
public class HorarioResponseDto {

    private Long id;
    private Long sucursalId;
    private DiaSemana diaSemana;
    private Integer ordenTurno;
    private String etiqueta;
    private LocalTime horaApertura;
    private LocalTime horaCierre;
    private Boolean activo;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
}