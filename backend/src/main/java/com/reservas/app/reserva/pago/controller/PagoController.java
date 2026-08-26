package com.reservas.app.reserva.pago.controller;

import com.reservas.app.reserva.pago.dto.PagoResponseDto;
import com.reservas.app.reserva.pago.service.PagoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reserva/{reservaId}/pago")
@RequiredArgsConstructor
@Tag(name = "Pago")
public class PagoController {

    private final PagoService pagoService;

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

//    @PatchMapping("/reembolsar")
//    @Operation(summary = "Reembolsar pago (APROBADO → REEMBOLSADO)")
//    public ResponseEntity<PagoResponseDto> reembolsar(@PathVariable Long reservaId) {
//        return ResponseEntity.ok(pagoService.reembolsar(reservaId));
//    }
}
