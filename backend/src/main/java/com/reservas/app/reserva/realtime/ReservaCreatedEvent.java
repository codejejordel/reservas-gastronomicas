package com.reservas.app.reserva.realtime;

import com.reservas.app.reserva.entity.EstadoReserva;
import com.reservas.app.reserva.entity.Reserva;
import com.reservas.app.sucursal.entity.Sucursal;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record ReservaCreatedEvent(
        UUID eventId,
        Long reservaId,
        String codigoReserva,
        Long restauranteId,
        Long sucursalId,
        String sucursalNombre,
        String zonaHoraria,
        LocalDate fechaReserva,
        LocalTime horaReserva,
        Integer cantPersonas,
        EstadoReserva estado,
        String clienteNombre,
        Instant occurredAt
) {
    public static ReservaCreatedEvent from(Reserva reserva) {
        Sucursal sucursal = reserva.getSucursal();
        String clienteNombre = reserva.getCliente() != null
                ? reserva.getCliente().getNombreCompleto()
                : reserva.getNombreInvitado();
        return new ReservaCreatedEvent(
                UUID.randomUUID(),
                reserva.getId(),
                reserva.getCodigoReserva(),
                sucursal.getRestaurante().getId(),
                sucursal.getId(),
                sucursal.getNombre(),
                sucursal.getZonaHoraria(),
                reserva.getFechaReserva(),
                reserva.getHoraReserva(),
                reserva.getCantPersonas(),
                reserva.getEstado(),
                clienteNombre,
                Instant.now());
    }
}
