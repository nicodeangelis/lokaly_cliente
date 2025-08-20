import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Coffee, Star, Gift, MapPin, Users } from 'lucide-react'

interface Local {
  id: number
  nombre: string
  slug: string
}

export default function Index(){
  const { slug } = useParams()
  const nav = useNavigate()
  const [local, setLocal] = useState<Local | null>(null)

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

  const register = async()=>{
    const email = prompt('Email para registrarte:') || ''
    if (!email) return
    
    // Crear usuario directamente sin magic link
    const { error } = await supabase.auth.signUp({
      email,
      password: 'temp123', // Contraseña temporal
    })
    
    if (error) {
      alert('Error: ' + error.message)
      return
    }
    
    // Crear cliente en la base de datos
    const { error: clientError } = await supabase
      .from('clientes')
      .insert({
        email,
        nombre: email.split('@')[0],
        apellido: '',
        sexo: 'M',
        puntos: 0,
        nivel: 'bronce'
      })
    
    if (clientError) {
      console.error('Error creating client:', clientError)
    }
    
    alert('¡Registro exitoso! Ya puedes usar la app ✅')
    nav('/app/home')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
              <Coffee size={24} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-lg text-gray-800">Lokaly</div>
              <div className="text-xs text-gray-500">Fidelización</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-8">
        <motion.div
          initial={{opacity:0,y:20}}
          animate={{opacity:1,y:0}}
          transition={{duration:0.5}}
          className="space-y-6"
        >
          {/* Hero Section */}
          <motion.div
            initial={{scale:0.95,opacity:0}}
            animate={{scale:1,opacity:1}}
            transition={{delay:0.2,duration:0.4}}
            className="text-center"
          >
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
                <Coffee size={32} className="text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <Star size={16} className="text-white fill-current" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              {local?.nombre ?? 'Local'}
            </h1>
            <p className="text-gray-600 mb-4">¡Bienvenido a nuestra comunidad!</p>
          </motion.div>

          {/* Benefits Card */}
          <motion.div
            initial={{scale:0.95,opacity:0}}
            animate={{scale:1,opacity:1}}
            transition={{delay:0.3,duration:0.4}}
          >
            <Card className="p-6 bg-gradient-to-br from-white to-gray-50 border-0 shadow-xl">
              <div className="text-center mb-6">
                <div className="w-12 h-12 mx-auto bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl flex items-center justify-center mb-3">
                  <Gift size={24} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Beneficio de Bienvenida</h2>
                <p className="text-gray-600 text-sm">Registrá tu visita y obtené puntos especiales</p>
              </div>

              {/* Benefits List */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">50</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Puntos de bienvenida</div>
                    <div className="text-sm text-gray-600">Solo por registrarte</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                    <Users size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Acceso a la app</div>
                    <div className="text-sm text-gray-600">Gestioná tus puntos</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <MapPin size={16} className="text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Descuentos especiales</div>
                    <div className="text-sm text-gray-600">En futuras visitas</div>
                  </div>
                </div>
              </div>

              {/* Register Button */}
              <motion.div
                initial={{y:10,opacity:0}}
                animate={{y:0,opacity:1}}
                transition={{delay:0.5,duration:0.4}}
              >
                <Button 
                  onClick={register}
                  className="w-full py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  ¡Registrarme Ahora!
                </Button>
              </motion.div>
            </Card>
          </motion.div>

          {/* Footer Info */}
          <motion.div
            initial={{opacity:0}}
            animate={{opacity:1}}
            transition={{delay:0.6,duration:0.4}}
            className="text-center"
          >
            <p className="text-sm text-gray-500">
              Al registrarte aceptás nuestros términos y condiciones
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
