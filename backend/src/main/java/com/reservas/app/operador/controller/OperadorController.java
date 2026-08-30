package com.reservas.app.operador.controller;

import com.reservas.app.operador.dto.CreateOperadorRequestDto;
import com.reservas.app.operador.dto.OperadorResponseDto;
import com.reservas.app.operador.dto.UpdateOperadorRequestDto;
import com.reservas.app.operador.service.OperadorService;
import com.reservas.app.usuario.entity.Usuario;
import com.reservas.app.usuario.repository.UsuarioRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/operador")
@RequiredArgsConstructor
@Tag(name = "Operador")
public class OperadorController {

    private final OperadorService operadorService;
    private final UsuarioRepository usuarioRepository;

    @PreAuthorize("hasAnyRole('ADMIN_RESTAURANTE','SUPER_ADMIN')")
    @PostMapping
    @Operation(summary = "Crear un operador/mozo para una sucursal")
    public ResponseEntity<OperadorResponseDto> create(@AuthenticationPrincipal UserDetails userDetails, @Valid @RequestBody CreateOperadorRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(operadorService.create(resolveUsuario(userDetails), request));
    }

    @PreAuthorize("hasAnyRole('ADMIN_RESTAURANTE','SUPER_ADMIN')")
    @GetMapping
    @Operation(summary = "Listar operadores de una sucursal")
    public ResponseEntity<List<OperadorResponseDto>> listBySucursal(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam Long sucursalId) {
        return ResponseEntity.ok(operadorService.listBySucursal(resolveUsuario(userDetails), sucursalId));
    }

    @PreAuthorize("hasAnyRole('ADMIN_RESTAURANTE','SUPER_ADMIN')")
    @GetMapping("/{id}")
    @Operation(summary = "Obtener operador por ID")
    public ResponseEntity<OperadorResponseDto> getById(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        return ResponseEntity.ok(operadorService.getById(resolveUsuario(userDetails), id));
    }

    @PreAuthorize("hasAnyRole('ADMIN_RESTAURANTE','SUPER_ADMIN')")
    @PutMapping("/{id}")
    @Operation(summary = "Actualizar datos, sucursal y turnos de un operador")
    public ResponseEntity<OperadorResponseDto> update(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody UpdateOperadorRequestDto request) {
        return ResponseEntity.ok(operadorService.update(resolveUsuario(userDetails), id, request));
    }

    @PreAuthorize("hasAnyRole('ADMIN_RESTAURANTE','SUPER_ADMIN')")
    @PatchMapping("/{id}/activo")
    @Operation(summary = "Activar o desactivar un operador")
    public ResponseEntity<OperadorResponseDto> setActivo(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestParam boolean activo) {
        return ResponseEntity.ok(operadorService.setActivo(resolveUsuario(userDetails), id, activo));
    }

    @PreAuthorize("hasAnyRole('ADMIN_RESTAURANTE','SUPER_ADMIN')")
    @PatchMapping(value = "/{id}/foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Subir o reemplazar la foto de perfil del operador")
    public ResponseEntity<OperadorResponseDto> subirFoto(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @RequestPart("archivo") MultipartFile archivo) {
        return ResponseEntity.ok(operadorService.subirFoto(resolveUsuario(userDetails), id, archivo));
    }

    @PreAuthorize("hasRole('EMPLEADO_SUCURSAL')")
    @GetMapping("/me")
    @Operation(summary = "Perfil y horario del operador logueado, incluye si está en turno ahora")
    public ResponseEntity<OperadorResponseDto> getPropioPerfil(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(operadorService.getPropioPerfil(resolveUsuario(userDetails)));
    }

    private Usuario resolveUsuario(UserDetails userDetails) {
        return usuarioRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    }
}
