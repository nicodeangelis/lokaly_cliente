-- Create staff records and QR tokens
INSERT INTO public.staff (user_id, local_id, activo)
VALUES 
  ('e1053c5f-b16c-4b22-bc71-59e1b09ee521', '2f7d8337-51c8-4830-b290-ba48ada8a372', true),
  ('e1053c5f-b16c-4b22-bc71-59e1b09ee521', 'eb6b81f2-9568-4cf7-95ad-49389b92285e', true);

-- Now create QR tokens using the staff IDs
INSERT INTO public.qr_tokens (local_id, staff_id, token, puntos_a_otorgar, expire_at, nro_pos) 
SELECT 
  s.local_id,
  s.id,
  token_data.token,
  token_data.puntos,
  now() + interval '7 days',
  token_data.pos
FROM (
  SELECT '2f7d8337-51c8-4830-b290-ba48ada8a372'::uuid as local_id, 'TEST_QR_001' as token, 50 as puntos, 'POS_001' as pos
  UNION ALL
  SELECT '2f7d8337-51c8-4830-b290-ba48ada8a372'::uuid, 'TEST_QR_002', 75, 'POS_001'
  UNION ALL
  SELECT 'eb6b81f2-9568-4cf7-95ad-49389b92285e'::uuid, 'TEST_QR_003', 100, 'POS_002'
  UNION ALL
  SELECT 'eb6b81f2-9568-4cf7-95ad-49389b92285e'::uuid, 'TEST_QR_004', 60, 'POS_002'
  UNION ALL
  SELECT '2f7d8337-51c8-4830-b290-ba48ada8a372'::uuid, 'TEST_QR_005', 25, 'POS_001'
) token_data
JOIN public.staff s ON s.local_id = token_data.local_id
WHERE s.user_id = 'e1053c5f-b16c-4b22-bc71-59e1b09ee521';