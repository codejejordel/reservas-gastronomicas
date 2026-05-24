package com.reservas.app.sucursal.foto.service;

import com.reservas.app.sucursal.entity.Sucursal;
import com.reservas.app.sucursal.foto.dto.CreateFotoSucursalRequestDto;
import com.reservas.app.sucursal.foto.dto.FotoSucursalResponseDto;
import com.reservas.app.sucursal.foto.dto.UpdateFotoSucursalRequestDto;
import com.reservas.app.sucursal.foto.entity.FotoSucursal;
import com.reservas.app.sucursal.foto.repository.FotoSucursalRepository;
import com.reservas.app.sucursal.repository.SucursalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FotoSucursalService {

    private static final int MAX_FOTOS_POR_SUCURSAL = 20;

    private final FotoSucursalRepository fotoRepository;
    private final SucursalRepository sucursalRepository;

    @Transactional
    public FotoSucursalResponseDto create(Long sucursalId, CreateFotoSucursalRequestDto request) {
        Sucursal sucursal = findSucursalOrThrow(sucursalId);

        if (fotoRepository.countBySucursalId(sucursalId) >= MAX_FOTOS_POR_SUCURSAL) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "La sucursal ya alcanzó el límite de " + MAX_FOTOS_POR_SUCURSAL + " fotos");
        }

        FotoSucursal foto = new FotoSucursal();
        foto.setSucursal(sucursal);
        foto.setUrl(request.getUrl());
        foto.setDescripcion(request.getDescripcion());

        if (request.getOrden() != null) {
            foto.setOrden(request.getOrden());
        } else {
            foto.setOrden((int) fotoRepository.countBySucursalId(sucursalId));
        }

        return toDto(fotoRepository.save(foto));
    }

    public List<FotoSucursalResponseDto> listBySucursal(Long sucursalId) {
        findSucursalOrThrow(sucursalId);
        return fotoRepository.findBySucursalIdOrderByOrdenAsc(sucursalId)
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public FotoSucursalResponseDto update(Long sucursalId, Long id, UpdateFotoSucursalRequestDto request) {
        FotoSucursal foto = findOrThrow(id, sucursalId);
        if (request.getDescripcion() != null) foto.setDescripcion(request.getDescripcion());
        if (request.getOrden()       != null) foto.setOrden(request.getOrden());
        return toDto(fotoRepository.save(foto));
    }

    @Transactional
    public void delete(Long sucursalId, Long id) {
        FotoSucursal foto = findOrThrow(id, sucursalId);
        fotoRepository.delete(foto);
    }

    private Sucursal findSucursalOrThrow(Long sucursalId) {
        return sucursalRepository.findById(sucursalId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sucursal no encontrada"));
    }

    private FotoSucursal findOrThrow(Long id, Long sucursalId) {
        FotoSucursal foto = fotoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Foto no encontrada"));
        if (!foto.getSucursal().getId().equals(sucursalId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Foto no encontrada");
        }
        return foto;
    }

    private FotoSucursalResponseDto toDto(FotoSucursal f) {
        return new FotoSucursalResponseDto(
                f.getId(),
                f.getSucursal().getId(),
                f.getUrl(),
                f.getDescripcion(),
                f.getOrden(),
                f.getFechaCreacion()
        );
    }
}
