-- Create storage bucket for menu images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('menu-images', 'menu-images', true);

-- Create RLS policies for menu images bucket
CREATE POLICY "Anyone can view menu images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'menu-images');

CREATE POLICY "Only admins can upload menu images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'menu-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can update menu images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'menu-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Only admins can delete menu images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'menu-images' AND has_role(auth.uid(), 'admin'::app_role));

-- Update existing menu items with example images for Tienda de Cafe Arregui
UPDATE public.menu_items 
SET imagen = CASE 
  WHEN nombre = 'Espresso' THEN 'https://images.unsplash.com/photo-1510707577719-ae7c14805e76?w=400&h=300&fit=crop'
  WHEN nombre = 'Americano' THEN 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=400&h=300&fit=crop'
  WHEN nombre = 'Cappuccino' THEN 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
  WHEN nombre = 'Latte' THEN 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400&h=300&fit=crop'
  WHEN nombre = 'Frappé' THEN 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop'
  WHEN nombre = 'Iced Coffee' THEN 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=400&h=300&fit=crop'
  WHEN nombre = 'Cold Brew' THEN 'https://images.unsplash.com/photo-1520637836862-4d197d17c8a4?w=400&h=300&fit=crop'
  WHEN nombre = 'Brownie' THEN 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&h=300&fit=crop'
  WHEN nombre = 'Cheesecake' THEN 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=400&h=300&fit=crop'
  WHEN nombre = 'Muffin' THEN 'https://images.unsplash.com/photo-1426869981800-95ebf51ce900?w=400&h=300&fit=crop'
  WHEN nombre = 'Croissant' THEN 'https://images.unsplash.com/photo-1555507036-ace7d6c21b74?w=400&h=300&fit=crop'
  WHEN nombre = 'Sandwich' THEN 'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?w=400&h=300&fit=crop'
  WHEN nombre = 'Ensalada' THEN 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop'
  ELSE imagen
END
WHERE local_id = (SELECT id FROM public.locales WHERE nombre = 'Tienda de Cafe Arregui' LIMIT 1);

-- Update existing menu items with example images for Tienda de Cafe Mendoza
UPDATE public.menu_items 
SET imagen = CASE 
  WHEN nombre = 'Cortado' THEN 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop'
  WHEN nombre = 'Macchiato' THEN 'https://images.unsplash.com/photo-1545665225-b23b99e4d45e?w=400&h=300&fit=crop'
  WHEN nombre = 'Mocha' THEN 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
  WHEN nombre = 'Té Chai' THEN 'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=300&fit=crop'
  WHEN nombre = 'Smoothie' THEN 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop'
  WHEN nombre = 'Limonada' THEN 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400&h=300&fit=crop'
  WHEN nombre = 'Frappuccino' THEN 'https://images.unsplash.com/photo-1484244233201-29ed0542ba46?w=400&h=300&fit=crop'
  WHEN nombre = 'Tiramisu' THEN 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=300&fit=crop'
  WHEN nombre = 'Cookies' THEN 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&h=300&fit=crop'
  WHEN nombre = 'Flan' THEN 'https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?w=400&h=300&fit=crop'
  WHEN nombre = 'Tostada' THEN 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&h=300&fit=crop'
  WHEN nombre = 'Panini' THEN 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400&h=300&fit=crop'
  WHEN nombre = 'Wrap' THEN 'https://images.unsplash.com/photo-1565299585323-38174c4a6471?w=400&h=300&fit=crop'
  ELSE imagen
END
WHERE local_id = (SELECT id FROM public.locales WHERE nombre = 'Tienda de Cafe Mendoza' LIMIT 1);

