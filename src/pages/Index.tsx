import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Store, QrCode, Trophy, Users, ArrowRight } from 'lucide-react';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { FloatingParticles } from '@/components/FloatingParticles';

const Index = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Lokaly - Programa de Fidelización para Restaurantes</title>
        <meta name="description" content="Descubre Lokaly, el programa de fidelización que conecta restaurantes con sus clientes favoritos" />
      </Helmet>

      <div className="min-h-screen gradient-subtle relative">
        <AnimatedBackground />
        <FloatingParticles count={8} />
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-16 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div 
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              whileHover={{ scale: 1.1, rotate: [0, -15, 15, 0] }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-20 h-20 gradient-brand rounded-full flex items-center justify-center mx-auto mb-8 animate-float hover-glow"
            >
              <Store className="w-10 h-10 text-primary-foreground" />
            </motion.div>
            
            <h1 className="text-5xl font-bold mb-6 gradient-brand bg-clip-text text-transparent">
              Lokaly
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              El programa de fidelización que conecta restaurantes con sus clientes favoritos. 
              Acumula puntos, sube de nivel y disfruta beneficios exclusivos.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="shadow-medium hover:shadow-strong transition-all duration-300 hover-lift hover-shimmer">
                  <CardHeader className="text-center">
                    <QrCode className="w-12 h-12 text-primary mx-auto mb-4" />
                    <CardTitle>Escanea & Acumula</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground">
                      Escanea el QR del local y de tus compras para acumular puntos automáticamente
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="shadow-medium hover:shadow-strong transition-all duration-300 hover-lift hover-shimmer">
                  <CardHeader className="text-center">
                    <Trophy className="w-12 h-12 text-success mx-auto mb-4" />
                    <CardTitle>Sube de Nivel</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground">
                      Progresa de Bronce a Plata y Oro, desbloqueando mejores beneficios
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="shadow-medium hover:shadow-strong transition-all duration-300 hover-lift hover-shimmer">
                  <CardHeader className="text-center">
                    <Users className="w-12 h-12 text-secondary mx-auto mb-4" />
                    <CardTitle>Beneficios Exclusivos</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground">
                      Disfruta descuentos, productos gratis y experiencias especiales
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-12 space-y-4"
            >
              <Button 
                onClick={() => navigate('/l/cafe-arregui')}
                className="gradient-brand text-primary-foreground h-12 px-8 text-lg hover-lift hover-glow animate-pulse-subtle"
              >
                Ver Demo - Tienda de Cafe Arregui
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button 
                onClick={() => navigate('/l/cafe-mendoza')}
                variant="outline"
                className="h-12 px-8 text-lg hover-lift"
              >
                Ver Demo - Tienda de Cafe Mendoza
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <div className="flex gap-4 justify-center">
                <Button 
                  onClick={() => navigate('/staff')}
                  variant="outline"
                  className="h-10"
                >
                  Panel Staff
                </Button>
                <Button 
                  onClick={() => navigate('/app/home')}
                  variant="outline"
                  className="h-10"
                >
                  Dashboard Cliente
                </Button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Index;
