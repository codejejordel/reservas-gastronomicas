package com.reservas.app.config;

import com.reservas.app.common.JwtUtil;
import com.reservas.app.realtime.ReservaRealtimeAuthorizationService;
import com.reservas.app.realtime.StompUserPrincipal;
import com.reservas.app.usuario.entity.RolUsuario;
import com.reservas.app.usuario.entity.Usuario;
import com.reservas.app.usuario.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StompSecurityInterceptorTest {

    @Mock private JwtUtil jwtUtil;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private ReservaRealtimeAuthorizationService authorizationService;
    @Mock private MessageChannel channel;

    private StompSecurityInterceptor interceptor;
    private Usuario admin;

    @BeforeEach
    void setUp() {
        interceptor = new StompSecurityInterceptor(jwtUtil, usuarioRepository, authorizationService);
        admin = new Usuario();
        admin.setId(2L);
        admin.setEmail("admin@turnify.test");
        admin.setRol(RolUsuario.ADMIN_RESTAURANTE);
        admin.setActivo(true);
        admin.setAuthVersion(6);
    }

    @Test
    void authenticatesConnectOnlyWithCurrentActiveJwtCredentials() {
        when(jwtUtil.validateToken("token")).thenReturn(true);
        when(jwtUtil.getUserIdFromToken("token")).thenReturn(2L);
        when(jwtUtil.getEmailFromToken("token")).thenReturn("admin@turnify.test");
        when(jwtUtil.getRolFromToken("token")).thenReturn("ADMIN_RESTAURANTE");
        when(jwtUtil.getAuthVersionFromToken("token")).thenReturn(6);
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(admin));
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        accessor.setNativeHeader("Authorization", "Bearer token");

        Message<?> result = interceptor.preSend(message(accessor), channel);

        StompHeaderAccessor resultAccessor = StompHeaderAccessor.wrap(result);
        assertThat(resultAccessor.getUser()).isInstanceOf(StompUserPrincipal.class);

        admin.setAuthVersion(7);
        assertThatThrownBy(() -> interceptor.preSend(message(accessor), channel))
                .isInstanceOf(AuthenticationCredentialsNotFoundException.class);
    }

    @Test
    void authorizesOnlyExactServerVerifiedBranchTopicsAndDeniesSend() {
        when(usuarioRepository.findById(2L)).thenReturn(Optional.of(admin));
        when(authorizationService.canSubscribe(admin, 3L, 7L)).thenReturn(true);
        StompUserPrincipal principal = new StompUserPrincipal(2L, admin.getEmail(), admin.getRol());
        StompHeaderAccessor allowed = StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
        allowed.setUser(principal);
        allowed.setDestination("/topic/restaurantes/3/sucursales/7/reservas");

        assertThat(interceptor.preSend(message(allowed), channel)).isNotNull();

        StompHeaderAccessor denied = StompHeaderAccessor.create(StompCommand.SUBSCRIBE);
        denied.setUser(principal);
        denied.setDestination("/topic/restaurantes/3/sucursales/8/reservas");
        assertThatThrownBy(() -> interceptor.preSend(message(denied), channel))
                .isInstanceOf(AccessDeniedException.class);

        StompHeaderAccessor send = StompHeaderAccessor.create(StompCommand.SEND);
        send.setDestination("/app/anything");
        assertThatThrownBy(() -> interceptor.preSend(message(send), channel))
                .isInstanceOf(AccessDeniedException.class);
    }

    private Message<byte[]> message(StompHeaderAccessor accessor) {
        accessor.setLeaveMutable(true);
        return MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());
    }
}
