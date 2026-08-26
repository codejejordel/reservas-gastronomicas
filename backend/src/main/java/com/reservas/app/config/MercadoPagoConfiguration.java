package com.reservas.app.config;

import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.preference.PreferenceClient;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

@Configuration
public class MercadoPagoConfiguration {

    @Value("${app.mercadopago.access-token:}")
    private String accessToken;

    @PostConstruct
    public void init() {
        if (accessToken != null && !accessToken.isBlank()) {
            MercadoPagoConfig.setAccessToken(accessToken);
        }
    }

    @Bean
    public PreferenceClient mercadoPagoPreferenceClient() {
        return new PreferenceClient();
    }

    @Bean
    public PaymentClient mercadoPagoPaymentClient() {
        return new PaymentClient();
    }

    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }
}
