package com.reservas.app.mesa.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateMesaRequestDto {

    @Size(max = 50)
    private String nombre;

    @Size(max = 100)
    private String ubicacion;

    @Min(1)
    private Integer capacidad;
}
