-- ============================================================
-- Sistema de Reservas Gastronómicas
-- Basado en el diagrama UML
-- ============================================================

-- ===== Extensiones =====
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USUARIO (admins/empleados del restaurante + super admin)
-- ============================================================
CREATE TABLE usuario (
    id              BIGSERIAL PRIMARY KEY,
    nombre          VARCHAR(100)  NOT NULL,
    apellido        VARCHAR(100)  NOT NULL,
    email           VARCHAR(255)  NOT NULL UNIQUE,
    password        VARCHAR(255)  NOT NULL,
    telefono        VARCHAR(50),
    rol             VARCHAR(30)   NOT NULL CHECK (rol IN ('SUPER_ADMIN', 'ADMIN_RESTAURANTE', 'EMPLEADO_RESTAURANTE', 'CLIENTE')),
    activo          BOOLEAN       NOT NULL DEFAULT TRUE,
    fecha_creacion       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_usuario_rol   ON usuario(rol);

-- ============================================================
-- RESTAURANTE
-- ============================================================
CREATE TABLE restaurante (
    id              BIGSERIAL PRIMARY KEY,
    usuario_admin_id    BIGINT REFERENCES usuario(id) ON DELETE SET NULL,
    nombre          VARCHAR(150)  NOT NULL,
    descripcion     TEXT,
    direccion       VARCHAR(255)  NOT NULL,
    ciudad          VARCHAR(100)  NOT NULL,
    provincia       VARCHAR(100)  NOT NULL,
    telefono        VARCHAR(50),
    email           VARCHAR(255),
    logo_url        VARCHAR(500),
    monto_senia     NUMERIC(12,2) NOT NULL DEFAULT 0,
    capacidad_maxima INTEGER      NOT NULL DEFAULT 0,
    rating_promedio NUMERIC(3,2)  NOT NULL DEFAULT 0,
    activo          BOOLEAN       NOT NULL DEFAULT TRUE,
    fecha_creacion       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_restaurante_ciudad ON restaurante(ciudad);
CREATE INDEX idx_restaurante_activo ON restaurante(activo);
CREATE INDEX idx_restaurante_usuario_admin ON restaurante(usuario_admin_id);

-- ============================================================
-- CONFIGURACION RESTAURANTE
-- ============================================================
CREATE TABLE configuracion_restaurante (
    id              BIGSERIAL PRIMARY KEY,
    restaurante_id  BIGINT NOT NULL UNIQUE REFERENCES restaurante(id) ON DELETE CASCADE,
    tolerancia_minutos          INTEGER NOT NULL DEFAULT 15,
    habilitar_lista_espera      BOOLEAN NOT NULL DEFAULT TRUE,
    confirmacion_automatica     BOOLEAN NOT NULL DEFAULT TRUE,
    minutos_recordatorio        INTEGER NOT NULL DEFAULT 180,
    max_personas_por_reserva    INTEGER NOT NULL DEFAULT 12,
    min_personas_por_reserva    INTEGER NOT NULL DEFAULT 1,
    dias_anticipacion_maxima    INTEGER NOT NULL DEFAULT 60,
    duracion_almuerzo_minutos   INTEGER NOT NULL DEFAULT 90,
    duracion_cena_minutos       INTEGER NOT NULL DEFAULT 120,
    fecha_creacion       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_personas CHECK (min_personas_por_reserva <= max_personas_por_reserva)
);

-- ============================================================
-- HORARIO (días/horarios de atención por restaurante)
-- ============================================================
CREATE TABLE horario (
    id              BIGSERIAL PRIMARY KEY,
    restaurante_id  BIGINT NOT NULL REFERENCES restaurante(id) ON DELETE CASCADE,
    dia_semana      VARCHAR(20) NOT NULL CHECK (dia_semana IN ('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY')),
    hora_apertura   TIME NOT NULL,
    hora_cierre     TIME NOT NULL,
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_horario_restaurante ON horario(restaurante_id);

-- ============================================================
-- BLOQUEO RESTAURANTE (feriados, eventos privados, etc.)
-- ============================================================
CREATE TABLE bloqueo_restaurante (
    id              BIGSERIAL PRIMARY KEY,
    restaurante_id  BIGINT NOT NULL REFERENCES restaurante(id) ON DELETE CASCADE,
    fecha_inicio    DATE NOT NULL,
    fecha_fin       DATE NOT NULL,
    hora_inicio     TIME,
    hora_fin        TIME,
    motivo          VARCHAR(255),
    tipo            VARCHAR(30) NOT NULL CHECK (tipo IN ('FERIADO','EVENTO_PRIVADO','MANTENIMIENTO','VACACIONES','OTRO')),
    fecha_creacion       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_bloqueo_fechas CHECK (fecha_inicio <= fecha_fin)
);

CREATE INDEX idx_bloqueo_restaurante ON bloqueo_restaurante(restaurante_id);
CREATE INDEX idx_bloqueo_fechas ON bloqueo_restaurante(fecha_inicio, fecha_fin);

-- ============================================================
-- MESA
-- ============================================================
CREATE TABLE mesa (
    id              BIGSERIAL PRIMARY KEY,
    restaurante_id  BIGINT NOT NULL REFERENCES restaurante(id) ON DELETE CASCADE,
    nombre          VARCHAR(50) NOT NULL,
    ubicacion       VARCHAR(100),
    capacidad       INTEGER NOT NULL CHECK (capacidad > 0),
    estado          VARCHAR(30) NOT NULL DEFAULT 'DISPONIBLE'
                    CHECK (estado IN ('DISPONIBLE','OCUPADA','RESERVADA','FUERA_DE_SERVICIO')),
    activa          BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mesa_restaurante ON mesa(restaurante_id);
CREATE INDEX idx_mesa_estado ON mesa(estado);

-- ============================================================
-- CLIENTE (consumidor final, sin login obligatorio)
-- ============================================================
CREATE TABLE cliente (
    id              BIGSERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    apellido        VARCHAR(100) NOT NULL,
    telefono        VARCHAR(50)  NOT NULL,
    email           VARCHAR(255) NOT NULL UNIQUE,
    dni             VARCHAR(20),
    cant_no_shows   INTEGER NOT NULL DEFAULT 0,
    cant_reservas   INTEGER NOT NULL DEFAULT 0,
    bloqueado       BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cliente_email ON cliente(email);
CREATE INDEX idx_cliente_telefono ON cliente(telefono);

-- ============================================================
-- RESERVA
-- ============================================================
CREATE TABLE reserva (
    id              BIGSERIAL PRIMARY KEY,
    codigo_reserva  VARCHAR(20) NOT NULL UNIQUE,
    restaurante_id  BIGINT NOT NULL REFERENCES restaurante(id) ON DELETE RESTRICT,
    cliente_id      BIGINT NOT NULL REFERENCES cliente(id)     ON DELETE RESTRICT,
    fecha_reserva   DATE NOT NULL,
    hora_reserva    TIME NOT NULL,
    cant_personas   INTEGER NOT NULL CHECK (cant_personas > 0),
    estado          VARCHAR(30) NOT NULL
                    CHECK (estado IN ('PENDIENTE_PAGO','CONFIRMADA','CANCELADA','COMPLETADA','NO_SHOW','EXPIRADA')),
    observaciones   VARCHAR(500),
    fecha_confirmacion   TIMESTAMP,
    fecha_cancelacion    TIMESTAMP,
    motivo_cancelacion   VARCHAR(255),
    version         BIGINT NOT NULL DEFAULT 0,
    fecha_creacion       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reserva_restaurante_fecha ON reserva(restaurante_id, fecha_reserva);
CREATE INDEX idx_reserva_cliente ON reserva(cliente_id);
CREATE INDEX idx_reserva_estado ON reserva(estado);
CREATE INDEX idx_reserva_codigo ON reserva(codigo_reserva);

-- ============================================================
-- ASIGNACION MESA (relación reserva <-> mesa)
-- ============================================================
CREATE TABLE asignacion_mesa (
    id              BIGSERIAL PRIMARY KEY,
    reserva_id      BIGINT NOT NULL REFERENCES reserva(id) ON DELETE CASCADE,
    mesa_id         BIGINT NOT NULL REFERENCES mesa(id)    ON DELETE RESTRICT,
    fecha_asignacion     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_creacion       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_asignacion_reserva ON asignacion_mesa(reserva_id);
CREATE INDEX idx_asignacion_mesa ON asignacion_mesa(mesa_id);

-- ============================================================
-- PAGO
-- ============================================================
CREATE TABLE pago (
    id              BIGSERIAL PRIMARY KEY,
    reserva_id      BIGINT NOT NULL UNIQUE REFERENCES reserva(id) ON DELETE CASCADE,
    monto           NUMERIC(12,2) NOT NULL,
    estado          VARCHAR(30) NOT NULL
                    CHECK (estado IN ('PENDIENTE','APROBADO','RECHAZADO','REEMBOLSADO','EXPIRADO')),
    mercado_pago_payment_id    VARCHAR(100),
    mercado_pago_preference_id VARCHAR(100),
    link_pago       VARCHAR(500),
    fecha_pago      TIMESTAMP,
    fecha_expiracion TIMESTAMP,
    metodo_pago     VARCHAR(50),
    fecha_creacion       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pago_reserva ON pago(reserva_id);
CREATE INDEX idx_pago_mp_payment_id ON pago(mercado_pago_payment_id);
CREATE INDEX idx_pago_estado ON pago(estado);

-- ============================================================
-- LISTA ESPERA
-- ============================================================
CREATE TABLE lista_espera (
    id              BIGSERIAL PRIMARY KEY,
    restaurante_id  BIGINT NOT NULL REFERENCES restaurante(id) ON DELETE CASCADE,
    cliente_id      BIGINT NOT NULL REFERENCES cliente(id)     ON DELETE RESTRICT,
    reserva_id      BIGINT REFERENCES reserva(id) ON DELETE SET NULL,
    fecha_deseada   DATE NOT NULL,
    hora_deseada    TIME NOT NULL,
    cant_personas   INTEGER NOT NULL CHECK (cant_personas > 0),
    estado          VARCHAR(30) NOT NULL
                    CHECK (estado IN ('EN_ESPERA','NOTIFICADA','CONVERTIDA_RESERVA','CANCELADA','EXPIRADA')),
    prioridad       INTEGER NOT NULL DEFAULT 0,
    fecha_notificacion   TIMESTAMP,
    fecha_creacion       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lista_espera_restaurante ON lista_espera(restaurante_id);
CREATE INDEX idx_lista_espera_cliente ON lista_espera(cliente_id);
CREATE INDEX idx_lista_espera_estado ON lista_espera(estado);
CREATE INDEX idx_lista_espera_fecha ON lista_espera(fecha_deseada);

-- ============================================================
-- NOTIFICACION
-- ============================================================
CREATE TABLE notificacion (
    id              BIGSERIAL PRIMARY KEY,
    cliente_id      BIGINT REFERENCES cliente(id) ON DELETE SET NULL,
    reserva_id      BIGINT REFERENCES reserva(id) ON DELETE SET NULL,
    tipo            VARCHAR(30) NOT NULL
                    CHECK (tipo IN ('CONFIRMACION_RESERVA','RECORDATORIO','CANCELACION','LISTA_ESPERA','PAGO_RECIBIDO','PROMOCIONAL')),
    canal           VARCHAR(20) NOT NULL CHECK (canal IN ('EMAIL','SMS','WHATSAPP','PUSH')),
    asunto          VARCHAR(255),
    mensaje         TEXT NOT NULL,
    estado          VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
                    CHECK (estado IN ('PENDIENTE','ENVIADA','FALLIDA','LEIDA')),
    fecha_envio     TIMESTAMP,
    intentos        INTEGER NOT NULL DEFAULT 0,
    fecha_creacion       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notificacion_cliente ON notificacion(cliente_id);
CREATE INDEX idx_notificacion_reserva ON notificacion(reserva_id);
CREATE INDEX idx_notificacion_estado ON notificacion(estado);
CREATE INDEX idx_notificacion_tipo ON notificacion(tipo);

-- ============================================================
-- RESEÑA
-- ============================================================
CREATE TABLE resena (
    id              BIGSERIAL PRIMARY KEY,
    restaurante_id  BIGINT NOT NULL REFERENCES restaurante(id) ON DELETE CASCADE,
    cliente_id      BIGINT NOT NULL REFERENCES cliente(id)     ON DELETE RESTRICT,
    reserva_id      BIGINT REFERENCES reserva(id) ON DELETE SET NULL,
    puntuacion      INTEGER NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
    comentario      TEXT,
    aprobada        BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_creacion       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resena_restaurante ON resena(restaurante_id);
CREATE INDEX idx_resena_cliente ON resena(cliente_id);
CREATE INDEX idx_resena_aprobada ON resena(aprobada);
