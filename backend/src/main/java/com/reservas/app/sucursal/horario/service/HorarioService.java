package com.reservas.app.sucursal.horario.service;

import com.reservas.app.sucursal.entity.Sucursal;
import com.reservas.app.sucursal.horario.dto.CreateHorarioRequestDto;
import com.reservas.app.sucursal.horario.dto.HorarioResponseDto;
import com.reservas.app.sucursal.horario.dto.UpdateHorarioRequestDto;
import com.reservas.app.sucursal.horario.entity.DiaSemana;
import com.reservas.app.sucursal.horario.entity.Horario;
import com.reservas.app.sucursal.horario.repository.HorarioRepository;
import com.reservas.app.sucursal.repository.SucursalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HorarioService {

    private final HorarioRepository horarioRepository;
    private final SucursalRepository sucursalRepository;

    @Transactional
    public HorarioResponseDto create(Long sucursalId, CreateHorarioRequestDto request) {
        Sucursal sucursal = findSucursalOrThrow(sucursalId);

        if (request.getHoraApertura().isAfter(request.getHoraCierre()) ||
                request.getHoraApertura().equals(request.getHoraCierre())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "horaApertura debe ser anterior a horaCierre");
        }

        int ordenTurno = request.getOrdenTurno() != null ? request.getOrdenTurno() : 1;
        if (horarioRepository.existsBySucursalIdAndDiaSemanaAndOrdenTurno(sucursalId, request.getDiaSemana(), ordenTurno)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe un turno " + ordenTurno + " para " + request.getDiaSemana() + " en esta sucursal");
        }

        Horario horario = new Horario();
        horario.setSucursal(sucursal);
        horario.setDiaSemana(request.getDiaSemana());
        horario.setOrdenTurno(ordenTurno);
        horario.setEtiqueta(request.getEtiqueta());
        horario.setHoraApertura(request.getHoraApertura());
        horario.setHoraCierre(request.getHoraCierre());

        return toDto(horarioRepository.save(horario));
    }

    public List<HorarioResponseDto> listBySucursal(Long sucursalId) {
        findSucursalOrThrow(sucursalId);
        return horarioRepository
                .findBySucursalIdAndActivoTrueOrderByDiaSemanaAscOrdenTurnoAsc(sucursalId)
                .stream().map(this::toDto).toList();
    }

    public List<HorarioResponseDto> listByDia(Long sucursalId, DiaSemana dia) {
        findSucursalOrThrow(sucursalId);
        return horarioRepository
                .findBySucursalIdAndDiaSemanaAndActivoTrueOrderByOrdenTurnoAsc(sucursalId, dia)
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public HorarioResponseDto update(Long sucursalId, Long id, UpdateHorarioRequestDto request) {
        Horario horario = findOrThrow(id, sucursalId);

        LocalTime apertura = request.getHoraApertura() != null ? request.getHoraApertura() : horario.getHoraApertura();
        LocalTime cierre   = request.getHoraCierre()   != null ? request.getHoraCierre()   : horario.getHoraCierre();

        if (!apertura.isBefore(cierre)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "horaApertura debe ser anterior a horaCierre");
        }

        if (request.getOrdenTurno() != null && !request.getOrdenTurno().equals(horario.getOrdenTurno())) {
            if (horarioRepository.existsBySucursalIdAndDiaSemanaAndOrdenTurnoAndIdNot(
                    sucursalId, horario.getDiaSemana(), request.getOrdenTurno(), id)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Ya existe un turno " + request.getOrdenTurno() + " para " + horario.getDiaSemana() + " en esta sucursal");
            }
            horario.setOrdenTurno(request.getOrdenTurno());
        }

        if (request.getEtiqueta()    != null) horario.setEtiqueta(request.getEtiqueta());
        if (request.getActivo()      != null) horario.setActivo(request.getActivo());

        horario.setHoraApertura(apertura);
        horario.setHoraCierre(cierre);

        return toDto(horarioRepository.save(horario));
    }

    public void delete(Long sucursalId, Long id) {
        Horario horario = findOrThrow(id, sucursalId);
        horario.setActivo(false);
        horarioRepository.save(horario);
    }

    private Sucursal findSucursalOrThrow(Long sucursalId) {
        return sucursalRepository.findById(sucursalId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sucursal no encontrada"));
    }

    private Horario findOrThrow(Long id, Long sucursalId) {
        Horario horario = horarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Horario no encontrado"));
        if (!horario.getSucursal().getId().equals(sucursalId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Horario no encontrado");
        }
        return horario;
    }

    private HorarioResponseDto toDto(Horario h) {
        return new HorarioResponseDto(
                h.getId(),
                h.getSucursal().getId(),
                h.getDiaSemana(),
                h.getOrdenTurno(),
                h.getEtiqueta(),
                h.getHoraApertura(),
                h.getHoraCierre(),
                h.getActivo(),
                h.getFechaCreacion(),
                h.getFechaActualizacion()
        );
    }
}