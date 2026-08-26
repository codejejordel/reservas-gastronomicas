package com.reservas.app.reserva.entity;

import com.reservas.app.cliente.entity.Cliente;
import com.reservas.app.common.CanalNotif;
import com.reservas.app.sucursal.entity.Sucursal;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

// Reserva no extiende BaseEntity porque necesita @Version para optimistic locking
// y BaseEntity no lo tiene. Los campos de auditoría se declaran aquí directamente.
@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "reserva")
@EntityListeners(AuditingEntityListener.class)
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo_reserva", nullable = false, unique = true, length = 20)
    private String codigoReserva;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id")
    private Cliente cliente;

    @Column(name = "nombre_invitado", length = 200)
    private String nombreInvitado;

    @Column(name = "email_invitado", length = 255)
    private String emailInvitado;

    @Column(name = "telefono_invitado", length = 50)
    private String telefonoInvitado;

    @Column(name = "fecha_reserva", nullable = false)
    private LocalDate fechaReserva;

    @Column(name = "hora_reserva", nullable = false)
    private LocalTime horaReserva;

    @Column(name = "cant_personas", nullable = false)
    private Integer cantPersonas;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoReserva estado;

    @Column(length = 500)
    private String observaciones;

    @Enumerated(EnumType.STRING)
    @Column(name = "canal_notif", length = 20)
    private CanalNotif canalNotif;

    @Column(name = "fecha_confirmacion")
    private LocalDateTime fechaConfirmacion;

    @Column(name = "fecha_cancelacion")
    private LocalDateTime fechaCancelacion;

    @Column(name = "motivo_cancelacion", length = 255)
    private String motivoCancelacion;

    @Enumerated(EnumType.STRING)
    @Column(name = "cancelada_por", length = 20)
    private CanceladaPor canceladaPor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reserva_reemplazada_por")
    private Reserva reservaReemplazadaPor;

    @Version
    private Long version;

    @CreatedDate
    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    @LastModifiedDate
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
}
