package com.reservas.app.sucursal.horario.controller;

import com.reservas.app.sucursal.horario.dto.CreateHorarioRequestDto;
import com.reservas.app.sucursal.horario.dto.HorarioResponseDto;
import com.reservas.app.sucursal.horario.dto.UpdateHorarioRequestDto;
import com.reservas.app.sucursal.horario.entity.DiaSemana;
import com.reservas.app.sucursal.horario.service.HorarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sucursal/{sucursalId}/horario")
@RequiredArgsConstructor
@Tag(name = "Horario")
public class HorarioController {

    private final HorarioService horarioService;

    @PostMapping
    @Operation(summary = "Agregar un turno de atención a una sucursal")
    public ResponseEntity<HorarioResponseDto> create(
            @PathVariable Long sucursalId,
            @Valid @RequestBody CreateHorarioRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(horarioService.create(sucursalId, request));
    }

    @GetMapping
    @Operation(summary = "Listar todos los horarios activos de una sucursal (agrupables por día en el frontend)")
    public ResponseEntity<List<HorarioResponseDto>> listBySucursal(@PathVariable Long sucursalId) {
        return ResponseEntity.ok(horarioService.listBySucursal(sucursalId));
    }

    @GetMapping("/dia/{dia}")
    @Operation(summary = "Listar los turnos de un día específico")
    public ResponseEntity<List<HorarioResponseDto>> listByDia(
            @PathVariable Long sucursalId,
            @PathVariable DiaSemana dia) {
        return ResponseEntity.ok(horarioService.listByDia(sucursalId, dia));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar un turno de atención")
    public ResponseEntity<HorarioResponseDto> update(
            @PathVariable Long sucursalId,
            @PathVariable Long id,
            @Valid @RequestBody UpdateHorarioRequestDto request) {
        return ResponseEntity.ok(horarioService.update(sucursalId, id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desactivar un turno de atención (soft delete)")
    public ResponseEntity<Void> delete(
            @PathVariable Long sucursalId,
            @PathVariable Long id) {
        horarioService.delete(sucursalId, id);
        return ResponseEntity.noContent().build();
    }
}