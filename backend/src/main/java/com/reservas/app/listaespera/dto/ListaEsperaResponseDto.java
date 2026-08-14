package com.reservas.app.listaespera.dto;

import com.reservas.app.listaespera.entity.EstadoListaEspera;
import com.reservas.app.listaespera.entity.FlexibilidadFecha;
import com.reservas.app.listaespera.entity.FlexibilidadHoraria;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@AllArgsConstructor
public class ListaEsperaResponseDto {

    private Long id;
    private Long sucursalId;
    private Long clienteId;
    private Long reservaId;
    private LocalDate fechaDeseada;
    private LocalTime horaDeseada;
    private Integer cantPersonas;
    private FlexibilidadHoraria flexibilidadHoraria;
    private FlexibilidadFecha flexibilidadFecha;
    private EstadoListaEspera estado;
    private Integer prioridad;
    private LocalDateTime fechaNotificacion;
    private LocalDateTime fechaExpiracionNotif;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
}
