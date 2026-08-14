package com.reservas.app.reserva.controller;

import com.reservas.app.reserva.dto.CancelarReservaRequestDto;
import com.reservas.app.reserva.dto.CreateReservaPublicaRequestDto;
import com.reservas.app.reserva.dto.CreateReservaRequestDto;
import com.reservas.app.reserva.dto.ReservaResponseDto;
import com.reservas.app.reserva.entity.EstadoReserva;
import com.reservas.app.reserva.service.ReservaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/reserva")
@RequiredArgsConstructor
@Tag(name = "Reserva")
public class ReservaController {

    private final ReservaService reservaService;

    @PostMapping
    @Operation(summary = "Crear nueva reserva")
    public ResponseEntity<ReservaResponseDto> create(@Valid @RequestBody CreateReservaRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reservaService.create(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener reserva por ID")
    public ResponseEntity<ReservaResponseDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(reservaService.getById(id));
    }

    @GetMapping("/codigo/{codigo}")
    @Operation(summary = "Obtener reserva por código")
    public ResponseEntity<ReservaResponseDto> getByCodigo(@PathVariable String codigo) {
        return ResponseEntity.ok(reservaService.getByCodigo(codigo));
    }

    @GetMapping("/sucursal/{sucursalId}")
    @Operation(summary = "Listar reservas de una sucursal (filtros opcionales: fecha, estado)")
    public ResponseEntity<List<ReservaResponseDto>> listBySucursal(
            @PathVariable Long sucursalId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) EstadoReserva estado) {
        return ResponseEntity.ok(reservaService.listBySucursal(sucursalId, fecha, estado));
    }

    @GetMapping("/cliente/{clienteId}")
    @Operation(summary = "Listar reservas de un cliente")
    public ResponseEntity<List<ReservaResponseDto>> listByCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(reservaService.listByCliente(clienteId));
    }

    @PatchMapping("/{id}/confirmar")
    @Operation(summary = "Confirmar reserva (PENDIENTE_CONFIRMACION → CONFIRMADA)")
    public ResponseEntity<ReservaResponseDto> confirmar(@PathVariable Long id) {
        return ResponseEntity.ok(reservaService.confirmar(id));
    }

    @PatchMapping("/{id}/cancelar")
    @Operation(summary = "Cancelar reserva")
    public ResponseEntity<ReservaResponseDto> cancelar(
            @PathVariable Long id,
            @Valid @RequestBody CancelarReservaRequestDto request) {
        return ResponseEntity.ok(reservaService.cancelar(id, request));
    }

    @PatchMapping("/{id}/completar")
    @Operation(summary = "Marcar reserva como completada (CONFIRMADA → COMPLETADA)")
    public ResponseEntity<ReservaResponseDto> completar(@PathVariable Long id) {
        return ResponseEntity.ok(reservaService.completar(id));
    }

    @PatchMapping("/{id}/no-show")
    @Operation(summary = "Marcar no-show (CONFIRMADA → NO_SHOW, incrementa contador del cliente)")
    public ResponseEntity<ReservaResponseDto> noShow(@PathVariable Long id) {
        return ResponseEntity.ok(reservaService.marcarNoShow(id));
    }

    @PostMapping("/public")
    @Operation(summary = "Crear reserva pública (con upsert de cliente inline)")
    public ResponseEntity<ReservaResponseDto> createPublic(@Valid @RequestBody CreateReservaPublicaRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reservaService.createPublic(request));
    }
}
