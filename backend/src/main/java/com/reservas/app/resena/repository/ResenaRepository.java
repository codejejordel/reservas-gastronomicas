package com.reservas.app.resena.repository;

import com.reservas.app.resena.entity.Resena;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ResenaRepository extends JpaRepository<Resena, Long> {

    List<Resena> findBySucursalIdOrderByFechaCreacionDesc(Long sucursalId);

    List<Resena> findBySucursalIdAndAprobadaTrueOrderByFechaCreacionDesc(Long sucursalId);

    List<Resena> findByClienteIdOrderByFechaCreacionDesc(Long clienteId);

    Optional<Resena> findBySucursalIdAndClienteId(Long sucursalId, Long clienteId);

    @Query("SELECT COALESCE(AVG(r.puntuacion), 0) FROM Resena r WHERE r.sucursal.id = :sucursalId AND r.aprobada = true")
    Double calcularPromedioSucursal(@Param("sucursalId") Long sucursalId);

    @Query("SELECT COUNT(r) FROM Resena r WHERE r.sucursal.id = :sucursalId AND r.aprobada = true")
    long contarAprobadasSucursal(@Param("sucursalId") Long sucursalId);

    @Query("SELECT COALESCE(AVG(r.puntuacion), 0) FROM Resena r WHERE r.sucursal.restaurante.id = :restauranteId AND r.aprobada = true")
    Double calcularPromedioRestaurante(@Param("restauranteId") Long restauranteId);

    @Query("SELECT COUNT(r) FROM Resena r WHERE r.sucursal.restaurante.id = :restauranteId AND r.aprobada = true")
    long contarAprobadasRestaurante(@Param("restauranteId") Long restauranteId);
}
