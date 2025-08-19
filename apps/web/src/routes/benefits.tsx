import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import AppShell from '../components/AppShell'
import { BottomNav } from '../components/BottomNav'
import { Card } from '../components/Card'

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
                    sexo: 'otro',
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
      <section className="py-4 space-y-4">
        <div className="text-lg font-semibold">Beneficios disponibles</div>
        
        {beneficios.map((beneficio) => (
          <Card key={beneficio.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">{beneficio.nombre}</div>
                <div className="text-sm text-ink-500 mt-1">{beneficio.descripcion}</div>
                <div className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-full mt-2 inline-block">
                  Nivel {beneficio.nivel_minimo}
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">
                  {beneficio.tipo === 'percentual' ? `${beneficio.valor}%` : `$${beneficio.valor}`}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </section>
      <BottomNav />
    </AppShell>
  )
}
