package com.reservas.app.operador.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class OperadorResponseDto {

    private Long id;
    private String nombreCompleto;
    private String email;
    private String telefono;
    private String dni;
    private String fotoPerfilUrl;
    private Long sucursalId;
    private String sucursalNombre;
    private Boolean activo;
    private Boolean enTurnoAhora;
    private List<TurnoOperadorResponseDto> turnos;
}
