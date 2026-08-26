package com.reservas.app.usuario.repository;

import com.reservas.app.usuario.entity.PasswordResetChallenge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PasswordResetChallengeRepository extends JpaRepository<PasswordResetChallenge, Long> {

    Optional<PasswordResetChallenge> findByPublicId(UUID publicId);

    Optional<PasswordResetChallenge> findByResetTokenHash(String resetTokenHash);
}
