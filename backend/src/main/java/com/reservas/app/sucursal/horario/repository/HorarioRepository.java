package com.reservas.app.sucursal.horario.repository;

import com.reservas.app.sucursal.horario.entity.DiaSemana;
import com.reservas.app.sucursal.horario.entity.Horario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HorarioRepository extends JpaRepository<Horario, Long> {

    List<Horario> findBySucursalIdAndActivoTrueOrderByDiaSemanaAscOrdenTurnoAsc(Long sucursalId);

    List<Horario> findBySucursalIdAndDiaSemanaAndActivoTrueOrderByOrdenTurnoAsc(Long sucursalId, DiaSemana diaSemana);

    Optional<Horario> findBySucursalIdAndDiaSemanaAndOrdenTurno(Long sucursalId, DiaSemana diaSemana, Integer ordenTurno);

    boolean existsBySucursalIdAndDiaSemanaAndOrdenTurno(Long sucursalId, DiaSemana diaSemana, Integer ordenTurno);

    boolean existsBySucursalIdAndDiaSemanaAndOrdenTurnoAndIdNot(Long sucursalId, DiaSemana diaSemana, Integer ordenTurno, Long id);
}