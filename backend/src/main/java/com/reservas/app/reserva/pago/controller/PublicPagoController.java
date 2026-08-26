package com.reservas.app.reserva.pago.controller;

import com.reservas.app.reserva.pago.dto.PagoResponseDto;
import com.reservas.app.reserva.pago.dto.PagoReturnRequestDto;
import com.reservas.app.reserva.pago.dto.PagoReturnResponseDto;
import com.reservas.app.reserva.pago.service.PagoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reserva/public/{codigoReserva}/pago")
@RequiredArgsConstructor
@Tag(name = "Pago")
public class PublicPagoController {

    private final PagoService pagoService;

    @PostMapping("/preference")
    @Operation(summary = "Crear o reutilizar la preferencia de pago de una reserva pública")
    public ResponseEntity<PagoResponseDto> crearPreferencia(@PathVariable String codigoReserva) {
        return ResponseEntity.ok(pagoService.crearOReutilizarPreferencia(codigoReserva));
    }

    @PostMapping("/return")
    @Operation(summary = "Verificar y conciliar el retorno público de Mercado Pago")
    public ResponseEntity<PagoReturnResponseDto> reconciliarRetorno(
            @PathVariable String codigoReserva,
            @Valid @RequestBody PagoReturnRequestDto request) {
        return ResponseEntity.ok(pagoService.reconciliarRetorno(codigoReserva, request.getPaymentId()));
    }
}
