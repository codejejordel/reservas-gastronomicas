package com.reservas.app.reserva.dto;

import com.reservas.app.common.CanalNotif;
import com.reservas.app.reserva.asignacion.dto.AsignacionMesaResponseDto;
import com.reservas.app.reserva.entity.CanceladaPor;
import com.reservas.app.reserva.entity.EstadoReserva;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class ReservaDetalleResponseDto {
    private Long id;
    private String codigoReserva;
    private LocalDate fechaReserva;
    private LocalTime horaReserva;
    private Integer cantPersonas;
    private EstadoReserva estado;
    private Long clienteId;
    private String contactoNombre;
    private String contactoEmail;
    private String contactoTelefono;
    private String observaciones;
    private CanalNotif canalNotif;
    private LocalDateTime fechaConfirmacion;
    private LocalDateTime fechaCancelacion;
    private String motivoCancelacion;
    private CanceladaPor canceladaPor;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private List<AsignacionMesaResponseDto> asignacionesMesa;
}
