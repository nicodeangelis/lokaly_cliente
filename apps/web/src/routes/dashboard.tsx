import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
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
      <motion.section 
        initial={{opacity:0,y:8}} 
        animate={{opacity:1,y:0}} 
        transition={{duration:.2}}
        className="space-y-4 py-4"
      >
        <motion.div 
          initial={{scale:0.95,opacity:0}}
          animate={{scale:1,opacity:1}}
          transition={{delay:0.1,duration:0.3}}
          className="text-white rounded-2xl p-5 shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.3)'
          }}
        >
          <div className="text-sm opacity-90">Tu nivel</div>
          <div className="text-2xl font-bold capitalize">{me?.nivel ?? 'bronce'}</div>
          <div className="mt-3 h-2 bg-white/30 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-white rounded-full"
              initial={{width:0}}
              animate={{width: `${Math.min(100, Math.round(((me?.puntos||0)%300)/3))}%`}}
              transition={{delay:0.3,duration:0.8,ease:"easeOut"}}
            />
          </div>
          <div className="mt-4">
            <Button variant="secondary" className="bg-white" style={{color: '#4338ca'}} onClick={()=>nav('/app/benefits')}>
              Ver beneficios
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{scale:0.95,opacity:0}}
          animate={{scale:1,opacity:1}}
          transition={{delay:0.2,duration:0.3}}
        >
          <Card className="p-4">
            <div className="text-sm text-gray-500">Puntos</div>
            <motion.div 
              className="text-3xl font-bold"
              initial={{scale:0.8}}
              animate={{scale:1}}
              transition={{delay:0.4,duration:0.3}}
            >
              {me?.puntos ?? 0}
            </motion.div>
            <Button className="mt-3 w-full" onClick={()=>nav('/app/scan')}>
              Escanear QR
            </Button>
          </Card>
        </motion.div>
      </motion.section>
      <BottomNav/>
    </AppShell>
  )
}
