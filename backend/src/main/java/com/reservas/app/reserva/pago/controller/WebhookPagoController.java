package com.reservas.app.reserva.pago.controller;

import com.reservas.app.reserva.pago.dto.WebhookNotificacionDto;
import com.reservas.app.reserva.pago.service.PagoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/pagos/webhook")
@RequiredArgsConstructor
@Tag(name = "Webhook MercadoPago")
public class WebhookPagoController {

    private final PagoService pagoService;

    @PostMapping("/{reservaId}")
    @Operation(summary = "Recibe notificaciones de MercadoPago (este endpoint no Se lo llama manualmente)")
    public ResponseEntity<Void> handle(
            @PathVariable Long reservaId,
            @RequestBody WebhookNotificacionDto payload,
            @RequestHeader(value = "x-signature", required = false) String xSignature,
            @RequestHeader(value = "x-request-id", required = false) String xRequestId) {

        if ("payment".equals(payload.getType()) && payload.getData() != null) {
            Long mpPaymentId = Long.parseLong(payload.getData().getId());
            try {
                pagoService.procesarWebhook(reservaId, mpPaymentId, xSignature, xRequestId);
            } catch (NumberFormatException e) {
                log.warn("Webhook MP: data.id no es un número válido: '{}'", mpPaymentId);
            }
        }

        // Siempre respondemos con status 200 para que MP no reintente
        return ResponseEntity.ok().build();
    }
}
