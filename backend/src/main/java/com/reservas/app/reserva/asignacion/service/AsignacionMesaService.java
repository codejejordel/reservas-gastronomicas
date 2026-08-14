package com.reservas.app.reserva.asignacion.service;

import com.reservas.app.mesa.entity.EstadoMesa;
import com.reservas.app.mesa.entity.Mesa;
import com.reservas.app.mesa.repository.MesaRepository;
import com.reservas.app.reserva.asignacion.dto.AsignarMesaRequestDto;
import com.reservas.app.reserva.asignacion.dto.AsignacionMesaResponseDto;
import com.reservas.app.reserva.asignacion.entity.AsignacionMesa;
import com.reservas.app.reserva.asignacion.repository.AsignacionMesaRepository;
import com.reservas.app.reserva.entity.EstadoReserva;
import com.reservas.app.reserva.entity.Reserva;
import com.reservas.app.reserva.repository.ReservaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AsignacionMesaService {

    private final AsignacionMesaRepository asignacionRepository;
    private final ReservaRepository reservaRepository;
    private final MesaRepository mesaRepository;

    @Transactional
    public AsignacionMesaResponseDto asignar(Long reservaId, AsignarMesaRequestDto request) {
        Reserva reserva = reservaRepository.findById(reservaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));

        if (reserva.getEstado() != EstadoReserva.CONFIRMADA
                && reserva.getEstado() != EstadoReserva.PENDIENTE_CONFIRMACION) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Solo se puede asignar mesa a reservas confirmadas o pendientes de confirmación");
        }

        Mesa mesa = mesaRepository.findById(request.getMesaId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mesa no encontrada"));

        if (mesa.getEstado() != EstadoMesa.DISPONIBLE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La mesa no está disponible");
        }

        if (asignacionRepository.existsByReservaIdAndMesaIdAndActivaTrue(reservaId, mesa.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La mesa ya está asignada a esta reserva");
        }

        AsignacionMesa asignacion = new AsignacionMesa();
        asignacion.setReserva(reserva);
        asignacion.setMesa(mesa);

        mesa.setEstado(EstadoMesa.RESERVADA);
        mesaRepository.save(mesa);

        return toDto(asignacionRepository.save(asignacion));
    }

    public List<AsignacionMesaResponseDto> listByReserva(Long reservaId) {
        if (!reservaRepository.existsById(reservaId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada");
        }
        return asignacionRepository.findByReservaIdAndActivaTrue(reservaId)
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public void desasignar(Long reservaId, Long asignacionId) {
        AsignacionMesa asignacion = asignacionRepository.findById(asignacionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Asignación no encontrada"));

        if (!asignacion.getReserva().getId().equals(reservaId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La asignación no pertenece a esta reserva");
        }

        asignacion.setActiva(false);

        Mesa mesa = asignacion.getMesa();
        mesa.setEstado(EstadoMesa.DISPONIBLE);
        mesaRepository.save(mesa);

        asignacionRepository.save(asignacion);
    }

    private AsignacionMesaResponseDto toDto(AsignacionMesa a) {
        return new AsignacionMesaResponseDto(
                a.getId(), a.getReserva().getId(), a.getMesa().getId(),
                a.getMesa().getNombre(), a.getMesa().getCapacidad(),
                a.getFechaAsignacion(), a.getActiva()
        );
    }
}
