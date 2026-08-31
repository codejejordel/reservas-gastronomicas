package com.reservas.app.reserva.pago.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class PagoPublicPreferenceResponseDto {
    private String checkoutUrl;
    private LocalDateTime fechaExpiracion;
}
