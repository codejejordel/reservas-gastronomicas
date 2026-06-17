package com.reservas.app.sucursal.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
public class DisponibilidadResponseDto {

    private List<DiaDisponibilidadDto> dias;
    private Map<String, List<HorarioSlotDto>> horarios;

    @Getter
    @Setter
    @AllArgsConstructor
    public static class DiaDisponibilidadDto {
        private String fecha;
        private String estado; // available, few-left, full
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class HorarioSlotDto {
        private String hora;
        private boolean disponible;
    }
}
