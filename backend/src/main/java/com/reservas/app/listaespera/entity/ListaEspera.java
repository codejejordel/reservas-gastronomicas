package com.reservas.app.listaespera.entity;

import com.reservas.app.cliente.entity.Cliente;
import com.reservas.app.common.BaseEntity;
import com.reservas.app.reserva.entity.Reserva;
import com.reservas.app.sucursal.entity.Sucursal;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "lista_espera")
public class ListaEspera extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reserva_id")
    private Reserva reserva;

    @Column(name = "fecha_deseada", nullable = false)
    private LocalDate fechaDeseada;

    @Column(name = "hora_deseada", nullable = false)
    private LocalTime horaDeseada;

    @Column(name = "cant_personas", nullable = false)
    private Integer cantPersonas;

    @Enumerated(EnumType.STRING)
    @Column(name = "flexibilidad_horaria", nullable = false, length = 20)
    private FlexibilidadHoraria flexibilidadHoraria = FlexibilidadHoraria.EXACTA;

    @Enumerated(EnumType.STRING)
    @Column(name = "flexibilidad_fecha", nullable = false, length = 20)
    private FlexibilidadFecha flexibilidadFecha = FlexibilidadFecha.EXACTA;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoListaEspera estado = EstadoListaEspera.EN_ESPERA;

    @Column(nullable = false)
    private Integer prioridad = 0;

    @Column(name = "fecha_notificacion")
    private LocalDateTime fechaNotificacion;

    @Column(name = "fecha_expiracion_notif")
    private LocalDateTime fechaExpiracionNotif;
}
