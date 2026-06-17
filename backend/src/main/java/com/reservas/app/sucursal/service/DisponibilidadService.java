package com.reservas.app.sucursal.service;

import com.reservas.app.mesa.repository.MesaRepository;
import com.reservas.app.reserva.repository.ReservaRepository;
import com.reservas.app.sucursal.dto.DisponibilidadResponseDto;
import com.reservas.app.sucursal.horario.entity.DiaSemana;
import com.reservas.app.sucursal.horario.entity.Horario;
import com.reservas.app.sucursal.horario.repository.HorarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DisponibilidadService {

    private final HorarioRepository horarioRepository;
    private final MesaRepository mesaRepository;
    private final ReservaRepository reservaRepository;

    private static final int SLOT_MINUTES = 30;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE;
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    @Cacheable(value = "disponibilidad", key = "#sucursalId + '-' + #desde + '-' + #hasta + '-' + #personas")
    public DisponibilidadResponseDto calcularDisponibilidad(Long sucursalId, LocalDate desde, LocalDate hasta, int personas) {
        // Capacidad total de mesas
        Integer capacidadTotal = mesaRepository.sumCapacidadBySucursalId(sucursalId);
        if (capacidadTotal == null || capacidadTotal == 0) {
            return new DisponibilidadResponseDto(List.of(), Map.of());
        }

        // Cargar horarios de la sucursal
        List<Horario> horariosConfig = horarioRepository.findBySucursalIdAndActivoTrueOrderByDiaSemanaAscOrdenTurnoAsc(sucursalId);

        // OPTIMIZACIÓN: 1 query batched en lugar de N queries
        List<Object[]> reservasAgrupadas = reservaRepository.sumPersonasGroupedByFechaHora(sucursalId, desde, hasta);
        Map<String, Integer> ocupadasPorSlot = new HashMap<>();
        for (Object[] row : reservasAgrupadas) {
            LocalDate fecha = (LocalDate) row[0];
            LocalTime hora = (LocalTime) row[1];
            Long cantPersonas = (Long) row[2];
            String key = fecha.format(DATE_FORMATTER) + " " + hora.format(TIME_FORMATTER);
            ocupadasPorSlot.put(key, cantPersonas.intValue());
        }

        List<DisponibilidadResponseDto.DiaDisponibilidadDto> dias = new ArrayList<>();
        Map<String, List<DisponibilidadResponseDto.HorarioSlotDto>> horariosMap = new HashMap<>();

        LocalDate fecha = desde;
        while (!fecha.isAfter(hasta)) {
            String fechaStr = fecha.format(DATE_FORMATTER);
            DiaSemana diaSemana = mapDayOfWeek(fecha.getDayOfWeek());

            // Buscar horarios para este día
            List<Horario> horariosDelDia = horariosConfig.stream()
                    .filter(h -> h.getDiaSemana() == diaSemana)
                    .toList();

            if (horariosDelDia.isEmpty()) {
                // Día cerrado (sin horarios configurados)
                dias.add(new DisponibilidadResponseDto.DiaDisponibilidadDto(fechaStr, "closed"));
                horariosMap.put(fechaStr, List.of());
            } else {
                // Generar slots y calcular disponibilidad
                List<DisponibilidadResponseDto.HorarioSlotDto> slots = new ArrayList<>();
                int slotsDisponibles = 0;
                int slotsTotal = 0;

                for (Horario horario : horariosDelDia) {
                    LocalTime hora = horario.getHoraApertura();
                    while (hora.isBefore(horario.getHoraCierre())) {
                        slotsTotal++;
                        // Consultar desde el Map en memoria (ya no hace query SQL)
                        String slotKey = fechaStr + " " + hora.format(TIME_FORMATTER);
                        Integer ocupadas = ocupadasPorSlot.getOrDefault(slotKey, 0);
                        int disponible = capacidadTotal - ocupadas;

                        boolean slotDisponible = disponible >= personas;
                        if (slotDisponible) {
                            slotsDisponibles++;
                        }

                        slots.add(new DisponibilidadResponseDto.HorarioSlotDto(
                                hora.format(TIME_FORMATTER),
                                slotDisponible
                        ));

                        hora = hora.plusMinutes(SLOT_MINUTES);
                    }
                }

                // Estado del día
                String estado;
                if (slotsDisponibles == 0) {
                    estado = "full";
                } else if (slotsDisponibles <= slotsTotal * 0.3) {
                    estado = "few-left";
                } else {
                    estado = "available";
                }

                dias.add(new DisponibilidadResponseDto.DiaDisponibilidadDto(fechaStr, estado));
                horariosMap.put(fechaStr, slots);
            }

            fecha = fecha.plusDays(1);
        }

        return new DisponibilidadResponseDto(dias, horariosMap);
    }

    private DiaSemana mapDayOfWeek(DayOfWeek dayOfWeek) {
        return switch (dayOfWeek) {
            case MONDAY -> DiaSemana.MONDAY;
            case TUESDAY -> DiaSemana.TUESDAY;
            case WEDNESDAY -> DiaSemana.WEDNESDAY;
            case THURSDAY -> DiaSemana.THURSDAY;
            case FRIDAY -> DiaSemana.FRIDAY;
            case SATURDAY -> DiaSemana.SATURDAY;
            case SUNDAY -> DiaSemana.SUNDAY;
        };
    }
}
