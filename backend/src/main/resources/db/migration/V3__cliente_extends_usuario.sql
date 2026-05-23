-- Cliente pasa a ser subtype de Usuario (JPA JOINED inheritance).
-- En dev no hay datos, se eliminan las tablas dependientes y se recrea cliente.

DROP TABLE IF EXISTS lista_espera   CASCADE;
DROP TABLE IF EXISTS resena         CASCADE;
DROP TABLE IF EXISTS notificacion   CASCADE;
DROP TABLE IF EXISTS asignacion_mesa CASCADE;
DROP TABLE IF EXISTS pago           CASCADE;
DROP TABLE IF EXISTS reserva        CASCADE;
DROP TABLE IF EXISTS cliente        CASCADE;

-- cliente.id es FK a usuario.id (Hibernate inserta en ambas tablas automáticamente)
CREATE TABLE cliente (
    id                       BIGINT PRIMARY KEY REFERENCES usuario(id) ON DELETE CASCADE,
    canal_notif_preferido    VARCHAR(20) CHECK (canal_notif_preferido IN ('EMAIL','SMS','WHATSAPP','PUSH')),
    cant_no_shows            INTEGER NOT NULL DEFAULT 0,
    cant_reservas            INTEGER NOT NULL DEFAULT 0,
    bloqueado                BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_desbloqueo         TIMESTAMP
);

CREATE INDEX idx_cliente_bloqueado ON cliente(bloqueado);

