-- Create QR tokens for demo coffee shops
INSERT INTO qr_tokens (token, local_id, staff_id, puntos_a_otorgar, nro_pos, expire_at)
SELECT 
  'cafe-arregui-demo',
  l.id,
  (SELECT id FROM staff WHERE local_id = l.id LIMIT 1),
  10,
  'POS001',
  NOW() + INTERVAL '1 year'
FROM locales l 
WHERE l.nombre LIKE '%Arregui%' 
LIMIT 1;

INSERT INTO qr_tokens (token, local_id, staff_id, puntos_a_otorgar, nro_pos, expire_at)
SELECT 
  'cafe-mendoza-demo',
  l.id,
  (SELECT id FROM staff WHERE local_id = l.id LIMIT 1),
  10,
  'POS002',
  NOW() + INTERVAL '1 year'
FROM locales l 
WHERE l.nombre LIKE '%Mendoza%' 
LIMIT 1;