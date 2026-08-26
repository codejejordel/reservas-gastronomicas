package com.reservas.app.common;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
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

@Service
@RequiredArgsConstructor
public class ImagenStorageService {

    private static final DateTimeFormatter TIMESTAMP_FMT = DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS");

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    public String guardar(MultipartFile archivo, String subdirectorio) {
        validarArchivo(archivo);
        if (subdirectorio == null || subdirectorio.contains("..") || !subdirectorio.matches("[a-zA-Z0-9_/-]+")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Directorio de imagen inválido");
        }
        String nombreOriginal = StringUtils.cleanPath(
                archivo.getOriginalFilename() != null ? archivo.getOriginalFilename() : "imagen"
        );
        int punto = nombreOriginal.lastIndexOf('.');
        String base = (punto > 0 ? nombreOriginal.substring(0, punto) : nombreOriginal)
                .replaceAll("[^a-zA-Z0-9_\\-]", "_");
        String extension = punto > 0 ? nombreOriginal.substring(punto) : "";
        String nombreFinal = base + "_" + LocalDateTime.now().format(TIMESTAMP_FMT) + extension;
        Path directorio = Paths.get(uploadDir, subdirectorio).normalize();

        try {
            Files.createDirectories(directorio);
            Files.copy(archivo.getInputStream(), directorio.resolve(nombreFinal), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Error al guardar la imagen");
        }

        return "/uploads/" + subdirectorio + "/" + nombreFinal;
    }

    public void eliminar(String url) {
        if (url == null || !url.startsWith("/uploads/")) return;
        String subPath = url.replaceFirst("^/uploads/", "");
        try {
            Files.deleteIfExists(Paths.get(uploadDir, subPath).normalize());
        } catch (IOException ignored) {
        }
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
}
