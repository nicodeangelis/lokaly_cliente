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
      
      // Buscar el cliente existente
      const { data: existingClient } = await supabase
        .from('clientes')
        .select('*')
        .eq('email', user.email)
        .maybeSingle();
      
      if (existingClient) {
        setMe(existingClient);
      } else {
        // Crear nuevo cliente si no existe
        const { data: newClient, error } = await supabase
          .from('clientes')
          .insert({
            email: user.email,
            nombre: user.email?.split('@')[0] || 'Usuario',
            apellido: '',
            sexo: 'M',
            puntos: 0,
            nivel: 'bronce'
          })
          .select()
          .single();
        
        if (error) {
          console.error('Error creating client:', error);
          // Mostrar datos por defecto
          setMe({
            email: user.email,
            nombre: user.email?.split('@')[0] || 'Usuario',
            apellido: '',
            sexo: 'M',
            puntos: 0,
            nivel: 'bronce'
          });
        } else {
          setMe(newClient);
        }
      }
    })()
  },[])

  return (
    <AppShell title="Lokaly" points={me?.puntos}>
      <div className="space-y-6">
        {/* Level Card */}
        <Card>
          <div className="text-sm text-gray-600 mb-2">Tu nivel</div>
          <div className="text-2xl font-bold text-gray-900 mb-4 capitalize">
            {me?.nivel ?? 'bronce'}
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.round(((me?.puntos||0)%300)/3))}%` }}
            />
          </div>
          
          <Button 
            onClick={()=>nav('/app/benefits')}
            className="w-full"
          >
            Ver beneficios
          </Button>
        </Card>

        {/* Points Card */}
        <Card>
          <div className="text-sm text-gray-600 mb-2">Puntos</div>
          <div className="text-4xl font-bold text-gray-900 mb-6">
            {me?.puntos ?? 0}
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={()=>nav('/app/locales')}
              variant="secondary"
              className="w-full"
            >
              Ver Locales
            </Button>
            <Button 
              onClick={()=>nav('/app/scan')}
              className="w-full"
            >
              Escanear QR
            </Button>
          </div>
        </Card>
      </div>
      
      <BottomNav/>
    </AppShell>
  )
}
