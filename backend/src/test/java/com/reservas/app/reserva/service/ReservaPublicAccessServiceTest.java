package com.reservas.app.reserva.service;

import com.reservas.app.reserva.dto.ReservaPublicStatusDto;
import com.reservas.app.reserva.entity.EstadoReserva;
import com.reservas.app.reserva.entity.Reserva;
import com.reservas.app.reserva.pago.entity.EstadoPago;
import com.reservas.app.reserva.pago.entity.Pago;
import com.reservas.app.reserva.pago.repository.PagoRepository;
import com.reservas.app.reserva.repository.ReservaRepository;
import com.reservas.app.sucursal.configuracion.entity.ConfiguracionSucursal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReservaPublicAccessServiceTest {

    private static final Instant NOW = Instant.parse("2026-08-28T18:00:00Z");
    private static final String CODE = "RES-260828-ABCD";

    @Mock private ReservaRepository reservaRepository;
    @Mock private PagoRepository pagoRepository;

    private ReservaPublicAccessService service;
    private Reserva reserva;
    private String token;

    @BeforeEach
    void setUp() {
        service = new ReservaPublicAccessService(
                reservaRepository, pagoRepository, Clock.fixed(NOW, ZoneOffset.UTC));
        reserva = new Reserva();
        reserva.setId(41L);
        reserva.setCodigoReserva(CODE);
        reserva.setEstado(EstadoReserva.PENDIENTE_PAGO);
        reserva.setFechaReserva(LocalDate.of(2026, 8, 30));
        reserva.setHoraReserva(LocalTime.of(21, 0));
        reserva.setCantPersonas(4);

        ConfiguracionSucursal config = new ConfiguracionSucursal();
        config.setMinutosLockPago(10);
        token = service.initialize(reserva, config);
    }

    @Test
    void initializesOpaqueCapabilityWithoutPersistingRawToken() {
        assertThat(token).matches("^[A-Za-z0-9_-]{43}$");
        assertThat(reserva.getPublicAccessTokenHash()).matches("^[0-9a-f]{64}$");
        assertThat(reserva.getPublicAccessTokenHash()).doesNotContain(token);
        assertThat(reserva.getFechaLimitePago()).isEqualTo("2026-08-28T18:10:00");
    }

    @Test
    void rejectsInvalidCapabilityBeforeReadingPaymentData() {
        when(reservaRepository.findByCodigoReservaForUpdate(CODE)).thenReturn(Optional.of(reserva));

        assertThatThrownBy(() -> service.getStatus(CODE, "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND));

        verifyNoInteractions(pagoRepository);
        verify(reservaRepository, never()).save(reserva);
    }

    @Test
    void rejectsMissingCapabilityHashBeforeReadingPaymentData() {
        reserva.setPublicAccessTokenHash(null);
        when(reservaRepository.findByCodigoReservaForUpdate(CODE)).thenReturn(Optional.of(reserva));

        assertThatThrownBy(() -> service.getStatus(CODE, token))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND));

        verifyNoInteractions(pagoRepository);
        verify(reservaRepository, never()).save(reserva);
    }

    @Test
    void returnsOnlyCustomerSafeStatusAndContinuationDecision() {
        when(reservaRepository.findByCodigoReservaForUpdate(CODE)).thenReturn(Optional.of(reserva));
        when(pagoRepository.findByReservaId(41L)).thenReturn(Optional.empty());

        ReservaPublicStatusDto status = service.getStatus(CODE, token);

        assertThat(status.getCodigoReserva()).isEqualTo(CODE);
        assertThat(status.getEstado()).isEqualTo(EstadoReserva.PENDIENTE_PAGO);
        assertThat(status.getFechaReserva()).isEqualTo(LocalDate.of(2026, 8, 30));
        assertThat(status.getHoraReserva()).isEqualTo(LocalTime.of(21, 0));
        assertThat(status.getCantPersonas()).isEqualTo(4);
        assertThat(status.getEstadoPago()).isNull();
        assertThat(status.isPuedeContinuarPago()).isTrue();
    }

    @Test
    void expiresReservationAndPendingPaymentOnAccessAfterDeadline() {
        reserva.setFechaLimitePago(LocalDateTime.ofInstant(NOW, ZoneOffset.UTC));
        Pago pago = new Pago();
        pago.setReserva(reserva);
        pago.setEstado(EstadoPago.PENDIENTE);
        when(reservaRepository.findByCodigoReservaForUpdate(CODE)).thenReturn(Optional.of(reserva));
        when(pagoRepository.findByReservaId(41L)).thenReturn(Optional.of(pago));

        ReservaPublicStatusDto status = service.getStatus(CODE, token);

        assertThat(status.getEstado()).isEqualTo(EstadoReserva.EXPIRADA);
        assertThat(status.getEstadoPago()).isEqualTo(EstadoPago.EXPIRADO);
        assertThat(status.isPuedeContinuarPago()).isFalse();
        verify(reservaRepository).save(reserva);
        verify(pagoRepository).save(pago);
    }
}
