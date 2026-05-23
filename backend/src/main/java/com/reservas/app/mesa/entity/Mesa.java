package com.reservas.app.mesa.entity;

import com.reservas.app.common.BaseEntity;
import com.reservas.app.sucursal.entity.Sucursal;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "mesa")
public class Mesa extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    @Column(nullable = false, length = 50)
    private String nombre;

    @Column(length = 100)
    private String ubicacion;

    @Column(nullable = false)
    private Integer capacidad = 4;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoMesa estado = EstadoMesa.DISPONIBLE;

    @Column(nullable = false)
    private Boolean activa = true;
}