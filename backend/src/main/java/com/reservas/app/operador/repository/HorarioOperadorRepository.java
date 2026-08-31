package com.reservas.app.operador.repository;

import com.reservas.app.operador.entity.HorarioOperador;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HorarioOperadorRepository extends JpaRepository<HorarioOperador, Long> {

    List<HorarioOperador> findByOperadorIdAndActivoTrueOrderByDiaSemanaAscOrdenTurnoAsc(Long operadorId);

    void deleteByOperadorId(Long operadorId);
}
