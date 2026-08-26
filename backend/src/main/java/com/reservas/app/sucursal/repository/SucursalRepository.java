package com.reservas.app.sucursal.repository;

import com.reservas.app.sucursal.entity.Sucursal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SucursalRepository extends JpaRepository<Sucursal, Long> {

    List<Sucursal> findByRestauranteIdAndActivaTrue(Long restauranteId);

    boolean existsByRestauranteIdAndSlug(Long restauranteId, String slug);

    Optional<Sucursal> findByRestauranteIdAndEsPrincipalTrue(Long restauranteId);

    long countByRestauranteId(Long restauranteId);

    boolean existsByIdAndRestauranteId(Long id, Long restauranteId);
}
