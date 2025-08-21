-- PHASE 1: Database Foundation for Loyalty QR Epic (Fixed)

-- 1) Create immutable function for date extraction
CREATE OR REPLACE FUNCTION public.extract_date_immutable(timestamptz)
RETURNS date
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT $1::date;
$$;

-- 2) Unique index to prevent duplicate daily visits (using immutable function)
CREATE UNIQUE INDEX IF NOT EXISTS visitas_unique_user_local_day
  ON public.visitas (user_id, local_id, extract_date_immutable(created_at));

-- 3) User preferences table for coffee taste personalization
CREATE TABLE IF NOT EXISTS public.preferencias_usuario (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  gusto_cafe text,                 -- 'negro','espresso','americano','latte','capuccino','cold_brew', etc.
  intensidad smallint CHECK (intensidad BETWEEN 1 AND 5),
  dulzor smallint CHECK (dulzor BETWEEN 1 AND 5),
  tipo_leche text,                 -- 'entera','descremada','sin_lactosa','avena','almendra','ninguna'
  extras text[] DEFAULT NULL,      -- {'canela','chocolate','vainilla','caramelo'}
  horario_pref text[] DEFAULT NULL,-- {'maniana','tarde','noche'}
  comentario text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS for preferencias_usuario
ALTER TABLE public.preferencias_usuario ENABLE ROW LEVEL SECURITY;

-- RLS Policies for preferencias_usuario
CREATE POLICY "Users can view their own preferences" 
ON public.preferencias_usuario 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own preferences" 
ON public.preferencias_usuario 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own preferences" 
ON public.preferencias_usuario 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Admins can view all preferences" 
ON public.preferencias_usuario 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4) Service rating table for post-consumption surveys
CREATE TABLE IF NOT EXISTS public.calificaciones_visita (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visita_id uuid NOT NULL REFERENCES public.visitas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  local_id uuid NOT NULL REFERENCES public.locales(id),
  rating_atencion smallint CHECK (rating_atencion BETWEEN 1 AND 5),
  rating_local smallint CHECK (rating_local BETWEEN 1 AND 5),
  rating_cafe smallint CHECK (rating_cafe BETWEEN 1 AND 5),
  comentario text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT calificaciones_visita_uniq UNIQUE (visita_id, user_id)
);

-- Enable RLS for calificaciones_visita
ALTER TABLE public.calificaciones_visita ENABLE ROW LEVEL SECURITY;

-- RLS Policies for calificaciones_visita
CREATE POLICY "Users can view their own ratings" 
ON public.calificaciones_visita 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own ratings" 
ON public.calificaciones_visita 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all ratings" 
ON public.calificaciones_visita 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can view ratings for their location" 
ON public.calificaciones_visita 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM staff 
  WHERE staff.user_id = auth.uid() 
  AND staff.local_id = calificaciones_visita.local_id
));

-- 5) Helper function to refresh user level based on points
CREATE OR REPLACE FUNCTION public.refrescar_nivel(p_user_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.puntos_usuario pu
  SET nivel_actual = n.id
  FROM public.niveles n
  WHERE pu.user_id = p_user_id
    AND pu.puntos_totales >= n.puntos_minimos
    AND (n.puntos_maximos IS NULL OR pu.puntos_totales <= n.puntos_maximos);
END; $$;

-- 6) RPC for wall QR onboarding flow
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

-- 7) RPC for dynamic QR redemption with service rating
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