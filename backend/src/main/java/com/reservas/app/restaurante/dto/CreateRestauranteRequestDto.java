package com.reservas.app.restaurante.dto;

import com.reservas.app.restaurante.entity.EstiloBordes;
import com.reservas.app.restaurante.entity.TipografiaFont;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateRestauranteRequestDto {

    @NotNull
    private Long usuarioAdminId;

    @NotBlank
    @Size(max = 150)
    private String nombrePublico;

    @NotBlank
    @Size(max = 100)
    @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$", message = "El slug solo puede contener letras minúsculas, números y guiones")
    private String slugPublico;

    @Size(max = 200)
    private String razonSocial;

    @Size(max = 20)
    private String cuit;

    @Size(max = 200)
    private String slogan;

    private String descripcion;

    @Size(max = 100)
    private String tipoCocina;

    @Size(max = 100)
    private String ciudadPrincipal;

    @Size(max = 500)
    private String logoUrl;

    @Size(max = 500)
    private String fotoLocalUrl;

    @Size(max = 9)
    private String colorPrimario;

    @Size(max = 9)
    private String colorAcento;

    private TipografiaFont tipografiaTitulos;

    private TipografiaFont tipografiaCuerpo;

    private EstiloBordes estiloBordes;

    @Size(max = 255)
    private String instagramUrl;

    @Size(max = 255)
    private String facebookUrl;

    @Size(max = 255)
    private String sitioWeb;

    @Size(max = 255)
    private String emailComercial;
}