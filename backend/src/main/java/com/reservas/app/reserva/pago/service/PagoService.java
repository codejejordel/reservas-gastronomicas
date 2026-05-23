package com.reservas.app.reserva.pago.service;

import com.reservas.app.reserva.entity.EstadoReserva;
import com.reservas.app.reserva.entity.Reserva;
import com.reservas.app.reserva.pago.dto.PagoResponseDto;
import com.reservas.app.reserva.pago.dto.RegistrarPagoRequestDto;
import com.reservas.app.reserva.pago.entity.EstadoPago;
import com.reservas.app.reserva.pago.entity.Pago;
import com.reservas.app.reserva.pago.repository.PagoRepository;
import com.reservas.app.reserva.repository.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PagoService {

    private final PagoRepository pagoRepository;
    private final ReservaRepository reservaRepository;

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

        Pago pago = new Pago();
        pago.setReserva(reserva);
        pago.setMonto(request.getMonto());
        pago.setFechaExpiracion(request.getFechaExpiracion());

        return toDto(pagoRepository.save(pago));
    }

    public PagoResponseDto getByReserva(Long reservaId) {
        Pago pago = pagoRepository.findByReservaId(reservaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pago no encontrado"));
        return toDto(pago);
    }

    @Transactional
    public PagoResponseDto aprobar(Long reservaId) {
        Pago pago = findByReservaOrThrow(reservaId);

        if (pago.getEstado() != EstadoPago.PENDIENTE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El pago no está en estado PENDIENTE");
        }

        pago.setEstado(EstadoPago.APROBADO);
        pago.setFechaPago(LocalDateTime.now());

        // Al aprobar el pago, la reserva pasa a CONFIRMADA
        Reserva reserva = pago.getReserva();
        reserva.setEstado(EstadoReserva.CONFIRMADA);
        reserva.setFechaConfirmacion(LocalDateTime.now());
        reservaRepository.save(reserva);

        return toDto(pagoRepository.save(pago));
    }

    @Transactional
    public PagoResponseDto reembolsar(Long reservaId) {
        Pago pago = findByReservaOrThrow(reservaId);

        if (pago.getEstado() != EstadoPago.APROBADO) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Solo se puede reembolsar un pago APROBADO");
        }

        pago.setEstado(EstadoPago.REEMBOLSADO);
        pago.setMontoReembolsado(pago.getMonto());

        return toDto(pagoRepository.save(pago));
    }

    private Pago findByReservaOrThrow(Long reservaId) {
        if (!reservaRepository.existsById(reservaId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada");
        }
        return pagoRepository.findByReservaId(reservaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pago no encontrado"));
    }

    private PagoResponseDto toDto(Pago p) {
        return new PagoResponseDto(
                p.getId(), p.getReserva().getId(), p.getMonto(), p.getEstado(),
                p.getMercadoPagoPaymentId(), p.getLinkPago(), p.getFechaPago(),
                p.getFechaExpiracion(), p.getMetodoPago(), p.getMontoReembolsado(),
                p.getFechaCreacion()
        );
    }
}
