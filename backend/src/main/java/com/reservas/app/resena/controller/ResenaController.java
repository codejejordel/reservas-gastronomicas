package com.reservas.app.resena.controller;

import com.reservas.app.resena.dto.CreateResenaRequestDto;
import com.reservas.app.resena.dto.ResenaResponseDto;
import com.reservas.app.resena.service.ResenaService;
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
@Tag(name = "Reseña")
public class ResenaController {

    private final ResenaService resenaService;

    @PostMapping("/sucursal/{sucursalId}/resena")
    @Operation(summary = "Enviar una reseña para una sucursal")
    public ResponseEntity<ResenaResponseDto> create(
            @PathVariable Long sucursalId,
            @Valid @RequestBody CreateResenaRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(resenaService.create(sucursalId, request));
    }

    @GetMapping("/sucursal/{sucursalId}/resena")
    @Operation(summary = "Listar reseñas de una sucursal (soloAprobadas=true para vista pública)")
    public ResponseEntity<List<ResenaResponseDto>> listBySucursal(
            @PathVariable Long sucursalId,
            @RequestParam(defaultValue = "false") boolean soloAprobadas) {
        return ResponseEntity.ok(resenaService.listBySucursal(sucursalId, soloAprobadas));
    }

    @GetMapping("/cliente/{clienteId}/resena")
    @Operation(summary = "Listar reseñas enviadas por un cliente")
    public ResponseEntity<List<ResenaResponseDto>> listByCliente(@PathVariable Long clienteId) {
        return ResponseEntity.ok(resenaService.listByCliente(clienteId));
    }

    @PatchMapping("/sucursal/{sucursalId}/resena/{id}/aprobar")
    @Operation(summary = "Aprobar una reseña (la hace pública y recalcula el rating)")
    public ResponseEntity<ResenaResponseDto> aprobar(
            @PathVariable Long sucursalId,
            @PathVariable Long id) {
        return ResponseEntity.ok(resenaService.aprobar(sucursalId, id));
    }

    @DeleteMapping("/sucursal/{sucursalId}/resena/{id}")
    @Operation(summary = "Eliminar una reseña (si estaba aprobada, recalcula el rating)")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long sucursalId,
            @PathVariable Long id) {
        resenaService.eliminar(sucursalId, id);
        return ResponseEntity.noContent().build();
    }
}
