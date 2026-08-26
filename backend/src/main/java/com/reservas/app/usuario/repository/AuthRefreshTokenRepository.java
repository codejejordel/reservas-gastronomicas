package com.reservas.app.usuario.repository;

import com.reservas.app.usuario.entity.AuthRefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface AuthRefreshTokenRepository extends JpaRepository<AuthRefreshToken, Long> {

    Optional<AuthRefreshToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query("update AuthRefreshToken token set token.revokedAt = :now where token.usuario.id = :usuarioId and token.revokedAt is null")
    void revokeAllByUsuarioId(@Param("usuarioId") Long usuarioId, @Param("now") LocalDateTime now);
}
