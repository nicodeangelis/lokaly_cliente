-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  email TEXT NOT NULL,
  nombre TEXT NOT NULL,
  telefono TEXT,
  fecha_registro TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create levels table
CREATE TABLE public.niveles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  puntos_minimos INTEGER NOT NULL,
  puntos_maximos INTEGER,
  color TEXT NOT NULL DEFAULT '#666666',
  icono TEXT NOT NULL DEFAULT '🥉',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.niveles ENABLE ROW LEVEL SECURITY;

-- Insert default levels
INSERT INTO public.niveles (nombre, descripcion, puntos_minimos, puntos_maximos, color, icono) VALUES
('Bronce', 'Nivel inicial para nuevos usuarios', 0, 100, '#CD7F32', '🥉'),
('Plata', 'Nivel intermedio con mejores beneficios', 101, 500, '#C0C0C0', '🥈'),
('Oro', 'Nivel premium con beneficios exclusivos', 501, NULL, '#FFD700', '🥇');

-- Create locations table
CREATE TABLE public.locales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  direccion TEXT NOT NULL,
  latitud DECIMAL(10, 8),
  longitud DECIMAL(11, 8),
  telefono TEXT,
  email TEXT,
  horarios JSONB,
  descripcion TEXT,
  imagen TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.locales ENABLE ROW LEVEL SECURITY;

-- Insert demo locations
INSERT INTO public.locales (nombre, direccion, latitud, longitud, telefono, descripcion, horarios, imagen) VALUES
('Tienda de Cafe - Local Arregui 6302', 'Arregui 6302, Buenos Aires', -34.6037, -58.3816, '+54 11 1234-5678', 'Café artesanal con granos seleccionados y ambiente acogedor', '{"lunes": "07:00-19:00", "martes": "07:00-19:00", "miercoles": "07:00-19:00", "jueves": "07:00-19:00", "viernes": "07:00-19:00", "sabado": "08:00-20:00", "domingo": "09:00-18:00"}', 'https://images.unsplash.com/photo-1554118811-1e0d58224f24'),
('Tienda de Cafe - Local Mendoza 2299', 'Mendoza 2299, Buenos Aires', -34.5875, -58.3974, '+54 11 1234-5679', 'Especialistas en café de origen con opciones veganas', '{"lunes": "07:00-19:00", "martes": "07:00-19:00", "miercoles": "07:00-19:00", "jueves": "07:00-19:00", "viernes": "07:00-19:00", "sabado": "08:00-20:00", "domingo": "09:00-18:00"}', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb');

-- Create benefits table
CREATE TABLE public.beneficios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,
  tipo TEXT NOT NULL, -- 'descuento', 'regalo', 'puntos_extra'
  valor TEXT NOT NULL, -- '10%', 'Cafe gratis', '+50 puntos'
  nivel_requerido UUID REFERENCES public.niveles(id),
  local_id UUID REFERENCES public.locales(id),
  puntos_requeridos INTEGER DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.beneficios ENABLE ROW LEVEL SECURITY;

-- Insert demo benefits
INSERT INTO public.beneficios (titulo, descripcion, tipo, valor, nivel_requerido, puntos_requeridos) VALUES
('Descuento Plata', '10% de descuento en toda la tienda', 'descuento', '10%', (SELECT id FROM public.niveles WHERE nombre = 'Plata'), 0),
('Café gratis Plata', 'Un café gratis cada 5 visitas', 'regalo', 'Café Americano', (SELECT id FROM public.niveles WHERE nombre = 'Plata'), 100),
('Descuento Oro', '20% de descuento en toda la tienda', 'descuento', '20%', (SELECT id FROM public.niveles WHERE nombre = 'Oro'), 0),
('Café Premium gratis', 'Un café premium gratis por semana', 'regalo', 'Café Premium', (SELECT id FROM public.niveles WHERE nombre = 'Oro'), 50);

-- Create staff table
CREATE TABLE public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  local_id UUID REFERENCES public.locales(id) ON DELETE CASCADE NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Create user points table
CREATE TABLE public.puntos_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  puntos_totales INTEGER NOT NULL DEFAULT 0,
  nivel_actual UUID REFERENCES public.niveles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.puntos_usuario ENABLE ROW LEVEL SECURITY;

-- Create visits table
CREATE TABLE public.visitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  local_id UUID REFERENCES public.locales(id) ON DELETE CASCADE NOT NULL,
  puntos_obtenidos INTEGER NOT NULL DEFAULT 0,
  beneficio_aplicado UUID REFERENCES public.beneficios(id),
  qr_token TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.visitas ENABLE ROW LEVEL SECURITY;

-- Create QR tokens table for staff
CREATE TABLE public.qr_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  staff_id UUID REFERENCES public.staff(id) ON DELETE CASCADE NOT NULL,
  local_id UUID REFERENCES public.locales(id) ON DELETE CASCADE NOT NULL,
  nro_pos TEXT NOT NULL,
  puntos_a_otorgar INTEGER NOT NULL DEFAULT 25,
  usado BOOLEAN NOT NULL DEFAULT false,
  expire_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.qr_tokens ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for all tables
-- Niveles (public read)
CREATE POLICY "Anyone can view levels" ON public.niveles FOR SELECT USING (true);
CREATE POLICY "Only admins can modify levels" ON public.niveles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Locales (public read)
CREATE POLICY "Anyone can view active locations" ON public.locales FOR SELECT USING (activo = true);
CREATE POLICY "Only admins can modify locations" ON public.locales FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Beneficios (public read)
CREATE POLICY "Anyone can view active benefits" ON public.beneficios FOR SELECT USING (activo = true);
CREATE POLICY "Only admins can modify benefits" ON public.beneficios FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Staff (restricted access)
CREATE POLICY "Staff can view their own record" ON public.staff FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage staff" ON public.staff FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- User points (user can view own, admins can view all)
CREATE POLICY "Users can view their own points" ON public.puntos_usuario FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own points" ON public.puntos_usuario FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can view all points" ON public.puntos_usuario FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Visitas (users can view own, staff/admins can view their location's)
CREATE POLICY "Users can view their own visits" ON public.visitas FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Staff can view visits for their location" ON public.visitas FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.staff WHERE staff.user_id = auth.uid() AND staff.local_id = visitas.local_id)
);
CREATE POLICY "Admins can view all visits" ON public.visitas FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- QR Tokens (staff can manage for their location)
CREATE POLICY "Staff can manage QR tokens for their location" ON public.qr_tokens FOR ALL USING (
  EXISTS (SELECT 1 FROM public.staff WHERE staff.user_id = auth.uid() AND staff.local_id = qr_tokens.local_id)
);
CREATE POLICY "Admins can manage all QR tokens" ON public.qr_tokens FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- User roles policies
CREATE POLICY "Admins can view all user roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage user roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger to automatically create user profile and points when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Insert into profiles
  INSERT INTO public.profiles (id, email, nombre)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'nombre', NEW.email));
  
  -- Insert into user_roles with default 'user' role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Initialize user points with Bronce level
  INSERT INTO public.puntos_usuario (user_id, puntos_totales, nivel_actual)
  VALUES (NEW.id, 0, (SELECT id FROM public.niveles WHERE nombre = 'Bronce'));
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_niveles_updated_at
  BEFORE UPDATE ON public.niveles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_locales_updated_at
  BEFORE UPDATE ON public.locales
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_beneficios_updated_at
  BEFORE UPDATE ON public.beneficios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_staff_updated_at
  BEFORE UPDATE ON public.staff
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_puntos_usuario_updated_at
  BEFORE UPDATE ON public.puntos_usuario
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();