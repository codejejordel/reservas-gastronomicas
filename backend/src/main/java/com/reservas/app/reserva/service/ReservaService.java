package com.reservas.app.reserva.service;

import com.reservas.app.cliente.entity.Cliente;
import com.reservas.app.cliente.repository.ClienteRepository;
import com.reservas.app.reserva.asignacion.dto.AsignacionMesaResponseDto;
import com.reservas.app.reserva.asignacion.repository.AsignacionMesaRepository;
import com.reservas.app.reserva.dto.CancelarReservaRequestDto;
import com.reservas.app.reserva.dto.CreateReservaPublicaRequestDto;
import com.reservas.app.reserva.dto.CreateReservaRequestDto;
import com.reservas.app.reserva.dto.ReservaDetalleResponseDto;
import com.reservas.app.reserva.dto.ReservaPublicCreatedResponseDto;
import com.reservas.app.reserva.dto.ReservaResponseDto;
import com.reservas.app.reserva.entity.EstadoReserva;
import com.reservas.app.reserva.entity.Reserva;
import com.reservas.app.reserva.repository.ReservaRepository;
import com.reservas.app.reserva.realtime.ReservaCreatedEvent;
import com.reservas.app.reserva.spec.ReservaSpecs;
import com.reservas.app.mesa.repository.MesaRepository;
import com.reservas.app.sucursal.configuracion.entity.ConfiguracionSucursal;
import com.reservas.app.sucursal.configuracion.repository.ConfiguracionSucursalRepository;
import com.reservas.app.sucursal.entity.Sucursal;
import com.reservas.app.sucursal.repository.SucursalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.context.ApplicationEventPublisher;
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
    private final MesaRepository mesaRepository;
    private final AsignacionMesaRepository asignacionMesaRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final ReservaPublicAccessService publicAccessService;

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
        publicAccessService.initialize(reserva, config);

        if (estadoInicial == EstadoReserva.CONFIRMADA) {
            reserva.setFechaConfirmacion(LocalDateTime.now());
        }

        Reserva saved = reservaRepository.save(reserva);
        eventPublisher.publishEvent(ReservaCreatedEvent.from(saved));
        return toDto(saved);
    }

    @Transactional
    public ReservaPublicCreatedResponseDto createPublic(CreateReservaPublicaRequestDto request) {
        Sucursal sucursal = sucursalRepository.findById(request.getSucursalId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sucursal no encontrada"));

        if (!Boolean.TRUE.equals(sucursal.getActiva())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La sucursal no está activa");
        }

        ConfiguracionSucursal config = configuracionRepository.findBySucursalId(sucursal.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "La sucursal no tiene configuración"));

        // Validar rango de personas
        if (request.getCantPersonas() < config.getMinPersonasPorReserva()
                || request.getCantPersonas() > config.getMaxPersonasPorReserva()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    String.format("La cantidad de personas debe estar entre %d y %d",
                            config.getMinPersonasPorReserva(), config.getMaxPersonasPorReserva()));
        }

        // Validar disponibilidad (race condition protection)
        Integer capacidadTotal = mesaRepository.sumCapacidadBySucursalId(sucursal.getId());
        if (capacidadTotal == null) capacidadTotal = 0;
        Integer ocupadas = reservaRepository.sumPersonasBySucursalFechaHora(
                sucursal.getId(), request.getFechaReserva(), request.getHoraReserva());
        int disponible = capacidadTotal - (ocupadas != null ? ocupadas : 0);
        if (disponible < request.getCantPersonas()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "No hay disponibilidad para esa fecha y hora");
        }

        // Crear reserva con datos guest (sin crear Cliente/Usuario)
        EstadoReserva estadoInicial = determinarEstadoInicial(config);

        Reserva reserva = new Reserva();
        reserva.setCodigoReserva(generarCodigo());
        reserva.setSucursal(sucursal);
        reserva.setNombreInvitado(request.getCliente().getNombre());
        reserva.setEmailInvitado(request.getCliente().getEmail().toLowerCase().trim());
        reserva.setTelefonoInvitado(request.getCliente().getTelefono());
        reserva.setFechaReserva(request.getFechaReserva());
        reserva.setHoraReserva(request.getHoraReserva());
        reserva.setCantPersonas(request.getCantPersonas());
        reserva.setObservaciones(request.getObservaciones());
        reserva.setCanalNotif(request.getCanalNotif());
        reserva.setEstado(estadoInicial);
        String accessToken = publicAccessService.initialize(reserva, config);

        if (estadoInicial == EstadoReserva.CONFIRMADA) {
            reserva.setFechaConfirmacion(LocalDateTime.now());
        }

        Reserva saved = reservaRepository.save(reserva);
        eventPublisher.publishEvent(ReservaCreatedEvent.from(saved));
        return new ReservaPublicCreatedResponseDto(
                saved.getCodigoReserva(),
                saved.getEstado(),
                saved.getFechaReserva(),
                saved.getHoraReserva(),
                saved.getCantPersonas(),
                accessToken,
                saved.getFechaLimitePago());
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

    @Transactional(readOnly = true)
    public Page<ReservaResponseDto> searchBySucursal(Long sucursalId, LocalDate desde, LocalDate hasta,
                                                       List<EstadoReserva> estados, String busqueda,
                                                       int page, int size, Sort.Direction direccionOrden) {
        if (page < 0 || size < 1 || size > 50) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La página debe ser mayor o igual a cero y el tamaño debe estar entre 1 y 50");
        }
        if (desde != null && hasta != null && desde.isAfter(hasta)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La fecha desde no puede ser posterior a la fecha hasta");
        }

        Specification<Reserva> spec = Specification.where(ReservaSpecs.conSucursal(sucursalId))
                .and(ReservaSpecs.entreFehas(desde, hasta))
                .and(ReservaSpecs.conEstados(estados))
                .and(ReservaSpecs.conBusqueda(busqueda));
        Pageable pageable = PageRequest.of(page, size,
                Sort.by(direccionOrden, "fechaReserva", "horaReserva"));

        return reservaRepository.findAll(spec, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public ReservaDetalleResponseDto getDetalle(Long id) {
        Reserva reserva = findOrThrow(id);
        Cliente cliente = reserva.getCliente();
        String contactoNombre = cliente != null ? cliente.getNombreCompleto() : reserva.getNombreInvitado();
        String contactoEmail = cliente != null ? cliente.getEmail() : reserva.getEmailInvitado();
        String contactoTelefono = cliente != null ? cliente.getTelefono() : reserva.getTelefonoInvitado();
        List<AsignacionMesaResponseDto> asignaciones = asignacionMesaRepository
                .findByReservaIdAndActivaTrue(id)
                .stream()
                .map(a -> new AsignacionMesaResponseDto(
                        a.getId(), a.getReserva().getId(), a.getMesa().getId(),
                        a.getMesa().getNombre(), a.getMesa().getCapacidad(),
                        a.getFechaAsignacion(), a.getActiva()))
                .toList();

        return new ReservaDetalleResponseDto(
                reserva.getId(), reserva.getCodigoReserva(), reserva.getFechaReserva(), reserva.getHoraReserva(),
                reserva.getCantPersonas(), reserva.getEstado(), cliente != null ? cliente.getId() : null,
                contactoNombre, contactoEmail, contactoTelefono, reserva.getObservaciones(), reserva.getCanalNotif(),
                reserva.getFechaConfirmacion(), reserva.getFechaCancelacion(), reserva.getMotivoCancelacion(),
                reserva.getCanceladaPor(), reserva.getFechaCreacion(), reserva.getFechaActualizacion(), asignaciones);
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
        Long clienteId = r.getCliente() != null ? r.getCliente().getId() : null;
        String clienteNombre = r.getCliente() != null ? r.getCliente().getNombreCompleto() : null;
        return new ReservaResponseDto(
                r.getId(), r.getCodigoReserva(),
                r.getSucursal().getId(), clienteId, clienteNombre,
                r.getFechaReserva(), r.getHoraReserva(), r.getCantPersonas(),
                r.getEstado(), r.getObservaciones(), r.getCanalNotif(),
                r.getFechaConfirmacion(), r.getFechaCancelacion(),
                r.getMotivoCancelacion(), r.getCanceladaPor(), r.getFechaCreacion(),
                r.getNombreInvitado(), r.getEmailInvitado(), r.getTelefonoInvitado()
        );
    }
}
