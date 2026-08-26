package com.reservas.app.reserva.asignacion.repository;

import com.reservas.app.reserva.asignacion.entity.AsignacionMesa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AsignacionMesaRepository extends JpaRepository<AsignacionMesa, Long> {

    List<AsignacionMesa> findByReservaIdAndActivaTrue(Long reservaId);

    boolean existsByReservaIdAndMesaIdAndActivaTrue(Long reservaId, Long mesaId);
}
