package com.reservas.app.reserva.repository;

import com.reservas.app.reserva.entity.EstadoReserva;
import com.reservas.app.reserva.entity.Reserva;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface ReservaRepository extends JpaRepository<Reserva, Long>,
                                           JpaSpecificationExecutor<Reserva> {

    Optional<Reserva> findByCodigoReserva(String codigoReserva);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Reserva r JOIN FETCH r.sucursal WHERE r.codigoReserva = :codigoReserva")
    Optional<Reserva> findByCodigoReservaForUpdate(@Param("codigoReserva") String codigoReserva);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Reserva r JOIN FETCH r.sucursal WHERE r.id = :id")
    Optional<Reserva> findByIdForUpdate(@Param("id") Long id);

    List<Reserva> findBySucursalIdAndFechaReserva(Long sucursalId, LocalDate fecha);

    List<Reserva> findBySucursalIdAndEstado(Long sucursalId, EstadoReserva estado);

    List<Reserva> findByClienteId(Long clienteId);

    boolean existsByCodigoReserva(String codigoReserva);

    @Query("SELECT r FROM Reserva r WHERE r.sucursal.id = :sucursalId " +
           "AND r.fechaReserva BETWEEN :desde AND :hasta " +
           "AND r.estado IN ('PENDIENTE_PAGO', 'PENDIENTE_CONFIRMACION', 'CONFIRMADA')")
    List<Reserva> findActivasBySucursalAndFechaBetween(Long sucursalId, LocalDate desde, LocalDate hasta);

    @Query("SELECT COALESCE(SUM(r.cantPersonas), 0) FROM Reserva r " +
           "WHERE r.sucursal.id = :sucursalId AND r.fechaReserva = :fecha " +
           "AND r.horaReserva = :hora " +
           "AND r.estado IN ('PENDIENTE_PAGO', 'PENDIENTE_CONFIRMACION', 'CONFIRMADA')")
    Integer sumPersonasBySucursalFechaHora(Long sucursalId, LocalDate fecha, LocalTime hora);

    @Query("SELECT r.fechaReserva, r.horaReserva, SUM(r.cantPersonas) " +
           "FROM Reserva r WHERE r.sucursal.id = :sucursalId " +
           "AND r.fechaReserva BETWEEN :desde AND :hasta " +
           "AND r.estado IN ('PENDIENTE_PAGO', 'PENDIENTE_CONFIRMACION', 'CONFIRMADA') " +
           "GROUP BY r.fechaReserva, r.horaReserva")
    List<Object[]> sumPersonasGroupedByFechaHora(Long sucursalId, LocalDate desde, LocalDate hasta);
}
