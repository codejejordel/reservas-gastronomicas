package com.reservas.app.reserva.pago.controller;

import com.reservas.app.common.JwtUtil;
import com.reservas.app.config.JwtAuthFilter;
import com.reservas.app.config.SecurityConfig;
import com.reservas.app.reserva.pago.dto.PagoPublicPreferenceResponseDto;
import com.reservas.app.reserva.pago.dto.PagoReturnResponseDto;
import com.reservas.app.reserva.entity.EstadoReserva;
import com.reservas.app.reserva.pago.entity.EstadoPago;
import com.reservas.app.reserva.pago.service.PagoService;
import com.reservas.app.usuario.repository.UsuarioRepository;
import jakarta.servlet.DispatcherType;
import jakarta.servlet.RequestDispatcher;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PublicPagoController.class)
@Import({SecurityConfig.class, JwtAuthFilter.class})
class PublicPagoSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PagoService pagoService;
    @MockBean
    private JwtUtil jwtUtil;
    @MockBean
    private UserDetailsService userDetailsService;
    @MockBean
    private UsuarioRepository usuarioRepository;
    @MockBean
    private JpaMetamodelMappingContext jpaMappingContext;

    @Test
    void allowsAnonymousPostOnlyOnOpaquePreferenceRouteWithoutBody() throws Exception {
        when(pagoService.crearOReutilizarPreferencia("RSV-A1B2C3D4", "private-token"))
                .thenReturn(new PagoPublicPreferenceResponseDto(
                "https://checkout.example/pref-123",
                LocalDateTime.parse("2026-08-24T15:10:00")));

        mockMvc.perform(post("/reserva/public/RSV-A1B2C3D4/pago/preference")
                        .header("X-Reservation-Token", "private-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.checkoutUrl").value("https://checkout.example/pref-123"))
                .andExpect(jsonPath("$.mercadoPagoPreferenceId").doesNotExist());

        mockMvc.perform(post("/reserva/public/RSV-A1B2C3D4/pago/preference/extra"))
                .andExpect(status().isForbidden());
    }

    @Test
    void preservesPublicPaymentErrorsThroughErrorDispatch() throws Exception {
        when(pagoService.crearOReutilizarPreferencia("RSV-A1B2C3D4", "private-token"))
                .thenThrow(new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                        "Mercado Pago no está configurado"));

        mockMvc.perform(post("/reserva/public/RSV-A1B2C3D4/pago/preference")
                        .header("X-Reservation-Token", "private-token"))
                .andExpect(status().isServiceUnavailable());

        mockMvc.perform(get("/error")
                        .with(request -> {
                            request.setDispatcherType(DispatcherType.ERROR);
                            return request;
                        })
                        .requestAttr(RequestDispatcher.ERROR_STATUS_CODE, HttpStatus.SERVICE_UNAVAILABLE.value())
                        .requestAttr(RequestDispatcher.ERROR_REQUEST_URI,
                                "/reserva/public/RSV-A1B2C3D4/pago/preference")
                        .requestAttr(RequestDispatcher.ERROR_MESSAGE, "Mercado Pago no está configurado")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status").value(HttpStatus.SERVICE_UNAVAILABLE.value()))
                .andExpect(jsonPath("$.message").value("Mercado Pago no está configurado"));
    }

    @Test
    void allowsAnonymousValidatedReturnRouteAndNoBroaderPath() throws Exception {
        when(pagoService.reconciliarRetorno("RSV-A1B2C3D4", "private-token", "9001")).thenReturn(new PagoReturnResponseDto(
                "RSV-A1B2C3D4",
                EstadoReserva.CONFIRMADA,
                EstadoPago.APROBADO,
                "approved",
                true,
                PagoReturnResponseDto.Outcome.APPROVED));

        mockMvc.perform(post("/reserva/public/RSV-A1B2C3D4/pago/return")
                        .header("X-Reservation-Token", "private-token")
                        .contentType("application/json")
                        .content("{\"paymentId\":\"9001\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.codigoReserva").value("RSV-A1B2C3D4"))
                .andExpect(jsonPath("$.verified").value(true))
                .andExpect(jsonPath("$.outcome").value("APPROVED"));

        mockMvc.perform(post("/reserva/public/RSV-A1B2C3D4/pago/return")
                        .header("X-Reservation-Token", "private-token")
                        .contentType("application/json")
                        .content("{\"paymentId\":\"approved\"}"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/reserva/public/RSV-A1B2C3D4/pago/return/extra")
                        .contentType("application/json")
                        .content("{}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void invalidCapabilityBlocksPublicReturn() throws Exception {
        when(pagoService.reconciliarRetorno("RSV-A1B2C3D4", "invalid-token", "9001"))
                .thenThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "Reserva no encontrada"));

        mockMvc.perform(post("/reserva/public/RSV-A1B2C3D4/pago/return")
                        .header("X-Reservation-Token", "invalid-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"paymentId\":\"9001\"}"))
                .andExpect(status().isNotFound());
    }
}
