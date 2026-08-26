package com.reservas.app.usuario.controller;

import com.reservas.app.usuario.dto.RegistroRequestDto;
import com.reservas.app.usuario.dto.UsuarioResponseDto;
import com.reservas.app.usuario.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuario")
@RequiredArgsConstructor
@Tag(name = "Usuario")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @PostMapping
    @Operation(summary = "Registrar administrador de restaurante")
    public ResponseEntity<UsuarioResponseDto> create(@Valid @RequestBody RegistroRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.createUser(request));
    }

    @GetMapping
    @Operation(summary = "Listado de todos los usuarios")
    public ResponseEntity<List<UsuarioResponseDto>> getUsuarios() {
        return ResponseEntity.ok(usuarioService.list());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener usuario por ID")
    public ResponseEntity<UsuarioResponseDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.getById(id));
    }

    @GetMapping("/dni/{dni}")
    @Operation(summary = "Obtener usuario por DNI")
    public ResponseEntity<UsuarioResponseDto> getByDni(@PathVariable String dni) {
        return ResponseEntity.ok(usuarioService.getByDni(dni));
    }

    @PatchMapping("/{id}/onboarding")
    @Operation(summary = "Marcar onboarding como completado")
    public ResponseEntity<UsuarioResponseDto> completarOnboarding(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.completarOnboarding(id));
    }
}
