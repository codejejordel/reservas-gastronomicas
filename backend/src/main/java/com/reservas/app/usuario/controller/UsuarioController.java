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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/usuario")
@RequiredArgsConstructor
@Tag(name = "Usuario")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @PostMapping
    @Operation(summary = "Crear nuevo usuario desde el back office")
    public ResponseEntity<UsuarioResponseDto> create(@Valid @RequestBody RegistroRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.createUser(request));
    }
}