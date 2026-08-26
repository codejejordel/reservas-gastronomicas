package com.reservas.app.listaespera.controller;

import com.reservas.app.listaespera.dto.ConvertirReservaRequestDto;
import com.reservas.app.listaespera.dto.CreateListaEsperaRequestDto;
import com.reservas.app.listaespera.dto.ListaEsperaResponseDto;
import com.reservas.app.listaespera.dto.NotificarListaEsperaRequestDto;
import com.reservas.app.listaespera.entity.EstadoListaEspera;
import com.reservas.app.listaespera.service.ListaEsperaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Lista de Espera")
public class ListaEsperaController {

    private final ListaEsperaService listaEsperaService;

    @PostMapping("/sucursal/{sucursalId}/lista-espera")
    @Operation(summary = "Inscribir un cliente en la lista de espera de una sucursal")
    public ResponseEntity<ListaEsperaResponseDto> create(
            @PathVariable Long sucursalId,
            @Valid @RequestBody CreateListaEsperaRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(listaEsperaService.create(sucursalId, request));
    }

    @GetMapping("/sucursal/{sucursalId}/lista-espera")
    @Operation(summary = "Listar la lista de espera de una sucursal, opcionalmente filtrada por estado")
    public ResponseEntity<List<ListaEsperaResponseDto>> listBySucursal(
            @PathVariable Long sucursalId,
            @RequestParam(required = false) EstadoListaEspera estado) {
        if (estado != null) {
            return ResponseEntity.ok(listaEsperaService.listBySucursalYEstado(sucursalId, estado));
        }
        return ResponseEntity.ok(listaEsperaService.listBySucursal(sucursalId));
    }

    @GetMapping("/cliente/{clienteId}/lista-espera")
    @Operation(summary = "Historial de lista de espera de un cliente")
    public ResponseEntity<List<ListaEsperaResponseDto>> listByCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(listaEsperaService.listByCliente(clienteId));
    }

    @PatchMapping("/sucursal/{sucursalId}/lista-espera/{id}/notificar")
    @Operation(summary = "Marcar una entrada como NOTIFICADA (hay lugar disponible)")
    public ResponseEntity<ListaEsperaResponseDto> notificar(
            @PathVariable Long sucursalId,
            @PathVariable Long id,
            @Valid @RequestBody NotificarListaEsperaRequestDto request) {
        return ResponseEntity.ok(listaEsperaService.notificar(sucursalId, id, request));
    }

    @PatchMapping("/sucursal/{sucursalId}/lista-espera/{id}/convertir")
    @Operation(summary = "Vincular la entrada a una reserva concretada (CONVERTIDA_RESERVA)")
    public ResponseEntity<ListaEsperaResponseDto> convertirAReserva(
            @PathVariable Long sucursalId,
            @PathVariable Long id,
            @Valid @RequestBody ConvertirReservaRequestDto request) {
        return ResponseEntity.ok(listaEsperaService.convertirAReserva(sucursalId, id, request));
    }

    @PatchMapping("/sucursal/{sucursalId}/lista-espera/{id}/cancelar")
    @Operation(summary = "Cancelar una entrada de la lista de espera")
    public ResponseEntity<ListaEsperaResponseDto> cancelar(
            @PathVariable Long sucursalId,
            @PathVariable Long id) {
        return ResponseEntity.ok(listaEsperaService.cancelar(sucursalId, id));
    }
}
