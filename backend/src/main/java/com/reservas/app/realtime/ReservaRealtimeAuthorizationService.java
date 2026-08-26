package com.reservas.app.realtime;

import com.reservas.app.restaurante.repository.RestauranteRepository;
import com.reservas.app.sucursal.repository.SucursalRepository;
import com.reservas.app.usuario.entity.RolUsuario;
import com.reservas.app.usuario.entity.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReservaRealtimeAuthorizationService {

    private final SucursalRepository sucursalRepository;
    private final RestauranteRepository restauranteRepository;
    private final JdbcTemplate jdbcTemplate;

    public boolean canSubscribe(Usuario usuario, Long restauranteId, Long sucursalId) {
        if (!sucursalRepository.existsByIdAndRestauranteId(sucursalId, restauranteId)) {
            return false;
        }

        return switch (usuario.getRol()) {
            case SUPER_ADMIN -> true;
            case ADMIN_RESTAURANTE -> restauranteRepository
                    .existsByIdAndUsuarioAdminId(restauranteId, usuario.getId());
            case EMPLEADO_SUCURSAL -> hasActiveBranchMembership(usuario.getId(), sucursalId);
            case CLIENTE -> false;
        };
    }

    private boolean hasActiveBranchMembership(Long usuarioId, Long sucursalId) {
        Boolean allowed = jdbcTemplate.queryForObject("""
                SELECT EXISTS (
                    SELECT 1 FROM usuario_sucursal
                    WHERE usuario_id = ? AND sucursal_id = ? AND activo = TRUE
                )
                """, Boolean.class, usuarioId, sucursalId);
        return Boolean.TRUE.equals(allowed);
    }
}
