package com.reservas.app.sucursal.configuracion.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class UpdateConfiguracionSucursalRequestDto {

    private Boolean cobrarSenia;

    @DecimalMin("0.0")
    private BigDecimal montoSenia;

    @Min(0)
    private Integer toleranciaMinutos;

    private Boolean habilitarListaEspera;

    private Boolean confirmacionAutomatica;

    @Min(0)
    private Integer minutosRecordatorio;

    @Min(1)
    private Integer maxPersonasPorReserva;

    @Min(1)
    private Integer minPersonasPorReserva;

    @Min(1)
    private Integer diasAnticipacionMaxima;

    @Min(1)
    private Integer duracionAlmuerzoMinutos;

    @Min(1)
    private Integer duracionCenaMinutos;

    @Min(0)
    private Integer minutosLockPago;

    @Min(0)
    private Integer horasCancelacionLibre;

    @Min(1)
    private Integer umbralNoShowsBloqueo;
}