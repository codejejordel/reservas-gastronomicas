package com.reservas.app.reserva.pago.controller;

import com.reservas.app.reserva.pago.dto.WebhookNotificacionDto;
import com.reservas.app.reserva.pago.service.PagoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/pagos/webhook")
@RequiredArgsConstructor
@Tag(name = "Webhook MercadoPago")
public class WebhookPagoController {

    private final PagoService pagoService;

    @PostMapping("/{reservaId}")
    @Operation(summary = "Recibe notificaciones de MercadoPago")
    public ResponseEntity<Void> handle(
            @PathVariable Long reservaId,
            @RequestParam(name = "data.id", required = false) String queryDataId,
            @RequestBody(required = false) WebhookNotificacionDto payload,
            @RequestHeader(value = "x-signature", required = false) String xSignature,
            @RequestHeader(value = "x-request-id", required = false) String xRequestId) {
        String bodyDataId = payload != null && payload.getData() != null
                ? payload.getData().getId()
                : null;
        if (bodyDataId != null && !bodyDataId.equals(queryDataId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Los identificadores de la notificación no coinciden");
        }

        Long paymentId = parsePaymentId(queryDataId);
        pagoService.procesarWebhook(reservaId, paymentId, queryDataId, xSignature, xRequestId);
        return ResponseEntity.ok().build();
    }

    private Long parsePaymentId(String dataId) {
        if (dataId == null || !dataId.matches("[1-9][0-9]{0,18}")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El identificador de pago es inválido");
        }
        try {
            return Long.valueOf(dataId);
        } catch (NumberFormatException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El identificador de pago es inválido");
        }
    }
}
