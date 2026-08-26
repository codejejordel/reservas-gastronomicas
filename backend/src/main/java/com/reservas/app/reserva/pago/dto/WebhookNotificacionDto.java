package com.reservas.app.reserva.pago.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class WebhookNotificacionDto {

    private Long id;
    private String type;
    private Data data;

    @Getter
    @Setter
    @NoArgsConstructor
    public static class Data {
        private String id;
    }
}