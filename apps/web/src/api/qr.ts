import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
)

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { local_slug, nro_pos, minutos = 5 } = req.body
  
  if (!local_slug || !nro_pos) {
    return res.status(400).json({ error: 'local_slug y nro_pos requeridos' })
  }

  try {
    // Buscar el local por slug
    const { data: local, error: localError } = await supabaseAdmin
      .from('locales').select('id').eq('slug', local_slug).single()
    
    if (localError || !local) {
      return res.status(400).json({ error: 'Local no encontrado' })
    }

    // Generar QR usando la función RPC
    const { data, error } = await supabaseAdmin.rpc('generar_qr_pedido', {
      p_local_id: local.id,
      p_nro_pos: nro_pos,
      p_minutos: minutos,
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    return res.json({ token: data })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}
