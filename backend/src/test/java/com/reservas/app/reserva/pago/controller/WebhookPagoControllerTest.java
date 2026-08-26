package com.reservas.app.reserva.pago.controller;

import com.reservas.app.reserva.pago.service.PagoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class WebhookPagoControllerTest {

    @Mock
    private PagoService pagoService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(new WebhookPagoController(pagoService)).build();
    }

    @Test
    void passesExactQueryDataIdUsedForSignatureVerification() throws Exception {
        mockMvc.perform(post("/pagos/webhook/41")
                        .queryParam("data.id", "9001")
                        .header("x-signature", "ts=1724500000,v1=abc")
                        .header("x-request-id", "request-123")
                        .contentType("application/json")
                        .content("{\"type\":\"payment\",\"data\":{\"id\":\"9001\"}}"))
                .andExpect(status().isOk());

        verify(pagoService).procesarWebhook(
                41L, 9001L, "9001", "ts=1724500000,v1=abc", "request-123");
    }

    @Test
    void rejectsQueryAndBodyIdentifierMismatchBeforeService() throws Exception {
        mockMvc.perform(post("/pagos/webhook/41")
                        .queryParam("data.id", "9001")
                        .contentType("application/json")
                        .content("{\"type\":\"payment\",\"data\":{\"id\":\"9002\"}}"))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(pagoService);
    }

    @Test
    void rejectsMissingMalformedAndOutOfRangeIdentifiersBeforeService() throws Exception {
        mockMvc.perform(post("/pagos/webhook/41"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(post("/pagos/webhook/41").queryParam("data.id", "not-a-number"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(post("/pagos/webhook/41").queryParam("data.id", "9999999999999999999"))
                .andExpect(status().isBadRequest());

        verifyNoInteractions(pagoService);
    }

    @Test
    void preservesAuthenticationFailureStatusFromService() throws Exception {
        doThrow(new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Firma de webhook inválida"))
                .when(pagoService).procesarWebhook(41L, 9001L, "9001", null, null);

        mockMvc.perform(post("/pagos/webhook/41").queryParam("data.id", "9001"))
                .andExpect(status().isUnauthorized());
    }
}
