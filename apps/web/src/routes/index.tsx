import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
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
      <motion.section 
        initial={{opacity:0,y:8}} 
        animate={{opacity:1,y:0}} 
        transition={{duration:.2}}
        className="py-6"
      >
        <motion.div
          initial={{scale:0.95,opacity:0}}
          animate={{scale:1,opacity:1}}
          transition={{delay:0.1,duration:0.3}}
        >
          <Card className="p-5">
            <div className="text-sm text-gray-500">Bienvenido</div>
            <motion.h1 
              className="text-2xl font-bold"
              initial={{scale:0.9}}
              animate={{scale:1}}
              transition={{delay:0.2,duration:0.3}}
            >
              {local?.nombre ?? 'Local'}
            </motion.h1>
            <p className="mt-1 text-sm">Registrá tu visita y obtené tu beneficio de bienvenida.</p>
            <motion.div
              initial={{y:10,opacity:0}}
              animate={{y:0,opacity:1}}
              transition={{delay:0.3,duration:0.3}}
            >
              <Button className="mt-4 w-full" onClick={login}>
                Ingresar / Registrarme
              </Button>
            </motion.div>
          </Card>
        </motion.div>
      </motion.section>
    </AppShell>
  )
}
