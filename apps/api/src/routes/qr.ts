import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase'
const router = Router()

// Generar QR efímero para un nro_pos (crea pedido si no existe)
router.post('/qr/generar', async (req, res) => {
  const { local_slug, nro_pos, minutos = 5 } = req.body
  if (!local_slug || !nro_pos) return res.status(400).json({ error: 'local_slug y nro_pos requeridos' })

  // Buscar el local por slug
  const { data: local, error: localError } = await supabaseAdmin
    .from('locales').select('id').eq('slug', local_slug).single()
  if (localError || !local) return res.status(400).json({ error: 'Local no encontrado' })

  let pedido_id: string | undefined
  const { data: ped, error: e1 } = await supabaseAdmin
    .from('pedidos').select('id').eq('local_id', local.id).eq('nro_pos', nro_pos).maybeSingle()
  if (e1) return res.status(400).json({ error: e1.message })

  if (!ped) {
    const { data: ins, error: e2 } = await supabaseAdmin
      .from('pedidos').insert({ local_id: local.id, nro_pos }).select('id').single()
    if (e2) return res.status(400).json({ error: e2.message })
    pedido_id = ins.id
  } else {
    pedido_id = ped.id
  }

  const { data, error } = await supabaseAdmin.rpc('generar_qr_pedido', {
    p_local_id: local.id,
    p_nro_pos: nro_pos,
    p_minutos: minutos,
  })
  if (error) return res.status(400).json({ error: error.message })
  return res.json({ token: data, pedido_id })
})

export default router
