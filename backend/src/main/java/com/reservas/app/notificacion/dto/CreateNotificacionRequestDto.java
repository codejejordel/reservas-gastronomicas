package com.reservas.app.notificacion.dto;

import com.reservas.app.common.CanalNotif;
import com.reservas.app.notificacion.entity.TipoNotificacion;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateNotificacionRequestDto {

    private Long clienteId;

    private Long reservaId;

    private Long sucursalId;

    @NotNull
    private TipoNotificacion tipo;

    @NotNull
    private CanalNotif canal;

    @Size(max = 255)
    private String asunto;

    @NotBlank
    private String mensaje;
}
