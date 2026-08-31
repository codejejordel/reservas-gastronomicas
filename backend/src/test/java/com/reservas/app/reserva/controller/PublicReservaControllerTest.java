package com.reservas.app.reserva.controller;

import com.reservas.app.reserva.dto.ReservaPublicStatusDto;
import com.reservas.app.reserva.entity.EstadoReserva;
import com.reservas.app.reserva.pago.entity.EstadoPago;
import com.reservas.app.reserva.service.ReservaPublicAccessService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class PublicReservaControllerTest {

    @Mock private ReservaPublicAccessService publicAccessService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(
                new PublicReservaController(publicAccessService)).build();
    }

    @Test
    void exposesOnlyMinimalCustomerSafeStatus() throws Exception {
        when(publicAccessService.getStatus("RES-260828-ABCD", "private-token"))
                .thenReturn(new ReservaPublicStatusDto(
                        "RES-260828-ABCD",
                        EstadoReserva.PENDIENTE_PAGO,
                        LocalDate.of(2026, 8, 30),
                        LocalTime.of(21, 0),
                        4,
                        EstadoPago.RECHAZADO,
                        true,
                        LocalDateTime.of(2026, 8, 28, 18, 10)));

        mockMvc.perform(get("/reserva/public/RES-260828-ABCD/status")
                        .header("X-Reservation-Token", "private-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.codigoReserva").value("RES-260828-ABCD"))
                .andExpect(jsonPath("$.estadoPago").value("RECHAZADO"))
                .andExpect(jsonPath("$.puedeContinuarPago").value(true))
                .andExpect(jsonPath("$.clienteId").doesNotExist())
                .andExpect(jsonPath("$.nombreInvitado").doesNotExist())
                .andExpect(jsonPath("$.emailInvitado").doesNotExist())
                .andExpect(jsonPath("$.telefonoInvitado").doesNotExist())
                .andExpect(jsonPath("$.observaciones").doesNotExist())
                .andExpect(jsonPath("$.linkPago").doesNotExist())
                .andExpect(jsonPath("$.accessToken").doesNotExist());
    }

    @Test
    void requiresCapabilityHeader() throws Exception {
        mockMvc.perform(get("/reserva/public/RES-260828-ABCD/status"))
                .andExpect(status().isBadRequest());
    }
}
