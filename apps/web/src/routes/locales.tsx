import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import AppShell from '../components/AppShell'
import { BottomNav } from '../components/BottomNav'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { MapPin, Star, Filter } from 'lucide-react'

export default function Locales() {
  const [locales, setLocales] = useState<any[]>([])
  const [filteredLocales, setFilteredLocales] = useState<any[]>([])
  const [selectedBarrio, setSelectedBarrio] = useState<string>('todos')
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null)

  useEffect(() => {
    // Obtener ubicación del usuario
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('Error getting location:', error)
        }
      )
    }

    // Cargar locales
    const loadLocales = async () => {
      const { data } = await supabase
        .from('locales')
        .select('*')
        .eq('activo', true)
        .order('nombre')
      
      setLocales(data || [])
      setFilteredLocales(data || [])
    }

    loadLocales()
  }, [])

  // Filtrar por barrio
  useEffect(() => {
    if (selectedBarrio === 'todos') {
      setFilteredLocales(locales)
    } else {
      setFilteredLocales(locales.filter(local => local.barrio === selectedBarrio))
    }
  }, [selectedBarrio, locales])

  const barrios = ['todos', ...new Set(locales.map(l => l.barrio).filter(Boolean))]

  return (
    <AppShell title="Locales">
      <motion.section
        initial={{opacity:0,y:8}}
        animate={{opacity:1,y:0}}
        transition={{duration:.2}}
        className="space-y-4 py-4"
      >
        {/* Filtros */}
        <motion.div
          initial={{scale:0.95,opacity:0}}
          animate={{scale:1,opacity:1}}
          transition={{delay:0.1,duration:0.3}}
        >
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter size={20} className="text-ink-500" />
              <span className="font-semibold">Filtrar por barrio</span>
            </div>
            <select 
              value={selectedBarrio}
              onChange={(e) => setSelectedBarrio(e.target.value)}
              className="w-full p-3 border rounded-xl bg-white"
            >
              {barrios.map(barrio => (
                <option key={barrio} value={barrio}>
                  {barrio === 'todos' ? 'Todos los barrios' : barrio}
                </option>
              ))}
            </select>
          </Card>
        </motion.div>

        {/* Mapa simulado */}
        <motion.div
          initial={{scale:0.95,opacity:0}}
          animate={{scale:1,opacity:1}}
          transition={{delay:0.2,duration:0.3}}
        >
          <Card className="p-4">
            <div className="text-center mb-4">
              <MapPin size={24} className="mx-auto text-brand-600 mb-2" />
              <h3 className="font-semibold">Mapa de Locales</h3>
              <p className="text-sm text-ink-500">
                {userLocation ? 'Ubicación detectada' : 'Activa ubicación para ver distancias'}
              </p>
            </div>
            
            {/* Mapa placeholder */}
            <div 
              className="w-full h-48 rounded-xl bg-gradient-to-br from-brand-50 to-brand-100 border-2 border-dashed border-brand-200 flex items-center justify-center"
            >
              <div className="text-center">
                <MapPin size={32} className="mx-auto text-brand-600 mb-2" />
                <p className="text-sm text-ink-500">Mapa interactivo</p>
                <p className="text-xs text-ink-400">(Integrar con Google Maps)</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Lista de locales */}
        <div className="space-y-3">
          {filteredLocales.map((local, index) => (
            <motion.div
              key={local.id}
              initial={{scale:0.95,opacity:0,y:20}}
              animate={{scale:1,opacity:1,y:0}}
              transition={{delay:0.3 + index * 0.1,duration:0.3}}
            >
              <Card className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{local.nombre}</h3>
                    <p className="text-sm text-ink-500 mb-2">{local.direccion}</p>
                    {local.barrio && (
                      <span className="inline-block bg-brand-50 text-brand-700 px-2 py-1 rounded-full text-xs mb-3">
                        {local.barrio}
                      </span>
                    )}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-500 fill-current" />
                        <span className="text-sm">{local.rating || '4.5'}</span>
                      </div>
                      <span className="text-sm text-ink-500">
                        {local.distancia ? `${local.distancia}km` : 'Distancia N/A'}
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="secondary" 
                    className="ml-4"
                    onClick={() => window.location.href = `/l/${local.slug}`}
                  >
                    Visitar
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredLocales.length === 0 && (
          <motion.div
            initial={{opacity:0}}
            animate={{opacity:1}}
            transition={{delay:0.5}}
            className="text-center py-8"
          >
            <p className="text-ink-500">No se encontraron locales en este barrio</p>
          </motion.div>
        )}
      </motion.section>
      <BottomNav />
    </AppShell>
  )
}
