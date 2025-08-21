import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  QrCode, 
  Clock, 
  RefreshCw,
  Store,
  User,
  CheckCircle,
  LogOut
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Local {
  id: string;
  nombre: string;
  direccion: string;
}

interface StaffInfo {
  id: string;
  local_id: string;
  locales: Local;
}

export default function Staff() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [user, setUser] = useState<any>(null);
  const [staffInfo, setStaffInfo] = useState<StaffInfo | null>(null);
  const [nroPos, setNroPos] = useState('');
  const [qrToken, setQrToken] = useState('');
  const [qrExpiry, setQrExpiry] = useState<Date | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/auth');
          return;
        }

        setUser(session.user);

        // Check if user is staff and get their location
        const { data: staff, error } = await supabase
          .from('staff')
          .select(`
            id,
            local_id,
            locales:locales (
              id,
              nombre,
              direccion
            )
          `)
          .eq('user_id', session.user.id)
          .eq('activo', true)
          .single();

        if (error || !staff) {
          toast({
            title: "Acceso denegado",
            description: "No tienes permisos de staff o tu cuenta está inactiva.",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        setStaffInfo(staff as StaffInfo);
      } catch (error) {
        console.error('Error checking auth:', error);
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate, toast]);

  const generateQR = async () => {
    if (!staffInfo || !nroPos.trim()) {
      toast({
        title: "Error",
        description: "Por favor completá el número de POS/Mesa.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const token = `${staffInfo.local_id}_${nroPos}_${Date.now()}`;
      const expireAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

      const { data, error } = await supabase
        .from('qr_tokens')
        .insert({
          token,
          local_id: staffInfo.local_id,
          staff_id: staffInfo.id,
          nro_pos: nroPos,
          expire_at: expireAt.toISOString(),
          puntos_a_otorgar: 25, // Default points
          usado: false
        })
        .select()
        .single();

      if (error) throw error;

      setQrToken(token);
      setQrExpiry(expireAt);
      
      toast({
        title: "QR generado",
        description: "El código QR ha sido creado exitosamente.",
      });

    } catch (error) {
      console.error('Error generating QR:', error);
      toast({
        title: "Error",
        description: "No se pudo generar el código QR. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const clearQR = () => {
    setQrToken('');
    setQrExpiry(null);
    setNroPos('');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const getTimeRemaining = () => {
    if (!qrExpiry) return '';
    const now = new Date();
    const diff = qrExpiry.getTime() - now.getTime();
    if (diff <= 0) return 'Expirado';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (qrExpiry) {
      const timer = setInterval(() => {
        const now = new Date();
        if (now >= qrExpiry) {
          clearQR();
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [qrExpiry]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-subtle">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando panel de staff...</p>
        </div>
      </div>
    );
  }

  if (!staffInfo) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Staff - Generar QR - Lokaly</title>
        <meta name="description" content="Panel de staff para generar códigos QR de compras" />
      </Helmet>

      <div className="min-h-screen gradient-subtle">
        {/* Header */}
        <div className="bg-white shadow-soft border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 gradient-brand rounded-lg flex items-center justify-center">
                  <Store className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-primary">Staff Panel</h1>
                  <p className="text-sm text-muted-foreground">Generar QR para compras</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="w-4 h-4" />
                Salir
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">

            {/* Local Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card className="shadow-soft">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Store className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-semibold">{staffInfo.locales.nombre}</h2>
                      <p className="text-sm text-muted-foreground">{staffInfo.locales.direccion}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {!qrToken ? (
              /* QR Generation Form */
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="shadow-medium">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-primary" />
                      Generar QR de Compra
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="nro-pos">Número de POS / Mesa</Label>
                      <Input
                        id="nro-pos"
                        value={nroPos}
                        onChange={(e) => setNroPos(e.target.value)}
                        placeholder="Ej: POS01, MESA05, etc."
                        className="text-lg"
                      />
                    </div>

                    <div className="bg-accent/50 rounded-lg p-4">
                      <h4 className="font-semibold mb-2">Instrucciones:</h4>
                      <ol className="text-sm space-y-1 text-muted-foreground">
                        <li>1. Ingresá el número de POS o mesa</li>
                        <li>2. Presioná "Generar QR"</li>
                        <li>3. El cliente debe escanear el QR con la app</li>
                        <li>4. El QR expira en 5 minutos</li>
                      </ol>
                    </div>

                    <Button 
                      onClick={generateQR}
                      disabled={!nroPos || isGenerating}
                      className="w-full gradient-brand text-primary-foreground h-12"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <QrCode className="w-5 h-5 mr-2" />
                          Generar QR
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              /* QR Display */
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <Card className="shadow-strong border-success">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-success-foreground" />
                    </div>
                    <CardTitle className="text-success">QR Generado Correctamente</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-6">
                    
                    {/* QR Code */}
                    <motion.div 
                      initial={{ scale: 0, rotate: 45 }}
                      animate={{ scale: 1, rotate: 0 }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", bounce: 0.4 }}
                      className="bg-white p-6 rounded-lg border inline-block shadow-elegant animate-glow"
                    >
                       <QRCodeSVG 
                         value={`${window.location.origin}/visit/${qrToken}`}
                         size={200}
                         level="M"
                         includeMargin={true}
                       />
                    </motion.div>

                    {/* QR Info */}
                    <div className="space-y-3">
                      <div className="bg-accent/50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">POS/Mesa:</span>
                          <Badge variant="secondary">{nroPos}</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Local:</span>
                          <span>{staffInfo.locales.nombre}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Tiempo restante:</span>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-secondary" />
                            <Badge variant="outline" className="font-mono">
                              {getTimeRemaining()}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <User className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div className="text-left">
                            <div className="font-semibold text-blue-800">Para el cliente:</div>
                            <div className="text-sm text-blue-600">
                              "Escaneá este QR con tu app Lokaly para sumar puntos por tu compra"
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button onClick={clearQR} className="w-full" variant="outline">
                        Generar Nuevo QR
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Tips */}
                <Card className="shadow-soft">
                  <CardContent className="pt-6">
                    <h4 className="font-semibold mb-3">💡 Tips para el staff:</h4>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div>• Asegurate que el cliente tenga la app Lokaly instalada</div>
                      <div>• El QR debe escanearse antes que expire (5 minutos)</div>
                      <div>• Cada QR es único por compra</div>
                      <div>• Si hay problemas, generá un nuevo QR</div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}