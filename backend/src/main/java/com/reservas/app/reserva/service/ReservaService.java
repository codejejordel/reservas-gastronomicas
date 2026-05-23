package com.reservas.app.reserva.service;

import com.reservas.app.cliente.entity.Cliente;
import com.reservas.app.cliente.repository.ClienteRepository;
import com.reservas.app.reserva.dto.CancelarReservaRequestDto;
import com.reservas.app.reserva.dto.CreateReservaRequestDto;
import com.reservas.app.reserva.dto.ReservaResponseDto;
import com.reservas.app.reserva.entity.CanceladaPor;
import com.reservas.app.reserva.entity.EstadoReserva;
import com.reservas.app.reserva.entity.Reserva;
import com.reservas.app.reserva.repository.ReservaRepository;
import com.reservas.app.reserva.spec.ReservaSpecs;
import com.reservas.app.sucursal.configuracion.entity.ConfiguracionSucursal;
import com.reservas.app.sucursal.configuracion.repository.ConfiguracionSucursalRepository;
import com.reservas.app.sucursal.entity.Sucursal;
import com.reservas.app.sucursal.repository.SucursalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class ReservaService {

    private final ReservaRepository reservaRepository;
    private final ClienteRepository clienteRepository;
    private final SucursalRepository sucursalRepository;
    private final ConfiguracionSucursalRepository configuracionRepository;

    @Transactional
    public ReservaResponseDto create(CreateReservaRequestDto request) {
        Sucursal sucursal = sucursalRepository.findById(request.getSucursalId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sucursal no encontrada"));

        if (!Boolean.TRUE.equals(sucursal.getActiva())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La sucursal no está activa");
        }

        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));

        if (Boolean.TRUE.equals(cliente.getBloqueado())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El cliente está bloqueado");
        }

        ConfiguracionSucursal config = configuracionRepository.findBySucursalId(sucursal.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "La sucursal no tiene configuración"));

        if (request.getCantPersonas() < config.getMinPersonasPorReserva()
                || request.getCantPersonas() > config.getMaxPersonasPorReserva()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    String.format("La cantidad de personas debe estar entre %d y %d",
                            config.getMinPersonasPorReserva(), config.getMaxPersonasPorReserva()));
        }

        EstadoReserva estadoInicial = determinarEstadoInicial(config);

        Reserva reserva = new Reserva();
        reserva.setCodigoReserva(generarCodigo());
        reserva.setSucursal(sucursal);
        reserva.setCliente(cliente);
        reserva.setFechaReserva(request.getFechaReserva());
        reserva.setHoraReserva(request.getHoraReserva());
        reserva.setCantPersonas(request.getCantPersonas());
        reserva.setObservaciones(request.getObservaciones());
        reserva.setCanalNotif(request.getCanalNotif());
        reserva.setEstado(estadoInicial);

        if (estadoInicial == EstadoReserva.CONFIRMADA) {
            reserva.setFechaConfirmacion(LocalDateTime.now());
        }

        return toDto(reservaRepository.save(reserva));
    }

    public ReservaResponseDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    public ReservaResponseDto getByCodigo(String codigo) {
        Reserva reserva = reservaRepository.findByCodigoReserva(codigo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));
        return toDto(reserva);
    }

    public List<ReservaResponseDto> listBySucursal(Long sucursalId, LocalDate fecha, EstadoReserva estado) {
        Specification<Reserva> spec = Specification.where(ReservaSpecs.conSucursal(sucursalId))
                .and(ReservaSpecs.conFecha(fecha))
                .and(ReservaSpecs.conEstado(estado));
        return reservaRepository.findAll(spec).stream().map(this::toDto).toList();
    }

    public List<ReservaResponseDto> listByCliente(Long clienteId) {
        return reservaRepository.findByClienteId(clienteId).stream().map(this::toDto).toList();
    }

    @Transactional
    public ReservaResponseDto confirmar(Long id) {
        try {
            Reserva reserva = findOrThrow(id);
            validarTransicion(reserva.getEstado(), EstadoReserva.CONFIRMADA,
                    EstadoReserva.PENDIENTE_CONFIRMACION);
            reserva.setEstado(EstadoReserva.CONFIRMADA);
            reserva.setFechaConfirmacion(LocalDateTime.now());
            return toDto(reservaRepository.save(reserva));
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "La reserva fue modificada por otro proceso. Intentá de nuevo.");
        }
    }

    @Transactional
    public ReservaResponseDto cancelar(Long id, CancelarReservaRequestDto request) {
        try {
            Reserva reserva = findOrThrow(id);
            validarTransicion(reserva.getEstado(), EstadoReserva.CANCELADA,
                    EstadoReserva.PENDIENTE_PAGO,
                    EstadoReserva.PENDIENTE_CONFIRMACION,
                    EstadoReserva.CONFIRMADA);
            reserva.setEstado(EstadoReserva.CANCELADA);
            reserva.setFechaCancelacion(LocalDateTime.now());
            reserva.setMotivoCancelacion(request.getMotivo());
            reserva.setCanceladaPor(request.getCanceladaPor());
            return toDto(reservaRepository.save(reserva));
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "La reserva fue modificada por otro proceso. Intentá de nuevo.");
        }
    }

    @Transactional
    public ReservaResponseDto completar(Long id) {
        try {
            Reserva reserva = findOrThrow(id);
            validarTransicion(reserva.getEstado(), EstadoReserva.COMPLETADA, EstadoReserva.CONFIRMADA);
            reserva.setEstado(EstadoReserva.COMPLETADA);
            return toDto(reservaRepository.save(reserva));
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "La reserva fue modificada por otro proceso. Intentá de nuevo.");
        }
    }

    @Transactional
    public ReservaResponseDto marcarNoShow(Long id) {
        try {
            Reserva reserva = findOrThrow(id);
            validarTransicion(reserva.getEstado(), EstadoReserva.NO_SHOW, EstadoReserva.CONFIRMADA);
            reserva.setEstado(EstadoReserva.NO_SHOW);

            Cliente cliente = reserva.getCliente();
            cliente.setCantNoShows(cliente.getCantNoShows() + 1);
            clienteRepository.save(cliente);

            return toDto(reservaRepository.save(reserva));
        } catch (ObjectOptimisticLockingFailureException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "La reserva fue modificada por otro proceso. Intentá de nuevo.");
        }
    }

    private EstadoReserva determinarEstadoInicial(ConfiguracionSucursal config) {
        if (Boolean.TRUE.equals(config.getCobrarSenia())) {
            return EstadoReserva.PENDIENTE_PAGO;
        }
        return Boolean.TRUE.equals(config.getConfirmacionAutomatica())
                ? EstadoReserva.CONFIRMADA
                : EstadoReserva.PENDIENTE_CONFIRMACION;
    }

    private void validarTransicion(EstadoReserva actual, EstadoReserva destino, EstadoReserva... permitidos) {
        for (EstadoReserva p : permitidos) {
            if (actual == p) return;
        }
        throw new ResponseStatusException(HttpStatus.CONFLICT,
                String.format("No se puede pasar de %s a %s", actual, destino));
    }

    private String generarCodigo() {
        String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
        Random rnd = new Random();
        StringBuilder sb = new StringBuilder("RES-").append(datePart).append("-");
        for (int i = 0; i < 4; i++) sb.append(chars.charAt(rnd.nextInt(chars.length())));
        String codigo = sb.toString();
        return reservaRepository.existsByCodigoReserva(codigo) ? generarCodigo() : codigo;
    }

    private Reserva findOrThrow(Long id) {
        return reservaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));
    }

    private ReservaResponseDto toDto(Reserva r) {
        return new ReservaResponseDto(
                r.getId(), r.getCodigoReserva(),
                r.getSucursal().getId(), r.getCliente().getId(), r.getCliente().getNombreCompleto(),
                r.getFechaReserva(), r.getHoraReserva(), r.getCantPersonas(),
                r.getEstado(), r.getObservaciones(), r.getCanalNotif(),
                r.getFechaConfirmacion(), r.getFechaCancelacion(),
                r.getMotivoCancelacion(), r.getCanceladaPor(), r.getFechaCreacion()
        );
    }
}
