package com.reservas.app.reserva.pago.controller;

import com.reservas.app.reserva.pago.dto.PagoResponseDto;
import com.reservas.app.reserva.pago.dto.RegistrarPagoRequestDto;
import com.reservas.app.reserva.pago.service.PagoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reserva/{reservaId}/pago")
@RequiredArgsConstructor
@Tag(name = "Pago")
public class PagoController {

    private final PagoService pagoService;

    @PostMapping
    @Operation(summary = "Registrar pago de seña para una reserva")
    public ResponseEntity<PagoResponseDto> registrar(
            @PathVariable Long reservaId,
            @Valid @RequestBody RegistrarPagoRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pagoService.registrar(reservaId, request));
    }

    @GetMapping
    @Operation(summary = "Obtener pago de una reserva")
    public ResponseEntity<PagoResponseDto> getByReserva(@PathVariable Long reservaId) {
        return ResponseEntity.ok(pagoService.getByReserva(reservaId));
    }

    @PatchMapping("/aprobar")
    @Operation(summary = "Aprobar pago (PENDIENTE → APROBADO, reserva pasa a CONFIRMADA)")
    public ResponseEntity<PagoResponseDto> aprobar(@PathVariable Long reservaId) {
        return ResponseEntity.ok(pagoService.aprobar(reservaId));
    }

    @PatchMapping("/reembolsar")
    @Operation(summary = "Reembolsar pago (APROBADO → REEMBOLSADO)")
    public ResponseEntity<PagoResponseDto> reembolsar(@PathVariable Long reservaId) {
        return ResponseEntity.ok(pagoService.reembolsar(reservaId));
    }
}
