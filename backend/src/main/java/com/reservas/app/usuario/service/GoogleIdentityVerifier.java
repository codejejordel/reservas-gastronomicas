package com.reservas.app.usuario.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;

@Component
public class GoogleIdentityVerifier {

    private final String clientId;

    public GoogleIdentityVerifier(@Value("${app.google.client-id:}") String clientId) {
        this.clientId = clientId;
    }

    public GoogleIdentity verify(String credential) {
        if (clientId == null || clientId.isBlank()) {
            throw unauthorized("Autenticación con Google no configurada");
        }

        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(clientId))
                    .build();
            GoogleIdToken token = verifier.verify(credential);
            if (token == null) {
                throw unauthorized("Credencial de Google inválida");
            }
            return validatePayload(token.getPayload());
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw unauthorized("No se pudo verificar la credencial de Google");
        }
    }

    GoogleIdentity validatePayload(GoogleIdToken.Payload payload) {
        String subject = payload.getSubject();
        String email = payload.getEmail();
        if (subject == null || subject.isBlank()
                || email == null || email.isBlank()
                || !Boolean.TRUE.equals(payload.getEmailVerified())) {
            throw unauthorized("Credencial de Google inválida");
        }

        Object nameClaim = payload.get("name");
        String name = nameClaim instanceof String ? (String) nameClaim : null;
        return new GoogleIdentity(subject, email, name);
    }

    private ResponseStatusException unauthorized(String reason) {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, reason);
    }

    public record GoogleIdentity(String subject, String email, String name) {
    }
}
