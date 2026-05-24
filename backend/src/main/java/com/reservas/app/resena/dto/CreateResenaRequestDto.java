package com.reservas.app.resena.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateResenaRequestDto {

    @NotNull
    private Long clienteId;

    private Long reservaId;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer puntuacion;

    private String comentario;

    private Boolean mostrarNombre = false;
}
