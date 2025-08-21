-- Create menu categories table
CREATE TABLE public.menu_categorias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  orden INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create menu items table
CREATE TABLE public.menu_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  local_id UUID NOT NULL REFERENCES public.locales(id) ON DELETE CASCADE,
  categoria_id UUID NOT NULL REFERENCES public.menu_categorias(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  imagen TEXT,
  disponible BOOLEAN NOT NULL DEFAULT true,
  orden INTEGER NOT NULL DEFAULT 0,
  ingredientes TEXT[],
  alergenos TEXT[],
  vegetariano BOOLEAN NOT NULL DEFAULT false,
  vegano BOOLEAN NOT NULL DEFAULT false,
  sin_gluten BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.menu_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for menu_categorias
CREATE POLICY "Anyone can view active categories" 
ON public.menu_categorias 
FOR SELECT 
USING (activo = true);

CREATE POLICY "Only admins can modify categories" 
ON public.menu_categorias 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for menu_items
CREATE POLICY "Anyone can view available menu items" 
ON public.menu_items 
FOR SELECT 
USING (disponible = true);

CREATE POLICY "Only admins can modify menu items" 
ON public.menu_items 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Staff can view menu items for their location" 
ON public.menu_items 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.staff 
  WHERE staff.user_id = auth.uid() 
  AND staff.local_id = menu_items.local_id
));

-- Create triggers for updated_at
CREATE TRIGGER update_menu_categorias_updated_at
BEFORE UPDATE ON public.menu_categorias
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
BEFORE UPDATE ON public.menu_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample categories
INSERT INTO public.menu_categorias (nombre, descripcion, orden) VALUES
('Bebidas Calientes', 'Café, té y otras bebidas calientes', 1),
('Bebidas Frías', 'Bebidas refrescantes y frías', 2),
('Postres', 'Dulces y postres artesanales', 3),
('Snacks', 'Bocadillos y comidas ligeras', 4);

-- Insert sample menu items for Tienda de Cafe Arregui
INSERT INTO public.menu_items (local_id, categoria_id, nombre, descripcion, precio, vegetariano, orden) 
SELECT 
  l.id as local_id,
  c.id as categoria_id,
  items.nombre,
  items.descripcion,
  items.precio,
  items.vegetariano,
  items.orden
FROM public.locales l
CROSS JOIN public.menu_categorias c
CROSS JOIN (VALUES
  -- Bebidas Calientes
  ('Espresso', 'Café espresso tradicional', 2.50, true, 1),
  ('Americano', 'Café americano suave', 3.00, true, 2),
  ('Cappuccino', 'Espresso con leche vaporizada', 3.50, true, 3),
  ('Latte', 'Café con leche cremoso', 4.00, true, 4),
  -- Bebidas Frías  
  ('Frappé', 'Café helado batido', 4.50, true, 1),
  ('Iced Coffee', 'Café frío americano', 3.50, true, 2),
  ('Cold Brew', 'Café de extracción fría', 4.00, true, 3),
  -- Postres
  ('Brownie', 'Brownie de chocolate casero', 3.00, true, 1),
  ('Cheesecake', 'Tarta de queso artesanal', 4.50, true, 2),
  ('Muffin', 'Muffin de arándanos', 2.50, true, 3),
  -- Snacks
  ('Croissant', 'Croissant de mantequilla', 2.00, true, 1),
  ('Sandwich', 'Sandwich de jamón y queso', 5.00, false, 2),
  ('Ensalada', 'Ensalada fresca del día', 6.00, true, 3)
) AS items(nombre, descripcion, precio, vegetariano, orden)
WHERE l.nombre = 'Tienda de Cafe Arregui'
  AND (
    (c.nombre = 'Bebidas Calientes' AND items.orden <= 4) OR
    (c.nombre = 'Bebidas Frías' AND items.orden <= 3) OR  
    (c.nombre = 'Postres' AND items.orden <= 3) OR
    (c.nombre = 'Snacks' AND items.orden <= 3)
  );

-- Insert sample menu items for Tienda de Cafe Mendoza
INSERT INTO public.menu_items (local_id, categoria_id, nombre, descripcion, precio, vegetariano, orden) 
SELECT 
  l.id as local_id,
  c.id as categoria_id,
  items.nombre,
  items.descripcion,
  items.precio,
  items.vegetariano,
  items.orden
FROM public.locales l
CROSS JOIN public.menu_categorias c
CROSS JOIN (VALUES
  -- Bebidas Calientes
  ('Cortado', 'Café cortado tradicional', 2.80, true, 1),
  ('Macchiato', 'Espresso con espuma de leche', 3.20, true, 2),
  ('Mocha', 'Café con chocolate', 4.20, true, 3),
  ('Té Chai', 'Té especiado con leche', 3.80, true, 4),
  -- Bebidas Frías
  ('Smoothie', 'Batido de frutas frescas', 5.00, true, 1),
  ('Limonada', 'Limonada natural', 3.00, true, 2),
  ('Frappuccino', 'Café helado cremoso', 4.80, true, 3),
  -- Postres
  ('Tiramisu', 'Tiramisú artesanal', 5.00, true, 1),
  ('Cookies', 'Galletas de chocolate', 2.80, true, 2),
  ('Flan', 'Flan casero', 3.50, true, 3),
  -- Snacks
  ('Tostada', 'Tostada con palta', 4.50, true, 1),
  ('Panini', 'Panini de pollo', 6.50, false, 2),
  ('Wrap', 'Wrap vegetariano', 5.50, true, 3)
) AS items(nombre, descripcion, precio, vegetariano, orden)
WHERE l.nombre = 'Tienda de Cafe Mendoza'
  AND (
    (c.nombre = 'Bebidas Calientes' AND items.orden <= 4) OR
    (c.nombre = 'Bebidas Frías' AND items.orden <= 3) OR  
    (c.nombre = 'Postres' AND items.orden <= 3) OR
    (c.nombre = 'Snacks' AND items.orden <= 3)
  );