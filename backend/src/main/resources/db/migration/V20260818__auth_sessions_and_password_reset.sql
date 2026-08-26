ALTER TABLE usuario ADD COLUMN auth_version INTEGER NOT NULL DEFAULT 0;

CREATE TABLE auth_refresh_token (
    id BIGSERIAL PRIMARY KEY,
    usuario_id BIGINT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    family_id UUID NOT NULL,
    remember_me BOOLEAN NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auth_refresh_token_usuario_id ON auth_refresh_token(usuario_id);
CREATE INDEX idx_auth_refresh_token_family_id ON auth_refresh_token(family_id);
CREATE INDEX idx_auth_refresh_token_expires_at ON auth_refresh_token(expires_at);

CREATE TABLE password_reset_challenge (
    id BIGSERIAL PRIMARY KEY,
    public_id UUID NOT NULL UNIQUE,
    usuario_id BIGINT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    code_hash VARCHAR(255) NOT NULL,
    reset_token_hash VARCHAR(64) UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    verified_at TIMESTAMP,
    used_at TIMESTAMP,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_reset_challenge_usuario_id ON password_reset_challenge(usuario_id);
CREATE INDEX idx_password_reset_challenge_expires_at ON password_reset_challenge(expires_at);
