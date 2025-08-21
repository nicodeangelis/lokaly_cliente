import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Camera, 
  Check,
  AlertCircle,
  QrCode
} from 'lucide-react';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { BottomNavigation } from '@/components/BottomNavigation';
import { BrowserMultiFormatReader } from '@zxing/library';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

function QRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);
  const [scanMessage, setScanMessage] = useState<string>('');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log('QRScanner - Auth check:', { user, error });
      
      if (!user) {
        console.log('QRScanner - No user found, redirecting to auth');
        navigate('/auth');
        return;
      }
      console.log('QRScanner - User authenticated:', user.id);
    };

    checkAuth();
    
    // Initialize QR code reader
    codeReader.current = new BrowserMultiFormatReader();
    
    return () => {
      stopScanning();
    };
  }, [navigate]);

  const requestCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setHasPermission(true);
      return stream;
    } catch (error) {
      console.error('Camera permission denied:', error);
      setHasPermission(false);
      toast({
        title: 'Permiso de cámara denegado',
        description: 'Necesitas permitir el acceso a la cámara para escanear códigos QR.',
        variant: 'destructive'
      });
      return null;
    }
  };

  const startScanning = async () => {
    if (!codeReader.current || !videoRef.current) return;

    try {
      const stream = await requestCameraPermission();
      if (!stream) return;

      setIsScanning(true);
      setScanResult(null);
      setScanMessage('');

      // Assign stream to video element first
      videoRef.current.srcObject = stream;
      
      // Wait for video to load
      await new Promise((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => resolve(true);
        }
      });

      codeReader.current.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, error) => {
          if (result) {
            const qrData = result.getText();
            setScannedData(qrData);
            processQRCode(qrData);
            stopScanning();
          }
          
          if (error && !(error.name === 'NotFoundException')) {
            console.error('QR scanning error:', error);
          }
        }
      );
    } catch (error) {
      console.error('Error starting camera:', error);
      setIsScanning(false);
      toast({
        title: 'Error al iniciar la cámara',
        description: 'No se pudo acceder a la cámara. Verifica los permisos.',
        variant: 'destructive'
      });
    }
  };

  const stopScanning = () => {
    if (codeReader.current) {
      codeReader.current.reset();
    }
    setIsScanning(false);
  };

  const processQRCode = async (qrData: string) => {
    try {
      console.log('Processing QR data:', qrData);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setScanResult('error');
        setScanMessage('Usuario no autenticado');
        return;
      }

      // Use the redeem_qr_token RPC function
      const { data, error } = await supabase.rpc('redeem_qr_token', {
        p_token: qrData.trim(),
        p_user_id: user.id
      });

      console.log('RPC response:', { data, error });

      if (error) {
        console.error('Error redeeming QR token:', error);
        setScanResult('error');
        setScanMessage(
          error.message.includes('Token no encontrado') ? 'Código QR inválido o expirado' :
          error.message.includes('Token ya usado') ? 'Este código QR ya fue usado' :
          error.message.includes('Solo una visita') ? 'Ya registraste una visita hoy en este local' :
          'Error al procesar el código QR'
        );
        return;
      }

      // Type guard for the response data
      const responseData = data as any;
      
      if (responseData && responseData.success) {
        setScanResult('success');
        setScanMessage(`¡Visita registrada! Has ganado ${responseData.puntos_otorgados} puntos en ${responseData.local_nombre}`);
        
        toast({
          title: '¡Puntos ganados!',
          description: `+${responseData.puntos_otorgados} puntos en ${responseData.local_nombre}`,
        });

        // If level changed, show additional message
        if (responseData.nivel_anterior !== responseData.nivel_actual) {
          setTimeout(() => {
            toast({
              title: '¡Nivel alcanzado!',
              description: `Has alcanzado el nivel ${responseData.nivel_actual}`,
            });
          }, 1000);
        }
      } else {
        setScanResult('error');
        setScanMessage('Error al procesar el código QR');
      }

    } catch (error) {
      console.error('Error processing QR code:', error);
      setScanResult('error');
      setScanMessage('Error al procesar el código QR');
    }
  };

  return (
    <>
      <Helmet>
        <title>Escanear QR - Lokaly</title>
        <meta name="description" content="Escanea códigos QR para ganar puntos en tus locales favoritos" />
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
              <h1 className="text-xl font-bold text-primary">Escanear QR</h1>
              <p className="text-sm text-muted-foreground">Gana puntos escaneando códigos QR</p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="max-w-md mx-auto">
            
            {/* Scanner Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-primary" />
                    Escáner QR
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Camera View */}
                  <div className="relative">
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
                      {isScanning ? (
                        <video 
                          ref={videoRef}
                          className="w-full h-full object-cover"
                          autoPlay
                          playsInline
                          muted
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <Camera className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                            <p className="text-sm text-muted-foreground">
                              {hasPermission === false 
                                ? 'Permiso de cámara requerido'
                                : 'Presiona el botón para comenzar'
                              }
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {/* Scanning overlay */}
                      {isScanning && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-64 h-64 border-2 border-primary rounded-lg relative">
                            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                            
                            {/* Scanning line animation */}
                            <motion.div
                              className="absolute left-0 right-0 h-0.5 bg-primary"
                              animate={{
                                y: [0, 256, 0]
                              }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear"
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Scan Result */}
                  {scanResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-center gap-3 p-4 rounded-lg ${
                        scanResult === 'success' 
                          ? 'bg-success/10 text-success border border-success/20' 
                          : 'bg-destructive/10 text-destructive border border-destructive/20'
                      }`}
                    >
                      {scanResult === 'success' ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                      <span className="text-sm font-medium">{scanMessage}</span>
                    </motion.div>
                  )}

                  {/* Controls */}
                  <div className="space-y-3">
                    {!isScanning ? (
                      <Button 
                        onClick={startScanning}
                        className="w-full"
                        disabled={hasPermission === false}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Comenzar Escaneo
                      </Button>
                    ) : (
                      <Button 
                        onClick={stopScanning}
                        variant="outline"
                        className="w-full"
                      >
                        Detener Escaneo
                      </Button>
                    )}

                    {scanResult && (
                      <Button 
                        onClick={() => {
                          setScanResult(null);
                          setScannedData(null);
                          setScanMessage('');
                        }}
                        variant="outline"
                        className="w-full"
                      >
                        Escanear Otro Código
                      </Button>
                    )}
                  </div>

                  {/* Instructions */}
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p className="font-medium">Instrucciones:</p>
                    <ul className="space-y-1 pl-4">
                      <li>• Permite el acceso a la cámara</li>
                      <li>• Apunta la cámara al código QR</li>
                      <li>• Mantén el dispositivo estable</li>
                      <li>• El escaneo es automático</li>
                    </ul>
                  </div>

                </CardContent>
              </Card>
            </motion.div>

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

export default QRScanner;