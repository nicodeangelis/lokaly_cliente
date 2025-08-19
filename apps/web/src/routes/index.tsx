import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'
import AppShell from '../components/AppShell'
import { Card } from '../components/Card'
import { Button } from '../components/Button'

export default function Index(){
  const { slug } = useParams()
  const nav = useNavigate()
  const [local, setLocal] = useState<any>(null)

  useEffect(()=>{ (async()=>{
    const { data: l } = await supabase.from('locales').select('*').eq('slug', slug).single();
    setLocal(l)
    const { data: { user } } = await supabase.auth.getUser()
    if (user && l) {
      const { data: me } = await supabase.from('clientes').select('id').eq('email', user.email).single()
      if (me) await supabase.from('visitas').insert({ cliente_id: me.id, local_id: l.id, origen: 'qr_local', beneficio_inicial_aplicado: true })
      nav('/app/home')
    }
  })() },[slug])

  const login = async()=>{
    const email = prompt('Email para magic link:') || ''
    if (!email) return
    await supabase.auth.signInWithOtp({ email })
    alert('Te enviamos un mail para ingresar ✅')
  }

  return (
    <AppShell title={local?.nombre || 'Lokaly'}>
      <section className="py-6">
        <Card className="p-5">
          <div className="text-sm text-ink-500">Bienvenido</div>
          <h1 className="text-2xl font-bold">{local?.nombre ?? 'Local'}</h1>
          <p className="mt-1 text-sm">Registrá tu visita y obtené tu beneficio de bienvenida.</p>
          <Button className="mt-4 w-full" onClick={login}>Ingresar / Registrarme</Button>
        </Card>
      </section>
    </AppShell>
  )
}
