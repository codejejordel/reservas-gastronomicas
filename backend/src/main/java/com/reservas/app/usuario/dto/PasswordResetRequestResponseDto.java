package com.reservas.app.usuario.dto;

import java.util.UUID;

public record PasswordResetRequestResponseDto(UUID challengeId) {
}
