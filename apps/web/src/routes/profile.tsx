import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import AppShell from '../components/AppShell'
import { BottomNav } from '../components/BottomNav'
import { Card } from '../components/Card'
import { Button } from '../components/Button'

export default function Profile() {
  const [me, setMe] = useState<any>(null)
  const [visitas, setVisitas] = useState<any[]>([])

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
                        const { data: cliente } = await supabase.from('clientes').select('*').eq('email', user.email).maybeSingle()
                  setMe(cliente || {
                    email: user.email,
                    nombre: user.email?.split('@')[0] || 'Usuario',
                    apellido: '',
                    puntos: 0,
                    nivel: 'bronce'
                  })
      
                        if (cliente?.id) {
                    const { data: visitasData } = await supabase
                      .from('visitas')
                      .select(`
                        *,
                        locales (
                          nombre,
                          slug
                        )
                      `)
                      .eq('cliente_id', cliente.id)
                      .order('creado_en', { ascending: false })
                      .limit(5)

                    setVisitas(visitasData || [])
                  } else {
                    setVisitas([])
                  }
    })()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <AppShell title="Perfil" points={me?.puntos}>
      <section className="py-4 space-y-4">
        <Card className="p-4">
          <div className="text-sm text-ink-500">Tu información</div>
          <div className="font-semibold text-lg mt-1">{me?.nombre} {me?.apellido}</div>
          <div className="text-sm text-ink-500">{me?.email}</div>
          <div className="mt-3 flex gap-2">
            <div className="text-sm bg-brand-50 text-brand-700 px-3 py-1 rounded-full">
              Nivel {me?.nivel}
            </div>
            <div className="text-sm bg-green-50 text-green-700 px-3 py-1 rounded-full">
              {me?.puntos} puntos
            </div>
          </div>
        </Card>

        <div className="text-lg font-semibold">Últimas visitas</div>
        
        {visitas.map((visita) => (
          <Card key={visita.id} className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-semibold">{visita.locales?.nombre}</div>
                <div className="text-sm text-ink-500">
                  {new Date(visita.creado_en).toLocaleDateString('es-AR')}
                </div>
              </div>
              <div className="text-xs bg-brand-50 text-brand-700 px-2 py-1 rounded-full">
                {visita.origen}
              </div>
            </div>
          </Card>
        ))}

        <Button variant="ghost" onClick={logout} className="w-full">
          Cerrar sesión
        </Button>
      </section>
      <BottomNav />
    </AppShell>
  )
}
