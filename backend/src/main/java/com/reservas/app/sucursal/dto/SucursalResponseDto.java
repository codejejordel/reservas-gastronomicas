package com.reservas.app.sucursal.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class SucursalResponseDto {

    private Long id;
    private Long restauranteId;
    private String nombre;
    private String slug;
    private Boolean esPrincipal;
    private String direccion;
    private String ciudad;
    private String provincia;
    private String codigoPostal;
    private String pais;
    private BigDecimal latitud;
    private BigDecimal longitud;
    private String telefono;
    private String email;
    private Integer capacidadMaxima;
    private BigDecimal ratingPromedio;
    private Integer cantResenias;
    private String zonaHoraria;
    private Boolean activa;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
}