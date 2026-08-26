package com.reservas.app.listaespera.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class NotificarListaEsperaRequestDto {

    @NotNull
    private LocalDateTime fechaExpiracionNotif;
}
