package com.reservas.app.reserva.repository;

import com.reservas.app.reserva.entity.EstadoReserva;
import com.reservas.app.reserva.entity.Reserva;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface ReservaRepository extends JpaRepository<Reserva, Long>,
                                           JpaSpecificationExecutor<Reserva> {

    Optional<Reserva> findByCodigoReserva(String codigoReserva);

    List<Reserva> findBySucursalIdAndFechaReserva(Long sucursalId, LocalDate fecha);

    List<Reserva> findBySucursalIdAndEstado(Long sucursalId, EstadoReserva estado);

    List<Reserva> findByClienteId(Long clienteId);

    boolean existsByCodigoReserva(String codigoReserva);
}
