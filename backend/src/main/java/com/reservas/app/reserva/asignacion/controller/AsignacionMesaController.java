package com.reservas.app.reserva.asignacion.controller;

import com.reservas.app.reserva.asignacion.dto.AsignarMesaRequestDto;
import com.reservas.app.reserva.asignacion.dto.AsignacionMesaResponseDto;
import com.reservas.app.reserva.asignacion.service.AsignacionMesaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reserva/{reservaId}/asignacion")
@RequiredArgsConstructor
@Tag(name = "AsignacionMesa")
public class AsignacionMesaController {

    private final AsignacionMesaService asignacionService;

    @PostMapping
    @Operation(summary = "Asignar mesa a una reserva")
    public ResponseEntity<AsignacionMesaResponseDto> asignar(
            @PathVariable Long reservaId,
            @Valid @RequestBody AsignarMesaRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(asignacionService.asignar(reservaId, request));
    }

    @GetMapping
    @Operation(summary = "Listar mesas asignadas a una reserva")
    public ResponseEntity<List<AsignacionMesaResponseDto>> list(@PathVariable Long reservaId) {
        return ResponseEntity.ok(asignacionService.listByReserva(reservaId));
    }

    @DeleteMapping("/{asignacionId}")
    @Operation(summary = "Desasignar mesa y devolverla a DISPONIBLE. (Cuando termina la reserva o cancelan reserva)")
    public ResponseEntity<Void> desasignar(
            @PathVariable Long reservaId,
            @PathVariable Long asignacionId) {
        asignacionService.desasignar(reservaId, asignacionId);
        return ResponseEntity.noContent().build();
    }
}
