package com.reservas.app.reserva.pago.dto;

import com.reservas.app.reserva.pago.entity.EstadoPago;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class PagoResponseDto {
    private Long id;
    private Long reservaId;
    private BigDecimal monto;
    private EstadoPago estado;
    private String mercadoPagoPaymentId;
    private String linkPago;
    private LocalDateTime fechaPago;
    private LocalDateTime fechaExpiracion;
    private String metodoPago;
    private BigDecimal montoReembolsado;
    private LocalDateTime fechaCreacion;
}
