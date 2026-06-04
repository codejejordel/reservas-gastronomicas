DO $$
BEGIN
ALTER TABLE configuracion_sucursal
    ADD COLUMN IF NOT EXISTS mp_access_token character varying;
END;
$$;

DO $$
BEGIN
ALTER TABLE configuracion_sucursal
    ADD COLUMN IF NOT EXISTS mp_public_key character varying;
END;
$$;

DO $$
BEGIN
ALTER TABLE configuracion_sucursal
    ADD COLUMN IF NOT EXISTS mp_conectado boolean DEFAULT false;
END;
$$;