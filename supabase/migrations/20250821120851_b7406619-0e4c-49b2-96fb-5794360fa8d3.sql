-- First, let's create some staff records if they don't exist
-- Insert admin user as staff for both locations
DO $$
DECLARE
    admin_user_id uuid;
    local1_id uuid := '2f7d8337-51c8-4830-b290-ba48ada8a372';
    local2_id uuid := 'eb6b81f2-9568-4cf7-95ad-49389b92285e';
    staff1_id uuid;
    staff2_id uuid;
BEGIN
    -- Try to get the current authenticated user or use a default admin
    SELECT auth.uid() INTO admin_user_id;
    
    -- If no authenticated user, we'll need to handle this differently
    -- For now, let's create a dummy staff entry
    IF admin_user_id IS NULL THEN
        admin_user_id := 'e1053c5f-b16c-4b22-bc71-59e1b09ee521'; -- Current user from network logs
    END IF;
    
    -- Insert staff records if they don't exist
    INSERT INTO public.staff (user_id, local_id, activo)
    VALUES (admin_user_id, local1_id, true)
    ON CONFLICT (user_id, local_id) DO NOTHING
    RETURNING id INTO staff1_id;
    
    INSERT INTO public.staff (user_id, local_id, activo)
    VALUES (admin_user_id, local2_id, true)
    ON CONFLICT (user_id, local_id) DO NOTHING
    RETURNING id INTO staff2_id;
    
    -- Get staff IDs if they already existed
    IF staff1_id IS NULL THEN
        SELECT id INTO staff1_id FROM public.staff WHERE user_id = admin_user_id AND local_id = local1_id LIMIT 1;
    END IF;
    
    IF staff2_id IS NULL THEN
        SELECT id INTO staff2_id FROM public.staff WHERE user_id = admin_user_id AND local_id = local2_id LIMIT 1;
    END IF;
    
    -- Now create QR tokens with proper staff_id
    INSERT INTO public.qr_tokens (local_id, staff_id, token, puntos_a_otorgar, expire_at, nro_pos) 
    VALUES 
      (local1_id, staff1_id, 'TEST_QR_001', 50, now() + interval '7 days', 'POS_001'),
      (local1_id, staff1_id, 'TEST_QR_002', 75, now() + interval '7 days', 'POS_001'),
      (local2_id, staff2_id, 'TEST_QR_003', 100, now() + interval '7 days', 'POS_002'),
      (local2_id, staff2_id, 'TEST_QR_004', 60, now() + interval '7 days', 'POS_002'),
      (local1_id, staff1_id, 'TEST_QR_005', 25, now() + interval '7 days', 'POS_001');
      
END $$;