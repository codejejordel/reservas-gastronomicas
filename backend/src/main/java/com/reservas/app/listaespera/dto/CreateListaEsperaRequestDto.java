package com.reservas.app.listaespera.dto;

import com.reservas.app.listaespera.entity.FlexibilidadFecha;
import com.reservas.app.listaespera.entity.FlexibilidadHoraria;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class CreateListaEsperaRequestDto {

    @NotNull
    private Long clienteId;

    @NotNull
    private LocalDate fechaDeseada;

    @NotNull
    private LocalTime horaDeseada;

    @NotNull
    @Min(1)
    private Integer cantPersonas;

    private FlexibilidadHoraria flexibilidadHoraria = FlexibilidadHoraria.EXACTA;

    private FlexibilidadFecha flexibilidadFecha = FlexibilidadFecha.EXACTA;
}
