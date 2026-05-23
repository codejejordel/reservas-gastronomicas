package com.reservas.app.mesa.repository;

import com.reservas.app.mesa.entity.EstadoMesa;
import com.reservas.app.mesa.entity.Mesa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MesaRepository extends JpaRepository<Mesa, Long> {

    List<Mesa> findBySucursalIdAndActivaTrue(Long sucursalId);

    List<Mesa> findBySucursalIdAndEstadoAndActivaTrue(Long sucursalId, EstadoMesa estado);

    boolean existsBySucursalIdAndNombre(Long sucursalId, String nombre);
}
