package com.reservas.app.operador.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateOperadorRequestDto {

    @NotBlank
    @Size(max = 100)
    private String nombre;

    @NotBlank
    @Size(max = 100)
    private String apellido;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    @Size(min = 8, max = 255)
    private String password;

    @Size(max = 50)
    private String telefono;

    @Size(max = 20)
    private String dni;

    @NotNull
    private Long sucursalId;

    @Valid
    private List<TurnoOperadorRequestDto> turnos;
}
