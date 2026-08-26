package com.reservas.app.restaurante.dto;

import com.reservas.app.restaurante.entity.EstiloBordes;
import com.reservas.app.restaurante.entity.TipografiaFont;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class RestauranteResponseDto {

    private Long id;
    private Long usuarioAdminId;
    private String nombrePublico;
    private String razonSocial;
    private String cuit;
    private String slogan;
    private String descripcion;
    private String tipoCocina;
    private String ciudadPrincipal;
    private String logoUrl;
    private String fotoLocalUrl;
    private String colorPrimario;
    private String colorAcento;
    private TipografiaFont tipografiaTitulos;
    private TipografiaFont tipografiaCuerpo;
    private EstiloBordes estiloBordes;
    private String slugPublico;
    private String instagramUrl;
    private String facebookUrl;
    private String sitioWeb;
    private String emailComercial;
    private Boolean mpConectado;
    private BigDecimal ratingPromedioGlobal;
    private Integer cantReseniasGlobal;
    private Boolean activo;
    private Boolean publicado;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
}