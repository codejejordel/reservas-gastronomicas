package com.reservas.app.sucursal.bloqueo.entity;

import com.reservas.app.common.BaseEntity;
import com.reservas.app.sucursal.entity.Sucursal;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "bloqueo_sucursal")
public class BloqueoSucursal extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Column(name = "hora_inicio")
    private LocalTime horaInicio;

    @Column(name = "hora_fin")
    private LocalTime horaFin;

    @Column(length = 255)
    private String motivo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoBloqueo tipo;
}
