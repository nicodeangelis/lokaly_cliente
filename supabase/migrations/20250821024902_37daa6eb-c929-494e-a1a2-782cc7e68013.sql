-- Add some additional specialty menu items for both locations
INSERT INTO public.menu_items (local_id, categoria_id, nombre, descripcion, precio, imagen, vegetariano, vegano, sin_gluten, ingredientes, alergenos, orden, disponible) 
SELECT 
  l.id as local_id,
  c.id as categoria_id,
  items.nombre,
  items.descripcion,
  items.precio,
  items.imagen,
  items.vegetariano,
  items.vegano,
  items.sin_gluten,
  items.ingredientes,
  items.alergenos,
  items.orden,
  true
FROM public.locales l
CROSS JOIN public.menu_categorias c
CROSS JOIN (VALUES
  -- Bebidas Calientes adicionales
  ('Flat White', 'Café australiano con microespuma sedosa y sabor intenso', 4.20, 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop', true, false, true, ARRAY['café espresso', 'leche entera'], ARRAY['lácteos'], 5),
  -- Bebidas Frías adicionales  
  ('Affogato', 'Helado de vainilla "ahogado" en espresso caliente', 5.50, 'https://images.unsplash.com/photo-1551887373-6edba6dacbb1?w=400&h=300&fit=crop', true, false, true, ARRAY['helado de vainilla', 'café espresso'], ARRAY['lácteos'], 4),
  -- Postres adicionales
  ('Macarons', 'Delicados macarons franceses de sabores variados', 3.80, 'https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=400&h=300&fit=crop', true, false, true, ARRAY['almendras', 'azúcar', 'claras de huevo', 'colorantes naturales'], ARRAY['frutos secos', 'huevos'], 4),
  -- Snacks adicionales
  ('Avocado Toast', 'Pan tostado con palta, tomate cherry y semillas', 7.50, 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop', true, true, false, ARRAY['pan integral', 'palta', 'tomate cherry', 'semillas de girasol', 'sal marina'], ARRAY['gluten'], 4)
) AS items(nombre, descripcion, precio, imagen, vegetariano, vegano, sin_gluten, ingredientes, alergenos, orden)
WHERE (
  (c.nombre = 'Bebidas Calientes' AND items.orden = 5) OR
  (c.nombre = 'Bebidas Frías' AND items.orden = 4) OR  
  (c.nombre = 'Postres' AND items.orden = 4) OR
  (c.nombre = 'Snacks' AND items.orden = 4)
);

-- Add some unique items per location to differentiate them
-- Unique items for Arregui location
INSERT INTO public.menu_items (local_id, categoria_id, nombre, descripcion, precio, imagen, vegetariano, vegano, sin_gluten, ingredientes, alergenos, orden, disponible) 
SELECT 
  l.id as local_id,
  c.id as categoria_id,
  'Café de Olla',
  'Café tradicional mexicano con canela y piloncillo',
  3.80,
  'https://images.unsplash.com/photo-1497636577773-f1231844b336?w=400&h=300&fit=crop',
  true,
  true,
  true,
  ARRAY['café de grano', 'canela', 'piloncillo', 'agua'],
  ARRAY[]::text[],
  6,
  true
FROM public.locales l
CROSS JOIN public.menu_categorias c
WHERE l.nombre LIKE '%Arregui%' AND c.nombre = 'Bebidas Calientes';

-- Unique items for Mendoza location  
INSERT INTO public.menu_items (local_id, categoria_id, nombre, descripcion, precio, imagen, vegetariano, vegano, sin_gluten, ingredientes, alergenos, orden, disponible) 
SELECT 
  l.id as local_id,
  c.id as categoria_id,
  'Submarino',
  'Clásico argentino: chocolate caliente con leche',
  4.50,
  'https://images.unsplash.com/photo-1542990253-0b8b5384cf72?w=400&h=300&fit=crop',
  true,
  false,
  true,
  ARRAY['chocolate en barra', 'leche entera', 'azúcar'],
  ARRAY['lácteos'],
  6,
  true
FROM public.locales l
CROSS JOIN public.menu_categorias c
WHERE l.nombre LIKE '%Mendoza%' AND c.nombre = 'Bebidas Calientes';