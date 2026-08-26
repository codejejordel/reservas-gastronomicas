package com.reservas.app.config;

import com.reservas.app.common.JwtUtil;
import com.reservas.app.realtime.ReservaRealtimeAuthorizationService;
import com.reservas.app.realtime.StompUserPrincipal;
import com.reservas.app.usuario.entity.RolUsuario;
import com.reservas.app.usuario.entity.Usuario;
import com.reservas.app.usuario.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@RequiredArgsConstructor
public class StompSecurityInterceptor implements ChannelInterceptor {

    private static final Pattern RESERVATION_TOPIC = Pattern.compile(
            "^/topic/restaurantes/(\\d+)/sucursales/(\\d+)/reservas$");

    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;
    private final ReservaRealtimeAuthorizationService authorizationService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || accessor.getCommand() == null) {
            return message;
        }

        if (accessor.getCommand() == StompCommand.CONNECT) {
            authenticate(accessor);
        } else if (accessor.getCommand() == StompCommand.SUBSCRIBE) {
            authorizeSubscription(accessor);
        } else if (accessor.getCommand() == StompCommand.SEND) {
            throw new AccessDeniedException("Client SEND destinations are not supported");
        }
        return message;
    }

    private void authenticate(StompHeaderAccessor accessor) {
        String authorization = firstHeader(accessor, "Authorization", "authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new AuthenticationCredentialsNotFoundException("Missing bearer token");
        }

        String token = authorization.substring(7);
        if (!jwtUtil.validateToken(token)) {
            throw new AuthenticationCredentialsNotFoundException("Invalid bearer token");
        }

        Long userId = jwtUtil.getUserIdFromToken(token);
        String email = jwtUtil.getEmailFromToken(token);
        String role = jwtUtil.getRolFromToken(token);
        Integer authVersion = jwtUtil.getAuthVersionFromToken(token);
        Usuario usuario = userId == null ? null : usuarioRepository.findById(userId).orElse(null);

        boolean current = usuario != null
                && Boolean.TRUE.equals(usuario.getActivo())
                && authVersion != null
                && authVersion.equals(usuario.getAuthVersion())
                && email != null
                && email.equalsIgnoreCase(usuario.getEmail())
                && role != null
                && role.equals(usuario.getRol().name());
        if (!current) {
            throw new AuthenticationCredentialsNotFoundException("Expired user credentials");
        }

        accessor.setUser(new StompUserPrincipal(usuario.getId(), usuario.getEmail(), usuario.getRol()));
    }

    private void authorizeSubscription(StompHeaderAccessor accessor) {
        if (!(accessor.getUser() instanceof StompUserPrincipal principal)) {
            throw new AuthenticationCredentialsNotFoundException("STOMP session is not authenticated");
        }

        Matcher matcher = RESERVATION_TOPIC.matcher(accessor.getDestination() == null ? "" : accessor.getDestination());
        if (!matcher.matches()) {
            throw new AccessDeniedException("Unsupported subscription destination");
        }

        Long restauranteId = Long.valueOf(matcher.group(1));
        Long sucursalId = Long.valueOf(matcher.group(2));
        Usuario usuario = usuarioRepository.findById(principal.userId())
                .filter(candidate -> Boolean.TRUE.equals(candidate.getActivo()))
                .orElseThrow(() -> new AuthenticationCredentialsNotFoundException("Inactive user"));

        if (usuario.getRol() != principal.role()
                || usuario.getRol() == RolUsuario.CLIENTE
                || !authorizationService.canSubscribe(usuario, restauranteId, sucursalId)) {
            throw new AccessDeniedException("Not authorized for reservation topic");
        }
    }

    private String firstHeader(StompHeaderAccessor accessor, String... names) {
        for (String name : names) {
            List<String> values = accessor.getNativeHeader(name);
            if (values != null && !values.isEmpty()) {
                return values.get(0);
            }
        }
        return null;
    }
}
