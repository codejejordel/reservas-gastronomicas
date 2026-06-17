ALTER TABLE reserva ALTER COLUMN cliente_id DROP NOT NULL;

ALTER TABLE reserva ADD COLUMN nombre_invitado VARCHAR(200);
ALTER TABLE reserva ADD COLUMN email_invitado VARCHAR(255);
ALTER TABLE reserva ADD COLUMN telefono_invitado VARCHAR(50);

ALTER TABLE reserva ADD CONSTRAINT chk_reserva_cliente_or_guest
    CHECK (cliente_id IS NOT NULL OR (nombre_invitado IS NOT NULL AND email_invitado IS NOT NULL));
