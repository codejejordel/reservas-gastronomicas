CREATE TABLE operador (
    id              BIGINT       PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE,
    foto_perfil_url VARCHAR(500)
);

CREATE TABLE horario_operador (
    id                  BIGSERIAL   PRIMARY KEY,
    operador_id         BIGINT      NOT NULL REFERENCES operador(id) ON DELETE CASCADE,
    dia_semana          VARCHAR(20) NOT NULL CHECK (dia_semana IN (
                           'MONDAY','TUESDAY','WEDNESDAY','THURSDAY',
                           'FRIDAY','SATURDAY','SUNDAY'
                        )),
    orden_turno         INTEGER     NOT NULL DEFAULT 1,
    hora_inicio         TIME        NOT NULL,
    hora_fin            TIME        NOT NULL,
    activo              BOOLEAN     NOT NULL DEFAULT TRUE,
    fecha_creacion      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_horario_operador_turno UNIQUE (operador_id, dia_semana, orden_turno),
    -- hora_fin < hora_inicio es válido: representa un turno que cruza medianoche (ej. 19:00 a 01:00)
    CONSTRAINT chk_horario_operador_no_igual CHECK (hora_inicio <> hora_fin)
);

CREATE INDEX idx_horario_operador_operador ON horario_operador(operador_id);
