import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Mail, 
  User, 
  ArrowLeft,
  CheckCircle,
  Gift
} from 'lucide-react';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [email, setEmail] = useState('');
  const [nombre, setNombre] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const paramMode = searchParams.get('mode');
    if (paramMode === 'register') {
      setMode('register');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep('success');
      
      // Simulate successful login/registration
      setTimeout(() => {
        localStorage.setItem('lokaly_user_logged_in', 'true');
        localStorage.setItem('lokaly_user_email', email);
        navigate('/app/home');
      }, 2000);
    }, 1500);
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setStep('form');
  };

  return (
    <>
      <Helmet>
        <title>{mode === 'login' ? 'Iniciar Sesión' : 'Registrarse'} - Lokaly</title>
        <meta name="description" content="Accede a tu cuenta Lokaly para gestionar tu programa de fidelización" />
      </Helmet>

      <div className="min-h-screen gradient-subtle flex items-center justify-center p-4">
        <div className="w-full max-w-md">

          {step === 'form' ? (
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", bounce: 0.3 }}
              >
              <Card className="shadow-strong">
                <CardHeader className="text-center">
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate('/')}
                    className="absolute top-4 left-4 p-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  
                  <motion.div 
                    initial={{ scale: 0, rotate: -180, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    whileHover={{ 
                      scale: 1.1, 
                      rotate: [0, -10, 10, 0],
                      boxShadow: "0 0 40px hsl(var(--primary) / 0.6)"
                    }}
                    transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                    className="w-16 h-16 gradient-brand rounded-full flex items-center justify-center mx-auto mb-4 animate-glow"
                  >
                    {mode === 'login' ? (
                      <Mail className="w-8 h-8 text-primary-foreground" />
                    ) : (
                      <User className="w-8 h-8 text-primary-foreground" />
                    )}
                  </motion.div>
                  <CardTitle className="text-2xl">
                    {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                  </CardTitle>
                  <p className="text-muted-foreground">
                    {mode === 'login' 
                      ? 'Accede a tu programa de fidelización' 
                      : 'Únete al programa Lokaly'
                    }
                  </p>
                </CardHeader>
                
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'register' && (
                      <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre completo</Label>
                        <Input
                          id="nombre"
                          type="text"
                          value={nombre}
                          onChange={(e) => setNombre(e.target.value)}
                          placeholder="Tu nombre completo"
                          required={mode === 'register'}
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu@email.com"
                        required
                      />
                    </div>

                    {mode === 'register' && (
                      <div className="bg-success-muted border border-success/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Gift className="w-5 h-5 text-success mt-0.5" />
                          <div>
                            <div className="font-semibold text-success">¡Beneficio de bienvenida!</div>
                            <div className="text-sm text-success/80">
                              Al registrarte recibirás automáticamente tu beneficio de bienvenida
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      disabled={isLoading || !email || (mode === 'register' && !nombre)}
                      className="w-full gradient-brand text-primary-foreground h-12"
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          {mode === 'login' ? 'Enviando enlace...' : 'Creando cuenta...'}
                        </div>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          {mode === 'login' ? 'Enviar enlace mágico' : 'Crear cuenta'}
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 text-center space-y-4">
                    <div className="text-sm text-muted-foreground">
                      {mode === 'login' 
                        ? 'Te enviaremos un enlace para iniciar sesión sin contraseña'
                        : 'Te enviaremos un enlace para confirmar tu cuenta'
                      }
                    </div>

                    <div className="border-t pt-4">
                      <Button 
                        variant="ghost" 
                        onClick={toggleMode}
                        className="text-primary hover:text-primary/80"
                      >
                        {mode === 'login' 
                          ? '¿Primera vez? Crear cuenta' 
                          : '¿Ya tienes cuenta? Iniciar sesión'
                        }
                      </Button>
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
              <Card className="shadow-strong border-success">
                <CardHeader className="text-center">
                  <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-success-foreground" />
                  </div>
                  <CardTitle className="text-success">
                    {mode === 'login' ? '¡Enlace enviado!' : '¡Cuenta creada!'}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    {mode === 'login' 
                      ? `Enviamos un enlace mágico a ${email}. Revisá tu bandeja de entrada y hacé clic en el enlace para iniciar sesión.`
                      : `¡Bienvenida a Lokaly! Enviamos un enlace de confirmación a ${email}. Hacé clic en el enlace para activar tu cuenta.`
                    }
                  </p>

                  {mode === 'register' && (
                    <div className="bg-primary-subtle border border-primary/20 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <Gift className="w-5 h-5 text-primary" />
                        <div className="text-left">
                          <div className="font-semibold text-primary">Beneficio activado</div>
                          <div className="text-sm text-primary/80">
                            Tu beneficio de bienvenida te estará esperando
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 pt-4">
                    <div className="text-sm text-muted-foreground">
                      Redirigiendo automáticamente...
                    </div>
                    <div className="w-full bg-accent rounded-full h-2">
                      <motion.div 
                        className="bg-primary h-2 rounded-full"
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2, ease: 'easeInOut' }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

        </div>
      </div>
    </>
  );
}