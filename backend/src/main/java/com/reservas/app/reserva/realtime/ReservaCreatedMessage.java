package com.reservas.app.reserva.realtime;

import com.reservas.app.reserva.entity.EstadoReserva;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

public record ReservaCreatedMessage(
        UUID eventId,
        Long reservaId,
        String codigoReserva,
        Long restauranteId,
        Long sucursalId,
        String sucursalNombre,
        String title,
        LocalDate fechaReserva,
        LocalTime horaReserva,
        Integer cantPersonas,
        EstadoReserva estado,
        String clienteNombre,
        Instant occurredAt
) {
}
