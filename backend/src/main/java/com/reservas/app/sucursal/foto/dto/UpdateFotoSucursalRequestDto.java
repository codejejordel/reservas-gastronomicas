package com.reservas.app.sucursal.foto.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateFotoSucursalRequestDto {

    @Size(max = 255)
    private String descripcion;

    @Min(0)
    private Integer orden;
}
