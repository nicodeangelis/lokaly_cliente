import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import AppShell from '../components/AppShell'
import { BottomNav } from '../components/BottomNav'
import { Card } from '../components/Card'
import { motion } from 'framer-motion'

export default function Benefits() {
  const [beneficios, setBeneficios] = useState<any[]>([])
  const [me, setMe] = useState<any>(null)

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const { data: cliente } = await supabase.from('clientes').select('*').eq('email', user.email).maybeSingle()
      setMe(cliente || {
        email: user.email,
        nombre: user.email?.split('@')[0] || 'Usuario',
        apellido: '',
        sexo: 'M',
        puntos: 0,
        nivel: 'bronce'
      })
      
      const { data: beneficiosData } = await supabase
        .from('beneficios')
        .select('*')
        .eq('activo', true)
        .order('nivel_minimo')
      
      setBeneficios(beneficiosData || [])
    })()
  }, [])

  return (
    <AppShell title="Beneficios" points={me?.puntos}>
      <motion.section 
        className="py-4 space-y-4"
        initial={{opacity:0,y:8}}
        animate={{opacity:1,y:0}}
        transition={{duration:.2}}
      >
        <div className="text-lg font-semibold text-gray-800">Beneficios disponibles</div>
        
        {beneficios.map((beneficio, index) => (
          <motion.div
            key={beneficio.id}
            initial={{scale:0.95,opacity:0,y:20}}
            animate={{scale:1,opacity:1,y:0}}
            transition={{delay:0.1 + index * 0.1,duration:0.3}}
          >
            <Card className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-gray-800">{beneficio.nombre}</div>
                  <div className="text-sm text-gray-600 mt-1">{beneficio.descripcion}</div>
                  <div className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full mt-2 inline-block">
                    Nivel {beneficio.nivel_minimo}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-gray-800">
                    {beneficio.tipo === 'percentual' ? `${beneficio.valor}%` : `$${beneficio.valor}`}
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.section>
      <BottomNav />
    </AppShell>
  )
}