-- Add more detailed descriptions and ingredients to menu items
UPDATE public.menu_items 
SET 
  descripcion = CASE 
    WHEN nombre = 'Espresso' THEN 'Café espresso italiano auténtico, preparado con granos seleccionados y tostado perfecto'
    WHEN nombre = 'Americano' THEN 'Café americano suave y aromático, ideal para comenzar el día'
    WHEN nombre = 'Cappuccino' THEN 'Espresso con leche vaporizada y espuma cremosa, decorado con arte latte'
    WHEN nombre = 'Latte' THEN 'Café con leche cremoso y suave, perfecto balance entre café y leche'
    WHEN nombre = 'Frappé' THEN 'Bebida helada y refrescante con café, hielo y crema batida'
    WHEN nombre = 'Brownie' THEN 'Brownie de chocolate belga, húmedo y decadente, servido tibio'
    WHEN nombre = 'Cheesecake' THEN 'Tarta de queso cremosa con base de galletas y frutos rojos'
    WHEN nombre = 'Croissant' THEN 'Croissant francés hojaldrado, crujiente por fuera y suave por dentro'
    WHEN nombre = 'Ensalada' THEN 'Ensalada fresca con mix de verdes, tomate cherry y aderezo de la casa'
    ELSE descripcion
  END,
  ingredientes = CASE 
    WHEN nombre = 'Espresso' THEN ARRAY['café arábica', 'agua filtrada']
    WHEN nombre = 'Americano' THEN ARRAY['café espresso', 'agua caliente']
    WHEN nombre = 'Cappuccino' THEN ARRAY['café espresso', 'leche entera', 'espuma de leche']
    WHEN nombre = 'Latte' THEN ARRAY['café espresso', 'leche vaporizada', 'espuma ligera']
    WHEN nombre = 'Brownie' THEN ARRAY['chocolate belga', 'mantequilla', 'huevos', 'harina', 'azúcar', 'nueces']
    WHEN nombre = 'Cheesecake' THEN ARRAY['queso crema', 'galletas digestivas', 'frutos rojos', 'azúcar', 'huevos']
    WHEN nombre = 'Croissant' THEN ARRAY['harina', 'mantequilla', 'levadura', 'sal', 'azúcar']
    WHEN nombre = 'Ensalada' THEN ARRAY['lechuga', 'rúcula', 'tomate cherry', 'aceite de oliva', 'vinagre balsámico']
    ELSE ingredientes
  END,
  alergenos = CASE 
    WHEN nombre = 'Brownie' THEN ARRAY['gluten', 'huevos', 'lácteos', 'frutos secos']
    WHEN nombre = 'Cheesecake' THEN ARRAY['gluten', 'lácteos', 'huevos']
    WHEN nombre = 'Croissant' THEN ARRAY['gluten', 'lácteos']
    WHEN nombre IN ('Cappuccino', 'Latte') THEN ARRAY['lácteos']
    ELSE alergenos
  END
WHERE local_id = (SELECT id FROM public.locales WHERE nombre = 'Tienda de Cafe Arregui' LIMIT 1);

-- Add similar updates for Mendoza location
UPDATE public.menu_items 
SET 
  descripcion = CASE 
    WHEN nombre = 'Cortado' THEN 'Café cortado tradicional argentino, equilibrio perfecto entre café y leche'
    WHEN nombre = 'Macchiato' THEN 'Espresso "manchado" con una cucharada de espuma de leche'
    WHEN nombre = 'Mocha' THEN 'Deliciosa combinación de café espresso y chocolate caliente'
    WHEN nombre = 'Té Chai' THEN 'Té especiado indio con leche, canela, cardamomo y jengibre'
    WHEN nombre = 'Smoothie' THEN 'Batido cremoso de frutas frescas de estación'
    WHEN nombre = 'Tiramisu' THEN 'Postre italiano clásico con café, mascarpone y cacao'
    WHEN nombre = 'Tostada' THEN 'Tostada artesanal con palta fresca, sal marina y aceite de oliva'
    WHEN nombre = 'Wrap' THEN 'Wrap vegetariano con hummus, vegetales frescos y brotes'
    ELSE descripcion
  END,
  ingredientes = CASE 
    WHEN nombre = 'Cortado' THEN ARRAY['café espresso', 'leche entera']
    WHEN nombre = 'Mocha' THEN ARRAY['café espresso', 'chocolate en polvo', 'leche vaporizada', 'crema batida']
    WHEN nombre = 'Té Chai' THEN ARRAY['té negro', 'leche', 'canela', 'cardamomo', 'jengibre', 'clavo']
    WHEN nombre = 'Smoothie' THEN ARRAY['frutas de estación', 'yogur natural', 'miel', 'hielo']
    WHEN nombre = 'Tiramisu' THEN ARRAY['mascarpone', 'café', 'bizcochos de soletilla', 'cacao', 'huevos', 'azúcar']
    WHEN nombre = 'Tostada' THEN ARRAY['pan artesanal', 'palta', 'sal marina', 'aceite de oliva', 'limón']
    WHEN nombre = 'Wrap' THEN ARRAY['tortilla integral', 'hummus', 'lechuga', 'tomate', 'zanahoria', 'brotes']
    ELSE ingredientes
  END,
  alergenos = CASE 
    WHEN nombre = 'Mocha' THEN ARRAY['lácteos']
    WHEN nombre = 'Té Chai' THEN ARRAY['lácteos']
    WHEN nombre = 'Smoothie' THEN ARRAY['lácteos']
    WHEN nombre = 'Tiramisu' THEN ARRAY['gluten', 'lácteos', 'huevos']
    WHEN nombre = 'Tostada' THEN ARRAY['gluten']
    WHEN nombre = 'Wrap' THEN ARRAY['gluten', 'sésamo']
    ELSE alergenos
  END
WHERE local_id = (SELECT id FROM public.locales WHERE nombre = 'Tienda de Cafe Mendoza' LIMIT 1);

-- Add some additional menu items for variety
INSERT INTO public.menu_items (local_id, categoria_id, nombre, descripcion, precio, imagen, vegetariano, vegano, sin_gluten, ingredientes, alergenos, orden) 
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
  items.orden
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