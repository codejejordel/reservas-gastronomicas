package com.reservas.app.reserva.pago.service;

import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.core.MPRequestOptions;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.preference.Preference;
import com.mercadopago.resources.payment.Payment;
import com.reservas.app.reserva.dto.CotizacionReservaResponseDto;
import com.reservas.app.reserva.entity.EstadoReserva;
import com.reservas.app.reserva.entity.Reserva;
import com.reservas.app.reserva.pago.dto.PagoResponseDto;
import com.reservas.app.reserva.pago.dto.PagoReturnResponseDto;
import com.reservas.app.reserva.pago.entity.EstadoPago;
import com.reservas.app.reserva.pago.entity.Pago;
import com.reservas.app.reserva.pago.repository.PagoRepository;
import com.reservas.app.reserva.repository.ReservaRepository;
import com.reservas.app.reserva.service.CotizacionReservaService;
import com.reservas.app.sucursal.configuracion.entity.ConfiguracionSucursal;
import com.reservas.app.sucursal.configuracion.repository.ConfiguracionSucursalRepository;
import com.reservas.app.sucursal.entity.Sucursal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.HexFormat;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PagoServiceTest {

    private static final String CODIGO = "RSV-A1B2C3D4";
    private static final Instant AHORA = Instant.parse("2026-08-24T15:00:00Z");

    @Mock
    private PagoRepository pagoRepository;
    @Mock
    private ReservaRepository reservaRepository;
    @Mock
    private CotizacionReservaService cotizacionReservaService;
    @Mock
    private ConfiguracionSucursalRepository configuracionRepository;
    @Mock
    private PreferenceClient preferenceClient;
    @Mock
    private PaymentClient paymentClient;
    @Mock
    private Preference preference;
    @Mock
    private Payment payment;

    private PagoService service;
    private Reserva reserva;
    private ConfiguracionSucursal configuracion;

    @BeforeEach
    void setUp() {
        service = new PagoService(
                pagoRepository,
                reservaRepository,
                cotizacionReservaService,
                configuracionRepository,
                preferenceClient,
                paymentClient,
                Clock.fixed(AHORA, ZoneOffset.UTC));
        ReflectionTestUtils.setField(service, "globalMpAccessToken", " TEST-global-token ");
        ReflectionTestUtils.setField(service, "globalMpCollectorId", "123456");
        ReflectionTestUtils.setField(service, "webhookBaseUrl", "http://localhost:8080/api");
        ReflectionTestUtils.setField(service, "frontendUrl", "http://localhost:3000");

        Sucursal sucursal = new Sucursal();
        sucursal.setId(7L);

        reserva = new Reserva();
        reserva.setId(41L);
        reserva.setCodigoReserva(CODIGO);
        reserva.setSucursal(sucursal);
        reserva.setCantPersonas(3);
        reserva.setEstado(EstadoReserva.PENDIENTE_PAGO);

        configuracion = new ConfiguracionSucursal();
        configuracion.setMinutosLockPago(10);
    }

    @Test
    void createsPreferenceWithAuthoritativeAmountExpiryAndProviderFields() throws Exception {
        stubCreationInputs();
        when(preference.getId()).thenReturn("pref-123");
        when(preference.getInitPoint()).thenReturn("https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref-123");
        when(preferenceClient.create(any(PreferenceRequest.class), any(MPRequestOptions.class)))
                .thenReturn(preference);
        when(pagoRepository.save(any(Pago.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PagoResponseDto response = service.crearOReutilizarPreferencia(CODIGO);

        ArgumentCaptor<PreferenceRequest> requestCaptor = ArgumentCaptor.forClass(PreferenceRequest.class);
        ArgumentCaptor<MPRequestOptions> optionsCaptor = ArgumentCaptor.forClass(MPRequestOptions.class);
        verify(preferenceClient).create(requestCaptor.capture(), optionsCaptor.capture());
        PreferenceRequest request = requestCaptor.getValue();

        assertThat(optionsCaptor.getValue().getAccessToken()).isEqualTo("TEST-global-token");
        assertThat(request.getExternalReference()).isEqualTo(CODIGO);
        assertThat(request.getAutoReturn()).isEqualTo("approved");
        assertThat(request.getExpires()).isTrue();
        assertThat(request.getExpirationDateFrom()).isEqualTo("2026-08-24T15:00Z");
        assertThat(request.getExpirationDateTo()).isEqualTo("2026-08-24T15:10Z");
        assertThat(request.getItems()).singleElement().satisfies(item -> {
            assertThat(item.getTitle()).isEqualTo("Pago de reserva " + CODIGO);
            assertThat(item.getCurrencyId()).isEqualTo("ARS");
            assertThat(item.getQuantity()).isEqualTo(1);
            assertThat(item.getUnitPrice()).isEqualByComparingTo("3500.00");
        });
        assertThat(request.getBackUrls().getSuccess())
                .isEqualTo("http://localhost:3000/reserva/RSV-A1B2C3D4/pago-exitoso");
        assertThat(request.getBackUrls().getFailure())
                .isEqualTo("http://localhost:3000/reserva/RSV-A1B2C3D4/pago-fallido");
        assertThat(request.getBackUrls().getPending())
                .isEqualTo("http://localhost:3000/reserva/RSV-A1B2C3D4/pago-pendiente");
        assertThat(request.getNotificationUrl()).isEqualTo("http://localhost:8080/api/pagos/webhook/41");

        ArgumentCaptor<Pago> pagoCaptor = ArgumentCaptor.forClass(Pago.class);
        verify(pagoRepository).save(pagoCaptor.capture());
        assertThat(pagoCaptor.getValue().getMonto()).isEqualByComparingTo("3500.00");
        assertThat(pagoCaptor.getValue().getFechaExpiracion())
                .isEqualTo(LocalDateTime.parse("2026-08-24T15:10:00"));
        assertThat(pagoCaptor.getValue().getMercadoPagoPreferenceId()).isEqualTo("pref-123");
        assertThat(pagoCaptor.getValue().getLinkPago()).isEqualTo(preference.getInitPoint());
        assertThat(response.getMercadoPagoPreferenceId()).isEqualTo("pref-123");
        assertThat(response.getLinkPago()).isEqualTo(preference.getInitPoint());
    }

    @Test
    void reusesCompleteUnexpiredPendingPreferenceWithoutProviderCall() {
        Pago existing = new Pago();
        existing.setReserva(reserva);
        existing.setEstado(EstadoPago.PENDIENTE);
        existing.setMonto(new BigDecimal("3500.00"));
        existing.setMercadoPagoPreferenceId("pref-existing");
        existing.setLinkPago("https://checkout.example/existing");
        existing.setFechaExpiracion(LocalDateTime.ofInstant(AHORA, ZoneOffset.UTC).plusMinutes(1));
        when(reservaRepository.findByCodigoReservaForUpdate(CODIGO)).thenReturn(Optional.of(reserva));
        when(pagoRepository.findByReservaId(41L)).thenReturn(Optional.of(existing));

        PagoResponseDto response = service.crearOReutilizarPreferencia(CODIGO);

        assertThat(response.getMercadoPagoPreferenceId()).isEqualTo("pref-existing");
        assertThat(response.getLinkPago()).isEqualTo("https://checkout.example/existing");
        verifyNoInteractions(preferenceClient, cotizacionReservaService, configuracionRepository);
        verify(pagoRepository, never()).save(any());
    }

    @Test
    void createsFreshPreferenceAfterRejectedPaymentForSafeRetry() throws Exception {
        Pago rejected = new Pago();
        rejected.setReserva(reserva);
        rejected.setMonto(new BigDecimal("3500.00"));
        rejected.setEstado(EstadoPago.RECHAZADO);
        rejected.setMercadoPagoPaymentId("old-payment");
        rejected.setFechaPago(LocalDateTime.ofInstant(AHORA, ZoneOffset.UTC).minusMinutes(2));
        rejected.setMetodoPago("visa");
        when(reservaRepository.findByCodigoReservaForUpdate(CODIGO)).thenReturn(Optional.of(reserva));
        when(pagoRepository.findByReservaId(41L)).thenReturn(Optional.of(rejected));
        when(cotizacionReservaService.cotizar(7L, 3)).thenReturn(new CotizacionReservaResponseDto(
                new BigDecimal("500.00"),
                new BigDecimal("1500.00"),
                true,
                new BigDecimal("2000.00"),
                new BigDecimal("3500.00"),
                24,
                15));
        when(configuracionRepository.findBySucursalId(7L)).thenReturn(Optional.of(configuracion));
        when(preference.getId()).thenReturn("pref-retry");
        when(preference.getInitPoint()).thenReturn("https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=pref-retry");
        when(preferenceClient.create(any(PreferenceRequest.class), any(MPRequestOptions.class)))
                .thenReturn(preference);
        when(pagoRepository.save(rejected)).thenReturn(rejected);

        PagoResponseDto response = service.crearOReutilizarPreferencia(CODIGO);

        assertThat(response.getEstado()).isEqualTo(EstadoPago.PENDIENTE);
        assertThat(response.getMercadoPagoPreferenceId()).isEqualTo("pref-retry");
        assertThat(rejected.getMercadoPagoPaymentId()).isNull();
        assertThat(rejected.getFechaPago()).isNull();
        assertThat(rejected.getMetodoPago()).isNull();
    }

    @Test
    void rejectsReservationOutsidePendingPaymentState() {
        reserva.setEstado(EstadoReserva.CONFIRMADA);
        when(reservaRepository.findByCodigoReservaForUpdate(CODIGO)).thenReturn(Optional.of(reserva));

        assertThatThrownBy(() -> service.crearOReutilizarPreferencia(CODIGO))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.CONFLICT));

        verifyNoInteractions(preferenceClient, pagoRepository);
    }

    @Test
    void rejectsMissingGlobalTokenBeforeQuotingOrCallingProvider() {
        ReflectionTestUtils.setField(service, "globalMpAccessToken", "  ");
        when(reservaRepository.findByCodigoReservaForUpdate(CODIGO)).thenReturn(Optional.of(reserva));
        when(pagoRepository.findByReservaId(41L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.crearOReutilizarPreferencia(CODIGO))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE));

        verifyNoInteractions(preferenceClient, cotizacionReservaService, configuracionRepository);
        verify(pagoRepository, never()).save(any());
    }

    @Test
    void providerFailureDoesNotPersistPayment() throws Exception {
        stubCreationInputs();
        when(preferenceClient.create(any(PreferenceRequest.class), any(MPRequestOptions.class)))
                .thenThrow(new MPException("provider unavailable"));

        assertThatThrownBy(() -> service.crearOReutilizarPreferencia(CODIGO))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_GATEWAY));

        verify(pagoRepository, never()).save(any());
    }

    @Test
    void reconcilesVerifiedApprovedPaymentAndConfirmsReservation() throws Exception {
        Pago pago = stubReturnPayment(EstadoPago.PENDIENTE);
        stubVerifiedProviderPayment("approved");
        when(payment.getPaymentMethodId()).thenReturn("visa");
        when(pagoRepository.save(any(Pago.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PagoReturnResponseDto response = service.reconciliarRetorno(CODIGO, "9001");

        assertThat(response.isVerified()).isTrue();
        assertThat(response.getOutcome()).isEqualTo(PagoReturnResponseDto.Outcome.APPROVED);
        assertThat(response.getCodigoReserva()).isEqualTo(CODIGO);
        assertThat(response.getEstadoReserva()).isEqualTo(EstadoReserva.CONFIRMADA);
        assertThat(response.getEstadoPago()).isEqualTo(EstadoPago.APROBADO);
        assertThat(pago.getMercadoPagoPaymentId()).isEqualTo("9001");
        assertThat(pago.getMetodoPago()).isEqualTo("visa");
        assertThat(pago.getFechaPago()).isEqualTo(LocalDateTime.ofInstant(AHORA, ZoneOffset.UTC));
        assertThat(reserva.getFechaConfirmacion()).isEqualTo(LocalDateTime.ofInstant(AHORA, ZoneOffset.UTC));
        verify(reservaRepository).save(reserva);
        verify(pagoRepository).save(pago);
    }

    @Test
    void rejectsProviderMismatchWithoutMutatingLocalState() throws Exception {
        Pago pago = stubReturnPayment(EstadoPago.PENDIENTE);
        when(paymentClient.get(any(Long.class), any(MPRequestOptions.class))).thenReturn(payment);
        when(payment.getId()).thenReturn(9001L);
        when(payment.getExternalReference()).thenReturn("RSV-OTHER");

        PagoReturnResponseDto response = service.reconciliarRetorno(CODIGO, "9001");

        assertThat(response.isVerified()).isFalse();
        assertThat(response.getOutcome()).isEqualTo(PagoReturnResponseDto.Outcome.UNVERIFIED);
        assertThat(pago.getEstado()).isEqualTo(EstadoPago.PENDIENTE);
        assertThat(reserva.getEstado()).isEqualTo(EstadoReserva.PENDIENTE_PAGO);
        verify(pagoRepository, never()).save(any());
        verify(reservaRepository, never()).save(any());
    }

    @Test
    void rejectsProviderAmountMismatchWithoutMutatingLocalState() throws Exception {
        Pago pago = stubReturnPayment(EstadoPago.PENDIENTE);
        stubVerifiedProviderPayment("approved");
        when(payment.getTransactionAmount()).thenReturn(new BigDecimal("3499.99"));

        PagoReturnResponseDto response = service.reconciliarRetorno(CODIGO, "9001");

        assertThat(response.isVerified()).isFalse();
        assertThat(pago.getEstado()).isEqualTo(EstadoPago.PENDIENTE);
        assertThat(reserva.getEstado()).isEqualTo(EstadoReserva.PENDIENTE_PAGO);
        verify(pagoRepository, never()).save(any());
        verify(reservaRepository, never()).save(any());
    }

    @Test
    void rejectsCollectorMismatchWithoutMutatingLocalState() throws Exception {
        Pago pago = stubReturnPayment(EstadoPago.PENDIENTE);
        stubVerifiedProviderPayment("approved");
        when(payment.getCollectorId()).thenReturn(999999L);

        PagoReturnResponseDto response = service.reconciliarRetorno(CODIGO, "9001");

        assertThat(response.isVerified()).isFalse();
        assertThat(pago.getEstado()).isEqualTo(EstadoPago.PENDIENTE);
        assertThat(reserva.getEstado()).isEqualTo(EstadoReserva.PENDIENTE_PAGO);
        verify(pagoRepository, never()).save(any());
        verify(reservaRepository, never()).save(any());
    }

    @Test
    void missingCollectorConfigurationFailsVerificationClosedWithoutProviderCall() {
        Pago pago = stubReturnPayment(EstadoPago.PENDIENTE);
        ReflectionTestUtils.setField(service, "globalMpCollectorId", "  ");

        PagoReturnResponseDto response = service.reconciliarRetorno(CODIGO, "9001");

        assertThat(response.isVerified()).isFalse();
        assertThat(pago.getEstado()).isEqualTo(EstadoPago.PENDIENTE);
        verifyNoInteractions(paymentClient);
        verify(pagoRepository, never()).save(any());
        verify(reservaRepository, never()).save(any());
    }

    @Test
    void keepsVerifiedPendingPaymentPending() throws Exception {
        Pago pago = stubReturnPayment(EstadoPago.PENDIENTE);
        stubVerifiedProviderPayment("in_process");

        PagoReturnResponseDto response = service.reconciliarRetorno(CODIGO, "9001");

        assertThat(response.isVerified()).isTrue();
        assertThat(response.getOutcome()).isEqualTo(PagoReturnResponseDto.Outcome.PENDING);
        assertThat(pago.getEstado()).isEqualTo(EstadoPago.PENDIENTE);
        assertThat(reserva.getEstado()).isEqualTo(EstadoReserva.PENDIENTE_PAGO);
        verify(pagoRepository, never()).save(any());
        verify(reservaRepository, never()).save(any());
    }

    @Test
    void marksVerifiedRejectedPaymentWithoutCancellingReservation() throws Exception {
        Pago pago = stubReturnPayment(EstadoPago.PENDIENTE);
        stubVerifiedProviderPayment("rejected");
        when(payment.getPaymentMethodId()).thenReturn("master");

        PagoReturnResponseDto response = service.reconciliarRetorno(CODIGO, "9001");

        assertThat(response.getOutcome()).isEqualTo(PagoReturnResponseDto.Outcome.REJECTED);
        assertThat(pago.getEstado()).isEqualTo(EstadoPago.RECHAZADO);
        assertThat(pago.getMercadoPagoPaymentId()).isEqualTo("9001");
        assertThat(reserva.getEstado()).isEqualTo(EstadoReserva.PENDIENTE_PAGO);
        verify(pagoRepository).save(pago);
        verify(reservaRepository, never()).save(any());
    }

    @Test
    void repeatedReturnCannotDowngradeApprovedPayment() throws Exception {
        Pago pago = stubReturnPayment(EstadoPago.APROBADO);
        reserva.setEstado(EstadoReserva.CONFIRMADA);
        pago.setMercadoPagoPaymentId("9001");
        stubVerifiedProviderPayment("rejected");

        PagoReturnResponseDto response = service.reconciliarRetorno(CODIGO, "9001");

        assertThat(response.getOutcome()).isEqualTo(PagoReturnResponseDto.Outcome.APPROVED);
        assertThat(pago.getEstado()).isEqualTo(EstadoPago.APROBADO);
        assertThat(reserva.getEstado()).isEqualTo(EstadoReserva.CONFIRMADA);
        verify(pagoRepository, never()).save(any());
        verify(reservaRepository, never()).save(any());
    }

    @Test
    void missingPaymentIdReturnsUnverifiedLocalContextWithoutProviderCall() {
        Pago pago = stubReturnPayment(EstadoPago.PENDIENTE);

        PagoReturnResponseDto response = service.reconciliarRetorno(CODIGO, null);

        assertThat(response.isVerified()).isFalse();
        assertThat(response.getOutcome()).isEqualTo(PagoReturnResponseDto.Outcome.UNVERIFIED);
        assertThat(response.getEstadoPago()).isEqualTo(EstadoPago.PENDIENTE);
        assertThat(pago.getEstado()).isEqualTo(EstadoPago.PENDIENTE);
        verifyNoInteractions(paymentClient);
        verify(pagoRepository, never()).save(any());
    }

    @Test
    void providerErrorReturnsRetryableUnverifiedResponseWithoutMutation() throws Exception {
        Pago pago = stubReturnPayment(EstadoPago.PENDIENTE);
        when(paymentClient.get(any(Long.class), any(MPRequestOptions.class)))
                .thenThrow(new MPException("provider unavailable"));

        PagoReturnResponseDto response = service.reconciliarRetorno(CODIGO, "9001");

        assertThat(response.isVerified()).isFalse();
        assertThat(response.getOutcome()).isEqualTo(PagoReturnResponseDto.Outcome.UNVERIFIED);
        assertThat(pago.getEstado()).isEqualTo(EstadoPago.PENDIENTE);
        assertThat(reserva.getEstado()).isEqualTo(EstadoReserva.PENDIENTE_PAGO);
        verify(pagoRepository, never()).save(any());
        verify(reservaRepository, never()).save(any());
    }

    @Test
    void acceptsWebhookSignatureOnlyWithDocumentedTrailingSemicolonManifest() throws Exception {
        ReflectionTestUtils.setField(service, "webhookSecret", "webhook-test-secret");
        String signature = signature("9001", "request-123", "1724500000", "webhook-test-secret");
        when(reservaRepository.findByIdForUpdate(404L)).thenReturn(Optional.empty());

        service.procesarWebhook(404L, 9001L, "9001", signature, "request-123");

        verify(reservaRepository).findByIdForUpdate(404L);
        verifyNoInteractions(paymentClient);
    }

    @Test
    void rejectsMissingWebhookSecretBeforeLookup() {
        ReflectionTestUtils.setField(service, "webhookSecret", "  ");

        assertThatThrownBy(() -> service.procesarWebhook(
                41L, 9001L, "9001", "ts=1724500000,v1=00", "request-123"))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE));

        verifyNoInteractions(paymentClient, reservaRepository, pagoRepository);
    }

    @Test
    void rejectsInvalidOrMissingWebhookSignatureBeforeLookup() {
        ReflectionTestUtils.setField(service, "webhookSecret", "webhook-test-secret");

        assertThatThrownBy(() -> service.procesarWebhook(
                41L, 9001L, "9001", null, "request-123"))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED));
        assertThatThrownBy(() -> service.procesarWebhook(
                41L, 9001L, "9001", "ts=1724500000,v1=00", "request-123"))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception ->
                        assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED));

        verifyNoInteractions(paymentClient, reservaRepository, pagoRepository);
    }

    @Test
    void webhookApprovalAndLaterReturnConvergeWithoutDowngrade() throws Exception {
        ReflectionTestUtils.setField(service, "webhookSecret", "webhook-test-secret");
        Pago pago = new Pago();
        pago.setReserva(reserva);
        pago.setMonto(new BigDecimal("3500.00"));
        pago.setEstado(EstadoPago.PENDIENTE);
        when(reservaRepository.findByIdForUpdate(41L)).thenReturn(Optional.of(reserva));
        when(reservaRepository.findByCodigoReservaForUpdate(CODIGO)).thenReturn(Optional.of(reserva));
        when(pagoRepository.findByReservaId(41L)).thenReturn(Optional.of(pago));
        stubVerifiedProviderPayment("approved");
        when(payment.getPaymentMethodId()).thenReturn("visa");
        String signature = signature("9001", "request-race", "1724500000", "webhook-test-secret");

        service.procesarWebhook(41L, 9001L, "9001", signature, "request-race");
        when(payment.getStatus()).thenReturn("rejected");
        PagoReturnResponseDto response = service.reconciliarRetorno(CODIGO, "9001");

        assertThat(response.getOutcome()).isEqualTo(PagoReturnResponseDto.Outcome.APPROVED);
        assertThat(pago.getEstado()).isEqualTo(EstadoPago.APROBADO);
        assertThat(reserva.getEstado()).isEqualTo(EstadoReserva.CONFIRMADA);
        verify(paymentClient, times(2)).get(any(Long.class), any(MPRequestOptions.class));
    }

    private void stubCreationInputs() {
        when(reservaRepository.findByCodigoReservaForUpdate(CODIGO)).thenReturn(Optional.of(reserva));
        when(pagoRepository.findByReservaId(41L)).thenReturn(Optional.empty());
        when(cotizacionReservaService.cotizar(7L, 3)).thenReturn(new CotizacionReservaResponseDto(
                new BigDecimal("500.00"),
                new BigDecimal("1500.00"),
                true,
                new BigDecimal("2000.00"),
                new BigDecimal("3500.00"),
                24,
                15));
        when(configuracionRepository.findBySucursalId(7L)).thenReturn(Optional.of(configuracion));
    }

    private Pago stubReturnPayment(EstadoPago estado) {
        Pago pago = new Pago();
        pago.setReserva(reserva);
        pago.setMonto(new BigDecimal("3500.00"));
        pago.setEstado(estado);
        when(reservaRepository.findByCodigoReservaForUpdate(CODIGO)).thenReturn(Optional.of(reserva));
        when(pagoRepository.findByReservaId(41L)).thenReturn(Optional.of(pago));
        return pago;
    }

    private void stubVerifiedProviderPayment(String status) throws Exception {
        when(paymentClient.get(any(Long.class), any(MPRequestOptions.class))).thenReturn(payment);
        when(payment.getId()).thenReturn(9001L);
        when(payment.getExternalReference()).thenReturn(CODIGO);
        when(payment.getCurrencyId()).thenReturn("ARS");
        when(payment.getTransactionAmount()).thenReturn(new BigDecimal("3500.0"));
        lenient().when(payment.getCollectorId()).thenReturn(123456L);
        lenient().when(payment.getStatus()).thenReturn(status);
    }

    private String signature(String dataId, String requestId, String ts, String secret) throws Exception {
        String manifest = "id:" + dataId + ";request-id:" + requestId + ";ts:" + ts + ";";
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return "ts=" + ts + ",v1="
                + HexFormat.of().formatHex(mac.doFinal(manifest.getBytes(StandardCharsets.UTF_8)));
    }
}
