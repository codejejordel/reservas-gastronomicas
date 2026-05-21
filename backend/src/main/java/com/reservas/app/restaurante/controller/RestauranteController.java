package com.reservas.app.restaurante.controller;

import com.reservas.app.restaurante.dto.CreateRestauranteRequestDto;
import com.reservas.app.restaurante.dto.RestauranteResponseDto;
import com.reservas.app.restaurante.dto.UpdateRestauranteRequestDto;
import com.reservas.app.restaurante.service.RestauranteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<RestauranteResponseDto> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRestauranteRequestDto request) {
        return ResponseEntity.ok(restauranteService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Desactivar restaurante (soft delete)")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        restauranteService.delete(id);
        return ResponseEntity.noContent().build();
    }
}