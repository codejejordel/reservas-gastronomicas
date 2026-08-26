package com.reservas.app.sucursal.entity;

import com.reservas.app.common.BaseEntity;
import com.reservas.app.restaurante.entity.Restaurante;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "sucursal")
public class Sucursal extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restaurante_id", nullable = false)
    private Restaurante restaurante;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(nullable = false, length = 100)
    private String slug;

    @Column(name = "es_principal", nullable = false)
    private Boolean esPrincipal = false;

    @Column(nullable = false, length = 255)
    private String direccion;

    @Column(length = 100)
    private String ciudad;

    @Column(length = 100)
    private String provincia;

    @Column(name = "codigo_postal", length = 20)
    private String codigoPostal;

    @Column(nullable = false, length = 50)
    private String pais = "AR";

    @Column(precision = 10, scale = 7)
    private BigDecimal latitud;

    @Column(precision = 10, scale = 7)
    private BigDecimal longitud;

    @Column(length = 50)
    private String telefono;

    @Column(length = 255)
    private String email;

    @Column(name = "mp_access_token", length = 500)
    private String mpAccessToken;

    @Column(name = "mp_user_id", length = 100)
    private String mpUserId;

    @Column(name = "capacidad_maxima", nullable = false)
    private Integer capacidadMaxima = 0;

    @Column(name = "rating_promedio", nullable = false, precision = 3, scale = 2)
    private BigDecimal ratingPromedio = BigDecimal.ZERO;

    @Column(name = "cant_resenias", nullable = false)
    private Integer cantResenias = 0;

    @Column(name = "zona_horaria", nullable = false, length = 50)
    private String zonaHoraria = "America/Argentina/Buenos_Aires";

    @Column(nullable = false)
    private Boolean activa = true;
}