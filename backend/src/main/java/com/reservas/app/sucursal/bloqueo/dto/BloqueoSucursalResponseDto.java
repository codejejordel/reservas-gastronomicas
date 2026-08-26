package com.reservas.app.sucursal.bloqueo.dto;

import com.reservas.app.sucursal.bloqueo.entity.TipoBloqueo;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@AllArgsConstructor
public class BloqueoSucursalResponseDto {

    private Long id;
    private Long sucursalId;
    private LocalDate fechaInicio;
    private LocalDate fechaFin;
    private LocalTime horaInicio;
    private LocalTime horaFin;
    private String motivo;
    private TipoBloqueo tipo;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
}
