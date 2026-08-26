package com.reservas.app.reserva.pago.service;

import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.*;
import com.mercadopago.core.MPRequestOptions;
import com.mercadopago.exceptions.MPApiException;
import com.mercadopago.exceptions.MPException;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.math.BigDecimal;
import java.net.URI;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PagoService {

    private static final int MAX_PROVIDER_RESPONSE_LOG_LENGTH = 1000;

    private final PagoRepository pagoRepository;
    private final ReservaRepository reservaRepository;
    private final CotizacionReservaService cotizacionReservaService;
    private final ConfiguracionSucursalRepository configuracionSucursalRepository;
    private final PreferenceClient preferenceClient;
    private final PaymentClient paymentClient;
    private final Clock clock;

    @Value("${app.mercadopago.access-token:}")
    private String globalMpAccessToken;

    @Value("${app.mercadopago.webhook-secret:}")
    private String webhookSecret;

    @Value("${app.mercadopago.collector-id:}")
    private String globalMpCollectorId;

    @Value("${app.mercadopago.webhook-base-url:http://localhost:8080/api}")
    private String webhookBaseUrl;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Transactional
    public PagoResponseDto crearOReutilizarPreferencia(String codigoReserva) {
        Reserva reserva = reservaRepository.findByCodigoReservaForUpdate(codigoReserva)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));

        if (reserva.getEstado() != EstadoReserva.PENDIENTE_PAGO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Solo se puede crear el pago de una reserva PENDIENTE_PAGO");
        }

        LocalDateTime ahora = LocalDateTime.ofInstant(clock.instant(), ZoneOffset.UTC);
        Pago pagoExistente = pagoRepository.findByReservaId(reserva.getId()).orElse(null);
        if (esPreferenciaReutilizable(pagoExistente, ahora)) {
            return toDto(pagoExistente);
        }
        if (pagoExistente != null
                && pagoExistente.getEstado() != EstadoPago.PENDIENTE
                && pagoExistente.getEstado() != EstadoPago.RECHAZADO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La reserva ya tiene un pago procesado");
        }

        String accessToken = requireGlobalAccessToken();
        BigDecimal monto = cotizacionReservaService
                .cotizar(reserva.getSucursal().getId(), reserva.getCantPersonas())
                .totalAPagarAhora();
        if (monto == null || monto.signum() <= 0) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                    "La reserva no tiene un monto válido para pagar");
        }

        ConfiguracionSucursal configuracion = configuracionSucursalRepository
                .findBySucursalId(reserva.getSucursal().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "La sucursal no tiene configuración"));
        LocalDateTime expiracion = ahora.plusMinutes(configuracion.getMinutosLockPago());
        OffsetDateTime inicioMp = OffsetDateTime.of(ahora, ZoneOffset.UTC);
        OffsetDateTime expiracionMp = OffsetDateTime.of(expiracion, ZoneOffset.UTC);

        try {
            MPRequestOptions options = MPRequestOptions.builder().accessToken(accessToken).build();

            PreferenceItemRequest item = PreferenceItemRequest.builder()
                    .title("Pago de reserva " + reserva.getCodigoReserva())
                    .quantity(1)
                    .unitPrice(monto)
                    .currencyId("ARS")
                    .build();

            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success(buildUrl(frontendUrl, "reserva", codigoReserva, "pago-exitoso"))
                    .failure(buildUrl(frontendUrl, "reserva", codigoReserva, "pago-fallido"))
                    .pending(buildUrl(frontendUrl, "reserva", codigoReserva, "pago-pendiente"))
                    .build();

            PreferenceRequest mpRequest = PreferenceRequest.builder()
                    .items(List.of(item))
                    .backUrls(backUrls)
                    .autoReturn("approved")
                    .notificationUrl(buildUrl(webhookBaseUrl, "pagos", "webhook", reserva.getId().toString()))
                    .externalReference(codigoReserva)
                    .expires(true)
                    .expirationDateFrom(inicioMp)
                    .expirationDateTo(expiracionMp)
                    .build();

            Preference preference = preferenceClient.create(mpRequest, options);
            if (preference.getId() == null || preference.getId().isBlank()
                    || preference.getInitPoint() == null || preference.getInitPoint().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                        "Mercado Pago devolvió una preferencia incompleta");
            }

            Pago pago = pagoExistente != null ? pagoExistente : new Pago();
            pago.setReserva(reserva);
            pago.setMonto(monto);
            pago.setEstado(EstadoPago.PENDIENTE);
            pago.setFechaExpiracion(expiracion);
            pago.setMercadoPagoPreferenceId(preference.getId());
            pago.setLinkPago(preference.getInitPoint());
            pago.setMercadoPagoPaymentId(null);
            pago.setFechaPago(null);
            pago.setMetodoPago(null);

            return toDto(pagoRepository.save(pago));

        } catch (MPApiException exception) {
            String responseContent = exception.getApiResponse() == null
                    ? null
                    : exception.getApiResponse().getContent();
            log.error("MercadoPago rechazó la preferencia para reserva {}: status={}, response={}",
                    codigoReserva,
                    exception.getStatusCode(),
                    sanitizeProviderResponse(responseContent));
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Error al crear preferencia de pago en MercadoPago");
        } catch (MPException exception) {
            log.error("Error de comunicación creando preferencia en MercadoPago para reserva {}", codigoReserva);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Error al crear preferencia de pago en MercadoPago");
        }
    }

    @Transactional
    public PagoReturnResponseDto reconciliarRetorno(String codigoReserva, String paymentId) {
        Reserva reserva = reservaRepository.findByCodigoReservaForUpdate(codigoReserva)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));
        Pago pago = pagoRepository.findByReservaId(reserva.getId()).orElse(null);

        if (paymentId == null || paymentId.isBlank()) {
            return respuestaNoVerificada(reserva, pago, outcomeSinVerificacion(pago));
        }

        Long providerPaymentId;
        try {
            providerPaymentId = Long.valueOf(paymentId);
        } catch (NumberFormatException exception) {
            return respuestaNoVerificada(reserva, pago, PagoReturnResponseDto.Outcome.UNVERIFIED);
        }

        if (pago == null || !pagoPerteneceAReserva(pago, reserva)) {
            return respuestaNoVerificada(reserva, pago, PagoReturnResponseDto.Outcome.UNVERIFIED);
        }

        try {
            MPRequestOptions options = MPRequestOptions.builder()
                    .accessToken(requireGlobalAccessToken())
                    .build();
            Conciliacion conciliacion = verificarYAplicar(reserva, pago, providerPaymentId, options);
            if (!conciliacion.verified()) {
                log.warn("Retorno MP no verificable para reserva {} y paymentId={}", codigoReserva, paymentId);
                return respuestaNoVerificada(reserva, pago, PagoReturnResponseDto.Outcome.UNVERIFIED);
            }
            return respuesta(reserva, pago, conciliacion.providerStatus(), true, conciliacion.outcome());
        } catch (MPException | MPApiException | ResponseStatusException exception) {
            log.warn("No se pudo verificar el retorno MP para reserva {} y paymentId={}", codigoReserva, paymentId);
            return respuestaNoVerificada(reserva, pago, PagoReturnResponseDto.Outcome.UNVERIFIED);
        }
    }

    public PagoResponseDto getByReserva(Long reservaId) {
        Pago pago = pagoRepository.findByReservaId(reservaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registro de pago no encontrado para reserva: "+reservaId));
        return toDto(pago);
    }

    @Transactional
    public PagoResponseDto aprobar(Long reservaId) {
        Pago pago = findByReservaOrThrow(reservaId);

        if (pago.getEstado() != EstadoPago.PENDIENTE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El pago no está en estado PENDIENTE");
        }

        LocalDateTime hoy = LocalDateTime.now();

        pago.setEstado(EstadoPago.APROBADO);
        pago.setFechaPago(hoy);

        Reserva reserva = pago.getReserva();
        reserva.setEstado(EstadoReserva.CONFIRMADA);
        reserva.setFechaConfirmacion(hoy);
        reservaRepository.save(reserva);

        return toDto(pagoRepository.save(pago));
    }

//    @Transactional
//    public PagoResponseDto reembolsar(Long reservaId) {
//        Pago pago = findByReservaOrThrow(reservaId);
//
//        if (pago.getEstado() != EstadoPago.APROBADO) {
//            throw new ResponseStatusException(HttpStatus.CONFLICT, "Solo se puede reembolsar un pago APROBADO");
//        }
//
//        pago.setEstado(EstadoPago.REEMBOLSADO);
//        pago.setMontoReembolsado(pago.getMonto());
//
//        return toDto(pagoRepository.save(pago));
//    }

    @Transactional
    public void procesarWebhook(
            Long reservaId,
            Long mpPaymentId,
            String signatureDataId,
            String xSignature,
            String xRequestId) {
        verificarFirma(signatureDataId, xSignature, xRequestId);

        Reserva reserva = reservaRepository.findByIdForUpdate(reservaId).orElse(null);
        if (reserva == null) {
            log.warn("Webhook MP autenticado para reserva inexistente: reservaId={}, paymentId={}",
                    reservaId, mpPaymentId);
            return;
        }
        Pago pago = pagoRepository.findByReservaId(reservaId).orElse(null);
        if (pago == null) {
            log.warn("Webhook MP autenticado sin pago local: reservaId={}, paymentId={}", reservaId, mpPaymentId);
            return;
        }

        try {
            MPRequestOptions options = MPRequestOptions.builder()
                    .accessToken(requireGlobalAccessToken())
                    .build();
            Conciliacion conciliacion = verificarYAplicar(reserva, pago, mpPaymentId, options);
            if (!conciliacion.verified()) {
                log.warn("Webhook MP autenticado pero no verificable: reservaId={}, paymentId={}",
                        reservaId, mpPaymentId);
                return;
            }
            log.info("Webhook MP conciliado: reservaId={}, paymentId={}, status={}, outcome={}",
                    reservaId, mpPaymentId, conciliacion.providerStatus(), conciliacion.outcome());
        } catch (MPException | MPApiException e) {
            log.warn("No se pudo consultar Mercado Pago para webhook: reservaId={}, paymentId={}",
                    reservaId, mpPaymentId);
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "No se pudo verificar la notificación con Mercado Pago");
        }
    }

    private String requireGlobalAccessToken() {
        if (globalMpAccessToken != null && !globalMpAccessToken.isBlank()) {
            return globalMpAccessToken.trim();
        }
        throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "Mercado Pago no está configurado");
    }

    private boolean esPreferenciaReutilizable(Pago pago, LocalDateTime ahora) {
        return pago != null
                && pago.getEstado() == EstadoPago.PENDIENTE
                && pago.getMercadoPagoPreferenceId() != null
                && !pago.getMercadoPagoPreferenceId().isBlank()
                && pago.getLinkPago() != null
                && !pago.getLinkPago().isBlank()
                && pago.getMonto() != null
                && pago.getFechaExpiracion() != null
                && pago.getFechaExpiracion().isAfter(ahora);
    }

    private Long requireGlobalCollectorId() {
        if (globalMpCollectorId == null || globalMpCollectorId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "El vendedor de Mercado Pago no está configurado");
        }
        try {
            long collectorId = Long.parseLong(globalMpCollectorId.trim());
            if (collectorId <= 0) {
                throw new NumberFormatException();
            }
            return collectorId;
        } catch (NumberFormatException exception) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "El vendedor de Mercado Pago no está configurado correctamente");
        }
    }

    private boolean pagoPerteneceAReserva(Pago pago, Reserva reserva) {
        return pago.getReserva() != null
                && pago.getReserva().getId() != null
                && pago.getReserva().getId().equals(reserva.getId())
                && reserva.getCodigoReserva().equals(pago.getReserva().getCodigoReserva());
    }

    private boolean esPagoVerificado(
            Payment payment,
            Long requestedPaymentId,
            String codigoReserva,
            Pago pago,
            Long expectedCollectorId) {
        return payment != null
                && requestedPaymentId.equals(payment.getId())
                && codigoReserva.equals(payment.getExternalReference())
                && "ARS".equals(payment.getCurrencyId())
                && payment.getTransactionAmount() != null
                && pago.getMonto() != null
                && payment.getTransactionAmount().compareTo(pago.getMonto()) == 0
                && expectedCollectorId.equals(payment.getCollectorId())
                && (pago.getMercadoPagoPaymentId() == null
                || pago.getMercadoPagoPaymentId().equals(requestedPaymentId.toString()));
    }

    private Conciliacion verificarYAplicar(
            Reserva reserva,
            Pago pago,
            Long providerPaymentId,
            MPRequestOptions options) throws MPException, MPApiException {
        Long expectedCollectorId = requireGlobalCollectorId();
        Payment payment = paymentClient.get(providerPaymentId, options);
        if (!pagoPerteneceAReserva(pago, reserva)
                || !esPagoVerificado(payment, providerPaymentId, reserva.getCodigoReserva(), pago,
                expectedCollectorId)) {
            return Conciliacion.noVerificada();
        }

        String providerStatus = normalizarStatus(payment.getStatus());
        return new Conciliacion(
                true,
                providerStatus,
                aplicarTransicionVerificada(pago, reserva, payment, providerPaymentId, providerStatus));
    }

    private PagoReturnResponseDto.Outcome aplicarTransicionVerificada(
            Pago pago,
            Reserva reserva,
            Payment payment,
            Long paymentId,
            String providerStatus) {
        if (pago.getEstado() == EstadoPago.APROBADO) {
            return PagoReturnResponseDto.Outcome.APPROVED;
        }

        return switch (providerStatus) {
            case "approved" -> {
                LocalDateTime ahora = LocalDateTime.ofInstant(clock.instant(), ZoneOffset.UTC);
                pago.setEstado(EstadoPago.APROBADO);
                pago.setFechaPago(ahora);
                pago.setMercadoPagoPaymentId(paymentId.toString());
                pago.setMetodoPago(payment.getPaymentMethodId());
                reserva.setEstado(EstadoReserva.CONFIRMADA);
                reserva.setFechaConfirmacion(ahora);
                reservaRepository.save(reserva);
                pagoRepository.save(pago);
                yield PagoReturnResponseDto.Outcome.APPROVED;
            }
            case "rejected", "cancelled" -> {
                pago.setEstado(EstadoPago.RECHAZADO);
                pago.setMercadoPagoPaymentId(paymentId.toString());
                pago.setMetodoPago(payment.getPaymentMethodId());
                pagoRepository.save(pago);
                yield PagoReturnResponseDto.Outcome.REJECTED;
            }
            case "expired" -> {
                pago.setEstado(EstadoPago.EXPIRADO);
                pago.setMercadoPagoPaymentId(paymentId.toString());
                if (reserva.getEstado() == EstadoReserva.PENDIENTE_PAGO) {
                    reserva.setEstado(EstadoReserva.EXPIRADA);
                    reservaRepository.save(reserva);
                }
                pagoRepository.save(pago);
                yield PagoReturnResponseDto.Outcome.EXPIRED;
            }
            case "pending", "in_process", "authorized" -> PagoReturnResponseDto.Outcome.PENDING;
            default -> PagoReturnResponseDto.Outcome.PENDING;
        };
    }

    private String normalizarStatus(String status) {
        return status == null ? "unknown" : status.trim().toLowerCase(Locale.ROOT);
    }

    private PagoReturnResponseDto.Outcome outcomeSinVerificacion(Pago pago) {
        if (pago == null) {
            return PagoReturnResponseDto.Outcome.UNVERIFIED;
        }
        return switch (pago.getEstado()) {
            case RECHAZADO -> PagoReturnResponseDto.Outcome.REJECTED;
            case EXPIRADO -> PagoReturnResponseDto.Outcome.EXPIRED;
            default -> PagoReturnResponseDto.Outcome.UNVERIFIED;
        };
    }

    private PagoReturnResponseDto respuestaNoVerificada(
            Reserva reserva, Pago pago, PagoReturnResponseDto.Outcome outcome) {
        return respuesta(reserva, pago, null, false, outcome);
    }

    private PagoReturnResponseDto respuesta(
            Reserva reserva,
            Pago pago,
            String providerStatus,
            boolean verified,
            PagoReturnResponseDto.Outcome outcome) {
        return new PagoReturnResponseDto(
                reserva.getCodigoReserva(),
                reserva.getEstado(),
                pago != null ? pago.getEstado() : null,
                providerStatus,
                verified,
                outcome);
    }

    private String buildUrl(String baseUrl, String... pathSegments) {
        try {
            URI uri = UriComponentsBuilder.fromUriString(baseUrl)
                    .pathSegment(pathSegments)
                    .build()
                    .encode()
                    .toUri();
            if (!uri.isAbsolute() || uri.getHost() == null
                    || !("http".equalsIgnoreCase(uri.getScheme()) || "https".equalsIgnoreCase(uri.getScheme()))) {
                throw new IllegalArgumentException("URL must be an absolute HTTP(S) URL");
            }
            return uri.toString();
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "La URL de retorno de Mercado Pago no está configurada correctamente");
        }
    }

    private void verificarFirma(String dataId, String xSignature, String xRequestId) {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "La firma de webhook de Mercado Pago no está configurada");
        }
        if (dataId == null || xSignature == null || xSignature.isBlank()
                || xRequestId == null || xRequestId.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Firma de webhook inválida");
        }

        Map<String, String> signatureParts = new HashMap<>();
        for (String part : xSignature.split(",")) {
            String[] entry = part.trim().split("=", 2);
            if (entry.length == 2 && ("ts".equals(entry[0]) || "v1".equals(entry[0]))) {
                if (entry[1].isBlank() || signatureParts.put(entry[0], entry[1].trim()) != null) {
                    throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Firma de webhook malformada");
                }
            }
        }

        String ts = signatureParts.get("ts");
        String v1 = signatureParts.get("v1");
        if (ts == null || v1 == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Firma de webhook malformada");
        }

        String manifest = "id:" + dataId + ";request-id:" + xRequestId + ";ts:" + ts + ";";

        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(webhookSecret.trim().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] computed = mac.doFinal(manifest.getBytes(StandardCharsets.UTF_8));
            byte[] supplied = HexFormat.of().parseHex(v1);
            if (!MessageDigest.isEqual(computed, supplied)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Firma de webhook inválida");
            }
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Firma de webhook malformada");
        } catch (NoSuchAlgorithmException | InvalidKeyException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error verificando firma");
        }
    }

    private record Conciliacion(
            boolean verified,
            String providerStatus,
            PagoReturnResponseDto.Outcome outcome) {
        private static Conciliacion noVerificada() {
            return new Conciliacion(false, null, PagoReturnResponseDto.Outcome.UNVERIFIED);
        }
    }

    private Pago findByReservaOrThrow(Long reservaId) {
        if (!reservaRepository.existsById(reservaId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Registro de pago no encontrado para reserva: "+reservaId);
        }
        return pagoRepository.findByReservaId(reservaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registro de pago no encontrado para reserva: "+reservaId));
    }

    private static String sanitizeProviderResponse(String content) {
        if (content == null || content.isBlank()) {
            return "<empty>";
        }

        StringBuilder sanitized = new StringBuilder(Math.min(content.length(), MAX_PROVIDER_RESPONSE_LOG_LENGTH));
        for (int index = 0; index < content.length()
                && sanitized.length() < MAX_PROVIDER_RESPONSE_LOG_LENGTH; index++) {
            char character = content.charAt(index);
            if (!Character.isISOControl(character)) {
                sanitized.append(character);
            }
        }
        return sanitized.isEmpty() ? "<empty>" : sanitized.toString();
    }

    private PagoResponseDto toDto(Pago pago) {
        return new PagoResponseDto(
                pago.getId(),
                pago.getReserva().getId(),
                pago.getMonto(),
                pago.getEstado(),
                pago.getMercadoPagoPaymentId(),
                pago.getMercadoPagoPreferenceId(),
                pago.getLinkPago(),
                pago.getFechaPago(),
                pago.getFechaExpiracion(),
                pago.getMetodoPago(),
                pago.getMontoReembolsado(),
                pago.getFechaCreacion()
        );
    }
}
