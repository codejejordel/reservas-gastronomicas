package com.reservas.app.reserva.controller;

import com.reservas.app.reserva.dto.ReservaPublicStatusDto;
import com.reservas.app.reserva.service.ReservaPublicAccessService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reserva/public/{codigoReserva}")
@RequiredArgsConstructor
@Tag(name = "Reserva")
public class PublicReservaController {

    public static final String ACCESS_TOKEN_HEADER = "X-Reservation-Token";

    private final ReservaPublicAccessService publicAccessService;

    @GetMapping("/status")
    @Operation(summary = "Consultar el estado público mínimo de una reserva")
    public ResponseEntity<ReservaPublicStatusDto> getStatus(
            @PathVariable String codigoReserva,
            @RequestHeader(ACCESS_TOKEN_HEADER) String accessToken) {
        return ResponseEntity.ok(publicAccessService.getStatus(codigoReserva, accessToken));
    }
}
