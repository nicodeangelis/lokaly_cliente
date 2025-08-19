import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'

export default function Index() {
  const { slug } = useParams()
  const nav = useNavigate()
  const [local, setLocal] = useState<any>(null)

  useEffect(() => {
    (async () => {
      // 1) Buscar local por slug
      const { data: l } = await supabase.from('locales').select('*').eq('slug', slug).single()
      setLocal(l)
      // 2) Si usuario logueado → registrar visita
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: me } = await supabase.from('clientes').select('id').eq('email', user.email).single()
        if (me && l) {
          await supabase.from('visitas').insert({ cliente_id: me.id, local_id: l.id, origen: 'qr_local', beneficio_inicial_aplicado: true })
        }
        nav('/app/home')
      }
    })()
  }, [slug])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{local?.nombre ?? 'Lokaly'}</h1>
      <p>Escaneaste el QR del local. Registrate o iniciá sesión para obtener tu beneficio.</p>
      <div className="mt-4 flex gap-3">
        <button className="px-4 py-2 bg-black text-white rounded" onClick={() => supabase.auth.signInWithOtp({ email: prompt('Email para magic link:') || '' })}>Ingresar / Registrarme</button>
      </div>
    </div>
  )
}
