package com.reservas.app.reserva.dto;

import java.math.BigDecimal;

public record CotizacionReservaResponseDto(
        BigDecimal cargoServicioUnitario,
        BigDecimal cargoServicioTotal,
        boolean cobraSenia,
        BigDecimal montoSenia,
        BigDecimal totalAPagarAhora,
        Integer horasCancelacionLibre,
        Integer toleranciaMinutos
) {
}
