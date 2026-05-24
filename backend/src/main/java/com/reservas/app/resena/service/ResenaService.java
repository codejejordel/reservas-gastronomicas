package com.reservas.app.resena.service;

import com.reservas.app.cliente.entity.Cliente;
import com.reservas.app.cliente.repository.ClienteRepository;
import com.reservas.app.reserva.entity.EstadoReserva;
import com.reservas.app.reserva.entity.Reserva;
import com.reservas.app.reserva.repository.ReservaRepository;
import com.reservas.app.resena.dto.CreateResenaRequestDto;
import com.reservas.app.resena.dto.ResenaResponseDto;
import com.reservas.app.resena.entity.Resena;
import com.reservas.app.resena.repository.ResenaRepository;
import com.reservas.app.restaurante.entity.Restaurante;
import com.reservas.app.restaurante.repository.RestauranteRepository;
import com.reservas.app.sucursal.entity.Sucursal;
import com.reservas.app.sucursal.repository.SucursalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResenaService {

    private final ResenaRepository resenaRepository;
    private final SucursalRepository sucursalRepository;
    private final ClienteRepository clienteRepository;
    private final ReservaRepository reservaRepository;
    private final RestauranteRepository restauranteRepository;

    @Transactional
    public ResenaResponseDto create(Long sucursalId, CreateResenaRequestDto request) {
        Sucursal sucursal = findSucursalOrThrow(sucursalId);

        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));

        if (resenaRepository.findBySucursalIdAndClienteId(sucursalId, request.getClienteId()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El cliente ya tiene una reseña para esta sucursal");
        }

        Resena resena = new Resena();
        resena.setSucursal(sucursal);
        resena.setCliente(cliente);
        resena.setPuntuacion(request.getPuntuacion());
        resena.setComentario(request.getComentario());
        resena.setMostrarNombre(request.getMostrarNombre() != null ? request.getMostrarNombre() : false);

        if (request.getReservaId() != null) {
            Reserva reserva = reservaRepository.findById(request.getReservaId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));
            if (!reserva.getSucursal().getId().equals(sucursalId) ||
                    !reserva.getCliente().getId().equals(request.getClienteId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "La reserva no pertenece a esta sucursal o cliente");
            }
            if (reserva.getEstado() != EstadoReserva.COMPLETADA) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Solo se puede reseñar una reserva COMPLETADA");
            }
            resena.setReserva(reserva);
        }

        return toDto(resenaRepository.save(resena));
    }

    public List<ResenaResponseDto> listBySucursal(Long sucursalId, boolean soloAprobadas) {
        findSucursalOrThrow(sucursalId);
        List<Resena> resenas = soloAprobadas
                ? resenaRepository.findBySucursalIdAndAprobadaTrueOrderByFechaCreacionDesc(sucursalId)
                : resenaRepository.findBySucursalIdOrderByFechaCreacionDesc(sucursalId);
        return resenas.stream().map(this::toDto).toList();
    }

    public List<ResenaResponseDto> listByCliente(Long clienteId) {
        if (!clienteRepository.existsById(clienteId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado");
        }
        return resenaRepository.findByClienteIdOrderByFechaCreacionDesc(clienteId)
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public ResenaResponseDto aprobar(Long sucursalId, Long id) {
        Resena resena = findOrThrow(id, sucursalId);
        if (resena.getAprobada()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La reseña ya está aprobada");
        }
        resena.setAprobada(true);
        resenaRepository.save(resena);
        recalcularRatings(sucursalId);
        return toDto(resena);
    }

    @Transactional
    public void eliminar(Long sucursalId, Long id) {
        Resena resena = findOrThrow(id, sucursalId);
        boolean eraAprobada = resena.getAprobada();
        resenaRepository.delete(resena);
        if (eraAprobada) {
            recalcularRatings(sucursalId);
        }
    }

    // Recalcula rating_promedio / cant_resenias en Sucursal y los globales en Restaurante
    private void recalcularRatings(Long sucursalId) {
        Sucursal sucursal = findSucursalOrThrow(sucursalId);

        double promSucursal = resenaRepository.calcularPromedioSucursal(sucursalId);
        long cantSucursal   = resenaRepository.contarAprobadasSucursal(sucursalId);
        sucursal.setRatingPromedio(BigDecimal.valueOf(promSucursal).setScale(2, RoundingMode.HALF_UP));
        sucursal.setCantResenias((int) cantSucursal);
        sucursalRepository.save(sucursal);

        Restaurante restaurante = sucursal.getRestaurante();
        double promGlobal = resenaRepository.calcularPromedioRestaurante(restaurante.getId());
        long cantGlobal   = resenaRepository.contarAprobadasRestaurante(restaurante.getId());
        restaurante.setRatingPromedioGlobal(BigDecimal.valueOf(promGlobal).setScale(2, RoundingMode.HALF_UP));
        restaurante.setCantReseniasGlobal((int) cantGlobal);
        restauranteRepository.save(restaurante);
    }

    private Sucursal findSucursalOrThrow(Long sucursalId) {
        return sucursalRepository.findById(sucursalId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sucursal no encontrada"));
    }

    private Resena findOrThrow(Long id, Long sucursalId) {
        Resena resena = resenaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reseña no encontrada"));
        if (!resena.getSucursal().getId().equals(sucursalId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Reseña no encontrada");
        }
        return resena;
    }

    private ResenaResponseDto toDto(Resena r) {
        return new ResenaResponseDto(
                r.getId(),
                r.getSucursal().getId(),
                r.getCliente().getId(),
                r.getReserva() != null ? r.getReserva().getId() : null,
                r.getPuntuacion(),
                r.getComentario(),
                r.getMostrarNombre(),
                r.getAprobada(),
                r.getFechaCreacion(),
                r.getFechaActualizacion()
        );
    }
}
