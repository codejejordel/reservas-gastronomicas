package com.reservas.app.restaurante.service;

import com.reservas.app.common.ImagenStorageService;
import com.reservas.app.restaurante.dto.CreateRestauranteRequestDto;
import com.reservas.app.restaurante.dto.DisponibilidadResponseDto;
import com.reservas.app.restaurante.dto.RestauranteResponseDto;
import com.reservas.app.restaurante.dto.UpdateRestauranteRequestDto;
import com.reservas.app.restaurante.entity.Restaurante;
import com.reservas.app.restaurante.entity.TipoImagenRestaurante;
import com.reservas.app.restaurante.repository.RestauranteRepository;
import com.reservas.app.usuario.entity.Usuario;
import com.reservas.app.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RestauranteService {

    private final RestauranteRepository restauranteRepository;
    private final UsuarioRepository usuarioRepository;
    private final ImagenStorageService imagenStorageService;

    public RestauranteResponseDto create(CreateRestauranteRequestDto request) {
        if (restauranteRepository.existsBySlugPublico(request.getSlugPublico())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El slug ya está en uso");
        }

        Usuario admin = usuarioRepository.findById(request.getUsuarioAdminId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        Restaurante restaurante = new Restaurante();
        restaurante.setUsuarioAdmin(admin);
        restaurante.setNombrePublico(request.getNombrePublico());
        restaurante.setSlugPublico(request.getSlugPublico());
        restaurante.setRazonSocial(request.getRazonSocial());
        restaurante.setCuit(request.getCuit());
        restaurante.setSlogan(request.getSlogan());
        restaurante.setDescripcion(request.getDescripcion());
        restaurante.setTipoCocina(request.getTipoCocina());
        restaurante.setCiudadPrincipal(request.getCiudadPrincipal());
        restaurante.setLogoUrl(request.getLogoUrl());
        restaurante.setFotoLocalUrl(request.getFotoLocalUrl());
        restaurante.setInstagramUrl(request.getInstagramUrl());
        restaurante.setFacebookUrl(request.getFacebookUrl());
        restaurante.setSitioWeb(request.getSitioWeb());
        restaurante.setEmailComercial(request.getEmailComercial());

        if (request.getColorPrimario() != null) restaurante.setColorPrimario(request.getColorPrimario());
        if (request.getColorAcento() != null) restaurante.setColorAcento(request.getColorAcento());
        if (request.getTipografiaTitulos() != null) restaurante.setTipografiaTitulos(request.getTipografiaTitulos());
        if (request.getTipografiaCuerpo() != null) restaurante.setTipografiaCuerpo(request.getTipografiaCuerpo());
        if (request.getEstiloBordes() != null) restaurante.setEstiloBordes(request.getEstiloBordes());

        restaurante = restauranteRepository.save(restaurante);
        return toDto(restaurante);
    }

    public RestauranteResponseDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    public RestauranteResponseDto getBySlug(String slug) {
        Restaurante restaurante = restauranteRepository.findBySlugPublico(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurante no encontrado"));
        return toDto(restaurante);
    }

    public List<RestauranteResponseDto> listActivos() {
        return restauranteRepository.findByActivoTrue().stream()
                .map(this::toDto)
                .toList();
    }

    public RestauranteResponseDto update(Long id, UpdateRestauranteRequestDto request) {
        Restaurante restaurante = findOrThrow(id);

        if (request.getSlugPublico() != null && !request.getSlugPublico().equals(restaurante.getSlugPublico())) {
            if (restauranteRepository.existsBySlugPublico(request.getSlugPublico())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "El slug ya está en uso");
            }
            restaurante.setSlugPublico(request.getSlugPublico());
        }

        if (request.getNombrePublico() != null) restaurante.setNombrePublico(request.getNombrePublico());
        if (request.getRazonSocial() != null) restaurante.setRazonSocial(request.getRazonSocial());
        if (request.getCuit() != null) restaurante.setCuit(request.getCuit());
        if (request.getSlogan() != null) restaurante.setSlogan(request.getSlogan());
        if (request.getDescripcion() != null) restaurante.setDescripcion(request.getDescripcion());
        if (request.getTipoCocina() != null) restaurante.setTipoCocina(request.getTipoCocina());
        if (request.getCiudadPrincipal() != null) restaurante.setCiudadPrincipal(request.getCiudadPrincipal());
        if (request.getLogoUrl() != null) restaurante.setLogoUrl(request.getLogoUrl());
        if (request.getFotoLocalUrl() != null) restaurante.setFotoLocalUrl(request.getFotoLocalUrl());
        if (request.getColorPrimario() != null) restaurante.setColorPrimario(request.getColorPrimario());
        if (request.getColorAcento() != null) restaurante.setColorAcento(request.getColorAcento());
        if (request.getTipografiaTitulos() != null) restaurante.setTipografiaTitulos(request.getTipografiaTitulos());
        if (request.getTipografiaCuerpo() != null) restaurante.setTipografiaCuerpo(request.getTipografiaCuerpo());
        if (request.getEstiloBordes() != null) restaurante.setEstiloBordes(request.getEstiloBordes());
        if (request.getInstagramUrl() != null) restaurante.setInstagramUrl(request.getInstagramUrl());
        if (request.getFacebookUrl() != null) restaurante.setFacebookUrl(request.getFacebookUrl());
        if (request.getSitioWeb() != null) restaurante.setSitioWeb(request.getSitioWeb());
        if (request.getEmailComercial() != null) restaurante.setEmailComercial(request.getEmailComercial());

        return toDto(restauranteRepository.save(restaurante));
    }

    public RestauranteResponseDto subirImagen(Long id, TipoImagenRestaurante tipo, MultipartFile archivo) {
        Restaurante restaurante = findOrThrow(id);
        String urlAnterior = tipo == TipoImagenRestaurante.LOGO ? restaurante.getLogoUrl() : restaurante.getFotoLocalUrl();
        String url = imagenStorageService.guardar(archivo, "img/restaurante/" + id);
        if (tipo == TipoImagenRestaurante.LOGO) restaurante.setLogoUrl(url);
        else restaurante.setFotoLocalUrl(url);
        imagenStorageService.eliminar(urlAnterior);
        return toDto(restauranteRepository.save(restaurante));
    }

    public RestauranteResponseDto eliminarImagen(Long id, TipoImagenRestaurante tipo) {
        Restaurante restaurante = findOrThrow(id);
        String url = tipo == TipoImagenRestaurante.LOGO ? restaurante.getLogoUrl() : restaurante.getFotoLocalUrl();
        if (tipo == TipoImagenRestaurante.LOGO) restaurante.setLogoUrl(null);
        else restaurante.setFotoLocalUrl(null);
        imagenStorageService.eliminar(url);
        return toDto(restauranteRepository.save(restaurante));
    }

    public DisponibilidadResponseDto checkNombrePublico(String valor, Long idRestaurante) {
        boolean existe = idRestaurante != null ? restauranteRepository.existsByNombrePublicoAndIdNot(valor, idRestaurante)
                                                : restauranteRepository.existsByNombrePublico(valor);
        return new DisponibilidadResponseDto(!existe);
    }

    public DisponibilidadResponseDto checkSlug(String valor, Long idRestaurante) {
        boolean existe = idRestaurante != null ? restauranteRepository.existsBySlugPublicoAndIdNot(valor, idRestaurante)
                                                : restauranteRepository.existsBySlugPublico(valor);
        return new DisponibilidadResponseDto(!existe);
    }

    public DisponibilidadResponseDto checkCuit(String valor, Long idRestaurante) {
        boolean existe = idRestaurante != null ? restauranteRepository.existsByCuitAndIdNot(valor, idRestaurante)
                                                : restauranteRepository.existsByCuit(valor);
        return new DisponibilidadResponseDto(!existe);
    }

    public void delete(Long id) {
        Restaurante restaurante = findOrThrow(id);
        restaurante.setActivo(false);
        restauranteRepository.save(restaurante);
    }

    private Restaurante findOrThrow(Long id) {
        return restauranteRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(HttpStatus.NOT_FOUND, "Restaurante no encontrado"));
    }

    private RestauranteResponseDto toDto(Restaurante r) {
        return new RestauranteResponseDto(
                r.getId(),
                r.getUsuarioAdmin() != null ? r.getUsuarioAdmin().getId() : null,
                r.getNombrePublico(),
                r.getRazonSocial(),
                r.getCuit(),
                r.getSlogan(),
                r.getDescripcion(),
                r.getTipoCocina(),
                r.getCiudadPrincipal(),
                r.getLogoUrl(),
                r.getFotoLocalUrl(),
                r.getColorPrimario(),
                r.getColorAcento(),
                r.getTipografiaTitulos(),
                r.getTipografiaCuerpo(),
                r.getEstiloBordes(),
                r.getSlugPublico(),
                r.getInstagramUrl(),
                r.getFacebookUrl(),
                r.getSitioWeb(),
                r.getEmailComercial(),
                r.getMpConectado(),
                r.getRatingPromedioGlobal(),
                r.getCantReseniasGlobal(),
                r.getActivo(),
                r.getPublicado(),
                r.getFechaCreacion(),
                r.getFechaActualizacion()
        );
    }
}