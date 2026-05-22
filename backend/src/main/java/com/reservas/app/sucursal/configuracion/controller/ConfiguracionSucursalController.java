package com.reservas.app.sucursal.configuracion.controller;

import com.reservas.app.sucursal.configuracion.dto.ConfiguracionSucursalResponseDto;
import com.reservas.app.sucursal.configuracion.dto.UpdateConfiguracionSucursalRequestDto;
import com.reservas.app.sucursal.configuracion.service.ConfiguracionSucursalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/sucursal/{sucursalId}/configuracion")
@RequiredArgsConstructor
@Tag(name = "Configuración de Sucursal")
public class ConfiguracionSucursalController {

    private final ConfiguracionSucursalService configuracionService;

    @GetMapping
    @Operation(summary = "Obtener la configuración operativa de una sucursal")
    public ResponseEntity<ConfiguracionSucursalResponseDto> get(@PathVariable Long sucursalId) {
        return ResponseEntity.ok(configuracionService.getBySucursal(sucursalId));
    }

    @PutMapping
    @Operation(summary = "Actualizar la configuración operativa de una sucursal")
    public ResponseEntity<ConfiguracionSucursalResponseDto> update(@PathVariable Long sucursalId,
                                                                   @Valid @RequestBody UpdateConfiguracionSucursalRequestDto request) {
        return ResponseEntity.ok(configuracionService.update(sucursalId, request));
    }
}