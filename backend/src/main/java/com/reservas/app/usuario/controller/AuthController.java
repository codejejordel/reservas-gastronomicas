package com.reservas.app.usuario.controller;

import com.reservas.app.usuario.dto.GoogleAuthRequestDto;
import com.reservas.app.usuario.dto.LoginRequestDto;
import com.reservas.app.usuario.dto.LoginResponseDto;
import com.reservas.app.usuario.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación")
public class AuthController {

    private final UsuarioService usuarioService;

    @PostMapping("/login")
    @Operation(summary = "Login de usuario, retorna JWT Bearer token")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
        return ResponseEntity.ok(usuarioService.login(request));
    }

    @PostMapping("/google")
    @Operation(summary = "Login o registro con Google, retorna JWT Bearer token")
    public ResponseEntity<LoginResponseDto> googleAuth(@Valid @RequestBody GoogleAuthRequestDto request) {
        return ResponseEntity.ok(usuarioService.loginWithGoogle(request.getIdToken()));
    }
}