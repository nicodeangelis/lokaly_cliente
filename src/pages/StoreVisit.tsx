import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Coffee, ArrowLeft, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PreferencesModal } from '@/components/PreferencesModal';

interface Local {
  id: string;
  nombre: string;
  descripcion: string;
  direccion: string;
}

const WELCOME_BONUS = 50;
const VISIT_BONUS = 10;

const StoreVisit: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [local, setLocal] = useState<Local | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [visitComplete, setVisitComplete] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      try {
        // Check authentication
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // Redirect to auth with return URL
          navigate(`/auth?returnUrl=${encodeURIComponent(window.location.pathname)}`);
          return;
        }

        setUser(session.user);

        // Check if user already has points (to determine if new user)
        const { data: puntosData } = await supabase
          .from('puntos_usuario')
          .select('puntos_totales')
          .eq('user_id', session.user.id)
          .single();

        setIsNewUser(!puntosData || puntosData.puntos_totales === 0);

        // Load store information
        if (storeId) {
          const { data: localData, error } = await supabase
            .from('locales')
            .select('id, nombre, descripcion, direccion')
            .eq('id', storeId)
            .eq('activo', true)
            .single();

          if (error || !localData) {
            toast({
              title: "Local no encontrado",
              description: "El código QR no es válido o el local no está activo.",
              variant: "destructive",
            });
            navigate('/');
            return;
          }

          setLocal(localData);
        }
      } catch (error) {
        console.error('Error loading store visit:', error);
        toast({
          title: "Error",
          description: "Error al cargar la información del local.",
          variant: "destructive",
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndLoad();
  }, [storeId, navigate, toast]);

  const handleVisitRegistration = async (preferences?: any) => {
    if (!user || !local) return;

    setProcessing(true);
    try {
      const bonusPoints = isNewUser ? WELCOME_BONUS + VISIT_BONUS : VISIT_BONUS;
      
      const { data, error } = await supabase.rpc('visit_from_wall_qr', {
        p_user_id: user.id,
        p_local_id: local.id,
        p_puntos_visita: VISIT_BONUS,
        p_puntos_bienvenida: isNewUser ? WELCOME_BONUS : 0,
        p_gusto_cafe: preferences?.gusto_cafe,
        p_intensidad: preferences?.intensidad,
        p_dulzor: preferences?.dulzor,
        p_tipo_leche: preferences?.tipo_leche,
        p_extras: preferences?.extras,
        p_horario_pref: preferences?.horario_pref,
        p_comentario_gustos: preferences?.comentario,
      });

      if (error) throw error;

      setPointsEarned(bonusPoints);
      setVisitComplete(true);
      setShowPreferences(false);

      toast({
        title: "¡Visita registrada! 🎉",
        description: `Has ganado ${bonusPoints} puntos${isNewUser ? ' (incluyendo bonus de bienvenida)' : ''}.`,
      });

    } catch (error) {
      console.error('Error registering visit:', error);
      toast({
        title: "Error",
        description: "Error al registrar la visita. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleContinueWithoutPreferences = () => {
    handleVisitRegistration();
  };

  const handleSavePreferences = (preferences: any) => {
    handleVisitRegistration(preferences);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (visitComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 relative overflow-hidden">
        <AnimatedBackground />
        <Helmet>
          <title>¡Visita Registrada! - Lokaly</title>
          <meta name="description" content="Tu visita ha sido registrada exitosamente en Lokaly" />
        </Helmet>

        <div className="relative z-10 container mx-auto p-4 pt-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto"
          >
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Star className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">¡Visita Registrada! 🎉</CardTitle>
                <CardDescription>
                  Has ganado <span className="font-bold text-primary">{pointsEarned} puntos</span>
                  {isNewUser && (
                    <div className="mt-2">
                      <Badge variant="secondary" className="bg-primary/10">
                        Bonus de Bienvenida: {WELCOME_BONUS} puntos
                      </Badge>
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-secondary/30 rounded-lg">
                  <h3 className="font-semibold text-lg">{local?.nombre}</h3>
                  <p className="text-sm text-muted-foreground">{local?.direccion}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => navigate('/dashboard')}
                    className="w-full"
                  >
                    Ver Dashboard
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/benefits')}
                    className="w-full"
                  >
                    Ver Beneficios
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 relative overflow-hidden">
      <AnimatedBackground />
      <Helmet>
        <title>{`Visitar ${local?.nombre || 'Local'} - Lokaly`}</title>
        <meta name="description" content={`Registra tu visita en ${local?.nombre} y gana puntos de fidelidad`} />
      </Helmet>

      <div className="relative z-10 container mx-auto p-4 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold">¡Bienvenido!</h1>
          </div>

          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Coffee className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-xl">{local?.nombre}</CardTitle>
              <CardDescription>{local?.direccion}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {local?.descripcion && (
                <p className="text-sm text-muted-foreground text-center">
                  {local.descripcion}
                </p>
              )}

              <div className="p-4 bg-primary/5 rounded-lg text-center">
                <h3 className="font-semibold text-lg mb-2">
                  ¡Gana puntos por tu visita!
                </h3>
                <div className="space-y-2">
                  {isNewUser && (
                    <Badge variant="secondary" className="bg-primary/10">
                      Bonus de Bienvenida: {WELCOME_BONUS} puntos
                    </Badge>
                  )}
                  <Badge variant="outline">
                    Puntos por visita: {VISIT_BONUS} puntos
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Total: <span className="font-bold text-primary">
                    {isNewUser ? WELCOME_BONUS + VISIT_BONUS : VISIT_BONUS} puntos
                  </span>
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={() => setShowPreferences(true)}
                  className="w-full"
                  disabled={processing}
                >
                  {processing ? "Registrando..." : "Personalizar Beneficios"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleContinueWithoutPreferences}
                  className="w-full"
                  disabled={processing}
                >
                  Continuar sin personalizar
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Personalizar tus gustos nos ayuda a ofrecerte mejores beneficios
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <PreferencesModal
        open={showPreferences}
        onClose={() => setShowPreferences(false)}
        onSave={handleSavePreferences}
        loading={processing}
      />
    </div>
  );
};

export default StoreVisit;