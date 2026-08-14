package com.reservas.app.sucursal.foto.repository;

import com.reservas.app.sucursal.foto.entity.FotoSucursal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FotoSucursalRepository extends JpaRepository<FotoSucursal, Long> {

    List<FotoSucursal> findBySucursalIdOrderByOrdenAsc(Long sucursalId);

    long countBySucursalId(Long sucursalId);
}
