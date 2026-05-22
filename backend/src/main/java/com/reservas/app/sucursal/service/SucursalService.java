package com.reservas.app.sucursal.service;

import com.reservas.app.restaurante.entity.Restaurante;
import com.reservas.app.restaurante.repository.RestauranteRepository;
import com.reservas.app.sucursal.dto.CreateSucursalRequestDto;
import com.reservas.app.sucursal.dto.SucursalResponseDto;
import com.reservas.app.sucursal.dto.UpdateSucursalRequestDto;
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
public class SucursalService {

    private final SucursalRepository sucursalRepository;
    private final RestauranteRepository restauranteRepository;

    @Transactional
    public SucursalResponseDto create(CreateSucursalRequestDto request) {
        Restaurante restaurante = restauranteRepository.findById(request.getRestauranteId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurante no encontrado"));

        if (sucursalRepository.existsByRestauranteIdAndSlug(request.getRestauranteId(), request.getSlug())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El slug ya está en uso en este restaurante");
        }

        Sucursal sucursal = new Sucursal();
        sucursal.setRestaurante(restaurante);
        sucursal.setNombre(request.getNombre());
        sucursal.setSlug(request.getSlug());
        sucursal.setDireccion(request.getDireccion());
        sucursal.setCiudad(request.getCiudad());
        sucursal.setProvincia(request.getProvincia());
        sucursal.setCodigoPostal(request.getCodigoPostal());
        sucursal.setTelefono(request.getTelefono());
        sucursal.setEmail(request.getEmail());
        sucursal.setLatitud(request.getLatitud());
        sucursal.setLongitud(request.getLongitud());

        if (request.getPais() != null) sucursal.setPais(request.getPais());
        if (request.getCapacidadMaxima() != null) sucursal.setCapacidadMaxima(request.getCapacidadMaxima());
        if (request.getZonaHoraria() != null) sucursal.setZonaHoraria(request.getZonaHoraria());

        // Primera sucursal del restaurante => es la principal automáticamente
        boolean esPrimera = sucursalRepository.countByRestauranteId(request.getRestauranteId()) == 0;
        sucursal.setEsPrincipal(esPrimera);

        return toDto(sucursalRepository.save(sucursal));
    }

    public SucursalResponseDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    public List<SucursalResponseDto> listByRestaurante(Long restauranteId) {
        if (!restauranteRepository.existsById(restauranteId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurante no encontrado");
        }
        return sucursalRepository.findByRestauranteIdAndActivaTrue(restauranteId)
                .stream().map(this::toDto).toList();
    }

    @Transactional
    public SucursalResponseDto update(Long id, UpdateSucursalRequestDto request) {
        Sucursal sucursal = findOrThrow(id);

        if (request.getSlug() != null && !request.getSlug().equals(sucursal.getSlug())) {
            if (sucursalRepository.existsByRestauranteIdAndSlug(sucursal.getRestaurante().getId(), request.getSlug())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "El slug ya está en uso en este restaurante");
            }
            sucursal.setSlug(request.getSlug());
        }

        if (request.getNombre() != null) sucursal.setNombre(request.getNombre());
        if (request.getDireccion() != null) sucursal.setDireccion(request.getDireccion());
        if (request.getCiudad() != null) sucursal.setCiudad(request.getCiudad());
        if (request.getProvincia() != null) sucursal.setProvincia(request.getProvincia());
        if (request.getCodigoPostal() != null) sucursal.setCodigoPostal(request.getCodigoPostal());
        if (request.getPais() != null) sucursal.setPais(request.getPais());
        if (request.getLatitud() != null) sucursal.setLatitud(request.getLatitud());
        if (request.getLongitud() != null) sucursal.setLongitud(request.getLongitud());
        if (request.getTelefono() != null) sucursal.setTelefono(request.getTelefono());
        if (request.getEmail() != null) sucursal.setEmail(request.getEmail());
        if (request.getCapacidadMaxima() != null) sucursal.setCapacidadMaxima(request.getCapacidadMaxima());
        if (request.getZonaHoraria() != null) sucursal.setZonaHoraria(request.getZonaHoraria());

        return toDto(sucursalRepository.save(sucursal));
    }

    @Transactional
    public SucursalResponseDto setPrincipal(Long id) {
        Sucursal sucursal = findOrThrow(id);
        Long restauranteId = sucursal.getRestaurante().getId();

        // Quitar el flag de la sucursal que lo tenía
        sucursalRepository.findByRestauranteIdAndEsPrincipalTrue(restauranteId)
                .ifPresent(anterior -> {
                    anterior.setEsPrincipal(false);
                    sucursalRepository.save(anterior);
                });

        sucursal.setEsPrincipal(true);
        return toDto(sucursalRepository.save(sucursal));
    }

    public void delete(Long id) {
        Sucursal sucursal = findOrThrow(id);
        if (Boolean.TRUE.equals(sucursal.getEsPrincipal())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "No se puede desactivar la sucursal principal. Primero asigná otra como principal.");
        }
        sucursal.setActiva(false);
        sucursalRepository.save(sucursal);
    }

    private Sucursal findOrThrow(Long id) {
        return sucursalRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sucursal no encontrada"));
    }

    private SucursalResponseDto toDto(Sucursal s) {
        return new SucursalResponseDto(
                s.getId(),
                s.getRestaurante().getId(),
                s.getNombre(),
                s.getSlug(),
                s.getEsPrincipal(),
                s.getDireccion(),
                s.getCiudad(),
                s.getProvincia(),
                s.getCodigoPostal(),
                s.getPais(),
                s.getLatitud(),
                s.getLongitud(),
                s.getTelefono(),
                s.getEmail(),
                s.getCapacidadMaxima(),
                s.getRatingPromedio(),
                s.getCantResenias(),
                s.getZonaHoraria(),
                s.getActiva(),
                s.getFechaCreacion(),
                s.getFechaActualizacion()
        );
    }
}