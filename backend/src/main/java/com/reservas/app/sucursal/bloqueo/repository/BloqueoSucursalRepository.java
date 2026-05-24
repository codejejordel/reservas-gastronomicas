package com.reservas.app.sucursal.bloqueo.repository;

import com.reservas.app.sucursal.bloqueo.entity.BloqueoSucursal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BloqueoSucursalRepository extends JpaRepository<BloqueoSucursal, Long> {

    List<BloqueoSucursal> findBySucursalIdOrderByFechaInicioAsc(Long sucursalId);

    @Query("SELECT b FROM BloqueoSucursal b WHERE b.sucursal.id = :sucursalId AND b.fechaFin >= :hoy ORDER BY b.fechaInicio ASC")
    List<BloqueoSucursal> findVigentesBySucursalId(@Param("sucursalId") Long sucursalId, @Param("hoy") LocalDate hoy);

    @Query("SELECT COUNT(b) > 0 FROM BloqueoSucursal b WHERE b.sucursal.id = :sucursalId AND b.fechaInicio <= :fecha AND b.fechaFin >= :fecha")
    boolean existsBloqueoEnFecha(@Param("sucursalId") Long sucursalId, @Param("fecha") LocalDate fecha);
}
