import { createClient } from '@supabase/supabase-js'

// Temporal: usar valores por defecto si no hay credenciales
const supabaseUrl = process.env.SUPABASE_URL || 'https://bdesrfpsfgneahyzflfy.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE || 'temp-key'

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey)
