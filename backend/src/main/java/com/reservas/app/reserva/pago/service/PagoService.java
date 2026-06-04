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
import com.reservas.app.reserva.pago.dto.RegistrarPagoRequestDto;
import com.reservas.app.reserva.pago.entity.EstadoPago;
import com.reservas.app.reserva.pago.entity.Pago;
import com.reservas.app.reserva.pago.repository.PagoRepository;
import com.reservas.app.reserva.repository.ReservaRepository;
import com.reservas.app.restaurante.entity.Restaurante;
import com.reservas.app.sucursal.entity.Sucursal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.HexFormat;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PagoService {

    private final PagoRepository pagoRepository;
    private final ReservaRepository reservaRepository;

    @Value("${app.mercadopago.access-token:}")
    private String globalMpAccessToken;

    @Value("${app.mercadopago.webhook-secret:}")
    private String webhookSecret;

    @Value("${app.mercadopago.webhook-base-url:http://localhost:8080/api}")
    private String webhookBaseUrl;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Transactional
    public PagoResponseDto registrar(Long reservaId, RegistrarPagoRequestDto request) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));

        if (reserva.getEstado() != EstadoReserva.PENDIENTE_PAGO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Solo se puede registrar pago en reservas con estado PENDIENTE_PAGO");
        }

        if (pagoRepository.existsByReservaId(reservaId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La reserva ya tiene un pago registrado");
        }

        String accessToken = resolveAccessToken(reserva.getSucursal());

        try {
            MPRequestOptions options = MPRequestOptions.builder().accessToken(accessToken).build();

            PreferenceItemRequest item = PreferenceItemRequest.builder()
                    .title("Seña reserva #" + reserva.getCodigoReserva())
                    .quantity(1)
                    .unitPrice(request.getMonto())
                    .currencyId("ARS")
                    .build();

            PreferenceBackUrlsRequest backUrls = PreferenceBackUrlsRequest.builder()
                    .success(frontendUrl + "/reserva/" + reserva.getCodigoReserva() + "/pago-exitoso")
                    .failure(frontendUrl + "/reserva/" + reserva.getCodigoReserva() + "/pago-fallido")
                    .pending(frontendUrl + "/reserva/" + reserva.getCodigoReserva() + "/pago-pendiente")
                    .build();

            OffsetDateTime expiracion = request.getFechaExpiracion() != null
                    ? OffsetDateTime.of(request.getFechaExpiracion(), ZoneOffset.UTC)
                    : null;

            PreferenceRequest mpRequest = PreferenceRequest.builder()
                    .items(List.of(item))
                    .backUrls(backUrls)
                    .notificationUrl(webhookBaseUrl + "/pagos/webhook/" + reservaId)
                    .externalReference(reservaId.toString())
                    .expires(expiracion != null)
                    .expirationDateTo(expiracion)
                    .build();

            Preference preference = new PreferenceClient().create(mpRequest, options);

            Pago pago = new Pago();
            pago.setReserva(reserva);
            pago.setMonto(request.getMonto());
            pago.setFechaExpiracion(request.getFechaExpiracion());
            pago.setMercadoPagoPreferenceId(preference.getId());
            pago.setLinkPago(preference.getInitPoint());

            return toDto(pagoRepository.save(pago));

        } catch (MPException | MPApiException e) {
            log.error("Error creando preferencia en MercadoPago para reserva {}: {}", reservaId, e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                    "Error al crear preferencia de pago en MercadoPago");
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
    public void procesarWebhook(Long reservaId, Long mpPaymentId, String xSignature, String xRequestId) {
        if (webhookSecret != null && !webhookSecret.isBlank()) {
            verificarFirma(mpPaymentId, xSignature, xRequestId);
        }

        Pago pago = pagoRepository.findByReservaId(reservaId).orElse(null);
        if (pago == null) {
            log.warn("Webhook MP: no se encontró pago para reservaId={}", reservaId);
            return;
        }

        String accessToken = resolveAccessToken(pago.getReserva().getSucursal());

        try {
            MPRequestOptions options = MPRequestOptions.builder().accessToken(accessToken).build();
            Payment payment = new PaymentClient().get(mpPaymentId, options);

            String status = payment.getStatus();
            log.info("Webhook MP: paymentId={}, status={}, reservaId={}", mpPaymentId, status, reservaId);

            switch (status) {
                case "approved" -> {
                    if (pago.getEstado() == EstadoPago.PENDIENTE) {
                        pago.setEstado(EstadoPago.APROBADO);
                        pago.setFechaPago(LocalDateTime.now());
                        pago.setMercadoPagoPaymentId(mpPaymentId.toString());
                        pago.setMetodoPago(payment.getPaymentTypeId());

                        Reserva reserva = pago.getReserva();
                        reserva.setEstado(EstadoReserva.CONFIRMADA);
                        reserva.setFechaConfirmacion(LocalDateTime.now());
                        reservaRepository.save(reserva);
                        pagoRepository.save(pago);
                    }
                }
                case "rejected" -> {
                    if (pago.getEstado() == EstadoPago.PENDIENTE) {
                        pago.setEstado(EstadoPago.RECHAZADO);
                        pago.setMercadoPagoPaymentId(mpPaymentId.toString());
                        pagoRepository.save(pago);
                    }
                }
                default -> log.debug("Webhook MP: estado '{}' ignorado para paymentId={}", status, mpPaymentId);
            }

        } catch (MPException | MPApiException e) {
            log.error("Error consultando pago {} en MercadoPago: {}", mpPaymentId, e.getMessage());
        }
    }

    private String resolveAccessToken(Sucursal sucursal) {
        if (sucursal.getMpAccessToken() != null && !sucursal.getMpAccessToken().isBlank()) {
            return sucursal.getMpAccessToken();
        }
        Restaurante restaurante = sucursal.getRestaurante();
        if (restaurante.getMpAccessToken() != null && !restaurante.getMpAccessToken().isBlank()) {
            return restaurante.getMpAccessToken();
        }
        if (globalMpAccessToken != null && !globalMpAccessToken.isBlank()) {
            return globalMpAccessToken;
        }
        throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_ENTITY,
                "El restaurante no tiene MercadoPago configurado");
    }

    private void verificarFirma(Long paymentId, String xSignature, String xRequestId) {
        if (xSignature == null || xRequestId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Firma de webhook inválida");
        }

        String ts = null;
        String v1 = null;
        for (String part : xSignature.split(",")) {
            if (part.startsWith("ts=")) ts = part.substring(3).trim();
            if (part.startsWith("v1=")) v1 = part.substring(3).trim();
        }

        if (ts == null || v1 == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Firma de webhook malformada");
        }

        String manifest = "id:" + paymentId + ";request-id:" + xRequestId + ";ts:" + ts;

        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String computed = HexFormat.of().formatHex(mac.doFinal(manifest.getBytes(StandardCharsets.UTF_8)));

            if (!computed.equals(v1)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Firma de webhook inválida");
            }
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error verificando firma");
        }
    }

    private Pago findByReservaOrThrow(Long reservaId) {
        if (!reservaRepository.existsById(reservaId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Registro de pago no encontrado para reserva: "+reservaId);
        }
        return pagoRepository.findByReservaId(reservaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registro de pago no encontrado para reserva: "+reservaId));
    }

    private PagoResponseDto toDto(Pago pago) {
        return new PagoResponseDto(
                pago.getId(),
                pago.getReserva().getId(),
                pago.getMonto(),
                pago.getEstado(),
                pago.getMercadoPagoPaymentId(),
                pago.getLinkPago(),
                pago.getFechaPago(),
                pago.getFechaExpiracion(),
                pago.getMetodoPago(),
                pago.getMontoReembolsado(),
                pago.getFechaCreacion()
        );
    }
}
