package com.reservas.app.reserva.controller;

import com.reservas.app.reserva.dto.CotizacionReservaResponseDto;
import com.reservas.app.reserva.service.CotizacionReservaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/sucursal/{sucursalId}/reserva")
@Validated
@RequiredArgsConstructor
@Tag(name = "Reserva")
public class CotizacionReservaController {

    private final CotizacionReservaService cotizacionReservaService;

    @GetMapping("/cotizacion")
    @Operation(summary = "Cotizar una reserva pública")
    public ResponseEntity<CotizacionReservaResponseDto> cotizar(
            @PathVariable Long sucursalId,
            @RequestParam @Min(1) int personas) {
        return ResponseEntity.ok(cotizacionReservaService.cotizar(sucursalId, personas));
    }
}
