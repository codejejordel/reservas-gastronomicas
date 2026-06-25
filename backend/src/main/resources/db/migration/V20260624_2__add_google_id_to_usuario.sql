ALTER TABLE usuario ADD COLUMN google_id VARCHAR(255) UNIQUE;

CREATE INDEX idx_usuario_google_id ON usuario(google_id);
