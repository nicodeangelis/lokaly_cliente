import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from '@/components/ui/button';
import { Home, ArrowLeft, SearchX } from 'lucide-react';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <Helmet>
        <title>Página no encontrada - Lokaly</title>
        <meta name="description" content="La página que buscas no existe" />
      </Helmet>

      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md mx-auto px-6"
        >
          <motion.div
            initial={{ rotateY: 0 }}
            animate={{ rotateY: [0, 15] }}
            transition={{ duration: 1, repeat: Infinity, repeatType: "reverse", repeatDelay: 3 }}
            className="mb-8"
          >
            <div className="w-24 h-24 gradient-secondary rounded-full flex items-center justify-center mx-auto mb-6 shadow-elegant">
              <SearchX className="w-12 h-12 text-secondary-foreground" />
            </div>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl font-bold mb-4 gradient-brand bg-clip-text text-transparent"
          >
            404
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-muted-foreground mb-8"
          >
            Oops! La página que buscas no existe
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button 
              onClick={() => navigate('/')}
              className="gradient-brand text-primary-foreground h-12 px-6"
            >
              <Home className="mr-2 w-5 h-5" />
              Ir al Inicio
            </Button>
            
            <Button 
              onClick={() => navigate(-1)}
              variant="outline"
              className="h-12 px-6"
            >
              <ArrowLeft className="mr-2 w-5 h-5" />
              Volver Atrás
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-muted-foreground mt-8"
          >
            Ruta intentada: <code className="px-2 py-1 bg-muted rounded text-muted-foreground">{location.pathname}</code>
          </motion.p>
        </motion.div>
      </div>
    </>
  );
};

export default NotFound;
