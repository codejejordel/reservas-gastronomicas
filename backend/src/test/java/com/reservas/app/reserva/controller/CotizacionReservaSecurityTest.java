package com.reservas.app.reserva.controller;

import com.reservas.app.common.JwtUtil;
import com.reservas.app.config.JwtAuthFilter;
import com.reservas.app.config.SecurityConfig;
import com.reservas.app.reserva.dto.CotizacionReservaResponseDto;
import com.reservas.app.reserva.service.CotizacionReservaService;
import com.reservas.app.usuario.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CotizacionReservaController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class})
class CotizacionReservaSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CotizacionReservaService cotizacionReservaService;
    @MockBean
    private JwtUtil jwtUtil;
    @MockBean
    private UserDetailsService userDetailsService;
    @MockBean
    private UsuarioRepository usuarioRepository;
    @MockBean
    private JpaMetamodelMappingContext jpaMappingContext;

    @Test
    void allowsOnlyAnonymousGetForPublicQuoteRoute() throws Exception {
        when(cotizacionReservaService.cotizar(7L, 3)).thenReturn(new CotizacionReservaResponseDto(
                new BigDecimal("500.00"),
                new BigDecimal("1500.00"),
                true,
                new BigDecimal("2000.00"),
                new BigDecimal("3500.00"),
                24,
                15));

        mockMvc.perform(get("/sucursal/7/reserva/cotizacion").param("personas", "3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cargoServicioUnitario").value(500.00))
                .andExpect(jsonPath("$.cargoServicioTotal").value(1500.00))
                .andExpect(jsonPath("$.cobraSenia").value(true))
                .andExpect(jsonPath("$.montoSenia").value(2000.00))
                .andExpect(jsonPath("$.totalAPagarAhora").value(3500.00))
                .andExpect(jsonPath("$.horasCancelacionLibre").value(24))
                .andExpect(jsonPath("$.toleranciaMinutos").value(15));

        mockMvc.perform(post("/sucursal/7/reserva/cotizacion"))
                .andExpect(status().isForbidden());
    }
}
