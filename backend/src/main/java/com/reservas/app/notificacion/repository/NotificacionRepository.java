package com.reservas.app.notificacion.repository;

import com.reservas.app.notificacion.entity.EstadoNotificacion;
import com.reservas.app.notificacion.entity.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    List<Notificacion> findByClienteIdOrderByFechaCreacionDesc(Long clienteId);

    List<Notificacion> findBySucursalIdOrderByFechaCreacionDesc(Long sucursalId);

    List<Notificacion> findByReservaIdOrderByFechaCreacionDesc(Long reservaId);

    List<Notificacion> findByEstadoOrderByFechaCreacionAsc(EstadoNotificacion estado);

    long countByClienteIdAndEstado(Long clienteId, EstadoNotificacion estado);
}
