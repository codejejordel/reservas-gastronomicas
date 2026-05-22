package com.reservas.app.sucursal.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class CreateSucursalRequestDto {

    @NotNull
    private Long restauranteId;

    @NotBlank
    @Size(max = 150)
    private String nombre;

    @NotBlank
    @Size(max = 100)
    @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "El slug solo puede contener letras minúsculas, números y guiones")
    private String slug;

    @NotBlank
    @Size(max = 255)
    private String direccion;

    @Size(max = 100)
    private String ciudad;

    @Size(max = 100)
    private String provincia;

    @Size(max = 20)
    private String codigoPostal;

    @Size(max = 50)
    private String pais;

    @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0")
    private BigDecimal latitud;

    @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0")
    private BigDecimal longitud;

    @Size(max = 50)
    private String telefono;

    @Size(max = 255)
    @Email
    private String email;

    @Min(0)
    private Integer capacidadMaxima;

    @Size(max = 50)
    private String zonaHoraria;
}