-- ============================================================
-- RESERVA (recreada con cliente_id → cliente.id)
-- ============================================================
CREATE TABLE reserva (
    id                       BIGSERIAL PRIMARY KEY,
    codigo_reserva           VARCHAR(20) NOT NULL UNIQUE,
    sucursal_id              BIGINT NOT NULL REFERENCES sucursal(id) ON DELETE RESTRICT,
    cliente_id               BIGINT NOT NULL REFERENCES cliente(id)  ON DELETE RESTRICT,
    fecha_reserva            DATE NOT NULL,
    hora_reserva             TIME NOT NULL,
    cant_personas            INTEGER NOT NULL CHECK (cant_personas > 0),
    estado                   VARCHAR(30) NOT NULL
                             CHECK (estado IN (
                                'PENDIENTE_PAGO','PENDIENTE_CONFIRMACION',
                                'CONFIRMADA','CANCELADA',
                                'COMPLETADA','NO_SHOW','EXPIRADA'
                             )),
    observaciones            VARCHAR(500),
    canal_notif              VARCHAR(20) CHECK (canal_notif IN ('EMAIL','SMS','WHATSAPP','PUSH')),
    fecha_confirmacion       TIMESTAMP,
    fecha_cancelacion        TIMESTAMP,
    motivo_cancelacion       VARCHAR(255),
    cancelada_por            VARCHAR(20) CHECK (cancelada_por IN ('CLIENTE','RESTAURANTE','SISTEMA')),
    reserva_reemplazada_por  BIGINT REFERENCES reserva(id),
    version                  BIGINT NOT NULL DEFAULT 0,
    fecha_creacion           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reserva_sucursal_fecha ON reserva(sucursal_id, fecha_reserva);
CREATE INDEX idx_reserva_cliente        ON reserva(cliente_id);
CREATE INDEX idx_reserva_estado         ON reserva(estado);
CREATE INDEX idx_reserva_codigo         ON reserva(codigo_reserva);

-- ============================================================
-- ASIGNACION_MESA
-- ============================================================
CREATE TABLE asignacion_mesa (
    id                       BIGSERIAL PRIMARY KEY,
    reserva_id               BIGINT NOT NULL REFERENCES reserva(id) ON DELETE CASCADE,
    mesa_id                  BIGINT NOT NULL REFERENCES mesa(id)    ON DELETE RESTRICT,
    fecha_asignacion         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activa                   BOOLEAN   NOT NULL DEFAULT TRUE,
    fecha_creacion           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_asignacion_reserva ON asignacion_mesa(reserva_id);
CREATE INDEX idx_asignacion_mesa    ON asignacion_mesa(mesa_id);

-- ============================================================
-- PAGO
-- ============================================================
CREATE TABLE pago (
    id                         BIGSERIAL PRIMARY KEY,
    reserva_id                 BIGINT NOT NULL UNIQUE REFERENCES reserva(id) ON DELETE CASCADE,
    monto                      NUMERIC(12,2) NOT NULL,
    estado                     VARCHAR(30) NOT NULL
                               CHECK (estado IN (
                                  'PENDIENTE','APROBADO','RECHAZADO',
                                  'REEMBOLSADO','EXPIRADO'
                               )),
    mercado_pago_payment_id    VARCHAR(100),
    mercado_pago_preference_id VARCHAR(100),
    link_pago                  VARCHAR(500),
    fecha_pago                 TIMESTAMP,
    fecha_expiracion           TIMESTAMP,
    metodo_pago                VARCHAR(50),
    monto_comision_plataforma  NUMERIC(12,2) DEFAULT 0,
    monto_reembolsado          NUMERIC(12,2) DEFAULT 0,
    fecha_creacion             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pago_reserva           ON pago(reserva_id);
CREATE INDEX idx_pago_mp_payment_id     ON pago(mercado_pago_payment_id);
CREATE INDEX idx_pago_estado            ON pago(estado);

-- ============================================================
-- LISTA_ESPERA
-- ============================================================
CREATE TABLE lista_espera (
    id                       BIGSERIAL PRIMARY KEY,
    sucursal_id              BIGINT NOT NULL REFERENCES sucursal(id) ON DELETE CASCADE,
    cliente_id               BIGINT NOT NULL REFERENCES cliente(id)  ON DELETE RESTRICT,
    reserva_id               BIGINT REFERENCES reserva(id) ON DELETE SET NULL,
    fecha_deseada            DATE NOT NULL,
    hora_deseada             TIME NOT NULL,
    cant_personas            INTEGER NOT NULL CHECK (cant_personas > 0),
    flexibilidad_horaria     VARCHAR(20) NOT NULL DEFAULT 'EXACTA'
                             CHECK (flexibilidad_horaria IN ('EXACTA','MAS_MENOS_30','MAS_MENOS_60')),
    flexibilidad_fecha       VARCHAR(20) NOT NULL DEFAULT 'EXACTA'
                             CHECK (flexibilidad_fecha IN ('EXACTA','MISMA_SEMANA')),
    estado                   VARCHAR(30) NOT NULL
                             CHECK (estado IN (
                                'EN_ESPERA','NOTIFICADA','CONVERTIDA_RESERVA',
                                'CANCELADA','EXPIRADA'
                             )),
    prioridad                INTEGER NOT NULL DEFAULT 0,
    fecha_notificacion       TIMESTAMP,
    fecha_expiracion_notif   TIMESTAMP,
    fecha_creacion           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lista_espera_sucursal ON lista_espera(sucursal_id);
CREATE INDEX idx_lista_espera_cliente  ON lista_espera(cliente_id);
CREATE INDEX idx_lista_espera_estado   ON lista_espera(estado);

-- ============================================================
-- NOTIFICACION
-- ============================================================
CREATE TABLE notificacion (
    id                       BIGSERIAL PRIMARY KEY,
    cliente_id               BIGINT REFERENCES cliente(id)  ON DELETE SET NULL,
    reserva_id               BIGINT REFERENCES reserva(id)  ON DELETE SET NULL,
    sucursal_id              BIGINT REFERENCES sucursal(id) ON DELETE SET NULL,
    tipo                     VARCHAR(30) NOT NULL
                             CHECK (tipo IN (
                                'CONFIRMACION_RESERVA','RECORDATORIO','CANCELACION',
                                'LISTA_ESPERA','PAGO_RECIBIDO','PROMOCIONAL',
                                'RESERVA_RECIBIDA_ADMIN'
                             )),
    canal                    VARCHAR(20) NOT NULL
                             CHECK (canal IN ('EMAIL','SMS','WHATSAPP','PUSH')),
    asunto                   VARCHAR(255),
    mensaje                  TEXT NOT NULL,
    estado                   VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
                             CHECK (estado IN ('PENDIENTE','ENVIADA','FALLIDA','LEIDA')),
    fecha_envio              TIMESTAMP,
    intentos                 INTEGER NOT NULL DEFAULT 0,
    fecha_creacion           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notificacion_cliente  ON notificacion(cliente_id);
CREATE INDEX idx_notificacion_reserva  ON notificacion(reserva_id);
CREATE INDEX idx_notificacion_estado   ON notificacion(estado);

-- ============================================================
-- RESENIA
-- ============================================================
CREATE TABLE resena (
    id                       BIGSERIAL PRIMARY KEY,
    sucursal_id              BIGINT NOT NULL REFERENCES sucursal(id) ON DELETE CASCADE,
    cliente_id               BIGINT NOT NULL REFERENCES cliente(id)  ON DELETE RESTRICT,
    reserva_id               BIGINT REFERENCES reserva(id) ON DELETE SET NULL,
    puntuacion               INTEGER NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
    comentario               TEXT,
    mostrar_nombre           BOOLEAN NOT NULL DEFAULT FALSE,
    aprobada                 BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resena_sucursal ON resena(sucursal_id);
CREATE INDEX idx_resena_cliente  ON resena(cliente_id);