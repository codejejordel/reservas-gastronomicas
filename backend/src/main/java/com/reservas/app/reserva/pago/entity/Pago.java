package com.reservas.app.reserva.pago.entity;

import com.reservas.app.common.BaseEntity;
import com.reservas.app.reserva.entity.Reserva;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "pago")
public class Pago extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reserva_id", nullable = false, unique = true)
    private Reserva reserva;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal monto;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoPago estado = EstadoPago.PENDIENTE;

    @Column(name = "mercado_pago_payment_id", length = 100)
    private String mercadoPagoPaymentId;

    @Column(name = "mercado_pago_preference_id", length = 100)
    private String mercadoPagoPreferenceId;

    @Column(name = "link_pago", length = 500)
    private String linkPago;

    @Column(name = "fecha_pago")
    private LocalDateTime fechaPago;

    @Column(name = "fecha_expiracion")
    private LocalDateTime fechaExpiracion;

    @Column(name = "metodo_pago", length = 50)
    private String metodoPago;

    @Column(name = "monto_comision_plataforma", precision = 12, scale = 2)
    private BigDecimal montoComisionPlataforma = BigDecimal.ZERO;

    @Column(name = "monto_reembolsado", precision = 12, scale = 2)
    private BigDecimal montoReembolsado = BigDecimal.ZERO;
}
