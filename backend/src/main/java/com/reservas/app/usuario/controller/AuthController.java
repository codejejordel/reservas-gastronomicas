package com.reservas.app.usuario.controller;

import com.reservas.app.usuario.dto.GoogleAuthRequestDto;
import com.reservas.app.usuario.dto.LoginRequestDto;
import com.reservas.app.usuario.dto.LoginResponseDto;
import com.reservas.app.usuario.dto.PasswordResetConfirmRequestDto;
import com.reservas.app.usuario.dto.PasswordResetRequestDto;
import com.reservas.app.usuario.dto.PasswordResetRequestResponseDto;
import com.reservas.app.usuario.dto.PasswordResetVerifyRequestDto;
import com.reservas.app.usuario.dto.PasswordResetVerifyResponseDto;
import com.reservas.app.usuario.service.PasswordResetService;
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
    private final PasswordResetService passwordResetService;

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

    @PostMapping("/password-reset/request")
    @Operation(summary = "Solicita un código de recuperación")
    public ResponseEntity<PasswordResetRequestResponseDto> requestPasswordReset(@Valid @RequestBody PasswordResetRequestDto request) {
        return ResponseEntity.ok(passwordResetService.request(request.getEmail()));
    }

    @PostMapping("/password-reset/verify")
    @Operation(summary = "Verifica un código de recuperación")
    public ResponseEntity<PasswordResetVerifyResponseDto> verifyPasswordReset(@Valid @RequestBody PasswordResetVerifyRequestDto request) {
        return ResponseEntity.ok(passwordResetService.verify(request.getChallengeId(), request.getCode()));
    }

    @PostMapping("/password-reset/confirm")
    @Operation(summary = "Actualiza la contraseña recuperada")
    public ResponseEntity<Void> confirmPasswordReset(@Valid @RequestBody PasswordResetConfirmRequestDto request) {
        passwordResetService.confirm(request);
        return ResponseEntity.noContent().build();
    }
}
