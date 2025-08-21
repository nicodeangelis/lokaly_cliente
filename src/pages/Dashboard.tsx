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

interface UserData {
  id: string;
  email: string;
  nombre: string;
  puntos: number;
  nivel: string;
  totalVisitas: number;
  fechaRegistro: string;
  niveles?: {
    nombre: string;
    color: string;
    icono: string;
    puntos_minimos: number;
    puntos_maximos: number;
  };
}

interface VisitaData {
  id: string;
  local: string;
  fecha: string;
  puntos: number;
  beneficio?: string;
}

const getLevelInfo = (nivel: any) => {
  if (!nivel) return { name: 'Bronce', color: 'text-orange-600', icon: '🥉', range: '0-100 pts' };
  
  return {
    name: nivel.nombre,
    color: `text-[${nivel.color}]`,
    icon: nivel.icono,
    range: `${nivel.puntos_minimos}${nivel.puntos_maximos ? `-${nivel.puntos_maximos}` : '+'} pts`
  };
};

function Dashboard() {
  const [user, setUser] = useState<UserData | null>(null);
  const [visitas, setVisitas] = useState<VisitaData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        navigate('/auth');
        return;
      }

      try {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        // Get user points and level
        const { data: userPoints } = await supabase
          .from('puntos_usuario')
          .select(`
            puntos_totales,
            nivel_actual:niveles(nombre, color, icono, puntos_minimos, puntos_maximos)
          `)
          .eq('user_id', authUser.id)
          .single();

        // Get user visits with location names
        const { data: userVisits } = await supabase
          .from('visitas')
          .select(`
            id,
            created_at,
            puntos_obtenidos,
            locales(nombre),
            beneficios(titulo)
          `)
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false })
          .limit(5);

        // Count total visits
        const { count: totalVisitas } = await supabase
          .from('visitas')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', authUser.id);

        if (profile && userPoints) {
          setUser({
            id: authUser.id,
            email: profile.email,
            nombre: profile.nombre,
            puntos: userPoints.puntos_totales || 0,
            nivel: userPoints.nivel_actual?.nombre || 'Bronce',
            totalVisitas: totalVisitas || 0,
            fechaRegistro: profile.fecha_registro,
            niveles: userPoints.nivel_actual
          });
        }

        if (userVisits) {
          setVisitas(userVisits.map(visit => ({
            id: visit.id,
            local: visit.locales?.nombre || 'Local desconocido',
            fecha: new Date(visit.created_at).toLocaleDateString(),
            puntos: visit.puntos_obtenidos,
            beneficio: visit.beneficios?.titulo || undefined
          })));
        }

      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('lokaly_user_logged_in');
    localStorage.removeItem('lokaly_user_email');
    navigate('/');
  };

  const progressToNextLevel = user && user.niveles?.puntos_maximos 
    ? (user.puntos / user.niveles.puntos_maximos) * 100 
    : 0;
  const levelInfo = user ? getLevelInfo(user.niveles) : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando tu dashboard...</p>
        </div>
      </div>
    );
  }

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
                        <span>{user.niveles?.puntos_maximos ? user.niveles.puntos_maximos - user.puntos : 0} puntos restantes</span>
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
                      Otros Locales
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