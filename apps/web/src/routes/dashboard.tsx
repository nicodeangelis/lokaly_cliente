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
            sexo: 'no_especificado', // Campo requerido
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
            sexo: 'no_especificado',
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
                      className="text-white rounded-3xl p-6 relative overflow-hidden"
                      style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        boxShadow: '0 20px 40px -10px rgba(102, 126, 234, 0.4), 0 10px 20px -5px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      {/* Beautiful gradient overlay */}
                      <div 
                        className="absolute inset-0 opacity-20"
                        style={{
                          background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)'
                        }}
                      />
                      <div className="relative z-10">
          <div className="text-sm opacity-90">Tu nivel</div>
          <div className="text-2xl font-bold capitalize">{me?.nivel ?? 'bronce'}</div>
                                <div className="mt-4 h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                        <motion.div
                          className="h-full rounded-full relative"
                          initial={{width:0}}
                          animate={{width: `${Math.min(100, Math.round(((me?.puntos||0)%300)/3))}%`}}
                          transition={{delay:0.3,duration:0.8,ease:"easeOut"}}
                          style={{
                            background: 'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
                            boxShadow: '0 0 20px rgba(255,255,255,0.5)'
                          }}
                        />
                      </div>
                      <div className="mt-6">
                        <button 
                          className="px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95"
                          style={{
                            background: 'rgba(255,255,255,0.95)',
                            color: '#667eea',
                            boxShadow: '0 8px 25px -5px rgba(255,255,255,0.3)',
                            backdropFilter: 'blur(10px)'
                          }}
                          onClick={()=>nav('/app/benefits')}
                        >
                          Ver beneficios
                        </button>
                      </div>
                      </div>
                    </motion.div>

                            <motion.div
                      initial={{scale:0.95,opacity:0}}
                      animate={{scale:1,opacity:1}}
                      transition={{delay:0.2,duration:0.3}}
                    >
                      <div 
                        className="p-6 rounded-3xl relative overflow-hidden"
                        style={{
                          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                          boxShadow: '0 20px 40px -10px rgba(240, 147, 251, 0.4), 0 10px 20px -5px rgba(0, 0, 0, 0.1)'
                        }}
                      >
                        {/* Beautiful gradient overlay */}
                        <div 
                          className="absolute inset-0 opacity-20"
                          style={{
                            background: 'radial-gradient(circle at 70% 80%, rgba(255,255,255,0.3) 0%, transparent 50%)'
                          }}
                        />
                        <div className="relative z-10 text-white">
                          <div className="text-sm opacity-90 mb-2">Puntos</div>
                          <motion.div
                            className="text-4xl font-bold mb-4"
                            initial={{scale:0.8}}
                            animate={{scale:1}}
                            transition={{delay:0.4,duration:0.3}}
                          >
                            {me?.puntos ?? 0}
                          </motion.div>
                          <div className="grid grid-cols-2 gap-3">
                            <button 
                              className="px-4 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 text-sm"
                              style={{
                                background: 'rgba(255,255,255,0.95)',
                                color: '#f093fb',
                                boxShadow: '0 8px 25px -5px rgba(255,255,255,0.3)',
                                backdropFilter: 'blur(10px)'
                              }}
                              onClick={()=>nav('/app/locales')}
                            >
                              Ver Locales
                            </button>
                            <button 
                              className="px-4 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 text-sm"
                              style={{
                                background: 'rgba(255,255,255,0.95)',
                                color: '#f093fb',
                                boxShadow: '0 8px 25px -5px rgba(255,255,255,0.3)',
                                backdropFilter: 'blur(10px)'
                              }}
                              onClick={()=>nav('/app/scan')}
                            >
                              Escanear QR
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
      </motion.section>
      <BottomNav/>
    </AppShell>
  )
}
