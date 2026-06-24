package com.reservas.app.onboarding.controller;

import com.reservas.app.onboarding.dto.OnboardingStatusResponseDto;
import com.reservas.app.onboarding.dto.OnboardingUpdateRequestDto;
import com.reservas.app.onboarding.service.OnboardingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.reservas.app.usuario.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/onboarding")
@RequiredArgsConstructor
public class OnboardingController {

    private final OnboardingService onboardingService;
    private final UsuarioRepository usuarioRepository;

    @GetMapping("/status")
    public ResponseEntity<OnboardingStatusResponseDto> getStatus(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long usuarioId = resolveUsuarioId(userDetails);
        return ResponseEntity.ok(onboardingService.getStatus(usuarioId));
    }

    @PutMapping
    public ResponseEntity<OnboardingStatusResponseDto> saveOrUpdate(@AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody OnboardingUpdateRequestDto request) {
        Long usuarioId = resolveUsuarioId(userDetails);
        return ResponseEntity.ok(onboardingService.saveOrUpdate(usuarioId, request));
    }

    private Long resolveUsuarioId(UserDetails userDetails) {
        return usuarioRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"))
                .getId();
    }
}
