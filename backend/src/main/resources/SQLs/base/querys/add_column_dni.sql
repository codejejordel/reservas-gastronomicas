ALTER TABLE usuario ADD COLUMN dni VARCHAR(20) UNIQUE;
CREATE INDEX idx_usuario_dni ON usuario(dni);