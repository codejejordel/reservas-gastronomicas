package com.reservas.app.sucursal.foto.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateFotoSucursalRequestDto {

    @NotBlank
    @Size(max = 500)
    private String url;

    @Size(max = 255)
    private String descripcion;

    private Integer orden;
}
