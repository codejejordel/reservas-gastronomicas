package com.reservas.app.reserva.pago.repository;

import com.reservas.app.reserva.pago.entity.Pago;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PagoRepository extends JpaRepository<Pago, Long> {

    Optional<Pago> findByReservaId(Long reservaId);

    boolean existsByReservaId(Long reservaId);
}
