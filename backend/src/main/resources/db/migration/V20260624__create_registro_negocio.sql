CREATE TABLE registro_negocio (
    id              BIGSERIAL       PRIMARY KEY,
    usuario_id      BIGINT          NOT NULL UNIQUE REFERENCES usuario(id),
    paso_actual     INTEGER         NOT NULL DEFAULT 1,
    datos           TEXT,
    completado      BOOLEAN         NOT NULL DEFAULT FALSE,
    fecha_creacion      TIMESTAMP NOT NULL DEFAULT now(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT chk_paso_actual CHECK (paso_actual BETWEEN 1 AND 5)
);

CREATE INDEX idx_registro_negocio_usuario ON registro_negocio(usuario_id);
