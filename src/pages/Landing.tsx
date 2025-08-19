import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QrCode, Star, Gift, Users } from 'lucide-react';

// Mock data for demonstration
const mockLocales = {
  'cafe-centro': {
    id: '1',
    nombre: 'Café del Centro',
    slug: 'cafe-centro',
    direccion: 'Av. Corrientes 1234, CABA',
    descripcion: 'El mejor café de la ciudad con ambiente acogedor y productos artesanales.',
    imagen: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop',
    beneficio_bienvenida: '20% de descuento en tu primera compra',
    horarios: 'Lun-Vie: 7:00-22:00 | Sáb-Dom: 8:00-23:00'
  },
  'parrilla-puerto': {
    id: '2',
    nombre: 'Parrilla del Puerto',
    slug: 'parrilla-puerto',
    direccion: 'Puerto Madero 567, CABA',
    descripcion: 'Auténtica parrilla argentina con las mejores carnes y vista al río.',
    imagen: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop',
    beneficio_bienvenida: 'Entrada gratis en tu primera visita',
    horarios: 'Todos los días: 12:00-01:00'
  }
};

export default function Landing() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [local, setLocal] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (slug && mockLocales[slug as keyof typeof mockLocales]) {
      setLocal(mockLocales[slug as keyof typeof mockLocales]);
    }
    
    // Check if user is "logged in" (simulation)
    const userLoggedIn = localStorage.getItem('lokaly_user_logged_in');
    if (userLoggedIn === 'true') {
      setIsLoggedIn(true);
      // Simulate visit registration and redirect
      setTimeout(() => {
        navigate('/app/home');
      }, 2000);
    }
  }, [slug, navigate]);

  const handleLogin = () => {
    // Simulate login process
    localStorage.setItem('lokaly_user_logged_in', 'true');
    localStorage.setItem('lokaly_user_email', 'usuario@ejemplo.com');
    navigate('/auth');
  };

  const handleRegister = () => {
    navigate('/auth?mode=register');
  };

  if (!local) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Local no encontrado</h1>
          <p className="text-muted-foreground">El local que buscas no existe o el QR es inválido.</p>
        </div>
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-subtle">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-success-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">¡Visita registrada!</h1>
          <p className="text-muted-foreground">Redirigiendo a tu dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{local.nombre} - Lokaly</title>
        <meta name="description" content={`Descubre ${local.nombre} y únete a nuestro programa de fidelización. ${local.descripcion}`} />
        <meta property="og:title" content={`${local.nombre} - Lokaly`} />
        <meta property="og:description" content={local.descripcion} />
        <meta property="og:image" content={local.imagen} />
      </Helmet>

      <div className="min-h-screen gradient-subtle">
        {/* Hero Section */}
        <div className="relative h-96 overflow-hidden">
          <img 
            src={local.imagen} 
            alt={local.nombre}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-white"
            >
              <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-10 h-10" />
              </div>
              <h1 className="text-4xl font-bold mb-2">{local.nombre}</h1>
              <p className="text-xl opacity-90">{local.direccion}</p>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto space-y-6">
            
            {/* Welcome Benefit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="shadow-medium border-primary/20">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 gradient-brand rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-2xl text-primary">¡Bienvenida especial!</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <Badge variant="secondary" className="mb-4 text-lg px-4 py-2">
                    {local.beneficio_bienvenida}
                  </Badge>
                  <p className="text-muted-foreground mb-6">
                    Escaneaste el QR de {local.nombre}. Registrate o iniciá sesión para activar tu beneficio de bienvenida y comenzar a acumular puntos.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button onClick={handleLogin} variant="outline" className="h-12">
                      Iniciar Sesión
                    </Button>
                    <Button onClick={handleRegister} className="h-12 gradient-brand text-primary-foreground">
                      Registrarme
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* About Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-primary" />
                    Sobre nosotros
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{local.descripcion}</p>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Horarios</h4>
                    <p className="text-muted-foreground">{local.horarios}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Benefits Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-success" />
                    Programa de Fidelización
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="space-y-2">
                      <div className="level-bronze border rounded-lg p-3">
                        <div className="font-semibold">Bronce</div>
                        <div className="text-sm opacity-80">0-100 pts</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="level-plata border rounded-lg p-3">
                        <div className="font-semibold">Plata</div>
                        <div className="text-sm opacity-80">101-500 pts</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="level-oro border rounded-lg p-3">
                        <div className="font-semibold">Oro</div>
                        <div className="text-sm opacity-80">500+ pts</div>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-center text-muted-foreground mt-4">
                    Acumulá puntos con cada compra y desbloquea beneficios exclusivos.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

          </div>
        </div>
      </div>
    </>
  );
}