package com.reservas.app.reserva.service;

import com.reservas.app.reserva.dto.ReservaPublicStatusDto;
import com.reservas.app.reserva.entity.EstadoReserva;
import com.reservas.app.reserva.entity.Reserva;
import com.reservas.app.reserva.pago.entity.EstadoPago;
import com.reservas.app.reserva.pago.entity.Pago;
import com.reservas.app.reserva.pago.repository.PagoRepository;
import com.reservas.app.reserva.repository.ReservaRepository;
import com.reservas.app.sucursal.configuracion.entity.ConfiguracionSucursal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.HexFormat;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ReservaPublicAccessService {

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final Pattern TOKEN_PATTERN = Pattern.compile("^[A-Za-z0-9_-]{43}$");
    private static final Pattern TOKEN_HASH_PATTERN = Pattern.compile("^[0-9a-f]{64}$");

    private final ReservaRepository reservaRepository;
    private final PagoRepository pagoRepository;
    private final Clock clock;

    public String initialize(Reserva reserva, ConfiguracionSucursal configuracion) {
        byte[] tokenBytes = new byte[32];
        SECURE_RANDOM.nextBytes(tokenBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
        reserva.setPublicAccessTokenHash(hash(token));
        if (reserva.getEstado() == EstadoReserva.PENDIENTE_PAGO) {
            reserva.setFechaLimitePago(now().plusMinutes(configuracion.getMinutosLockPago()));
        }
        return token;
    }

    @Transactional
    public ReservaPublicStatusDto getStatus(String codigoReserva, String token) {
        Reserva reserva = reservaRepository.findByCodigoReservaForUpdate(codigoReserva)
                .orElseThrow(this::notFound);
        authorize(reserva, token);
        Pago pago = pagoRepository.findByReservaId(reserva.getId()).orElse(null);
        expireIfElapsed(reserva, pago);
        return toStatus(reserva, pago);
    }

    public void authorize(Reserva reserva, String token) {
        // Legacy rows contain unrecoverable random hashes, so public access intentionally fails closed.
        String expectedHash = reserva.getPublicAccessTokenHash();
        if (token == null || !TOKEN_PATTERN.matcher(token).matches()
                || expectedHash == null || !TOKEN_HASH_PATTERN.matcher(expectedHash).matches()) {
            throw notFound();
        }
        byte[] actual = hash(token).getBytes(StandardCharsets.US_ASCII);
        byte[] expected = expectedHash.getBytes(StandardCharsets.US_ASCII);
        if (!MessageDigest.isEqual(actual, expected)) {
            throw notFound();
        }
    }

    public void expireIfElapsed(Reserva reserva, Pago pago) {
        if (reserva.getEstado() != EstadoReserva.PENDIENTE_PAGO
                || reserva.getFechaLimitePago() == null
                || reserva.getFechaLimitePago().isAfter(now())) {
            return;
        }
        reserva.setEstado(EstadoReserva.EXPIRADA);
        reservaRepository.save(reserva);
        if (pago != null && (pago.getEstado() == EstadoPago.PENDIENTE
                || pago.getEstado() == EstadoPago.RECHAZADO)) {
            pago.setEstado(EstadoPago.EXPIRADO);
            pagoRepository.save(pago);
        }
    }

    private ReservaPublicStatusDto toStatus(Reserva reserva, Pago pago) {
        EstadoPago estadoPago = pago != null ? pago.getEstado() : null;
        boolean puedeContinuar = reserva.getEstado() == EstadoReserva.PENDIENTE_PAGO
                && reserva.getFechaLimitePago() != null
                && reserva.getFechaLimitePago().isAfter(now())
                && (estadoPago == null || estadoPago == EstadoPago.PENDIENTE || estadoPago == EstadoPago.RECHAZADO);
        return new ReservaPublicStatusDto(
                reserva.getCodigoReserva(),
                reserva.getEstado(),
                reserva.getFechaReserva(),
                reserva.getHoraReserva(),
                reserva.getCantPersonas(),
                estadoPago,
                puedeContinuar,
                reserva.getFechaLimitePago());
    }

    private LocalDateTime now() {
        return LocalDateTime.ofInstant(clock.instant(), ZoneOffset.UTC);
    }

    private static String hash(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    private ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada");
    }
}
