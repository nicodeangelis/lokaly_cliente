import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Clock,
  Navigation
} from 'lucide-react';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { BottomNavigation } from '@/components/BottomNavigation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader } from '@googlemaps/js-api-loader';

interface Local {
  id: string;
  nombre: string;
  direccion: string;
  latitud: number;
  longitud: number;
  telefono: string;
  descripcion: string;
  imagen: string;
  horarios: any;
}

function Locations() {
  const [locales, setLocales] = useState<Local[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocal, setSelectedLocal] = useState<Local | null>(null);
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }
      
      // Get locations
      const { data: locations } = await supabase
        .from('locales')
        .select('*')
        .eq('activo', true)
        .order('nombre');

      if (locations) {
        setLocales(locations as Local[]);
        await initializeMap(locations as Local[]);
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const initializeMap = async (locations: Local[]) => {
    if (!mapRef.current || locations.length === 0) return;

    try {
      const loader = new Loader({
        apiKey: 'DEMO_KEY', // User will need to add their Google Maps API key
        version: 'weekly',
        libraries: ['places']
      });

      await loader.load();

      // Calculate center from all locations
      const avgLat = locations.reduce((sum, loc) => sum + (loc.latitud || 0), 0) / locations.length;
      const avgLng = locations.reduce((sum, loc) => sum + (loc.longitud || 0), 0) / locations.length;

      const map = new google.maps.Map(mapRef.current, {
        center: { lat: avgLat, lng: avgLng },
        zoom: 12,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      mapInstance.current = map;

      // Add markers for each location
      locations.forEach((local) => {
        if (local.latitud && local.longitud) {
          const marker = new google.maps.Marker({
            position: { lat: local.latitud, lng: local.longitud },
            map: map,
            title: local.nombre,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#8b5cf6"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(40, 40),
              anchor: new google.maps.Point(20, 40)
            }
          });

          marker.addListener('click', () => {
            setSelectedLocal(local);
          });

          markersRef.current.push(marker);
        }
      });

    } catch (error) {
      console.error('Error loading Google Maps:', error);
    }
  };

  const formatHorarios = (horarios: any) => {
    if (!horarios) return 'Horarios no disponibles';
    
    const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    
    return days.map((day, index) => (
      <div key={day} className="flex justify-between text-sm">
        <span className="font-medium">{dayNames[index]}:</span>
        <span>{horarios[day] || 'Cerrado'}</span>
      </div>
    ));
  };

  const openInGoogleMaps = (local: Local) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${local.latitud},${local.longitud}`;
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando locales...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Locales Cercanos - Lokaly</title>
        <meta name="description" content="Encuentra todos los locales de Lokaly cerca de ti" />
      </Helmet>

      <div className="min-h-screen gradient-subtle relative">
        <AnimatedBackground variant="loyalty" />
        
        {/* Header */}
        <div className="bg-background/80 backdrop-blur-sm shadow-soft border-b">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/app/home')} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-primary">Locales Cercanos</h1>
              <p className="text-sm text-muted-foreground">{locales.length} locales disponibles</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Map */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="order-2 lg:order-1"
              >
                <Card className="shadow-medium h-[500px]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      Mapa de Locales
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div 
                      ref={mapRef} 
                      className="w-full h-[400px] rounded-b-lg"
                      style={{ minHeight: '400px' }}
                    >
                      {/* Fallback when Google Maps is not available */}
                      <div className="w-full h-full bg-muted flex items-center justify-center rounded-b-lg">
                        <div className="text-center">
                          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">Mapa no disponible</p>
                          <p className="text-sm text-muted-foreground">Se requiere API key de Google Maps</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Locations List */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="order-1 lg:order-2 space-y-4"
              >
                {locales.map((local, index) => (
                  <motion.div
                    key={local.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`shadow-soft hover:shadow-medium transition-all cursor-pointer ${
                      selectedLocal?.id === local.id ? 'border-primary' : ''
                    }`}
                    onClick={() => setSelectedLocal(local)}
                    >
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          {local.imagen && (
                            <img 
                              src={local.imagen} 
                              alt={local.nombre}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <CardTitle className="text-lg">{local.nombre}</CardTitle>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <MapPin className="w-4 h-4" />
                              <span>{local.direccion}</span>
                            </div>
                            {local.descripcion && (
                              <p className="text-sm text-muted-foreground mt-2">{local.descripcion}</p>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {local.telefono && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-primary" />
                              <span>{local.telefono}</span>
                            </div>
                          )}
                          
                          {local.horarios && (
                            <div>
                              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                                <Clock className="w-4 h-4 text-primary" />
                                <span>Horarios</span>
                              </div>
                              <div className="pl-6 space-y-1">
                                {formatHorarios(local.horarios)}
                              </div>
                            </div>
                          )}
                          
                          <Button 
                            onClick={(e) => {
                              e.stopPropagation();
                              openInGoogleMaps(local);
                            }}
                            className="w-full mt-4"
                            variant="outline"
                          >
                            <Navigation className="w-4 h-4 mr-2" />
                            Ir al Local
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}

                {locales.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No hay locales disponibles</h3>
                    <p className="text-muted-foreground">Los locales aparecerán aquí cuando estén disponibles.</p>
                  </motion.div>
                )}
              </motion.div>

            </div>
          </div>
        </div>
        
        {/* Bottom Navigation */}
        <BottomNavigation />
        
        {/* Bottom padding to avoid overlap with navigation */}
        <div className="h-20"></div>
      </div>
    </>
  );
}

export default Locations;