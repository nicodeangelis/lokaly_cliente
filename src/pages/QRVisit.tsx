import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, X, Gift, Star, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QRTokenData {
  id: string;
  token: string;
  local_id: string;
  puntos_a_otorgar: number;
  usado: boolean;
  expire_at: string;
  locales: {
    nombre: string;
    direccion: string;
  };
}

export default function QRVisit() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<'checking' | 'success' | 'error' | 'auth_required'>('checking');
  const [qrData, setQRData] = useState<QRTokenData | null>(null);
  const [pointsAwarded, setPointsAwarded] = useState(0);

  useEffect(() => {
    const processQRScan = async () => {
      if (!token) {
        setStatus('error');
        setLoading(false);
        return;
      }

      try {
        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setStatus('auth_required');
          setLoading(false);
          return;
        }

        // Get QR token data
        const { data: qrToken, error: qrError } = await supabase
          .from('qr_tokens')
          .select(`
            id,
            token,
            local_id,
            puntos_a_otorgar,
            usado,
            expire_at,
            locales:locales(nombre, direccion)
          `)
          .eq('token', token)
          .single();

        if (qrError || !qrToken) {
          setStatus('error');
          setLoading(false);
          return;
        }

        setQRData(qrToken as QRTokenData);

        // Check if token is still valid
        if (qrToken.usado) {
          toast({
            title: "QR ya utilizado",
            description: "Este código QR ya fue escaneado anteriormente.",
            variant: "destructive"
          });
          setStatus('error');
          setLoading(false);
          return;
        }

        if (new Date(qrToken.expire_at) < new Date()) {
          toast({
            title: "QR expirado",
            description: "Este código QR ya no es válido.",
            variant: "destructive"
          });
          setStatus('error');
          setLoading(false);
          return;
        }

        // Create visit record
        const { error: visitError } = await supabase
          .from('visitas')
          .insert({
            user_id: user.id,
            local_id: qrToken.local_id,
            puntos_obtenidos: qrToken.puntos_a_otorgar,
            qr_token: token
          });

        if (visitError) {
          toast({
            title: "Error",
            description: "No se pudo registrar la visita. Intenta de nuevo.",
            variant: "destructive"
          });
          setStatus('error');
          setLoading(false);
          return;
        }

        // Update user points
        const { data: currentPoints } = await supabase
          .from('puntos_usuario')
          .select('puntos_totales')
          .eq('user_id', user.id)
          .single();

        if (currentPoints) {
          const newPoints = currentPoints.puntos_totales + qrToken.puntos_a_otorgar;
          
          await supabase
            .from('puntos_usuario')
            .update({ puntos_totales: newPoints })
            .eq('user_id', user.id);
        }

        // Mark QR token as used
        await supabase
          .from('qr_tokens')
          .update({ usado: true })
          .eq('id', qrToken.id);

        setPointsAwarded(qrToken.puntos_a_otorgar);
        setStatus('success');
        
      } catch (error) {
        console.error('Error processing QR scan:', error);
        setStatus('error');
      } finally {
        setLoading(false);
      }
    };

    processQRScan();
  }, [token, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-subtle">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Procesando código QR...</p>
        </div>
      </div>
    );
  }

  if (status === 'auth_required') {
    return (
      <>
        <Helmet>
          <title>Acceso Requerido - Lokaly</title>
        </Helmet>
        <div className="min-h-screen flex items-center justify-center gradient-subtle p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="w-full max-w-md shadow-strong">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Gift className="w-8 h-8 text-warning" />
                </div>
                <CardTitle className="text-xl">¡Necesitas una cuenta!</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Para obtener puntos con este código QR, necesitas tener una cuenta en Lokaly.
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={() => navigate('/auth?mode=register')}
                    className="w-full gradient-brand text-primary-foreground"
                  >
                    Crear Cuenta
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/auth')}
                    className="w-full"
                  >
                    Iniciar Sesión
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </>
    );
  }

  if (status === 'error') {
    return (
      <>
        <Helmet>
          <title>Error - Lokaly</title>
        </Helmet>
        <div className="min-h-screen flex items-center justify-center gradient-subtle p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="w-full max-w-md shadow-strong border-destructive">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-destructive" />
                </div>
                <CardTitle className="text-destructive">Código QR Inválido</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Este código QR no es válido o ya fue utilizado.
                </p>
                <Button 
                  onClick={() => navigate('/app/home')}
                  variant="outline"
                  className="w-full"
                >
                  Ir al Dashboard
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>¡Puntos Obtenidos! - Lokaly</title>
      </Helmet>
      <div className="min-h-screen flex items-center justify-center gradient-subtle p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
        >
          <Card className="w-full max-w-md shadow-strong border-success">
            <CardHeader className="text-center">
              <motion.div 
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.6, delay: 0.2 }}
                className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle className="w-8 h-8 text-success-foreground" />
              </motion.div>
              <CardTitle className="text-success text-2xl">¡Felicitaciones!</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.4, delay: 0.4 }}
                  className="text-4xl font-bold text-primary mb-2"
                >
                  +{pointsAwarded}
                </motion.div>
                <p className="text-lg text-muted-foreground">puntos ganados</p>
              </div>

              {qrData && (
                <div className="bg-primary/5 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <Star className="w-5 h-5" />
                    <span className="font-semibold">{qrData.locales.nombre}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{qrData.locales.direccion}</p>
                </div>
              )}

              <div className="space-y-2">
                <Button 
                  onClick={() => navigate('/app/home')}
                  className="w-full gradient-brand text-primary-foreground"
                >
                  Ver Mi Dashboard
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/app/benefits')}
                  className="w-full"
                >
                  Ver Mis Beneficios
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </>
  );
}