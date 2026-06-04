package com.reservas.app.sucursal.foto.controller;

import com.reservas.app.sucursal.foto.dto.FotoSucursalResponseDto;
import com.reservas.app.sucursal.foto.dto.UpdateFotoSucursalRequestDto;
import com.reservas.app.sucursal.foto.service.FotoSucursalService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/sucursal/{sucursalId}/foto")
@RequiredArgsConstructor
@Tag(name = "Fotos de Sucursal")
public class FotoSucursalController {

    private final FotoSucursalService fotoService;

    @PreAuthorize("hasAnyRole('ADMIN_RESTAURANTE','SUPER_ADMIN')")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Subir una foto a una sucursal. Jorgito (Diría Agustin), Este subir imagen es para cuando quieras armar una galería de la sucursal, asi la gente ve dónde va a sacar una reserva.")
    public ResponseEntity<FotoSucursalResponseDto> create(
            @PathVariable Long sucursalId,
            @RequestPart("archivo") MultipartFile archivo,
            @RequestParam(required = false) String descripcion,
            @RequestParam(required = false) Integer orden) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(fotoService.create(sucursalId, archivo, descripcion, orden));
    }

    @GetMapping
    @Operation(summary = "Listar fotos de una sucursal ordenadas por campo orden")
    public ResponseEntity<List<FotoSucursalResponseDto>> listBySucursal(@PathVariable Long sucursalId) {
        return ResponseEntity.ok(fotoService.listBySucursal(sucursalId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar descripción u orden de una foto")
    public ResponseEntity<FotoSucursalResponseDto> update(
            @PathVariable Long sucursalId,
            @PathVariable Long id,
            @Valid @RequestBody UpdateFotoSucursalRequestDto request) {
        return ResponseEntity.ok(fotoService.update(sucursalId, id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar una foto de la sucursal")
    public ResponseEntity<Void> delete(
            @PathVariable Long sucursalId,
            @PathVariable Long id) {
        fotoService.delete(sucursalId, id);
        return ResponseEntity.noContent().build();
    }
}