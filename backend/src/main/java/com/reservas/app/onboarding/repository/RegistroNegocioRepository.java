package com.reservas.app.onboarding.repository;

import com.reservas.app.onboarding.entity.RegistroNegocio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RegistroNegocioRepository extends JpaRepository<RegistroNegocio, Long> {

    Optional<RegistroNegocio> findByUsuarioId(Long usuarioId);

    boolean existsByUsuarioId(Long usuarioId);
}
