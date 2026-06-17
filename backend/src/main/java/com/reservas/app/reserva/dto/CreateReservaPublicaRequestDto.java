package com.reservas.app.reserva.dto;

import com.reservas.app.common.CanalNotif;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
public class CreateReservaPublicaRequestDto {

    @NotNull
    private Long sucursalId;

    @NotNull
    private LocalDate fechaReserva;

    @NotNull
    private LocalTime horaReserva;

    @NotNull
    @Min(1)
    private Integer cantPersonas;

    @Size(max = 500)
    private String observaciones;

    private CanalNotif canalNotif;

    @NotNull
    private ClienteInlineDto cliente;

    @Getter
    @Setter
    public static class ClienteInlineDto {
        @NotNull
        @Size(min = 2, max = 100)
        private String nombre;

        @NotNull
        @Size(max = 100)
        private String email;

        @Size(max = 50)
        private String telefono;
    }
}
