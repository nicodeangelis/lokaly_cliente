import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { subscribePush } from '../lib/push'

export default function Dashboard() {
  const [me, setMe] = useState<any>(null)

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('clientes').select('*').eq('email', user.email).single()
      setMe(data)
      
      // Suscribir a push notifications
      await subscribePush()
    })()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Mi Lokaly</h1>
      {me && (
        <div className="mt-4 space-y-2">
          <div>Nivel: <b className="uppercase">{me.nivel}</b></div>
          <div>Puntos: <b>{me.puntos}</b></div>
        </div>
      )}
    </div>
  )
}
