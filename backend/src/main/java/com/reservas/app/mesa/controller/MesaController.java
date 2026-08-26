package com.reservas.app.mesa.controller;

import com.reservas.app.mesa.dto.CreateMesaRequestDto;
import com.reservas.app.mesa.dto.MesaResponseDto;
import com.reservas.app.mesa.dto.UpdateMesaRequestDto;
import com.reservas.app.mesa.entity.EstadoMesa;
import com.reservas.app.mesa.service.MesaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/mesa")
@RequiredArgsConstructor
@Tag(name = "Mesa")
public class MesaController {

    private final MesaService mesaService;

    @PostMapping
    @Operation(summary = "Crear mesa en una sucursal (Se necesita el id de la sucursal)")
    public ResponseEntity<MesaResponseDto> create(@Valid @RequestBody CreateMesaRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mesaService.create(request));
    }

    @PostMapping("/bulk")
    @Operation(summary = "Crear varias mesas de una sucursal en una sola operación")
    public ResponseEntity<List<MesaResponseDto>> createBulk(@RequestBody List<@Valid CreateMesaRequestDto> requests) {
        return ResponseEntity.status(HttpStatus.CREATED).body(mesaService.createBulk(requests));
    }

    @GetMapping("/sucursal/{sucursalId}")
    @Operation(summary = "Listar mesas activas de una sucursal")
    public ResponseEntity<List<MesaResponseDto>> listBySucursal(@PathVariable Long sucursalId) {
        return ResponseEntity.ok(mesaService.listBySucursal(sucursalId));
    }

    @GetMapping("/sucursal/{sucursalId}/disponibles")
    @Operation(summary = "Listar mesas disponibles de una sucursal")
    public ResponseEntity<List<MesaResponseDto>> listDisponibles(@PathVariable Long sucursalId) {
        return ResponseEntity.ok(mesaService.listDisponibles(sucursalId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener mesa por ID")
    public ResponseEntity<MesaResponseDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(mesaService.getById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar datos de una mesa en específico")
    public ResponseEntity<MesaResponseDto> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMesaRequestDto request) {
        return ResponseEntity.ok(mesaService.update(id, request));
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Cambiar estado de la mesa")
    public ResponseEntity<MesaResponseDto> cambiarEstado(
            @PathVariable Long id,
            @RequestParam EstadoMesa estado) {
        return ResponseEntity.ok(mesaService.cambiarEstado(id, estado));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desactivar mesa")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        mesaService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
