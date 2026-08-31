package com.reservas.app.sucursal.controller;

import com.reservas.app.sucursal.dto.CreateSucursalRequestDto;
import com.reservas.app.sucursal.dto.DisponibilidadResponseDto;
import com.reservas.app.sucursal.dto.SucursalResponseDto;
import com.reservas.app.sucursal.dto.UpdateSucursalRequestDto;
import com.reservas.app.sucursal.service.DisponibilidadService;
import com.reservas.app.sucursal.service.SucursalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/sucursal")
@RequiredArgsConstructor
@Tag(name = "Sucursal")
public class SucursalController {

    private final SucursalService sucursalService;
    private final DisponibilidadService disponibilidadService;

    @PostMapping
    @Operation(summary = "Crear una sucursal para un restaurante")
    public ResponseEntity<SucursalResponseDto> create(@Valid @RequestBody CreateSucursalRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sucursalService.create(request));
    }

    @GetMapping("/restaurante/all")
    @Operation(summary = "Listar TODAS las sucursales. Sin restrinccion de perfiles ni roles. Sirve para pantalla Super admin pero tambien pensado para cuando agreguemos un 'buscador' de sucursales")
    public ResponseEntity<List<SucursalResponseDto>> listAll(HttpServletRequest request) {
        return ResponseEntity.ok(sucursalService.listAll());
    }

    @GetMapping("/restaurante/{restauranteId}")
    @Operation(summary = "Listar sucursales de un restaurante")
    public ResponseEntity<List<SucursalResponseDto>> listByRestaurante(@PathVariable Long restauranteId) {
        return ResponseEntity.ok(sucursalService.listByRestaurante(restauranteId));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener sucursal por ID")
    public ResponseEntity<SucursalResponseDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(sucursalService.getById(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar datos de la sucursal")
    public ResponseEntity<SucursalResponseDto> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSucursalRequestDto request) {
        return ResponseEntity.ok(sucursalService.update(id, request));
    }

    @PatchMapping("/{id}/principal")
    @Operation(summary = "Marcar esta sucursal como la principal del restaurante")
    public ResponseEntity<SucursalResponseDto> setPrincipal(@PathVariable Long id) {
        return ResponseEntity.ok(sucursalService.setPrincipal(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desactivar sucursal (soft delete)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        sucursalService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/disponibilidad")
    @Operation(summary = "Calcular disponibilidad de turnos para una sucursal")
    public ResponseEntity<DisponibilidadResponseDto> getDisponibilidad(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta,
            @RequestParam(defaultValue = "2") int personas) {
        return ResponseEntity.ok(disponibilidadService.calcularDisponibilidad(id, desde, hasta, personas));
    }
}