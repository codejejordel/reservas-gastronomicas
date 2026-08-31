package com.reservas.app.sucursal.usuario.repository;

import com.reservas.app.sucursal.usuario.entity.UsuarioSucursal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioSucursalRepository extends JpaRepository<UsuarioSucursal, Long> {

    Optional<UsuarioSucursal> findByUsuarioIdAndActivoTrue(Long usuarioId);

    List<UsuarioSucursal> findBySucursalIdAndActivoTrue(Long sucursalId);
}
