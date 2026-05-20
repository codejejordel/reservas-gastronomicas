package com.reservas.app.usuario.service;

import com.reservas.app.common.JwtUtil;
import com.reservas.app.usuario.dto.LoginRequestDto;
import com.reservas.app.usuario.dto.LoginResponseDto;
import com.reservas.app.usuario.dto.RegistroRequestDto;
import com.reservas.app.usuario.dto.UsuarioResponseDto;
import com.reservas.app.usuario.entity.Usuario;
import com.reservas.app.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public LoginResponseDto login(LoginRequestDto request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas"));

        if (!usuario.getActivo()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario inactivo");
        }

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas");
        }

        String token = jwtUtil.generateToken(
                usuario.getEmail(),
                usuario.getRol().name(),
                usuario.getId()
        );

        return new LoginResponseDto(token, "Bearer", usuario.getId(),
                usuario.getEmail(), usuario.getNombreCompleto(), usuario.getRol());
    }

    public UsuarioResponseDto createUser(RegistroRequestDto request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El email ya está registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNombreCompleto(request.getNombreCompleto());
        usuario.setEmail(request.getEmail());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setTelefono(request.getTelefono());
        usuario.setRol(request.getRol());

        usuario = usuarioRepository.save(usuario);

        return new UsuarioResponseDto(
                usuario.getId(), usuario.getNombreCompleto(), usuario.getEmail(),
                usuario.getTelefono(), usuario.getRol(), usuario.getActivo(), usuario.getOnboardingCompleto()
        );
    }
}