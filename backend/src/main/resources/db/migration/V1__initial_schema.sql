-- ============================================================
-- Turnify - Sistema de Reservas Gastronómicas
-- Migración inicial
-- Versión: 2.1 (alineado a mockups Turnify)
-- ============================================================

-- ===== Extensiones =====
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USUARIO
-- ============================================================
CREATE TABLE usuario (
    id                   BIGSERIAL PRIMARY KEY,
    nombre_completo      VARCHAR(200)  NOT NULL,
    email                VARCHAR(255)  NOT NULL UNIQUE,
    password             VARCHAR(255)  NOT NULL,
    telefono             VARCHAR(50),
    rol                  VARCHAR(30)   NOT NULL CHECK (rol IN (
                            'SUPER_ADMIN',
                            'ADMIN_RESTAURANTE',
                            'EMPLEADO_SUCURSAL',
                            'CLIENTE'
                         )),
    activo               BOOLEAN       NOT NULL DEFAULT TRUE,
    onboarding_completo  BOOLEAN       NOT NULL DEFAULT FALSE,
    fecha_creacion       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_usuario_email ON usuario(email);
CREATE INDEX idx_usuario_rol   ON usuario(rol);

-- ============================================================
-- RESTAURANTE (empresa / marca)
-- Contiene branding completo de la agenda pública (paso 4 del wizard)
-- ============================================================
CREATE TABLE restaurante (
    id                       BIGSERIAL PRIMARY KEY,
    usuario_admin_id         BIGINT REFERENCES usuario(id) ON DELETE SET NULL,

    -- Identidad comercial
    nombre_publico           VARCHAR(150)  NOT NULL,
    razon_social             VARCHAR(200),
    cuit                     VARCHAR(20),
    slogan                   VARCHAR(200),
    descripcion              TEXT,
    tipo_cocina              VARCHAR(100),
    ciudad_principal         VARCHAR(100),

    -- Recursos de branding
    logo_url                 VARCHAR(500),
    foto_local_url           VARCHAR(500),

    -- Estética (paso 4: personalización de agenda)
    color_primario           VARCHAR(9)    NOT NULL DEFAULT '#005759',
    color_acento             VARCHAR(9)    NOT NULL DEFAULT '#07A7A9',
    tipografia_titulos       VARCHAR(50)   NOT NULL DEFAULT 'PLAYFAIR'
                             CHECK (tipografia_titulos IN ('PLAYFAIR','SORA','INTER','DM_SANS')),
    tipografia_cuerpo        VARCHAR(50)   NOT NULL DEFAULT 'INTER'
                             CHECK (tipografia_cuerpo IN ('PLAYFAIR','SORA','INTER','DM_SANS')),
    estilo_bordes            VARCHAR(20)   NOT NULL DEFAULT 'SUAVE'
                             CHECK (estilo_bordes IN ('MINIMAL','SUAVE','REDONDO')),

    -- URL pública (a nivel marca, único global)
    slug_publico             VARCHAR(100)  NOT NULL UNIQUE,

    -- Redes sociales
    instagram_url            VARCHAR(255),
    facebook_url             VARCHAR(255),
    sitio_web                VARCHAR(255),
    email_comercial          VARCHAR(255),

    -- Mercado Pago a nivel empresa (se conecta DESPUÉS del wizard, opcional)
    mp_access_token          VARCHAR(500),
    mp_user_id               VARCHAR(100),
    mp_conectado             BOOLEAN       NOT NULL DEFAULT FALSE,

    -- Métricas denormalizadas a nivel marca
    rating_promedio_global   NUMERIC(3,2)  NOT NULL DEFAULT 0,
    cant_resenias_global     INTEGER       NOT NULL DEFAULT 0,

    -- Estado
    activo                   BOOLEAN       NOT NULL DEFAULT TRUE,
    publicado                BOOLEAN       NOT NULL DEFAULT FALSE,
    fecha_creacion           TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_restaurante_slug          ON restaurante(slug_publico);
CREATE INDEX idx_restaurante_activo        ON restaurante(activo);
CREATE INDEX idx_restaurante_publicado     ON restaurante(publicado);
CREATE INDEX idx_restaurante_usuario_admin ON restaurante(usuario_admin_id);

-- ============================================================
-- SUCURSAL (local físico)
-- Datos mínimos: nombre, dirección, teléfono. La identidad la lleva la marca.
-- ============================================================
CREATE TABLE sucursal (
    id                       BIGSERIAL PRIMARY KEY,
    restaurante_id           BIGINT NOT NULL REFERENCES restaurante(id) ON DELETE CASCADE,
    nombre                   VARCHAR(150)  NOT NULL,
    slug                     VARCHAR(100)  NOT NULL,
    es_principal             BOOLEAN       NOT NULL DEFAULT FALSE,

    -- Datos del local
    direccion                VARCHAR(255)  NOT NULL,
    ciudad                   VARCHAR(100),
    provincia                VARCHAR(100),
    codigo_postal            VARCHAR(20),
    pais                     VARCHAR(50)   NOT NULL DEFAULT 'AR',
    latitud                  NUMERIC(10,7),
    longitud                 NUMERIC(10,7),
    telefono                 VARCHAR(50),
    email                    VARCHAR(255),

    -- Override de MP (si null, hereda de Restaurante)
    mp_access_token          VARCHAR(500),
    mp_user_id               VARCHAR(100),

    -- Capacidad y métricas
    capacidad_maxima         INTEGER       NOT NULL DEFAULT 0,
    rating_promedio          NUMERIC(3,2)  NOT NULL DEFAULT 0,
    cant_resenias            INTEGER       NOT NULL DEFAULT 0,

    zona_horaria             VARCHAR(50)   NOT NULL DEFAULT 'America/Argentina/Buenos_Aires',
    activa                   BOOLEAN       NOT NULL DEFAULT TRUE,
    fecha_creacion           TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_sucursal_slug UNIQUE (restaurante_id, slug)
);

CREATE INDEX idx_sucursal_restaurante  ON sucursal(restaurante_id);
CREATE INDEX idx_sucursal_ciudad       ON sucursal(ciudad);
CREATE INDEX idx_sucursal_activa       ON sucursal(activa);
CREATE INDEX idx_sucursal_geo          ON sucursal(latitud, longitud);

-- Solo una sucursal principal por restaurante
CREATE UNIQUE INDEX uk_sucursal_principal_por_restaurante
    ON sucursal(restaurante_id) WHERE es_principal = TRUE;

-- ============================================================
-- USUARIO_SUCURSAL (accesos de EMPLEADO_SUCURSAL)
-- ============================================================
CREATE TABLE usuario_sucursal (
    id                  BIGSERIAL PRIMARY KEY,
    usuario_id          BIGINT NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
    sucursal_id         BIGINT NOT NULL REFERENCES sucursal(id) ON DELETE CASCADE,
    fecha_asignacion    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activo              BOOLEAN   NOT NULL DEFAULT TRUE,
    CONSTRAINT uk_usuario_sucursal UNIQUE (usuario_id, sucursal_id)
);

CREATE INDEX idx_usuario_sucursal_usuario  ON usuario_sucursal(usuario_id);
CREATE INDEX idx_usuario_sucursal_sucursal ON usuario_sucursal(sucursal_id);

-- ============================================================
-- CONFIGURACION_SUCURSAL (reglas operativas por local)
-- Se crea con DEFAULTS INTELIGENTES al crear cada sucursal
-- Se ajusta DESPUÉS del wizard desde el panel
-- ============================================================
CREATE TABLE configuracion_sucursal (
    id                          BIGSERIAL PRIMARY KEY,
    sucursal_id                 BIGINT NOT NULL UNIQUE REFERENCES sucursal(id) ON DELETE CASCADE,
    cobrar_senia                BOOLEAN NOT NULL DEFAULT FALSE,
    monto_senia                 NUMERIC(12,2) NOT NULL DEFAULT 0,
    tolerancia_minutos          INTEGER NOT NULL DEFAULT 15,
    habilitar_lista_espera      BOOLEAN NOT NULL DEFAULT TRUE,
    confirmacion_automatica     BOOLEAN NOT NULL DEFAULT TRUE,
    minutos_recordatorio        INTEGER NOT NULL DEFAULT 180,
    max_personas_por_reserva    INTEGER NOT NULL DEFAULT 12,
    min_personas_por_reserva    INTEGER NOT NULL DEFAULT 1,
    dias_anticipacion_maxima    INTEGER NOT NULL DEFAULT 60,
    duracion_almuerzo_minutos   INTEGER NOT NULL DEFAULT 90,
    duracion_cena_minutos       INTEGER NOT NULL DEFAULT 120,
    minutos_lock_pago           INTEGER NOT NULL DEFAULT 10,
    horas_cancelacion_libre     INTEGER NOT NULL DEFAULT 24,
    umbral_no_shows_bloqueo     INTEGER NOT NULL DEFAULT 3,
    fecha_creacion              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_personas CHECK (min_personas_por_reserva <= max_personas_por_reserva)
);

-- ============================================================
-- HORARIO (días/horarios de atención POR SUCURSAL)
-- IMPORTANTE: soporta MÚLTIPLES TURNOS por día (paso 2 del wizard).
-- Ejemplo: lunes 09:00-18:00 + 20:00-23:00 = 2 filas con orden_turno 1 y 2.
-- ============================================================
CREATE TABLE horario (
    id                       BIGSERIAL PRIMARY KEY,
    sucursal_id              BIGINT NOT NULL REFERENCES sucursal(id) ON DELETE CASCADE,
    dia_semana               VARCHAR(20) NOT NULL CHECK (dia_semana IN (
                                'MONDAY','TUESDAY','WEDNESDAY','THURSDAY',
                                'FRIDAY','SATURDAY','SUNDAY'
                             )),
    orden_turno              INTEGER NOT NULL DEFAULT 1,
    etiqueta                 VARCHAR(50),
    hora_apertura            TIME NOT NULL,
    hora_cierre              TIME NOT NULL,
    activo                   BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_horario_turno UNIQUE (sucursal_id, dia_semana, orden_turno),
    CONSTRAINT chk_horario_franja CHECK (hora_apertura < hora_cierre)
);

CREATE INDEX idx_horario_sucursal_dia ON horario(sucursal_id, dia_semana);

-- ============================================================
-- BLOQUEO_SUCURSAL (feriados, eventos privados, etc.)
-- ============================================================
CREATE TABLE bloqueo_sucursal (
    id                       BIGSERIAL PRIMARY KEY,
    sucursal_id              BIGINT NOT NULL REFERENCES sucursal(id) ON DELETE CASCADE,
    fecha_inicio             DATE NOT NULL,
    fecha_fin                DATE NOT NULL,
    hora_inicio              TIME,
    hora_fin                 TIME,
    motivo                   VARCHAR(255),
    tipo                     VARCHAR(30) NOT NULL CHECK (tipo IN (
                                'FERIADO','EVENTO_PRIVADO','MANTENIMIENTO',
                                'VACACIONES','OTRO'
                             )),
    fecha_creacion           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_bloqueo_fechas CHECK (fecha_inicio <= fecha_fin)
);

CREATE INDEX idx_bloqueo_sucursal ON bloqueo_sucursal(sucursal_id);
CREATE INDEX idx_bloqueo_fechas   ON bloqueo_sucursal(fecha_inicio, fecha_fin);

-- ============================================================
-- MESA
-- En el wizard se cargan con nombre autogenerado "Mesa N" y capacidad default 4.
-- ============================================================
CREATE TABLE mesa (
    id                       BIGSERIAL PRIMARY KEY,
    sucursal_id              BIGINT NOT NULL REFERENCES sucursal(id) ON DELETE CASCADE,
    nombre                   VARCHAR(50) NOT NULL,
    ubicacion                VARCHAR(100),
    capacidad                INTEGER NOT NULL DEFAULT 4 CHECK (capacidad > 0),
    estado                   VARCHAR(30) NOT NULL DEFAULT 'DISPONIBLE'
                             CHECK (estado IN ('DISPONIBLE','OCUPADA','RESERVADA','FUERA_DE_SERVICIO')),
    activa                   BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mesa_sucursal ON mesa(sucursal_id);
CREATE INDEX idx_mesa_estado   ON mesa(estado);

-- ============================================================
-- FOTO_SUCURSAL (galería del local; la foto de portada está en restaurante.foto_local_url)
-- ============================================================
CREATE TABLE foto_sucursal (
    id                       BIGSERIAL PRIMARY KEY,
    sucursal_id              BIGINT NOT NULL REFERENCES sucursal(id) ON DELETE CASCADE,
    url                      VARCHAR(500) NOT NULL,
    descripcion              VARCHAR(255),
    orden                    INTEGER NOT NULL DEFAULT 0,
    fecha_creacion           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_foto_sucursal ON foto_sucursal(sucursal_id);

-- ============================================================
-- CLIENTE (consumidor final)
-- ============================================================
CREATE TABLE cliente (
    id                       BIGSERIAL PRIMARY KEY,
    nombre                   VARCHAR(100) NOT NULL,
    apellido                 VARCHAR(100) NOT NULL,
    telefono                 VARCHAR(50)  NOT NULL,
    email                    VARCHAR(255) NOT NULL UNIQUE,
    dni                      VARCHAR(20),
    canal_notif_preferido    VARCHAR(20) CHECK (canal_notif_preferido IN ('EMAIL','SMS','WHATSAPP','PUSH')),
    cant_no_shows            INTEGER NOT NULL DEFAULT 0,
    cant_reservas            INTEGER NOT NULL DEFAULT 0,
    bloqueado                BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_desbloqueo         TIMESTAMP,
    fecha_creacion           TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_cliente_email     ON cliente(email);
CREATE INDEX idx_cliente_telefono  ON cliente(telefono);

-- ============================================================
-- RESERVA
-- Estado nuevo: PENDIENTE_CONFIRMACION para reservas sin seña que requieren OK del admin
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
                                'PENDIENTE_PAGO',
                                'PENDIENTE_CONFIRMACION',
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
-- PAGO (solo existe si la sucursal cobra seña Y tiene MP conectado)
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
CREATE INDEX idx_lista_espera_fecha    ON lista_espera(fecha_deseada);

-- ============================================================
-- NOTIFICACION
-- ============================================================
CREATE TABLE notificacion (
    id                       BIGSERIAL PRIMARY KEY,
    cliente_id               BIGINT REFERENCES cliente(id) ON DELETE SET NULL,
    reserva_id               BIGINT REFERENCES reserva(id) ON DELETE SET NULL,
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
CREATE INDEX idx_notificacion_sucursal ON notificacion(sucursal_id);
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
CREATE INDEX idx_resena_aprobada ON resena(aprobada);
