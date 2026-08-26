package com.reservas.app.usuario.service;

import com.reservas.app.usuario.dto.PasswordResetConfirmRequestDto;
import com.reservas.app.usuario.dto.PasswordResetRequestResponseDto;
import com.reservas.app.usuario.dto.PasswordResetVerifyResponseDto;
import com.reservas.app.usuario.entity.PasswordResetChallenge;
import com.reservas.app.usuario.entity.Usuario;
import com.reservas.app.usuario.repository.AuthRefreshTokenRepository;
import com.reservas.app.usuario.repository.PasswordResetChallengeRepository;
import com.reservas.app.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private final UsuarioRepository usuarioRepository;
    private final PasswordResetChallengeRepository challengeRepository;
    private final AuthRefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.auth.password-reset.expiration-minutes:10}")
    private long expirationMinutes;

    @Transactional
    public PasswordResetRequestResponseDto request(String email) {
        UUID publicId = UUID.randomUUID();
        usuarioRepository.findByEmailIgnoreCase(email.trim())
                .filter(Usuario::getActivo)
                .ifPresent(usuario -> {
                    PasswordResetChallenge challenge = new PasswordResetChallenge();
                    challenge.setPublicId(publicId);
                    challenge.setUsuario(usuario);
                    challenge.setCodeHash(passwordEncoder.encode("123456"));
                    challenge.setExpiresAt(LocalDateTime.now().plusMinutes(expirationMinutes));
                    challengeRepository.save(challenge);
                });
        return new PasswordResetRequestResponseDto(publicId);
    }

    @Transactional
    public PasswordResetVerifyResponseDto verify(UUID publicId, String code) {
        PasswordResetChallenge challenge = challengeRepository.findByPublicId(publicId)
                .orElseThrow(this::invalidCode);
        if (challenge.getUsedAt() != null || challenge.getExpiresAt().isBefore(LocalDateTime.now()) || challenge.getAttempts() >= 5) {
            throw invalidCode();
        }
        if (!passwordEncoder.matches(code, challenge.getCodeHash())) {
            challenge.setAttempts(challenge.getAttempts() + 1);
            challengeRepository.save(challenge);
            throw invalidCode();
        }
        byte[] token = new byte[32];
        RANDOM.nextBytes(token);
        String rawToken = HexFormat.of().formatHex(token);
        challenge.setVerifiedAt(LocalDateTime.now());
        challenge.setResetTokenHash(hash(rawToken));
        challengeRepository.save(challenge);
        return new PasswordResetVerifyResponseDto(rawToken);
    }

    @Transactional
    public void confirm(PasswordResetConfirmRequestDto request) {
        PasswordResetChallenge challenge = challengeRepository.findByResetTokenHash(hash(request.getResetToken()))
                .orElseThrow(this::invalidCode);
        if (challenge.getUsedAt() != null || challenge.getVerifiedAt() == null || challenge.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw invalidCode();
        }
        Usuario usuario = challenge.getUsuario();
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setAuthVersion(usuario.getAuthVersion() + 1);
        challenge.setUsedAt(LocalDateTime.now());
        refreshTokenRepository.revokeAllByUsuarioId(usuario.getId(), LocalDateTime.now());
        usuarioRepository.save(usuario);
        challengeRepository.save(challenge);
    }

    private ResponseStatusException invalidCode() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "El código es inválido o venció");
    }

    private String hash(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo proteger el token", e);
        }
    }
}
