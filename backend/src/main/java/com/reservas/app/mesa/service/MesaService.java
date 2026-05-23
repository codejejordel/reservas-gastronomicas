package com.reservas.app.mesa.service;

import com.reservas.app.mesa.dto.CreateMesaRequestDto;
import com.reservas.app.mesa.dto.MesaResponseDto;
import com.reservas.app.mesa.dto.UpdateMesaRequestDto;
import com.reservas.app.mesa.entity.EstadoMesa;
import com.reservas.app.mesa.entity.Mesa;
import com.reservas.app.mesa.repository.MesaRepository;
import com.reservas.app.sucursal.entity.Sucursal;
import com.reservas.app.sucursal.repository.SucursalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MesaService {

    private final MesaRepository mesaRepository;
    private final SucursalRepository sucursalRepository;

    @Transactional
    public MesaResponseDto create(CreateMesaRequestDto request) {
        Sucursal sucursal = sucursalRepository.findById(request.getSucursalId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sucursal no encontrada"));

        if (mesaRepository.existsBySucursalIdAndNombre(request.getSucursalId(), request.getNombre())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una mesa con ese nombre en la sucursal");
        }

        Mesa mesa = new Mesa();
        mesa.setSucursal(sucursal);
        mesa.setNombre(request.getNombre());
        mesa.setUbicacion(request.getUbicacion());
        if (request.getCapacidad() != null) mesa.setCapacidad(request.getCapacidad());

        return toDto(mesaRepository.save(mesa));
    }

    public MesaResponseDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    public List<MesaResponseDto> listBySucursal(Long sucursalId) {
        if (!sucursalRepository.existsById(sucursalId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Sucursal no encontrada");
        }
        return mesaRepository.findBySucursalIdAndActivaTrue(sucursalId)
                .stream().map(this::toDto).toList();
    }

    public List<MesaResponseDto> listDisponibles(Long sucursalId) {
        return mesaRepository.findBySucursalIdAndEstadoAndActivaTrue(sucursalId, EstadoMesa.DISPONIBLE)
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public MesaResponseDto update(Long id, UpdateMesaRequestDto request) {
        Mesa mesa = findOrThrow(id);

        if (request.getNombre() != null && !request.getNombre().equals(mesa.getNombre())) {
            if (mesaRepository.existsBySucursalIdAndNombre(mesa.getSucursal().getId(), request.getNombre())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una mesa con ese nombre en la sucursal");
            }
            mesa.setNombre(request.getNombre());
        }
        if (request.getUbicacion() != null) mesa.setUbicacion(request.getUbicacion());
        if (request.getCapacidad() != null) mesa.setCapacidad(request.getCapacidad());

        return toDto(mesaRepository.save(mesa));
    }

    @Transactional
    public MesaResponseDto cambiarEstado(Long id, EstadoMesa nuevoEstado) {
        Mesa mesa = findOrThrow(id);
        mesa.setEstado(nuevoEstado);
        return toDto(mesaRepository.save(mesa));
    }

    @Transactional
    public void delete(Long id) {
        Mesa mesa = findOrThrow(id);
        mesa.setActiva(false);
        mesaRepository.save(mesa);
    }

    private Mesa findOrThrow(Long id) {
        return mesaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mesa no encontrada"));
    }

    public MesaResponseDto toDto(Mesa m) {
        return new MesaResponseDto(
                m.getId(), m.getSucursal().getId(), m.getNombre(), m.getUbicacion(),
                m.getCapacidad(), m.getEstado(), m.getActiva(), m.getFechaCreacion()
        );
    }
}
