package com.reservas.app.realtime;

import com.reservas.app.restaurante.repository.RestauranteRepository;
import com.reservas.app.sucursal.repository.SucursalRepository;
import com.reservas.app.usuario.entity.RolUsuario;
import com.reservas.app.usuario.entity.Usuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.jdbc.core.JdbcTemplate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReservaRealtimeAuthorizationServiceTest {

    @Mock private SucursalRepository sucursalRepository;
    @Mock private RestauranteRepository restauranteRepository;
    @Mock private JdbcTemplate jdbcTemplate;

    private ReservaRealtimeAuthorizationService service;

    @BeforeEach
    void setUp() {
        service = new ReservaRealtimeAuthorizationService(sucursalRepository, restauranteRepository, jdbcTemplate);
    }

    @Test
    void appliesExplicitRoleAndTenantRules() {
        when(sucursalRepository.existsByIdAndRestauranteId(7L, 3L)).thenReturn(true);
        Usuario superAdmin = user(1L, RolUsuario.SUPER_ADMIN);
        Usuario admin = user(2L, RolUsuario.ADMIN_RESTAURANTE);
        Usuario employee = user(4L, RolUsuario.EMPLEADO_SUCURSAL);
        Usuario client = user(5L, RolUsuario.CLIENTE);
        when(restauranteRepository.existsByIdAndUsuarioAdminId(3L, 2L)).thenReturn(true);
        when(jdbcTemplate.queryForObject(anyString(), eq(Boolean.class), eq(4L), eq(7L))).thenReturn(true);

        assertThat(service.canSubscribe(superAdmin, 3L, 7L)).isTrue();
        assertThat(service.canSubscribe(admin, 3L, 7L)).isTrue();
        assertThat(service.canSubscribe(employee, 3L, 7L)).isTrue();
        assertThat(service.canSubscribe(client, 3L, 7L)).isFalse();
        assertThat(service.canSubscribe(superAdmin, 99L, 7L)).isFalse();
    }

    private Usuario user(Long id, RolUsuario role) {
        Usuario usuario = new Usuario();
        usuario.setId(id);
        usuario.setRol(role);
        usuario.setActivo(true);
        return usuario;
    }
}
