import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Gift, 
  Star, 
  ArrowLeft, 
  Crown,
  Tag
} from 'lucide-react';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { supabase } from '@/integrations/supabase/client';

interface Beneficio {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  valor: string;
  puntos_requeridos: number;
  nivel_requerido: {
    nombre: string;
    color: string;
    icono: string;
  };
}

function Benefits() {
  const [beneficios, setBeneficios] = useState<Beneficio[]>([]);
  const [userLevel, setUserLevel] = useState<string>('');
  const [userPoints, setUserPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }
      
      // Get user level and points
      const { data: userPoints } = await supabase
        .from('puntos_usuario')
        .select(`
          puntos_totales,
          nivel_actual:niveles(nombre, color, icono)
        `)
        .eq('user_id', user.id)
        .single();

      if (userPoints) {
        setUserLevel(userPoints.nivel_actual?.nombre || 'Bronce');
        setUserPoints(userPoints.puntos_totales || 0);
      }

      // Get benefits
      const { data: benefits } = await supabase
        .from('beneficios')
        .select(`
          id,
          titulo,
          descripcion,
          tipo,
          valor,
          puntos_requeridos,
          nivel_requerido:niveles(nombre, color, icono)
        `)
        .eq('activo', true)
        .order('puntos_requeridos', { ascending: true });

      if (benefits) {
        setBeneficios(benefits as Beneficio[]);
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const getBenefitIcon = (tipo: string) => {
    switch (tipo) {
      case 'descuento':
        return <Tag className="w-5 h-5" />;
      case 'regalo':
        return <Gift className="w-5 h-5" />;
      case 'puntos_extra':
        return <Star className="w-5 h-5" />;
      default:
        return <Gift className="w-5 h-5" />;
    }
  };

  const canUseBenefit = (beneficio: Beneficio) => {
    const levelOrder = { 'Bronce': 1, 'Plata': 2, 'Oro': 3 };
    const userLevelOrder = levelOrder[userLevel as keyof typeof levelOrder] || 1;
    const benefitLevelOrder = levelOrder[beneficio.nivel_requerido?.nombre as keyof typeof levelOrder] || 1;
    
    return userLevelOrder >= benefitLevelOrder && userPoints >= beneficio.puntos_requeridos;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando beneficios...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Mis Beneficios - Lokaly</title>
        <meta name="description" content="Descubre todos los beneficios disponibles según tu nivel de fidelización" />
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
              <h1 className="text-xl font-bold text-primary">Mis Beneficios</h1>
              <p className="text-sm text-muted-foreground">Nivel actual: {userLevel} • {userPoints} puntos</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-4xl mx-auto">
            
            {/* User Level Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 text-center"
            >
              <div className="inline-flex items-center gap-2 bg-background/80 backdrop-blur-sm border rounded-full px-6 py-3 shadow-soft">
                <Crown className="w-5 h-5 text-primary" />
                <span className="font-semibold">Tu nivel {userLevel} te da acceso a estos beneficios</span>
              </div>
            </motion.div>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {beneficios.map((beneficio, index) => (
                <motion.div
                  key={beneficio.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`shadow-medium ${canUseBenefit(beneficio) ? 'border-primary/20' : 'opacity-60'}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${canUseBenefit(beneficio) ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            {getBenefitIcon(beneficio.tipo)}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{beneficio.titulo}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">{beneficio.descripcion}</p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="text-2xl font-bold text-primary">{beneficio.valor}</div>
                          {canUseBenefit(beneficio) && (
                            <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                              Disponible
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span>{beneficio.nivel_requerido?.icono}</span>
                            <span>Nivel {beneficio.nivel_requerido?.nombre}</span>
                          </div>
                          {beneficio.puntos_requeridos > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4" />
                              <span>{beneficio.puntos_requeridos} pts</span>
                            </div>
                          )}
                        </div>

                        {!canUseBenefit(beneficio) && (
                          <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
                            {userLevel !== beneficio.nivel_requerido?.nombre 
                              ? `Alcanza el nivel ${beneficio.nivel_requerido?.nombre} para desbloquear`
                              : `Necesitas ${beneficio.puntos_requeridos - userPoints} puntos más`
                            }
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {beneficios.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No hay beneficios disponibles</h3>
                <p className="text-muted-foreground">Los beneficios aparecerán aquí cuando estén disponibles.</p>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}

export default Benefits;