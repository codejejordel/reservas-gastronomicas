package com.reservas.app.reserva.service;

import com.reservas.app.reserva.dto.CotizacionReservaResponseDto;
import com.reservas.app.sucursal.configuracion.entity.ConfiguracionSucursal;
import com.reservas.app.sucursal.configuracion.repository.ConfiguracionSucursalRepository;
import com.reservas.app.sucursal.entity.Sucursal;
import com.reservas.app.sucursal.repository.SucursalRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class CotizacionReservaService {

    private final SucursalRepository sucursalRepository;
    private final ConfiguracionSucursalRepository configuracionRepository;
    private final BigDecimal cargoServicioUnitario;

    public CotizacionReservaService(
            SucursalRepository sucursalRepository,
            ConfiguracionSucursalRepository configuracionRepository,
            @Value("${app.reserva.cargo-servicio-unitario:500}") BigDecimal cargoServicioUnitario) {
        if (cargoServicioUnitario == null || cargoServicioUnitario.signum() < 0) {
            throw new IllegalArgumentException("El cargo de servicio unitario no puede ser negativo");
        }
        this.sucursalRepository = sucursalRepository;
        this.configuracionRepository = configuracionRepository;
        this.cargoServicioUnitario = normalizarMonto(cargoServicioUnitario);
    }

    @Transactional(readOnly = true)
    public CotizacionReservaResponseDto cotizar(Long sucursalId, int personas) {
        Sucursal sucursal = sucursalRepository.findById(sucursalId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sucursal no encontrada"));

        if (!Boolean.TRUE.equals(sucursal.getActiva())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La sucursal no está activa");
        }

        ConfiguracionSucursal config = configuracionRepository.findBySucursalId(sucursalId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "La sucursal no tiene configuración"));

        if (personas < config.getMinPersonasPorReserva()
                || personas > config.getMaxPersonasPorReserva()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    String.format("La cantidad de personas debe estar entre %d y %d",
                            config.getMinPersonasPorReserva(), config.getMaxPersonasPorReserva()));
        }

        BigDecimal cargoServicioTotal = cargoServicioUnitario.multiply(BigDecimal.valueOf(personas));
        boolean cobraSenia = Boolean.TRUE.equals(config.getCobrarSenia());
        BigDecimal montoSenia = cobraSenia && config.getMontoSenia() != null
                ? normalizarMonto(config.getMontoSenia()).max(BigDecimal.ZERO.setScale(2))
                : BigDecimal.ZERO.setScale(2);

        return new CotizacionReservaResponseDto(
                cargoServicioUnitario,
                cargoServicioTotal,
                cobraSenia,
                montoSenia,
                cargoServicioTotal.add(montoSenia),
                config.getHorasCancelacionLibre(),
                config.getToleranciaMinutos());
    }

    private static BigDecimal normalizarMonto(BigDecimal monto) {
        return monto.setScale(2, RoundingMode.HALF_UP);
    }
}
