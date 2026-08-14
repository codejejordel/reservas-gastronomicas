package com.reservas.app.cliente.controller;

import com.reservas.app.cliente.dto.ClienteResponseDto;
import com.reservas.app.cliente.dto.CreateClienteRequestDto;
import com.reservas.app.cliente.service.ClienteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/cliente")
@RequiredArgsConstructor
@Tag(name = "Cliente")
public class ClienteController {

    private final ClienteService clienteService;

    @PostMapping
    @Operation(summary = "Registrar nuevo cliente")
    public ResponseEntity<ClienteResponseDto> create(@Valid @RequestBody CreateClienteRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clienteService.create(request));
    }

    @GetMapping
    @Operation(summary = "Listar todos los clientes")
    public ResponseEntity<List<ClienteResponseDto>> list() {
        return ResponseEntity.ok(clienteService.list());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener cliente por ID")
    public ResponseEntity<ClienteResponseDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(clienteService.getById(id));
    }

    @GetMapping("/email/{email}")
    @Operation(summary = "Obtener cliente segun el email que debería ser único")
    public ResponseEntity<ClienteResponseDto> getByEmail(@PathVariable String email) {
        return ResponseEntity.ok(clienteService.getByEmail(email));
    }

    @GetMapping("/dni/{dni}")
    @Operation(summary = "Obtener cliente por DNI")
    public ResponseEntity<ClienteResponseDto> getByDni(@PathVariable String dni) {
        return ResponseEntity.ok(clienteService.getByDni(dni));
    }

    @PatchMapping("/{id}/bloquear")
    @Operation(summary = "Bloquear cliente")
    public ResponseEntity<ClienteResponseDto> bloquear(@PathVariable Long id) {
        return ResponseEntity.ok(clienteService.bloquear(id));
    }

    @PatchMapping("/{id}/desbloquear")
    @Operation(summary = "Desbloquear cliente y resetear no-shows")
    public ResponseEntity<ClienteResponseDto> desbloquear(@PathVariable Long id) {
        return ResponseEntity.ok(clienteService.desbloquear(id));
    }
}