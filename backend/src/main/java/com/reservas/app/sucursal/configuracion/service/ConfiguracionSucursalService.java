package com.reservas.app.sucursal.configuracion.service;

import com.reservas.app.sucursal.configuracion.dto.ConfiguracionSucursalResponseDto;
import com.reservas.app.sucursal.configuracion.dto.UpdateConfiguracionSucursalRequestDto;
import com.reservas.app.sucursal.configuracion.entity.ConfiguracionSucursal;
import com.reservas.app.sucursal.configuracion.repository.ConfiguracionSucursalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ConfiguracionSucursalService {

    private final ConfiguracionSucursalRepository configuracionRepository;

    public ConfiguracionSucursalResponseDto getBySucursal(Long sucursalId) {
        return toDto(findOrThrow(sucursalId));
    }

    @Transactional
    public ConfiguracionSucursalResponseDto update(Long sucursalId, UpdateConfiguracionSucursalRequestDto request) {
        ConfiguracionSucursal config = findOrThrow(sucursalId);

        if (request.getCobrarSenia() != null) config.setCobrarSenia(request.getCobrarSenia());
        if (request.getMontoSenia() != null) config.setMontoSenia(request.getMontoSenia());
        if (request.getToleranciaMinutos() != null) config.setToleranciaMinutos(request.getToleranciaMinutos());
        if (request.getHabilitarListaEspera() != null) config.setHabilitarListaEspera(request.getHabilitarListaEspera());
        if (request.getConfirmacionAutomatica() != null) config.setConfirmacionAutomatica(request.getConfirmacionAutomatica());
        if (request.getMinutosRecordatorio() != null) config.setMinutosRecordatorio(request.getMinutosRecordatorio());
        if (request.getMaxPersonasPorReserva() != null) config.setMaxPersonasPorReserva(request.getMaxPersonasPorReserva());
        if (request.getMinPersonasPorReserva() != null) config.setMinPersonasPorReserva(request.getMinPersonasPorReserva());
        if (request.getDiasAnticipacionMaxima() != null) config.setDiasAnticipacionMaxima(request.getDiasAnticipacionMaxima());
        if (request.getDuracionAlmuerzoMinutos() != null) config.setDuracionAlmuerzoMinutos(request.getDuracionAlmuerzoMinutos());
        if (request.getDuracionCenaMinutos() != null) config.setDuracionCenaMinutos(request.getDuracionCenaMinutos());
        if (request.getMinutosLockPago() != null) config.setMinutosLockPago(request.getMinutosLockPago());
        if (request.getHorasCancelacionLibre() != null) config.setHorasCancelacionLibre(request.getHorasCancelacionLibre());
        if (request.getUmbralNoShowsBloqueo() != null) config.setUmbralNoShowsBloqueo(request.getUmbralNoShowsBloqueo());

        // Validación: si cobra seña pero monto es 0, rechazar
        if (Boolean.TRUE.equals(config.getCobrarSenia()) &&
                config.getMontoSenia().compareTo(java.math.BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Si cobrarSenia es true, montoSenia debe ser mayor a 0");
        }

        // Validación: min <= max personas
        if (config.getMinPersonasPorReserva() > config.getMaxPersonasPorReserva()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "minPersonasPorReserva no puede ser mayor que maxPersonasPorReserva");
        }

        return toDto(configuracionRepository.save(config));
    }

    private ConfiguracionSucursal findOrThrow(Long sucursalId) {
        return configuracionRepository.findBySucursalId(sucursalId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Configuración no encontrada para la sucursal"));
    }

    private ConfiguracionSucursalResponseDto toDto(ConfiguracionSucursal c) {
        return new ConfiguracionSucursalResponseDto(
                c.getId(),
                c.getSucursal().getId(),
                c.getCobrarSenia(),
                c.getMontoSenia(),
                c.getToleranciaMinutos(),
                c.getHabilitarListaEspera(),
                c.getConfirmacionAutomatica(),
                c.getMinutosRecordatorio(),
                c.getMaxPersonasPorReserva(),
                c.getMinPersonasPorReserva(),
                c.getDiasAnticipacionMaxima(),
                c.getDuracionAlmuerzoMinutos(),
                c.getDuracionCenaMinutos(),
                c.getMinutosLockPago(),
                c.getHorasCancelacionLibre(),
                c.getUmbralNoShowsBloqueo(),
                c.getFechaCreacion(),
                c.getFechaActualizacion()
        );
    }
}