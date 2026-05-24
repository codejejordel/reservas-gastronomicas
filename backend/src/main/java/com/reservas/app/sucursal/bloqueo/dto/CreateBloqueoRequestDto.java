package com.reservas.app.sucursal.bloqueo.dto;

import com.reservas.app.sucursal.bloqueo.entity.TipoBloqueo;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class CreateBloqueoRequestDto {

    @NotNull
    private LocalDate fechaInicio;

    @NotNull
    private LocalDate fechaFin;

    private LocalTime horaInicio;

    private LocalTime horaFin;

    @Size(max = 255)
    private String motivo;

    @NotNull
    private TipoBloqueo tipo;
}
