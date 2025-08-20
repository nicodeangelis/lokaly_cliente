import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  QrCode, 
  Camera, 
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';

export default function Scan() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Check if user is logged in
    const userLoggedIn = localStorage.getItem('lokaly_user_logged_in');
    if (userLoggedIn !== 'true') {
      navigate('/auth');
      return;
    }
    setIsLoggedIn(true);
  }, [navigate]);

  const startScanning = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
      }
    } catch (err) {
      setError('No se pudo acceder a la cámara. Verificá los permisos.');
    }
  };

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsScanning(false);
  };

  const simulateQRScan = (mockToken: string) => {
    // Simulate different QR scanning results
    const mockResults = {
      'qr_valid_123': {
        success: true,
        puntos: 25,
        local: 'Café del Centro',
        total_puntos: 270,
        nivel_anterior: 'plata',
        nivel_actual: 'plata',
        beneficio: 'Descuento 10% en próxima compra'
      },
      'qr_expired_456': {
        success: false,
        error: 'QR expirado',
        message: 'Este QR ha expirado. Pedí al personal que genere uno nuevo.'
      },
      'qr_used_789': {
        success: false,
        error: 'QR ya utilizado',
        message: 'Este QR ya fue escaneado anteriormente.'
      },
      'qr_level_up_999': {
        success: true,
        puntos: 35,
        local: 'Parrilla del Puerto',
        total_puntos: 305,
        nivel_anterior: 'plata',
        nivel_actual: 'oro',
        levelUp: true,
        beneficio: '¡Subiste a Oro! 20% de descuento permanente'
      }
    };

    const result = mockResults[mockToken as keyof typeof mockResults] || mockResults['qr_valid_123'];
    setScanResult(result);
    stopScanning();
  };

  const handleManualInput = () => {
    const tokens = ['qr_valid_123', 'qr_expired_456', 'qr_used_789', 'qr_level_up_999'];
    const randomToken = tokens[Math.floor(Math.random() * tokens.length)];
    simulateQRScan(randomToken);
  };

  const resetScan = () => {
    setScanResult(null);
    setError(null);
  };

  if (!isLoggedIn) {
    return null; // Will redirect
  }

  return (
    <>
      <Helmet>
        <title>Escanear QR - Lokaly</title>
        <meta name="description" content="Escaneá el QR de tu compra para acumular puntos" />
      </Helmet>

      <div className="min-h-screen gradient-subtle">
        {/* Header */}
        <div className="bg-white shadow-soft border-b">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/app/home')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <h1 className="text-xl font-bold text-primary">Escanear QR</h1>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">

            {!scanResult ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <Card className="shadow-medium">
                  <CardHeader className="text-center">
                          <motion.div 
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            whileHover={{ 
                              scale: 1.1, 
                              rotate: [0, -10, 10, 0],
                              boxShadow: "0 0 30px hsl(var(--primary) / 0.5)"
                            }}
                            transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                            className="w-16 h-16 gradient-brand rounded-full flex items-center justify-center mx-auto mb-4 animate-glow"
                          >
                            <QrCode className="w-8 h-8 text-primary-foreground" />
                          </motion.div>
                    <CardTitle>Escanear QR de Compra</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <p className="text-muted-foreground">
                      Pedí al personal que genere el QR de tu compra y escanealo para sumar puntos.
                    </p>

                    {!isScanning ? (
                      <div className="space-y-3">
                        <Button 
                          onClick={startScanning}
                          className="w-full gradient-brand text-primary-foreground h-12"
                        >
                          <Camera className="w-5 h-5 mr-2" />
                          Activar Cámara
                        </Button>
                        <Button 
                          onClick={handleManualInput}
                          variant="outline"
                          className="w-full"
                        >
                          Simular Escaneo
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative border-2 border-dashed border-primary rounded-lg overflow-hidden">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-64 object-cover"
                          />
                          <canvas ref={canvasRef} className="hidden" />
                          
                          {/* Scanning overlay */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="border-2 border-primary bg-primary/10 rounded-lg w-48 h-48 flex items-center justify-center">
                              <motion.div
                                animate={{ y: [-20, 20, -20] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-full h-0.5 bg-primary"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Button 
                            onClick={handleManualInput}
                            className="w-full"
                          >
                            Simular QR Detectado
                          </Button>
                          <Button 
                            onClick={stopScanning}
                            variant="outline"
                            className="w-full"
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="flex items-center gap-2 text-destructive bg-destructive/10 p-3 rounded-lg">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm">{error}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="shadow-soft">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-3">¿Cómo funciona?</h3>
                    <div className="space-y-3 text-sm text-muted-foreground">
                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs">1</div>
                        <div>Realizá tu compra en el local</div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs">2</div>
                        <div>Pedí al personal que genere tu QR</div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-xs">3</div>
                        <div>Escaneá el QR para sumar puntos</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className={`shadow-strong ${scanResult.success ? 'border-success' : 'border-destructive'}`}>
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                      scanResult.success ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'
                    }`}>
                      {scanResult.success ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                    </div>
                    <CardTitle className={scanResult.success ? 'text-success' : 'text-destructive'}>
                      {scanResult.success ? '¡Puntos Sumados!' : 'Error en QR'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    {scanResult.success ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-center gap-2 text-2xl font-bold text-success">
                          <TrendingUp className="w-6 h-6" />
                          +{scanResult.puntos} puntos
                        </div>
                        
                        <div className="bg-accent/50 rounded-lg p-4 space-y-2">
                          <div><strong>Local:</strong> {scanResult.local}</div>
                          <div><strong>Total puntos:</strong> {scanResult.total_puntos}</div>
                          <div><strong>Nivel:</strong> {scanResult.nivel_actual}</div>
                        </div>

                        {scanResult.levelUp && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="bg-gradient-loyalty text-white p-4 rounded-lg"
                          >
                            <div className="text-lg font-bold">🎉 ¡Subiste de nivel!</div>
                            <div>Ahora sos nivel {scanResult.nivel_actual.toUpperCase()}</div>
                          </motion.div>
                        )}

                        {scanResult.beneficio && (
                          <Badge variant="secondary" className="text-center block py-2">
                            {scanResult.beneficio}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-destructive font-semibold">{scanResult.error}</div>
                        <p className="text-muted-foreground">{scanResult.message}</p>
                      </div>
                    )}

                    <div className="space-y-2 pt-4">
                      <Button 
                        onClick={() => navigate('/app/home')}
                        className="w-full"
                      >
                        Ir a Dashboard
                      </Button>
                      <Button 
                        onClick={resetScan}
                        variant="outline"
                        className="w-full"
                      >
                        Escanear Otro QR
                      </Button>
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