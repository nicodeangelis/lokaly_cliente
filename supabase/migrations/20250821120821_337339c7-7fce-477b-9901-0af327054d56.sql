-- Create some test QR tokens for testing the scanner
INSERT INTO public.qr_tokens (local_id, token, puntos_a_otorgar, expire_at) 
VALUES 
  ('2f7d8337-51c8-4830-b290-ba48ada8a372', 'TEST_QR_001', 50, now() + interval '7 days'),
  ('2f7d8337-51c8-4830-b290-ba48ada8a372', 'TEST_QR_002', 75, now() + interval '7 days'),
  ('eb6b81f2-9568-4cf7-95ad-49389b92285e', 'TEST_QR_003', 100, now() + interval '7 days'),
  ('eb6b81f2-9568-4cf7-95ad-49389b92285e', 'TEST_QR_004', 60, now() + interval '7 days'),
  ('2f7d8337-51c8-4830-b290-ba48ada8a372', 'TEST_QR_005', 25, now() + interval '7 days');