package com.reservas.app.notificacion.controller;

import com.reservas.app.notificacion.dto.CreateNotificacionRequestDto;
import com.reservas.app.notificacion.dto.NotificacionResponseDto;
import com.reservas.app.notificacion.service.NotificacionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notificacion")
@RequiredArgsConstructor
@Tag(name = "Notificación")
public class NotificacionController {

    private final NotificacionService notificacionService;

    @PostMapping
    @Operation(summary = "Registrar una nueva notificación en el log de auditoría")
    public ResponseEntity<NotificacionResponseDto> create(
            @Valid @RequestBody CreateNotificacionRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(notificacionService.create(request));
    }

    @GetMapping("/cliente/{clienteId}")
    @Operation(summary = "Listar notificaciones de un cliente")
    public ResponseEntity<List<NotificacionResponseDto>> listByCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(notificacionService.listByCliente(clienteId));
    }

    @GetMapping("/sucursal/{sucursalId}")
    @Operation(summary = "Listar notificaciones de una sucursal")
    public ResponseEntity<List<NotificacionResponseDto>> listBySucursal(@PathVariable Long sucursalId) {
        return ResponseEntity.ok(notificacionService.listBySucursal(sucursalId));
    }

    @GetMapping("/reserva/{reservaId}")
    @Operation(summary = "Listar notificaciones asociadas a una reserva")
    public ResponseEntity<List<NotificacionResponseDto>> listByReserva(@PathVariable Long reservaId) {
        return ResponseEntity.ok(notificacionService.listByReserva(reservaId));
    }

    @GetMapping("/pendientes")
    @Operation(summary = "Listar todas las notificaciones pendientes de envío")
    public ResponseEntity<List<NotificacionResponseDto>> listPendientes() {
        return ResponseEntity.ok(notificacionService.listPendientes());
    }

    @PatchMapping("/{id}/enviar")
    @Operation(summary = "Registrar envío exitoso de una notificación")
    public ResponseEntity<NotificacionResponseDto> registrarEnvio(@PathVariable Long id) {
        return ResponseEntity.ok(notificacionService.registrarEnvio(id));
    }

    @PatchMapping("/{id}/fallo")
    @Operation(summary = "Registrar fallo de envío de una notificación")
    public ResponseEntity<NotificacionResponseDto> registrarFallo(@PathVariable Long id) {
        return ResponseEntity.ok(notificacionService.registrarFallo(id));
    }

    @PatchMapping("/{id}/leida")
    @Operation(summary = "Marcar una notificación como leída")
    public ResponseEntity<NotificacionResponseDto> marcarLeida(@PathVariable Long id) {
        return ResponseEntity.ok(notificacionService.marcarLeida(id));
    }
}
