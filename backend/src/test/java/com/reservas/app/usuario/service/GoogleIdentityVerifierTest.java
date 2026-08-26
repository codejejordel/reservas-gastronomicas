package com.reservas.app.usuario.service;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class GoogleIdentityVerifierTest {

    private final GoogleIdentityVerifier verifier = new GoogleIdentityVerifier("web-client-id");

    @Test
    void acceptsVerifiedIdentityWithRequiredClaims() {
        GoogleIdToken.Payload payload = validPayload();

        GoogleIdentityVerifier.GoogleIdentity identity = verifier.validatePayload(payload);

        assertThat(identity.subject()).isEqualTo("google-subject");
        assertThat(identity.email()).isEqualTo("owner@example.com");
        assertThat(identity.name()).isEqualTo("Restaurant Owner");
    }

    @Test
    void rejectsUnverifiedEmail() {
        GoogleIdToken.Payload payload = validPayload().setEmailVerified(false);

        assertThatThrownBy(() -> verifier.validatePayload(payload))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("401 UNAUTHORIZED");
    }

    @Test
    void rejectsBlankSubjectOrEmail() {
        assertThatThrownBy(() -> verifier.validatePayload(validPayload().setSubject(" ")))
                .isInstanceOf(ResponseStatusException.class);
        assertThatThrownBy(() -> verifier.validatePayload(validPayload().setEmail(" ")))
                .isInstanceOf(ResponseStatusException.class);
    }

    private GoogleIdToken.Payload validPayload() {
        return new GoogleIdToken.Payload()
                .setSubject("google-subject")
                .setEmail("owner@example.com")
                .setEmailVerified(true)
                .set("name", "Restaurant Owner");
    }
}
