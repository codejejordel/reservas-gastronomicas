package com.reservas.app.resena.entity;

import com.reservas.app.cliente.entity.Cliente;
import com.reservas.app.common.BaseEntity;
import com.reservas.app.reserva.entity.Reserva;
import com.reservas.app.sucursal.entity.Sucursal;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "resena")
public class Resena extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reserva_id")
    private Reserva reserva;

    @Column(nullable = false)
    private Integer puntuacion;

    @Column(columnDefinition = "TEXT")
    private String comentario;

    @Column(name = "mostrar_nombre", nullable = false)
    private Boolean mostrarNombre = false;

    @Column(nullable = false)
    private Boolean aprobada = false;
}
