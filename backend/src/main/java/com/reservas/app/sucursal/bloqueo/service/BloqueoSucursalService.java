package com.reservas.app.sucursal.bloqueo.service;

import com.reservas.app.sucursal.bloqueo.dto.BloqueoSucursalResponseDto;
import com.reservas.app.sucursal.bloqueo.dto.CreateBloqueoRequestDto;
import com.reservas.app.sucursal.bloqueo.dto.UpdateBloqueoRequestDto;
import com.reservas.app.sucursal.bloqueo.entity.BloqueoSucursal;
import com.reservas.app.sucursal.bloqueo.repository.BloqueoSucursalRepository;
import com.reservas.app.sucursal.entity.Sucursal;
import com.reservas.app.sucursal.repository.SucursalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BloqueoSucursalService {

    private final BloqueoSucursalRepository bloqueoRepository;
    private final SucursalRepository sucursalRepository;

    @Transactional
    public BloqueoSucursalResponseDto create(Long sucursalId, CreateBloqueoRequestDto request) {
        Sucursal sucursal = findSucursalOrThrow(sucursalId);
        validarFechas(request.getFechaInicio(), request.getFechaFin());
        validarHoras(request.getHoraInicio(), request.getHoraFin());

        BloqueoSucursal bloqueo = new BloqueoSucursal();
        bloqueo.setSucursal(sucursal);
        bloqueo.setFechaInicio(request.getFechaInicio());
        bloqueo.setFechaFin(request.getFechaFin());
        bloqueo.setHoraInicio(request.getHoraInicio());
        bloqueo.setHoraFin(request.getHoraFin());
        bloqueo.setMotivo(request.getMotivo());
        bloqueo.setTipo(request.getTipo());

        return toDto(bloqueoRepository.save(bloqueo));
    }

    public List<BloqueoSucursalResponseDto> listBySucursal(Long sucursalId) {
        findSucursalOrThrow(sucursalId);
        return bloqueoRepository.findBySucursalIdOrderByFechaInicioAsc(sucursalId)
                .stream().map(this::toDto).toList();
    }

    public List<BloqueoSucursalResponseDto> listVigentes(Long sucursalId) {
        findSucursalOrThrow(sucursalId);
        return bloqueoRepository.findVigentesBySucursalId(sucursalId, LocalDate.now())
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public BloqueoSucursalResponseDto update(Long sucursalId, Long id, UpdateBloqueoRequestDto request) {
        BloqueoSucursal bloqueo = findOrThrow(id, sucursalId);

        LocalDate inicio = request.getFechaInicio() != null ? request.getFechaInicio() : bloqueo.getFechaInicio();
        LocalDate fin    = request.getFechaFin()    != null ? request.getFechaFin()    : bloqueo.getFechaFin();
        validarFechas(inicio, fin);

        var horaInicio = request.getHoraInicio() != null ? request.getHoraInicio() : bloqueo.getHoraInicio();
        var horaFin    = request.getHoraFin()    != null ? request.getHoraFin()    : bloqueo.getHoraFin();
        validarHoras(horaInicio, horaFin);

        bloqueo.setFechaInicio(inicio);
        bloqueo.setFechaFin(fin);
        bloqueo.setHoraInicio(horaInicio);
        bloqueo.setHoraFin(horaFin);
        if (request.getMotivo() != null) bloqueo.setMotivo(request.getMotivo());
        if (request.getTipo()   != null) bloqueo.setTipo(request.getTipo());

        return toDto(bloqueoRepository.save(bloqueo));
    }

    @Transactional
    public void delete(Long sucursalId, Long id) {
        BloqueoSucursal bloqueo = findOrThrow(id, sucursalId);
        bloqueoRepository.delete(bloqueo);
    }

    private void validarFechas(LocalDate inicio, LocalDate fin) {
        if (inicio.isAfter(fin)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "fechaInicio no puede ser posterior a fechaFin");
        }
    }

    private void validarHoras(java.time.LocalTime horaInicio, java.time.LocalTime horaFin) {
        if ((horaInicio == null) != (horaFin == null)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "horaInicio y horaFin deben indicarse juntas o ninguna");
        }
        if (horaInicio != null && !horaInicio.isBefore(horaFin)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "horaInicio debe ser anterior a horaFin");
        }
    }

    private Sucursal findSucursalOrThrow(Long sucursalId) {
        return sucursalRepository.findById(sucursalId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sucursal no encontrada"));
    }

    private BloqueoSucursal findOrThrow(Long id, Long sucursalId) {
        BloqueoSucursal bloqueo = bloqueoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bloqueo no encontrado"));
        if (!bloqueo.getSucursal().getId().equals(sucursalId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Bloqueo no encontrado");
        }
        return bloqueo;
    }

    private BloqueoSucursalResponseDto toDto(BloqueoSucursal b) {
        return new BloqueoSucursalResponseDto(
                b.getId(),
                b.getSucursal().getId(),
                b.getFechaInicio(),
                b.getFechaFin(),
                b.getHoraInicio(),
                b.getHoraFin(),
                b.getMotivo(),
                b.getTipo(),
                b.getFechaCreacion(),
                b.getFechaActualizacion()
        );
    }
}
