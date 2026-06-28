package com.reservas.app.usuario.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.reservas.app.common.JwtUtil;
import com.reservas.app.usuario.dto.LoginRequestDto;
import com.reservas.app.usuario.dto.LoginResponseDto;
import com.reservas.app.usuario.dto.RegistroRequestDto;
import com.reservas.app.usuario.dto.UsuarioResponseDto;
import com.reservas.app.usuario.entity.RolUsuario;
import com.reservas.app.usuario.entity.Usuario;
import com.reservas.app.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${app.google.client-id}")
    private String googleClientId;

    public List<UsuarioResponseDto> list() {
        return usuarioRepository.findAll().stream()
                .map(this::toDto)
                .toList();
    }

    public UsuarioResponseDto getById(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        return toDto(usuario);
    }

    public UsuarioResponseDto getByDni(String dni) {
        Usuario usuario = usuarioRepository.findByDni(dni)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        return toDto(usuario);
    }

    private UsuarioResponseDto toDto(Usuario u) {
        return new UsuarioResponseDto(
                u.getId(), u.getNombreCompleto(), u.getEmail(),
                u.getTelefono(), u.getDni(), u.getRol(), u.getActivo(), u.getOnboardingCompleto()
        );
    }

    public LoginResponseDto login(LoginRequestDto request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas"));

        if (!usuario.getActivo()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario inactivo");
        }

        boolean bcryptOk = passwordEncoder.matches(request.getPassword(), usuario.getPassword());
        if (!bcryptOk) {
            boolean storedIsHash = usuario.getPassword() != null && usuario.getPassword().startsWith("$2");
            if (storedIsHash || !request.getPassword().equals(usuario.getPassword())) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales inválidas");
            }
            // Contraseña legacy en texto plano — migrar a BCrypt on-the-fly
            usuario.setPassword(passwordEncoder.encode(request.getPassword()));
            usuarioRepository.save(usuario);
        }

        String token = jwtUtil.generateToken(
                usuario.getEmail(),
                usuario.getRol().name(),
                usuario.getId()
        );

        return new LoginResponseDto(token, "Bearer", usuario.getId(),
                usuario.getEmail(), usuario.getNombreCompleto(), usuario.getRol(), usuario.getOnboardingCompleto());
    }

    public UsuarioResponseDto completarOnboarding(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        usuario.setOnboardingCompleto(true);
        return toDto(usuarioRepository.save(usuario));
    }

    @Transactional
    public LoginResponseDto loginWithGoogle(String idTokenString) {
        GoogleIdToken idToken = verifyGoogleToken(idTokenString);
        GoogleIdToken.Payload payload = idToken.getPayload();

        String googleId = payload.getSubject();
        String email = payload.getEmail();
        String nombre = (String) payload.get("name");

        Usuario usuario = usuarioRepository.findByGoogleId(googleId)
                .orElseGet(() -> usuarioRepository.findByEmail(email)
                        .map(existing -> {
                            existing.setGoogleId(googleId);
                            return usuarioRepository.save(existing);
                        })
                        .orElseGet(() -> {
                            Usuario nuevo = new Usuario();
                            nuevo.setEmail(email);
                            nuevo.setNombreCompleto(nombre != null ? nombre : email);
                            nuevo.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                            nuevo.setRol(RolUsuario.ADMIN_RESTAURANTE);
                            nuevo.setGoogleId(googleId);
                            return usuarioRepository.save(nuevo);
                        }));

        if (!usuario.getActivo()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario inactivo");
        }

        String token = jwtUtil.generateToken(
                usuario.getEmail(),
                usuario.getRol().name(),
                usuario.getId()
        );

        return new LoginResponseDto(token, "Bearer", usuario.getId(),
                usuario.getEmail(), usuario.getNombreCompleto(), usuario.getRol(), usuario.getOnboardingCompleto());
    }

    private GoogleIdToken verifyGoogleToken(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token de Google inválido");
            }
            return idToken;
        } catch (ResponseStatusException e) {
            throw e;
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Error al verificar token de Google");
        }
    }

    public UsuarioResponseDto createUser(RegistroRequestDto request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El email ya está registrado");
        }
        if (request.getDni() != null && usuarioRepository.existsByDni(request.getDni())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El DNI ya está registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNombreCompleto(request.getNombreCompleto());
        usuario.setEmail(request.getEmail());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setTelefono(request.getTelefono());
        usuario.setDni(request.getDni());
        usuario.setRol(request.getRol());

        return toDto(usuarioRepository.save(usuario));
    }
}