package com.reservas.app.realtime;

import com.reservas.app.usuario.entity.RolUsuario;

import java.security.Principal;

public record StompUserPrincipal(Long userId, String email, RolUsuario role) implements Principal {
    @Override
    public String getName() {
        return email;
    }
}
