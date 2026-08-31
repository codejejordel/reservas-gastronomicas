package com.reservas.app.reserva.service;

import com.reservas.app.cliente.entity.Cliente;
import com.reservas.app.cliente.repository.ClienteRepository;
import com.reservas.app.mesa.repository.MesaRepository;
import com.reservas.app.reserva.asignacion.repository.AsignacionMesaRepository;
import com.reservas.app.reserva.dto.CreateReservaPublicaRequestDto;
import com.reservas.app.reserva.dto.CreateReservaRequestDto;
import com.reservas.app.reserva.entity.Reserva;
import com.reservas.app.reserva.realtime.ReservaCreatedEvent;
import com.reservas.app.reserva.repository.ReservaRepository;
import com.reservas.app.restaurante.entity.Restaurante;
import com.reservas.app.sucursal.configuracion.entity.ConfiguracionSucursal;
import com.reservas.app.sucursal.configuracion.repository.ConfiguracionSucursalRepository;
import com.reservas.app.sucursal.entity.Sucursal;
import com.reservas.app.sucursal.repository.SucursalRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReservaServiceRealtimeTest {

    @Mock private ReservaRepository reservaRepository;
    @Mock private ClienteRepository clienteRepository;
    @Mock private SucursalRepository sucursalRepository;
    @Mock private ConfiguracionSucursalRepository configuracionRepository;
    @Mock private MesaRepository mesaRepository;
    @Mock private AsignacionMesaRepository asignacionMesaRepository;
    @Mock private ApplicationEventPublisher eventPublisher;
    @Mock private ReservaPublicAccessService publicAccessService;

    private ReservaService service;
    private Sucursal sucursal;

    @BeforeEach
    void setUp() {
        service = new ReservaService(reservaRepository, clienteRepository, sucursalRepository,
                configuracionRepository, mesaRepository, asignacionMesaRepository, eventPublisher,
                publicAccessService);

        Restaurante restaurante = new Restaurante();
        restaurante.setId(3L);
        sucursal = new Sucursal();
        sucursal.setId(7L);
        sucursal.setNombre("Palermo");
        sucursal.setZonaHoraria("America/Argentina/Buenos_Aires");
        sucursal.setRestaurante(restaurante);
        sucursal.setActiva(true);

        ConfiguracionSucursal configuracion = new ConfiguracionSucursal();
        configuracion.setMinPersonasPorReserva(1);
        configuracion.setMaxPersonasPorReserva(12);
        configuracion.setConfirmacionAutomatica(true);

        when(sucursalRepository.findById(7L)).thenReturn(Optional.of(sucursal));
        when(configuracionRepository.findBySucursalId(7L)).thenReturn(Optional.of(configuracion));
        when(reservaRepository.existsByCodigoReserva(any())).thenReturn(false);
        when(publicAccessService.initialize(any(), any())).thenReturn("public-token");
        when(reservaRepository.save(any())).thenAnswer(invocation -> {
            Reserva reserva = invocation.getArgument(0);
            reserva.setId(41L);
            return reserva;
        });
    }

    @Test
    void publishesOneImmutableEventAfterAuthenticatedCreationSave() {
        Cliente cliente = new Cliente();
        cliente.setId(11L);
        cliente.setNombreCompleto("Ana Pérez");
        cliente.setBloqueado(false);
        when(clienteRepository.findById(11L)).thenReturn(Optional.of(cliente));

        CreateReservaRequestDto request = new CreateReservaRequestDto();
        request.setSucursalId(7L);
        request.setClienteId(11L);
        request.setFechaReserva(LocalDate.of(2026, 8, 28));
        request.setHoraReserva(LocalTime.of(20, 30));
        request.setCantPersonas(4);

        service.create(request);

        ArgumentCaptor<ReservaCreatedEvent> event = ArgumentCaptor.forClass(ReservaCreatedEvent.class);
        verify(eventPublisher).publishEvent(event.capture());
        assertThat(event.getValue().reservaId()).isEqualTo(41L);
        assertThat(event.getValue().restauranteId()).isEqualTo(3L);
        assertThat(event.getValue().sucursalId()).isEqualTo(7L);
        assertThat(event.getValue().clienteNombre()).isEqualTo("Ana Pérez");
    }

    @Test
    void publishesOneImmutableEventAfterPublicCreationSave() {
        when(mesaRepository.sumCapacidadBySucursalId(7L)).thenReturn(30);
        when(reservaRepository.sumPersonasBySucursalFechaHora(any(), any(), any())).thenReturn(2);

        CreateReservaPublicaRequestDto.ClienteInlineDto guest = new CreateReservaPublicaRequestDto.ClienteInlineDto();
        guest.setNombre("Luis Gómez");
        guest.setEmail("luis@example.com");

        CreateReservaPublicaRequestDto request = new CreateReservaPublicaRequestDto();
        request.setSucursalId(7L);
        request.setFechaReserva(LocalDate.of(2026, 8, 29));
        request.setHoraReserva(LocalTime.of(21, 0));
        request.setCantPersonas(2);
        request.setCliente(guest);

        service.createPublic(request);

        ArgumentCaptor<ReservaCreatedEvent> event = ArgumentCaptor.forClass(ReservaCreatedEvent.class);
        verify(eventPublisher).publishEvent(event.capture());
        assertThat(event.getValue().eventId()).isNotNull();
        assertThat(event.getValue().clienteNombre()).isEqualTo("Luis Gómez");
        assertThat(event.getValue().zonaHoraria()).isEqualTo("America/Argentina/Buenos_Aires");
    }
}
