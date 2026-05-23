package com.reservas.app.cliente.service;

import com.reservas.app.cliente.dto.ClienteResponseDto;
import com.reservas.app.cliente.dto.CreateClienteRequestDto;
import com.reservas.app.cliente.entity.Cliente;
import com.reservas.app.cliente.repository.ClienteRepository;
import com.reservas.app.usuario.entity.RolUsuario;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public ClienteResponseDto create(CreateClienteRequestDto request) {
        if (clienteRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El email ya está registrado");
        }
        if (request.getDni() != null && clienteRepository.existsByDni(request.getDni())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El DNI ya está registrado");
        }

        Cliente cliente = new Cliente();
        cliente.setNombreCompleto(request.getNombreCompleto());
        cliente.setEmail(request.getEmail());
        cliente.setPassword(passwordEncoder.encode(request.getPassword()));
        cliente.setTelefono(request.getTelefono());
        cliente.setDni(request.getDni());
        cliente.setRol(RolUsuario.CLIENTE);
        cliente.setCanalNotifPreferido(request.getCanalNotifPreferido());

        return toDto(clienteRepository.save(cliente));
    }

    public ClienteResponseDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    public ClienteResponseDto getByEmail(String email) {
        Cliente cliente = clienteRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));
        return toDto(cliente);
    }

    public ClienteResponseDto getByDni(String dni) {
        Cliente cliente = clienteRepository.findByDni(dni)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));
        return toDto(cliente);
    }

    public List<ClienteResponseDto> list() {
        return clienteRepository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional
    public ClienteResponseDto bloquear(Long id) {
        Cliente cliente = findOrThrow(id);
        cliente.setBloqueado(true);
        cliente.setFechaDesbloqueo(null);
        return toDto(clienteRepository.save(cliente));
    }

    @Transactional
    public ClienteResponseDto desbloquear(Long id) {
        Cliente cliente = findOrThrow(id);
        cliente.setBloqueado(false);
        cliente.setCantNoShows(0);
        cliente.setFechaDesbloqueo(null);
        return toDto(clienteRepository.save(cliente));
    }

    private Cliente findOrThrow(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));
    }

    public ClienteResponseDto toDto(Cliente c) {
        return new ClienteResponseDto(
                c.getId(), c.getNombreCompleto(), c.getEmail(), c.getTelefono(), c.getDni(),
                c.getCanalNotifPreferido(), c.getCantNoShows(), c.getCantReservas(),
                c.getBloqueado(), c.getFechaDesbloqueo(), c.getActivo(), c.getFechaCreacion()
        );
    }
}