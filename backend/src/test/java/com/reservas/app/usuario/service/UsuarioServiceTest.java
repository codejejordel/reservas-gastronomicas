package com.reservas.app.usuario.service;

import com.reservas.app.common.JwtUtil;
import com.reservas.app.usuario.dto.RegistroRequestDto;
import com.reservas.app.usuario.entity.RolUsuario;
import com.reservas.app.usuario.entity.Usuario;
import com.reservas.app.usuario.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtUtil jwtUtil;
    @Mock
    private GoogleIdentityVerifier googleIdentityVerifier;

    @Test
    void publicRegistrationAlwaysCreatesRestaurantAdministrator() {
        RegistroRequestDto request = new RegistroRequestDto();
        request.setNombreCompleto("Restaurant Owner");
        request.setEmail("owner@example.com");
        request.setPassword("strong-password");
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encoded");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UsuarioService service = new UsuarioService(
                usuarioRepository, passwordEncoder, jwtUtil, googleIdentityVerifier);
        service.createUser(request);

        ArgumentCaptor<Usuario> captor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(captor.capture());
        assertThat(captor.getValue().getRol()).isEqualTo(RolUsuario.ADMIN_RESTAURANTE);
    }
}
