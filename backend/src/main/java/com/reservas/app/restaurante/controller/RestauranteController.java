package com.reservas.app.restaurante.controller;

import com.reservas.app.restaurante.dto.CreateRestauranteRequestDto;
import com.reservas.app.restaurante.dto.DisponibilidadResponseDto;
import com.reservas.app.restaurante.dto.RestauranteResponseDto;
import com.reservas.app.restaurante.dto.UpdateRestauranteRequestDto;
import com.reservas.app.restaurante.service.RestauranteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/restaurante")
@RequiredArgsConstructor
@Tag(name = "Restaurante")
public class RestauranteController {

    private final RestauranteService restauranteService;

    @PostMapping
    @Operation(summary = "Crear un restaurante (al finalizar el wizard de setup)")
    public ResponseEntity<RestauranteResponseDto> create(@Valid @RequestBody CreateRestauranteRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(restauranteService.create(request));
    }

    @GetMapping
    @Operation(summary = "Listar todos los restaurantes activos")
    public ResponseEntity<List<RestauranteResponseDto>> listActivos() {
        return ResponseEntity.ok(restauranteService.listActivos());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener restaurante por ID")
    public ResponseEntity<RestauranteResponseDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(restauranteService.getById(id));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Obtener restaurante por slug público")
    public ResponseEntity<RestauranteResponseDto> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(restauranteService.getBySlug(slug));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar datos o branding del restaurante")
    public ResponseEntity<RestauranteResponseDto> update(@PathVariable Long id,
                                                         @Valid @RequestBody UpdateRestauranteRequestDto request) {
        return ResponseEntity.ok(restauranteService.update(id, request));
    }

    @GetMapping("/validar/nombre")
    @Operation(summary = "Verificar disponibilidad de nombre de la empresa",
               description = "Retorna cuando esté disponible `disponible: true`. Pasar `idRestaurante` si es una edicion, para ignorar el propio registro.")
    public ResponseEntity<DisponibilidadResponseDto> checkNombrePublico(
            @RequestParam String valor,
            @RequestParam(required = false) Long idRestaurante) {
        return ResponseEntity.ok(restauranteService.checkNombrePublico(valor, idRestaurante));
    }

    @GetMapping("/validar/slug")
    @Operation(summary = "Verificar disponibilidad de slug público",
               description = "Retorna `disponible: true` si el slug no está en uso. Pasar `idRestaurante` al editar para ignorar el propio registro.")
    public ResponseEntity<DisponibilidadResponseDto> checkSlug(
            @RequestParam String valor,
            @RequestParam(required = false) Long idRestaurante) {
        return ResponseEntity.ok(restauranteService.checkSlug(valor, idRestaurante));
    }

    @GetMapping("/validar/cuit")
    @Operation(summary = "Verificar disponibilidad de CUIT",
               description = "Retorna `disponible: true` si el CUIT no está en uso. Pasar `excludeId` al editar para ignorar el propio registro.")
    public ResponseEntity<DisponibilidadResponseDto> checkCuit(
            @RequestParam String valor,
            @RequestParam(required = false) Long excludeId) {
        return ResponseEntity.ok(restauranteService.checkCuit(valor, excludeId));
    }

    @PreAuthorize("hasRole('SUPER_ADMIN','ADMIN_RESTAURANTE')")
    @DeleteMapping("/{id}")
    @Operation(summary = "Desactivar restaurante (soft delete)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        restauranteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}