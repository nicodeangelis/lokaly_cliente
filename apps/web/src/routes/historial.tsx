import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import AppShell from '../components/AppShell'
import { BottomNav } from '../components/BottomNav'
import { Card } from '../components/Card'
import { CreditCard, Plus, Minus, Calendar, MapPin } from 'lucide-react'

export default function Historial() {
  const [transacciones, setTransacciones] = useState<any[]>([])
  const [me, setMe] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Obtener datos del cliente
      const { data: cliente } = await supabase
        .from('clientes')
        .select('*')
        .eq('email', user.email)
        .maybeSingle()
      
      setMe(cliente)

      if (cliente?.id) {
        // Obtener transacciones (visitas y puntos)
        const { data: visitas } = await supabase
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

        // Simular transacciones de puntos (en una app real esto vendría de una tabla de transacciones)
        const transaccionesSimuladas = visitas?.map(visita => ({
          id: visita.id,
          tipo: 'suma',
          puntos: visita.beneficio_inicial_aplicado ? 50 : 25,
          descripcion: visita.beneficio_inicial_aplicado ? 'Beneficio de bienvenida' : 'Visita regular',
          fecha: visita.creado_en,
          local: visita.locales?.nombre || 'Local desconocido',
          origen: visita.origen
        })) || []

        setTransacciones(transaccionesSimuladas)
      }
    }

    loadData()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <AppShell title="Historial" points={me?.puntos}>
      <motion.section
        initial={{opacity:0,y:8}}
        animate={{opacity:1,y:0}}
        transition={{duration:.2}}
        className="space-y-4"
      >
        {/* Resumen */}
        <motion.div
          initial={{scale:0.95,opacity:0}}
          animate={{scale:1,opacity:1}}
          transition={{delay:0.1,duration:0.3}}
        >
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard size={24} className="text-blue-600" />
              <h2 className="text-xl font-bold text-gray-800">Resumen de Créditos</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{me?.puntos || 0}</div>
                <div className="text-sm text-gray-600">Puntos actuales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{transacciones.length}</div>
                <div className="text-sm text-gray-600">Transacciones</div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Lista de transacciones */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg text-gray-800">Historial de Transacciones</h3>
          
          {transacciones.map((transaccion, index) => (
            <motion.div
              key={transaccion.id}
              initial={{scale:0.95,opacity:0,y:20}}
              animate={{scale:1,opacity:1,y:0}}
              transition={{delay:0.2 + index * 0.1,duration:0.3}}
            >
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      transaccion.tipo === 'suma' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaccion.tipo === 'suma' ? <Plus size={16} /> : <Minus size={16} />}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{transaccion.descripcion}</div>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <MapPin size={14} />
                        {transaccion.local}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(transaccion.fecha)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${
                      transaccion.tipo === 'suma' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaccion.tipo === 'suma' ? '+' : '-'}{transaccion.puntos} pts
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {transaccion.origen}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}

          {transacciones.length === 0 && (
            <motion.div
              initial={{opacity:0}}
              animate={{opacity:1}}
              transition={{delay:0.5}}
              className="text-center py-8"
            >
              <CreditCard size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-600">No hay transacciones aún</p>
              <p className="text-sm text-gray-500">Visita un local para empezar a acumular puntos</p>
            </motion.div>
          )}
        </div>
      </motion.section>
      <BottomNav />
    </AppShell>
  )
}
