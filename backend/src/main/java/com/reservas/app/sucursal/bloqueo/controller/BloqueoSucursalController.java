package com.reservas.app.sucursal.bloqueo.controller;

import com.reservas.app.sucursal.bloqueo.dto.BloqueoSucursalResponseDto;
import com.reservas.app.sucursal.bloqueo.dto.CreateBloqueoRequestDto;
import com.reservas.app.sucursal.bloqueo.dto.UpdateBloqueoRequestDto;
import com.reservas.app.sucursal.bloqueo.service.BloqueoSucursalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sucursal/{sucursalId}/bloqueo")
@RequiredArgsConstructor
@Tag(name = "Bloqueo de Sucursal")
public class BloqueoSucursalController {

    private final BloqueoSucursalService bloqueoService;

    @PostMapping
    @Operation(summary = "Registrar un período de bloqueo en una sucursal")
    public ResponseEntity<BloqueoSucursalResponseDto> create(
            @PathVariable Long sucursalId,
            @Valid @RequestBody CreateBloqueoRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bloqueoService.create(sucursalId, request));
    }

    @GetMapping
    @Operation(summary = "Listar todos los bloqueos de una sucursal")
    public ResponseEntity<List<BloqueoSucursalResponseDto>> listAll(@PathVariable Long sucursalId) {
        return ResponseEntity.ok(bloqueoService.listBySucursal(sucursalId));
    }

    @GetMapping("/vigentes")
    @Operation(summary = "Listar bloqueos vigentes o futuros de una sucursal")
    public ResponseEntity<List<BloqueoSucursalResponseDto>> listVigentes(@PathVariable Long sucursalId) {
        return ResponseEntity.ok(bloqueoService.listVigentes(sucursalId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un bloqueo")
    public ResponseEntity<BloqueoSucursalResponseDto> update(
            @PathVariable Long sucursalId,
            @PathVariable Long id,
            @Valid @RequestBody UpdateBloqueoRequestDto request) {
        return ResponseEntity.ok(bloqueoService.update(sucursalId, id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un bloqueo")
    public ResponseEntity<Void> delete(
            @PathVariable Long sucursalId,
            @PathVariable Long id) {
        bloqueoService.delete(sucursalId, id);
        return ResponseEntity.noContent().build();
    }
}
