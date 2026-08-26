package com.reservas.app.reserva.service;

import com.reservas.app.reserva.dto.CotizacionReservaResponseDto;
import com.reservas.app.sucursal.configuracion.entity.ConfiguracionSucursal;
import com.reservas.app.sucursal.configuracion.repository.ConfiguracionSucursalRepository;
import com.reservas.app.sucursal.entity.Sucursal;
import com.reservas.app.sucursal.repository.SucursalRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CotizacionReservaServiceTest {

    @Mock
    private SucursalRepository sucursalRepository;
    @Mock
    private ConfiguracionSucursalRepository configuracionRepository;

    private CotizacionReservaService service;
    private ConfiguracionSucursal config;

    @BeforeEach
    void setUp() {
        service = new CotizacionReservaService(
                sucursalRepository, configuracionRepository, new BigDecimal("500"));

        Sucursal sucursal = new Sucursal();
        sucursal.setId(7L);
        sucursal.setActiva(true);
        when(sucursalRepository.findById(7L)).thenReturn(Optional.of(sucursal));

        config = new ConfiguracionSucursal();
        config.setMinPersonasPorReserva(2);
        config.setMaxPersonasPorReserva(12);
        config.setHorasCancelacionLibre(24);
        config.setToleranciaMinutos(15);
        when(configuracionRepository.findBySucursalId(7L)).thenReturn(Optional.of(config));
    }

    @Test
    void calculatesServiceFeeDepositAndTotal() {
        config.setCobrarSenia(true);
        config.setMontoSenia(new BigDecimal("2000"));

        CotizacionReservaResponseDto quote = service.cotizar(7L, 3);

        assertThat(quote.cargoServicioUnitario()).isEqualByComparingTo("500.00");
        assertThat(quote.cargoServicioTotal()).isEqualByComparingTo("1500.00");
        assertThat(quote.cobraSenia()).isTrue();
        assertThat(quote.montoSenia()).isEqualByComparingTo("2000.00");
        assertThat(quote.totalAPagarAhora()).isEqualByComparingTo("3500.00");
        assertThat(quote.horasCancelacionLibre()).isEqualTo(24);
        assertThat(quote.toleranciaMinutos()).isEqualTo(15);
    }

    @Test
    void excludesDepositWhenDisabledOrMissing() {
        config.setCobrarSenia(false);
        config.setMontoSenia(new BigDecimal("2000"));

        CotizacionReservaResponseDto disabled = service.cotizar(7L, 2);

        config.setCobrarSenia(true);
        config.setMontoSenia(null);
        CotizacionReservaResponseDto missing = service.cotizar(7L, 2);

        assertThat(disabled.montoSenia()).isEqualByComparingTo("0.00");
        assertThat(disabled.totalAPagarAhora()).isEqualByComparingTo("1000.00");
        assertThat(missing.montoSenia()).isEqualByComparingTo("0.00");
        assertThat(missing.totalAPagarAhora()).isEqualByComparingTo("1000.00");
    }

    @Test
    void rejectsPartySizeOutsideBranchConfiguration() {
        assertThatThrownBy(() -> service.cotizar(7L, 1))
                .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                    assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(exception.getReason()).isEqualTo(
                            "La cantidad de personas debe estar entre 2 y 12");
                });

        assertThatThrownBy(() -> service.cotizar(7L, 13))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void requiresExistingBranchAndConfiguration() {
        when(sucursalRepository.findById(8L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.cotizar(8L, 2))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND));

        when(configuracionRepository.findBySucursalId(7L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.cotizar(7L, 2))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        exception -> assertThat(exception.getStatusCode())
                                .isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR));
    }
}
