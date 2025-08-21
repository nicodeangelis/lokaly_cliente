import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  QrCode, 
  Star, 
  Trophy, 
  Gift, 
  MapPin, 
  Calendar,
  TrendingUp,
  LogOut
} from 'lucide-react';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { supabase } from '@/integrations/supabase/client';

// Mock user data
const mockUser = {
  id: '1',
  email: 'usuario@ejemplo.com',
  nombre: 'Ana García',
  nivel: 'plata',
  puntos: 245,
  puntosParaSiguienteNivel: 255,
  totalVisitas: 12,
  fechaRegistro: '2024-01-15'
};

const mockVisitas = [
  {
    id: '1',
    local: 'Café del Centro',
    fecha: '2024-12-18',
    puntos: 25,
    beneficio: 'Descuento 10%'
  },
  {
    id: '2',
    local: 'Parrilla del Puerto',
    fecha: '2024-12-15',
    puntos: 40,
    beneficio: 'Entrada gratis'
  },
  {
    id: '3',
    local: 'Café del Centro',
    fecha: '2024-12-10',
    puntos: 20,
    beneficio: null
  }
];

const getLevelInfo = (nivel: string) => {
  switch (nivel) {
    case 'bronze':
      return { name: 'Bronce', color: 'level-bronze', icon: '🥉', range: '0-100 pts' };
    case 'plata':
      return { name: 'Plata', color: 'level-plata', icon: '🥈', range: '101-500 pts' };
    case 'oro':
      return { name: 'Oro', color: 'level-oro', icon: '🥇', range: '500+ pts' };
    default:
      return { name: 'Bronce', color: 'level-bronze', icon: '🥉', range: '0-100 pts' };
  }
};

function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [visitas, setVisitas] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const userLoggedIn = localStorage.getItem('lokaly_user_logged_in');
    if (userLoggedIn !== 'true') {
      navigate('/');
      return;
    }

    // Load user data (simulation)
    setUser(mockUser);
    setVisitas(mockVisitas);
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('lokaly_user_logged_in');
    localStorage.removeItem('lokaly_user_email');
    navigate('/');
  };

  const progressToNextLevel = user ? (user.puntos / user.puntosParaSiguienteNivel) * 100 : 0;
  const levelInfo = user ? getLevelInfo(user.nivel) : null;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando tu perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Mi Dashboard - Lokaly</title>
        <meta name="description" content="Gestiona tus puntos de fidelización y revisa tus visitas en Lokaly" />
      </Helmet>

      <div className="min-h-screen gradient-subtle relative">
        <AnimatedBackground variant="loyalty" />
        {/* Header */}
        <div className="bg-white shadow-soft border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">Lokaly</h1>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Salir
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold mb-2">¡Hola, {user.nombre}! 👋</h1>
              <p className="text-muted-foreground">Bienvenida a tu dashboard de fidelización</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              
              {/* Level & Points Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="lg:col-span-2"
              >
                <Card className="shadow-medium">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="w-5 h-5 text-primary" />
                      Tu Nivel de Fidelidad
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.div 
                          whileHover={{ scale: 1.05 }}
                          className={`${levelInfo?.color} border rounded-full px-4 py-2 flex items-center gap-2 transition-all duration-300`}
                        >
                          <motion.span 
                            animate={{ rotate: [0, 15, -15, 0] }}
                            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                            className="text-xl"
                          >
                            {levelInfo?.icon}
                          </motion.span>
                          <span className="font-semibold">{levelInfo?.name}</span>
                        </motion.div>
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          <Badge variant="secondary" className="animate-pulse-subtle">{user.puntos} puntos</Badge>
                        </motion.div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progreso al siguiente nivel</span>
                        <span>{user.puntosParaSiguienteNivel - user.puntos} puntos restantes</span>
                      </div>
                      <Progress value={progressToNextLevel} className="h-3" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{user.totalVisitas}</div>
                        <div className="text-sm text-muted-foreground">Visitas totales</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-success">{user.puntos}</div>
                        <div className="text-sm text-muted-foreground">Puntos acumulados</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      onClick={() => navigate('/app/qr-scanner')}
                      className="w-full gradient-brand text-primary-foreground"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      Escanear QR
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/app/benefits')}
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      Mis Beneficios
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => navigate('/app/locations')}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Locales Cercanos
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Recent Visits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Visitas Recientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {visitas.map((visita, index) => (
                      <motion.div
                        key={visita.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <MapPin className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-semibold">{visita.local}</div>
                            <div className="text-sm text-muted-foreground">{visita.fecha}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-success" />
                            <span className="font-semibold text-success">+{visita.puntos} pts</span>
                          </div>
                          {visita.beneficio && (
                            <Badge variant="secondary" className="mt-1">
                              {visita.beneficio}
                            </Badge>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;