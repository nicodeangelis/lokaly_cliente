-- Fix security warnings for functions search path

-- Update existing functions to include secure search path
CREATE OR REPLACE FUNCTION public.refrescar_nivel(p_user_id uuid)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.puntos_usuario pu
  SET nivel_actual = n.id
  FROM public.niveles n
  WHERE pu.user_id = p_user_id
    AND pu.puntos_totales >= n.puntos_minimos
    AND (n.puntos_maximos IS NULL OR pu.puntos_totales <= n.puntos_maximos);
END; $$;

CREATE OR REPLACE FUNCTION public.visit_from_wall_qr(
  p_user_id uuid,
  p_local_id uuid,
  p_puntos_visita integer DEFAULT 0,
  p_puntos_bienvenida integer DEFAULT 0,
  -- Gustos (todos opcionales)
  p_gusto_cafe text DEFAULT NULL,
  p_intensidad smallint DEFAULT NULL,
  p_dulzor smallint DEFAULT NULL,
  p_tipo_leche text DEFAULT NULL,
  p_extras text[] DEFAULT NULL,
  p_horario_pref text[] DEFAULT NULL,
  p_comentario_gustos text DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_visita_id uuid;
  v_total integer := COALESCE(p_puntos_visita,0) + COALESCE(p_puntos_bienvenida,0);
BEGIN
  -- 1) Upsert visita del día
  INSERT INTO public.visitas (user_id, local_id, puntos_obtenidos)
  VALUES (p_user_id, p_local_id, v_total)
  ON CONFLICT (user_id, local_id, extract_date_immutable(created_at))
  DO UPDATE SET puntos_obtenidos = public.visitas.puntos_obtenidos + EXCLUDED.puntos_obtenidos
  RETURNING id INTO v_visita_id;

  -- 2) Actualizar puntos totales y nivel
  IF v_total > 0 THEN
    INSERT INTO public.puntos_usuario (user_id, puntos_totales)
    VALUES (p_user_id, v_total)
    ON CONFLICT (user_id)
    DO UPDATE SET puntos_totales = public.puntos_usuario.puntos_totales + EXCLUDED.puntos_totales;
    PERFORM public.refrescar_nivel(p_user_id);
  END IF;

  -- 3) Guardar gustos si llegó algo
  IF p_gusto_cafe IS NOT NULL OR p_intensidad IS NOT NULL OR p_dulzor IS NOT NULL
     OR p_tipo_leche IS NOT NULL OR p_extras IS NOT NULL OR p_horario_pref IS NOT NULL
     OR p_comentario_gustos IS NOT NULL THEN
    INSERT INTO public.preferencias_usuario (
      user_id, gusto_cafe, intensidad, dulzor, tipo_leche, extras, horario_pref, comentario
    ) VALUES (
      p_user_id, p_gusto_cafe, p_intensidad, p_dulzor, p_tipo_leche, p_extras, p_horario_pref, p_comentario_gustos
    )
    ON CONFLICT (user_id) DO UPDATE SET
      gusto_cafe   = COALESCE(EXCLUDED.gusto_cafe,   public.preferencias_usuario.gusto_cafe),
      intensidad   = COALESCE(EXCLUDED.intensidad,   public.preferencias_usuario.intensidad),
      dulzor       = COALESCE(EXCLUDED.dulzor,       public.preferencias_usuario.dulzor),
      tipo_leche   = COALESCE(EXCLUDED.tipo_leche,   public.preferencias_usuario.tipo_leche),
      extras       = COALESCE(EXCLUDED.extras,       public.preferencias_usuario.extras),
      horario_pref = COALESCE(EXCLUDED.horario_pref, public.preferencias_usuario.horario_pref),
      comentario   = COALESCE(EXCLUDED.comentario,   public.preferencias_usuario.comentario),
      updated_at   = now();
  END IF;

  RETURN v_visita_id;
END; $$;

CREATE OR REPLACE FUNCTION public.redeem_qr_token(
  p_user_id uuid,
  p_token text,
  -- Encuesta servicio (opcionales)
  p_rating_atencion smallint DEFAULT NULL,
  p_rating_local smallint DEFAULT NULL,
  p_rating_cafe smallint DEFAULT NULL,
  p_comentario text DEFAULT NULL
)
RETURNS uuid  -- visita_id
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_qr qr_tokens%ROWTYPE;
  v_visita_id uuid;
  v_puntos integer;
BEGIN
  -- 1) Validar token
  SELECT * INTO v_qr FROM public.qr_tokens WHERE token = p_token FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'QR inválido'; END IF;
  IF v_qr.usado THEN RAISE EXCEPTION 'QR ya usado'; END IF;
  IF v_qr.expire_at <= now() THEN RAISE EXCEPTION 'QR expirado'; END IF;

  v_puntos := v_qr.puntos_a_otorgar;

  -- 2) Upsert visita del día (suma puntos)
  INSERT INTO public.visitas (user_id, local_id, puntos_obtenidos, qr_token)
  VALUES (p_user_id, v_qr.local_id, v_puntos, v_qr.token)
  ON CONFLICT (user_id, local_id, extract_date_immutable(created_at))
  DO UPDATE SET puntos_obtenidos = public.visitas.puntos_obtenidos + EXCLUDED.puntos_obtenidos
  RETURNING id INTO v_visita_id;

  -- 3) Consumir token
  UPDATE public.qr_tokens SET usado = true WHERE id = v_qr.id;

  -- 4) Actualizar puntos y nivel
  INSERT INTO public.puntos_usuario (user_id, puntos_totales)
  VALUES (p_user_id, v_puntos)
  ON CONFLICT (user_id)
  DO UPDATE SET puntos_totales = public.puntos_usuario.puntos_totales + EXCLUDED.puntos_totales;
  PERFORM public.refrescar_nivel(p_user_id);

  -- 5) Guardar encuesta servicio si llegó algo
  IF p_rating_atencion IS NOT NULL
     OR p_rating_local IS NOT NULL
     OR p_rating_cafe IS NOT NULL
     OR p_comentario IS NOT NULL THEN
    INSERT INTO public.calificaciones_visita (
      visita_id, user_id, local_id,
      rating_atencion, rating_local, rating_cafe, comentario
    ) VALUES (
      v_visita_id, p_user_id, v_qr.local_id,
      p_rating_atencion, p_rating_local, p_rating_cafe, p_comentario
    ) ON CONFLICT (visita_id, user_id) DO NOTHING;
  END IF;

  RETURN v_visita_id;
END; $$;