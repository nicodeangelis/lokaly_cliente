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
  const [loading, setLoading] = useState(true)

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

    // Cargar locales con datos de ejemplo si no hay en DB
    const loadLocales = async () => {
      try {
        const { data, error } = await supabase
          .from('locales')
          .select('*')
          .order('nombre')
        
        if (error) {
          console.log('Error loading locales:', error)
          // Usar datos de ejemplo si no hay tabla o está vacía
          const exampleLocales = [
            {
              id: 1,
              nombre: 'Café Centro',
              direccion: 'Florida 555, CABA',
              barrio: 'Centro',
              slug: 'cafe-centro',
              rating: 4.5,
              distancia: 0.8
            },
            {
              id: 2,
              nombre: 'Café Norte',
              direccion: 'Cabildo 3200, CABA',
              barrio: 'Belgrano',
              slug: 'cafe-norte',
              rating: 4.2,
              distancia: 2.1
            },
            {
              id: 3,
              nombre: 'Café Palermo',
              direccion: 'Armenia 1234, CABA',
              barrio: 'Palermo',
              slug: 'cafe-palermo',
              rating: 4.7,
              distancia: 1.5
            },
            {
              id: 4,
              nombre: 'Café San Telmo',
              direccion: 'Defensa 800, CABA',
              barrio: 'San Telmo',
              slug: 'cafe-san-telmo',
              rating: 4.3,
              distancia: 3.2
            }
          ]
          setLocales(exampleLocales)
          setFilteredLocales(exampleLocales)
        } else {
          setLocales(data || [])
          setFilteredLocales(data || [])
        }
      } catch (error) {
        console.log('Error:', error)
      } finally {
        setLoading(false)
      }
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
        className="space-y-4"
      >
        {/* Filtros */}
        <motion.div
          initial={{scale:0.95,opacity:0}}
          animate={{scale:1,opacity:1}}
          transition={{delay:0.1,duration:0.3}}
        >
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter size={20} className="text-gray-500" />
              <span className="font-semibold text-gray-700">Filtrar por barrio</span>
            </div>
            <select 
              value={selectedBarrio}
              onChange={(e) => setSelectedBarrio(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <div className="relative rounded-3xl overflow-hidden gradient-primary shadow-lg">
            <div className="p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-full">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Mapa de Locales</h3>
                  <p className="text-sm opacity-90">
                    {userLocation ? 'Ubicación detectada' : 'Activa ubicación para ver distancias'}
                  </p>
                </div>
              </div>
              
              {/* Mapa placeholder mejorado */}
              <div className="w-full h-48 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center relative overflow-hidden">
                {/* Puntos del mapa simulados */}
                <div className="absolute inset-0">
                  <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                  <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                  <div className="absolute bottom-1/3 left-1/2 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                  <div className="absolute bottom-1/4 right-1/4 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
                </div>
                
                <div className="text-center relative z-10">
                  <MapPin size={40} className="mx-auto mb-3 opacity-80" />
                  <p className="text-sm font-medium">Mapa interactivo</p>
                  <p className="text-xs opacity-70">Próximamente con Google Maps</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Lista de locales */}
        <div className="space-y-4">
          <h3 className="font-bold text-xl text-gray-800">Locales Cercanos</h3>
          
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  initial={{opacity:0}}
                  animate={{opacity:1}}
                  transition={{delay: i * 0.1}}
                >
                  <div className="p-4 rounded-3xl bg-white/50 backdrop-blur-sm border border-white/20 animate-pulse">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            filteredLocales.map((local, index) => (
              <motion.div
                key={local.id}
                initial={{scale:0.95,opacity:0,y:20}}
                animate={{scale:1,opacity:1,y:0}}
                transition={{delay:0.3 + index * 0.1,duration:0.3}}
                className="group cursor-pointer"
                onClick={() => window.location.href = `/l/${local.slug}`}
              >
                <div className="p-5 rounded-3xl relative overflow-hidden transition-all duration-300 group-hover:scale-105 bg-white shadow-sm border border-gray-100">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl text-gray-800 mb-1">{local.nombre}</h3>
                        <p className="text-sm text-gray-600 mb-2">{local.direccion}</p>
                        {local.barrio && (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium gradient-primary text-white">
                            {local.barrio}
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          <Star size={16} className="text-yellow-500 fill-current" />
                          <span className="font-semibold text-gray-800">{local.rating || '4.5'}</span>
                        </div>
                        <span className="text-sm text-gray-600 font-medium">
                          {local.distancia ? `${local.distancia}km` : 'Distancia N/A'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-blue-600" />
                        <span className="text-sm text-gray-600">Disponible</span>
                      </div>
                      <div className="px-4 py-2 rounded-full font-semibold text-sm gradient-primary text-white shadow-md">
                        Visitar
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {filteredLocales.length === 0 && !loading && (
          <motion.div
            initial={{opacity:0}}
            animate={{opacity:1}}
            transition={{delay:0.5}}
            className="text-center py-8"
          >
            <p className="text-gray-500">No se encontraron locales en este barrio</p>
          </motion.div>
        )}
      </motion.section>
      <BottomNav />
    </AppShell>
  )
}
