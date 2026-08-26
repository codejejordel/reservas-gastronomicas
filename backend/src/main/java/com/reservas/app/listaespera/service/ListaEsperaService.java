package com.reservas.app.listaespera.service;

import com.reservas.app.cliente.entity.Cliente;
import com.reservas.app.cliente.repository.ClienteRepository;
import com.reservas.app.listaespera.dto.ConvertirReservaRequestDto;
import com.reservas.app.listaespera.dto.CreateListaEsperaRequestDto;
import com.reservas.app.listaespera.dto.ListaEsperaResponseDto;
import com.reservas.app.listaespera.dto.NotificarListaEsperaRequestDto;
import com.reservas.app.listaespera.entity.EstadoListaEspera;
import com.reservas.app.listaespera.entity.ListaEspera;
import com.reservas.app.listaespera.repository.ListaEsperaRepository;
import com.reservas.app.reserva.entity.Reserva;
import com.reservas.app.reserva.repository.ReservaRepository;
import com.reservas.app.sucursal.entity.Sucursal;
import com.reservas.app.sucursal.repository.SucursalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ListaEsperaService {

    private static final Set<EstadoListaEspera> ESTADOS_CANCELABLES =
            Set.of(EstadoListaEspera.EN_ESPERA, EstadoListaEspera.NOTIFICADA);

    private final ListaEsperaRepository listaEsperaRepository;
    private final SucursalRepository sucursalRepository;
    private final ClienteRepository clienteRepository;
    private final ReservaRepository reservaRepository;

    @Transactional
    public ListaEsperaResponseDto create(Long sucursalId, CreateListaEsperaRequestDto request) {
        Sucursal sucursal = findSucursalOrThrow(sucursalId);

        if (request.getFechaDeseada().isBefore(LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "fechaDeseada no puede ser en el pasado");
        }

        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));

        if (cliente.getBloqueado()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El cliente está bloqueado y no puede unirse a la lista de espera");
        }

        if (listaEsperaRepository.existsBySucursalIdAndClienteIdAndEstado(
                sucursalId, request.getClienteId(), EstadoListaEspera.EN_ESPERA)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El cliente ya tiene una entrada activa en la lista de espera de esta sucursal");
        }

        ListaEspera entrada = new ListaEspera();
        entrada.setSucursal(sucursal);
        entrada.setCliente(cliente);
        entrada.setFechaDeseada(request.getFechaDeseada());
        entrada.setHoraDeseada(request.getHoraDeseada());
        entrada.setCantPersonas(request.getCantPersonas());
        if (request.getFlexibilidadHoraria() != null) entrada.setFlexibilidadHoraria(request.getFlexibilidadHoraria());
        if (request.getFlexibilidadFecha()   != null) entrada.setFlexibilidadFecha(request.getFlexibilidadFecha());

        return toDto(listaEsperaRepository.save(entrada));
    }

    public List<ListaEsperaResponseDto> listBySucursal(Long sucursalId) {
        findSucursalOrThrow(sucursalId);
        return listaEsperaRepository.findBySucursalIdOrderByPrioridadDescFechaCreacionAsc(sucursalId)
                .stream().map(this::toDto).toList();
    }

    public List<ListaEsperaResponseDto> listBySucursalYEstado(Long sucursalId, EstadoListaEspera estado) {
        findSucursalOrThrow(sucursalId);
        return listaEsperaRepository.findBySucursalIdAndEstadoOrderByPrioridadDescFechaCreacionAsc(sucursalId, estado)
                .stream().map(this::toDto).toList();
    }

    public List<ListaEsperaResponseDto> listByCliente(Long clienteId) {
        if (!clienteRepository.existsById(clienteId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado");
        }
        return listaEsperaRepository.findByClienteIdOrderByFechaCreacionDesc(clienteId)
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public ListaEsperaResponseDto notificar(Long sucursalId, Long id, NotificarListaEsperaRequestDto request) {
        ListaEspera entrada = findOrThrow(id, sucursalId);

        if (entrada.getEstado() != EstadoListaEspera.EN_ESPERA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Solo se puede notificar una entrada en estado EN_ESPERA");
        }
        if (request.getFechaExpiracionNotif().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "fechaExpiracionNotif debe ser futura");
        }

        entrada.setEstado(EstadoListaEspera.NOTIFICADA);
        entrada.setFechaNotificacion(LocalDateTime.now());
        entrada.setFechaExpiracionNotif(request.getFechaExpiracionNotif());

        return toDto(listaEsperaRepository.save(entrada));
    }

    @Transactional
    public ListaEsperaResponseDto convertirAReserva(Long sucursalId, Long id, ConvertirReservaRequestDto request) {
        ListaEspera entrada = findOrThrow(id, sucursalId);

        if (entrada.getEstado() != EstadoListaEspera.NOTIFICADA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Solo se puede convertir una entrada en estado NOTIFICADA");
        }

        Reserva reserva = reservaRepository.findById(request.getReservaId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));

        if (!reserva.getSucursal().getId().equals(sucursalId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "La reserva no pertenece a esta sucursal");
        }

        entrada.setEstado(EstadoListaEspera.CONVERTIDA_RESERVA);
        entrada.setReserva(reserva);

        return toDto(listaEsperaRepository.save(entrada));
    }

    @Transactional
    public ListaEsperaResponseDto cancelar(Long sucursalId, Long id) {
        ListaEspera entrada = findOrThrow(id, sucursalId);

        if (!ESTADOS_CANCELABLES.contains(entrada.getEstado())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Solo se puede cancelar una entrada en estado EN_ESPERA o NOTIFICADA");
        }

        entrada.setEstado(EstadoListaEspera.CANCELADA);
        return toDto(listaEsperaRepository.save(entrada));
    }

    private Sucursal findSucursalOrThrow(Long sucursalId) {
        return sucursalRepository.findById(sucursalId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sucursal no encontrada"));
    }

    private ListaEspera findOrThrow(Long id, Long sucursalId) {
        ListaEspera entrada = listaEsperaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Entrada de lista de espera no encontrada"));
        if (!entrada.getSucursal().getId().equals(sucursalId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Entrada de lista de espera no encontrada");
        }
        return entrada;
    }

    private ListaEsperaResponseDto toDto(ListaEspera l) {
        return new ListaEsperaResponseDto(
                l.getId(),
                l.getSucursal().getId(),
                l.getCliente().getId(),
                l.getReserva() != null ? l.getReserva().getId() : null,
                l.getFechaDeseada(),
                l.getHoraDeseada(),
                l.getCantPersonas(),
                l.getFlexibilidadHoraria(),
                l.getFlexibilidadFecha(),
                l.getEstado(),
                l.getPrioridad(),
                l.getFechaNotificacion(),
                l.getFechaExpiracionNotif(),
                l.getFechaCreacion(),
                l.getFechaActualizacion()
        );
    }
}
