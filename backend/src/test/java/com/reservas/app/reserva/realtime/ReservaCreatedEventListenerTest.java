package com.reservas.app.reserva.realtime;

import com.reservas.app.reserva.entity.EstadoReserva;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.mockito.ArgumentCaptor;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class ReservaCreatedEventListenerTest {

    @Test
    void springContextInstantiatesListenerWithMessagingTemplate() {
        SimpMessagingTemplate messagingTemplate = mock(SimpMessagingTemplate.class);

        try (AnnotationConfigApplicationContext context = new AnnotationConfigApplicationContext()) {
            context.registerBean(SimpMessagingTemplate.class, () -> messagingTemplate);
            context.register(ReservaCreatedEventListener.class);
            context.refresh();

            assertThat(context.getBean(ReservaCreatedEventListener.class)).isNotNull();
        }
    }

    @ParameterizedTest
    @CsvSource({
            "2026-08-27, Nueva reserva para hoy",
            "2026-08-28, Nueva reserva para mañana",
            "2026-09-02, Nueva reserva para 02/09"
    })
    void sendsAfterCommitPayloadToBranchTopicUsingBranchTimezoneWording(
            LocalDate reservationDate, String expectedTitle) {
        SimpMessagingTemplate messagingTemplate = mock(SimpMessagingTemplate.class);
        Clock clock = Clock.fixed(Instant.parse("2026-08-27T03:30:00Z"), ZoneOffset.UTC);
        ReservaCreatedEventListener listener = new ReservaCreatedEventListener(messagingTemplate, clock);
        ReservaCreatedEvent event = new ReservaCreatedEvent(
                UUID.randomUUID(), 41L, "RES-260828-ABCD", 3L, 7L, "Palermo",
                "America/Argentina/Buenos_Aires", reservationDate,
                LocalTime.of(20, 30), 4, EstadoReserva.CONFIRMADA, "Ana Pérez",
                Instant.parse("2026-08-27T03:30:00Z"));

        listener.onReservationCreated(event);

        ArgumentCaptor<ReservaCreatedMessage> message = ArgumentCaptor.forClass(ReservaCreatedMessage.class);
        verify(messagingTemplate).convertAndSend(
                org.mockito.ArgumentMatchers.eq("/topic/restaurantes/3/sucursales/7/reservas"),
                message.capture());
        assertThat(message.getValue().title()).isEqualTo(expectedTitle);
        assertThat(message.getValue().clienteNombre()).isEqualTo("Ana Pérez");
    }
}
