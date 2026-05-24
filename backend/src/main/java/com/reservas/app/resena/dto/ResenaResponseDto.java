package com.reservas.app.resena.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class ResenaResponseDto {

    private Long id;
    private Long sucursalId;
    private Long clienteId;
    private Long reservaId;
    private Integer puntuacion;
    private String comentario;
    private Boolean mostrarNombre;
    private Boolean aprobada;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
}
