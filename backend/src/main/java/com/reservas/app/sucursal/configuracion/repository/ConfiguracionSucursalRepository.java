package com.reservas.app.sucursal.configuracion.repository;

import com.reservas.app.sucursal.configuracion.entity.ConfiguracionSucursal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConfiguracionSucursalRepository extends JpaRepository<ConfiguracionSucursal, Long> {

    Optional<ConfiguracionSucursal> findBySucursalId(Long sucursalId);
}