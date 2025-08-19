import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import AppShell from '../components/AppShell'
import { BottomNav } from '../components/BottomNav'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { useNavigate } from 'react-router-dom'

export default function Dashboard(){
  const [me, setMe] = useState<any>(null)
  const nav = useNavigate()

  useEffect(()=>{
    (async()=>{
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { nav('/l/cafe-palermo'); return; }
      const { data } = await supabase.from('clientes').select('*').eq('email', user.email).single();
      setMe(data)
    })()
  },[])

  return (
    <AppShell title="Lokaly" points={me?.puntos}>
      <section className="space-y-4 py-4">
        <div className="bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-2xl p-5 shadow-lg">
          <div className="text-sm opacity-90">Tu nivel</div>
          <div className="text-2xl font-bold capitalize">{me?.nivel ?? 'bronce'}</div>
          <div className="mt-3 h-2 bg-white/30 rounded-full">
            <div className="h-full bg-white rounded-full" style={{width: `${Math.min(100, Math.round(((me?.puntos||0)%300)/3))}%`}}/>
          </div>
          <div className="mt-4"><Button variant="secondary" className="bg-white text-brand-700" onClick={()=>nav('/app/benefits')}>Ver beneficios</Button></div>
        </div>

        <Card className="p-4">
          <div className="text-sm text-ink-500">Puntos</div>
          <div className="text-3xl font-bold">{me?.puntos ?? 0}</div>
          <Button className="mt-3 w-full" onClick={()=>nav('/app/scan')}>Escanear QR</Button>
        </Card>
      </section>
      <BottomNav/>
    </AppShell>
  )
}
