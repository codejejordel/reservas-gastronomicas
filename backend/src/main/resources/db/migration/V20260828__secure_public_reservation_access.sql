CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE reserva
    ADD COLUMN public_access_token_hash VARCHAR(64),
    ADD COLUMN fecha_limite_pago TIMESTAMP;

UPDATE reserva
SET public_access_token_hash = encode(digest(gen_random_bytes(32), 'sha256'), 'hex');

UPDATE reserva r
SET fecha_limite_pago = COALESCE(
    (SELECT p.fecha_expiracion FROM pago p WHERE p.reserva_id = r.id),
    CURRENT_TIMESTAMP
)
WHERE r.estado = 'PENDIENTE_PAGO';

ALTER TABLE reserva
    ALTER COLUMN public_access_token_hash SET NOT NULL;

ALTER TABLE reserva
    ADD CONSTRAINT chk_reserva_public_token_hash
        CHECK (public_access_token_hash ~ '^[0-9a-f]{64}$');
