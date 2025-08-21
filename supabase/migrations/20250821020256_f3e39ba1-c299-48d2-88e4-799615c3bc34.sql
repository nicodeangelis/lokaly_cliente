-- First, let's create some staff entries for the coffee shops
-- We'll need to get the admin user first and assign them as staff to create QR tokens

-- Get the first admin user if exists
DO $$
DECLARE
    admin_user_id uuid;
    arregui_local_id uuid;
    mendoza_local_id uuid;
BEGIN
    -- Get an admin user
    SELECT user_id INTO admin_user_id
    FROM user_roles 
    WHERE role = 'admin' 
    LIMIT 1;
    
    -- Get the coffee shop IDs
    SELECT id INTO arregui_local_id FROM locales WHERE nombre LIKE '%Arregui%' LIMIT 1;
    SELECT id INTO mendoza_local_id FROM locales WHERE nombre LIKE '%Mendoza%' LIMIT 1;
    
    -- If we have an admin user and the locations exist, create staff entries
    IF admin_user_id IS NOT NULL AND arregui_local_id IS NOT NULL THEN
        INSERT INTO staff (user_id, local_id, activo) 
        VALUES (admin_user_id, arregui_local_id, true)
        ON CONFLICT (user_id, local_id) DO NOTHING;
    END IF;
    
    IF admin_user_id IS NOT NULL AND mendoza_local_id IS NOT NULL THEN
        INSERT INTO staff (user_id, local_id, activo) 
        VALUES (admin_user_id, mendoza_local_id, true)
        ON CONFLICT (user_id, local_id) DO NOTHING;
    END IF;
END $$;

-- Now create the QR tokens
INSERT INTO qr_tokens (token, local_id, staff_id, puntos_a_otorgar, nro_pos, expire_at)
SELECT 
  'cafe-arregui-demo',
  l.id,
  s.id,
  10,
  'POS001',
  NOW() + INTERVAL '1 year'
FROM locales l 
JOIN staff s ON s.local_id = l.id
WHERE l.nombre LIKE '%Arregui%' 
LIMIT 1
ON CONFLICT (token) DO NOTHING;

INSERT INTO qr_tokens (token, local_id, staff_id, puntos_a_otorgar, nro_pos, expire_at)
SELECT 
  'cafe-mendoza-demo',
  l.id,
  s.id,
  10,
  'POS002',
  NOW() + INTERVAL '1 year'
FROM locales l 
JOIN staff s ON s.local_id = l.id
WHERE l.nombre LIKE '%Mendoza%' 
LIMIT 1
ON CONFLICT (token) DO NOTHING;