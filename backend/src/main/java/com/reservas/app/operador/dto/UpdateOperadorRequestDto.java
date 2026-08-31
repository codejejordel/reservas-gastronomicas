package com.reservas.app.operador.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UpdateOperadorRequestDto {

    @Size(max = 100)
    private String nombre;

    @Size(max = 100)
    private String apellido;

    @Size(max = 50)
    private String telefono;

    @Size(max = 20)
    private String dni;

    private Long sucursalId;

    @Valid
    private List<TurnoOperadorRequestDto> turnos;
}
