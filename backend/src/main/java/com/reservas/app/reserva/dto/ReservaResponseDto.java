package com.reservas.app.reserva.dto;

import com.reservas.app.common.CanalNotif;
import com.reservas.app.reserva.entity.CanceladaPor;
import com.reservas.app.reserva.entity.EstadoReserva;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Getter
@AllArgsConstructor
public class ReservaResponseDto {
    private Long id;
    private String codigoReserva;
    private Long sucursalId;
    private Long clienteId;
    private String clienteNombre;
    private LocalDate fechaReserva;
    private LocalTime horaReserva;
    private Integer cantPersonas;
    private EstadoReserva estado;
    private String observaciones;
    private CanalNotif canalNotif;
    private LocalDateTime fechaConfirmacion;
    private LocalDateTime fechaCancelacion;
    private String motivoCancelacion;
    private CanceladaPor canceladaPor;
    private LocalDateTime fechaCreacion;
    private String nombreInvitado;
    private String emailInvitado;
    private String telefonoInvitado;
}
