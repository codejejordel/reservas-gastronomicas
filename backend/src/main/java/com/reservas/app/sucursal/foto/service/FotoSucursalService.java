package com.reservas.app.sucursal.foto.service;

import com.reservas.app.sucursal.entity.Sucursal;
import com.reservas.app.sucursal.foto.dto.FotoSucursalResponseDto;
import com.reservas.app.sucursal.foto.dto.UpdateFotoSucursalRequestDto;
import com.reservas.app.sucursal.foto.entity.FotoSucursal;
import com.reservas.app.sucursal.foto.repository.FotoSucursalRepository;
import com.reservas.app.sucursal.repository.SucursalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FotoSucursalService {

    private static final int MAX_FOTOS_POR_SUCURSAL = 20;
    private static final DateTimeFormatter TIMESTAMP_FMT = DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS");

    private final FotoSucursalRepository fotoRepository;
    private final SucursalRepository sucursalRepository;

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    @Transactional
    public FotoSucursalResponseDto create(Long sucursalId, MultipartFile archivo, String descripcion, Integer orden) {
        validarArchivo(archivo);
        Sucursal sucursal = findSucursalOrThrow(sucursalId);

        if (fotoRepository.countBySucursalId(sucursalId) >= MAX_FOTOS_POR_SUCURSAL) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "La sucursal ya alcanzó el límite de " + MAX_FOTOS_POR_SUCURSAL + " fotos");
        }

        String url = guardarArchivo(archivo, sucursalId);

        FotoSucursal foto = new FotoSucursal();
        foto.setSucursal(sucursal);
        foto.setUrl(url);
        foto.setDescripcion(descripcion);
        foto.setOrden(orden != null ? orden : (int) fotoRepository.countBySucursalId(sucursalId));

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
        eliminarArchivoDisco(foto.getUrl());
        fotoRepository.delete(foto);
    }

    private void validarArchivo(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El archivo de imagen es requerido");
        }
        String contentType = archivo.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Solo se permiten archivos de imagen");
        }
    }

    private String guardarArchivo(MultipartFile archivo, Long sucursalId) {
        String nombreOriginal = StringUtils.cleanPath(
                archivo.getOriginalFilename() != null ? archivo.getOriginalFilename() : "foto"
        );
        int punto = nombreOriginal.lastIndexOf('.');
        String base = punto > 0 ? nombreOriginal.substring(0, punto) : nombreOriginal;
        String ext  = punto > 0 ? nombreOriginal.substring(punto)    : "";
        base = base.replaceAll("[^a-zA-Z0-9_\\-]", "_");

        String nombreFinal = base + "_" + LocalDateTime.now().format(TIMESTAMP_FMT) + ext;
        Path dir = Paths.get(uploadDir, "img", sucursalId.toString());

        try {
            Files.createDirectories(dir);
            Files.copy(archivo.getInputStream(), dir.resolve(nombreFinal), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error al guardar la imagen");
        }

        return "/uploads/img/" + sucursalId + "/" + nombreFinal;
    }

    private void eliminarArchivoDisco(String url) {
        if (url == null) return;
        // url almacenada: "/uploads/img/{id}/{file}" → disco: "{uploadDir}/img/{id}/{file}"
        String subPath = url.replaceFirst("^/uploads/", "");
        try {
            Files.deleteIfExists(Paths.get(uploadDir, subPath));
        } catch (IOException ignored) {
            // no bloqueamos el delete de la entidad si falla el borrado del archivo
        }
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