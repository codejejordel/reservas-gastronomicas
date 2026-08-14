package com.reservas.app.notificacion.service;

import com.reservas.app.cliente.repository.ClienteRepository;
import com.reservas.app.notificacion.dto.CreateNotificacionRequestDto;
import com.reservas.app.notificacion.dto.NotificacionResponseDto;
import com.reservas.app.notificacion.entity.EstadoNotificacion;
import com.reservas.app.notificacion.entity.Notificacion;
import com.reservas.app.notificacion.repository.NotificacionRepository;
import com.reservas.app.reserva.repository.ReservaRepository;
import com.reservas.app.sucursal.repository.SucursalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final ClienteRepository clienteRepository;
    private final ReservaRepository reservaRepository;
    private final SucursalRepository sucursalRepository;

    @Transactional
    public NotificacionResponseDto create(CreateNotificacionRequestDto request) {
        Notificacion n = new Notificacion();

        if (request.getClienteId() != null) {
            n.setCliente(clienteRepository.findById(request.getClienteId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado")));
        }
        if (request.getReservaId() != null) {
            n.setReserva(reservaRepository.findById(request.getReservaId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada")));
        }
        if (request.getSucursalId() != null) {
            n.setSucursal(sucursalRepository.findById(request.getSucursalId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sucursal no encontrada")));
        }

        n.setTipo(request.getTipo());
        n.setCanal(request.getCanal());
        n.setAsunto(request.getAsunto());
        n.setMensaje(request.getMensaje());

        return toDto(notificacionRepository.save(n));
    }

    public List<NotificacionResponseDto> listByCliente(Long clienteId) {
        if (!clienteRepository.existsById(clienteId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado");
        }
        return notificacionRepository.findByClienteIdOrderByFechaCreacionDesc(clienteId)
                .stream().map(this::toDto).toList();
    }

    public List<NotificacionResponseDto> listBySucursal(Long sucursalId) {
        if (!sucursalRepository.existsById(sucursalId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Sucursal no encontrada");
        }
        return notificacionRepository.findBySucursalIdOrderByFechaCreacionDesc(sucursalId)
                .stream().map(this::toDto).toList();
    }

    public List<NotificacionResponseDto> listByReserva(Long reservaId) {
        if (!reservaRepository.existsById(reservaId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada");
        }
        return notificacionRepository.findByReservaIdOrderByFechaCreacionDesc(reservaId)
                .stream().map(this::toDto).toList();
    }

    public List<NotificacionResponseDto> listPendientes() {
        return notificacionRepository.findByEstadoOrderByFechaCreacionAsc(EstadoNotificacion.PENDIENTE)
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public NotificacionResponseDto registrarEnvio(Long id) {
        Notificacion n = findOrThrow(id);
        if (n.getEstado() != EstadoNotificacion.PENDIENTE && n.getEstado() != EstadoNotificacion.FALLIDA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Solo se puede registrar envío de notificaciones en estado PENDIENTE o FALLIDA");
        }
        n.setEstado(EstadoNotificacion.ENVIADA);
        n.setFechaEnvio(LocalDateTime.now());
        n.setIntentos(n.getIntentos() + 1);
        return toDto(notificacionRepository.save(n));
    }

    @Transactional
    public NotificacionResponseDto registrarFallo(Long id) {
        Notificacion n = findOrThrow(id);
        if (n.getEstado() != EstadoNotificacion.PENDIENTE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Solo se puede registrar fallo de notificaciones en estado PENDIENTE");
        }
        n.setEstado(EstadoNotificacion.FALLIDA);
        n.setIntentos(n.getIntentos() + 1);
        return toDto(notificacionRepository.save(n));
    }

    @Transactional
    public NotificacionResponseDto marcarLeida(Long id) {
        Notificacion n = findOrThrow(id);
        if (n.getEstado() != EstadoNotificacion.ENVIADA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Solo se pueden marcar como leídas las notificaciones en estado ENVIADA");
        }
        n.setEstado(EstadoNotificacion.LEIDA);
        return toDto(notificacionRepository.save(n));
    }

    private Notificacion findOrThrow(Long id) {
        return notificacionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notificación no encontrada"));
    }

    private NotificacionResponseDto toDto(Notificacion n) {
        return new NotificacionResponseDto(
                n.getId(),
                n.getCliente()  != null ? n.getCliente().getId()  : null,
                n.getReserva()  != null ? n.getReserva().getId()  : null,
                n.getSucursal() != null ? n.getSucursal().getId() : null,
                n.getTipo(),
                n.getCanal(),
                n.getAsunto(),
                n.getMensaje(),
                n.getEstado(),
                n.getFechaEnvio(),
                n.getIntentos(),
                n.getFechaCreacion(),
                n.getFechaActualizacion()
        );
    }
}
