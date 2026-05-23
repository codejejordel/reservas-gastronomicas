package com.reservas.app.mesa.dto;

import com.reservas.app.mesa.entity.EstadoMesa;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class MesaResponseDto {
    private Long id;
    private Long sucursalId;
    private String nombre;
    private String ubicacion;
    private Integer capacidad;
    private EstadoMesa estado;
    private Boolean activa;
    private LocalDateTime fechaCreacion;
}
