package com.reservas.app.sucursal.foto.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class FotoSucursalResponseDto {

    private Long id;
    private Long sucursalId;
    private String url;
    private String descripcion;
    private Integer orden;
    private LocalDateTime fechaCreacion;
}
