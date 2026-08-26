package com.reservas.app.sucursal.configuracion.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class ConfiguracionSucursalResponseDto {

    private Long id;
    private Long sucursalId;
    private Boolean cobrarSenia;
    private BigDecimal montoSenia;
    private Integer toleranciaMinutos;
    private Boolean habilitarListaEspera;
    private Boolean confirmacionAutomatica;
    private Integer minutosRecordatorio;
    private Integer maxPersonasPorReserva;
    private Integer minPersonasPorReserva;
    private Integer diasAnticipacionMaxima;
    private Integer duracionAlmuerzoMinutos;
    private Integer duracionCenaMinutos;
    private Integer minutosLockPago;
    private Integer horasCancelacionLibre;
    private Integer umbralNoShowsBloqueo;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
}