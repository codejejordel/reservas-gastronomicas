package com.reservas.app.reserva.asignacion.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class AsignacionMesaResponseDto {
    private Long id;
    private Long reservaId;
    private Long mesaId;
    private String mesaNombre;
    private Integer mesaCapacidad;
    private LocalDateTime fechaAsignacion;
    private Boolean activa;
}
