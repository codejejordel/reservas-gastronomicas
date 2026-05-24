package com.reservas.app.notificacion.dto;

import com.reservas.app.common.CanalNotif;
import com.reservas.app.notificacion.entity.EstadoNotificacion;
import com.reservas.app.notificacion.entity.TipoNotificacion;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class NotificacionResponseDto {

    private Long id;
    private Long clienteId;
    private Long reservaId;
    private Long sucursalId;
    private TipoNotificacion tipo;
    private CanalNotif canal;
    private String asunto;
    private String mensaje;
    private EstadoNotificacion estado;
    private LocalDateTime fechaEnvio;
    private Integer intentos;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
}
