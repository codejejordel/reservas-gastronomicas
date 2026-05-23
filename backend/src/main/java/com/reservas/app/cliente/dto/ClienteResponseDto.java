package com.reservas.app.cliente.dto;

import com.reservas.app.common.CanalNotif;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class ClienteResponseDto {
    private Long id;
    private String nombreCompleto;
    private String email;
    private String telefono;
    private String dni;
    private CanalNotif canalNotifPreferido;
    private Integer cantNoShows;
    private Integer cantReservas;
    private Boolean bloqueado;
    private LocalDateTime fechaDesbloqueo;
    private Boolean activo;
    private LocalDateTime fechaCreacion;
}