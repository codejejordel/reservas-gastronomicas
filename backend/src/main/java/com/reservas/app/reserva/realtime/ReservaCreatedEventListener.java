package com.reservas.app.reserva.realtime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Component
public class ReservaCreatedEventListener {

    private static final DateTimeFormatter SHORT_DATE = DateTimeFormatter.ofPattern("dd/MM");

    private final SimpMessagingTemplate messagingTemplate;
    private final Clock clock;

    @Autowired
    public ReservaCreatedEventListener(SimpMessagingTemplate messagingTemplate) {
        this(messagingTemplate, Clock.systemUTC());
    }

    ReservaCreatedEventListener(SimpMessagingTemplate messagingTemplate, Clock clock) {
        this.messagingTemplate = messagingTemplate;
        this.clock = clock;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onReservationCreated(ReservaCreatedEvent event) {
        String destination = "/topic/restaurantes/%d/sucursales/%d/reservas"
                .formatted(event.restauranteId(), event.sucursalId());
        messagingTemplate.convertAndSend(destination, toMessage(event));
    }

    private ReservaCreatedMessage toMessage(ReservaCreatedEvent event) {
        LocalDate branchToday = LocalDate.now(clock.withZone(ZoneId.of(event.zonaHoraria())));
        String dateLabel;
        if (event.fechaReserva().equals(branchToday)) {
            dateLabel = "hoy";
        } else if (event.fechaReserva().equals(branchToday.plusDays(1))) {
            dateLabel = "mañana";
        } else {
            dateLabel = event.fechaReserva().format(SHORT_DATE);
        }

        return new ReservaCreatedMessage(
                event.eventId(), event.reservaId(), event.codigoReserva(), event.restauranteId(),
                event.sucursalId(), event.sucursalNombre(), "Nueva reserva para " + dateLabel,
                event.fechaReserva(), event.horaReserva(), event.cantPersonas(), event.estado(),
                event.clienteNombre(), event.occurredAt());
    }
}
