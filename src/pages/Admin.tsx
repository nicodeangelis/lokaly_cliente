import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  MapPin, 
  Gift, 
  Users, 
  Trophy,
  Plus,
  LogOut
} from 'lucide-react';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Import admin components
import { LocalesAdmin } from '@/components/admin/LocalesAdmin';
import { BeneficiosAdmin } from '@/components/admin/BeneficiosAdmin';
import { StaffAdmin } from '@/components/admin/StaffAdmin';
import { NivelesAdmin } from '@/components/admin/NivelesAdmin';

interface Stats {
  totalLocales: number;
  totalBeneficios: number;
  totalStaff: number;
  totalUsuarios: number;
}

function Admin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    totalLocales: 0,
    totalBeneficios: 0,
    totalStaff: 0,
    totalUsuarios: 0
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }

      // Check if user has admin role
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (!userRole) {
        toast({
          title: 'Acceso denegado',
          description: 'No tienes permisos de administrador',
          variant: 'destructive'
        });
        navigate('/app/home');
        return;
      }

      setIsAdmin(true);
      await loadStats();
      setLoading(false);
    };

    checkAdminAccess();
  }, [navigate, toast]);

  const loadStats = async () => {
    try {
      const [localesRes, beneficiosRes, staffRes, usuariosRes] = await Promise.all([
        supabase.from('locales').select('id', { count: 'exact' }),
        supabase.from('beneficios').select('id', { count: 'exact' }),
        supabase.from('staff').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' })
      ]);

      setStats({
        totalLocales: localesRes.count || 0,
        totalBeneficios: beneficiosRes.count || 0,
        totalStaff: staffRes.count || 0,
        totalUsuarios: usuariosRes.count || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Panel de Administración - Lokaly</title>
        <meta name="description" content="Panel de administración para gestionar locales, beneficios y staff" />
      </Helmet>

      <div className="min-h-screen gradient-subtle relative">
        <AnimatedBackground variant="default" />
        
        {/* Header */}
        <div className="bg-background/80 backdrop-blur-sm shadow-soft border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold text-primary">Panel de Administración</h1>
                <p className="text-sm text-muted-foreground">Gestión del sistema Lokaly</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
              <LogOut className="w-4 h-4" />
              Salir
            </Button>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 relative z-10">
          
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Locales</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalLocales}</div>
                <p className="text-xs text-muted-foreground">Locales registrados</p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Beneficios</CardTitle>
                <Gift className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBeneficios}</div>
                <p className="text-xs text-muted-foreground">Beneficios activos</p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Staff</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStaff}</div>
                <p className="text-xs text-muted-foreground">Miembros del staff</p>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsuarios}</div>
                <p className="text-xs text-muted-foreground">Usuarios registrados</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Admin Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Tabs defaultValue="locales" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="locales" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Locales
                </TabsTrigger>
                <TabsTrigger value="beneficios" className="flex items-center gap-2">
                  <Gift className="w-4 h-4" />
                  Beneficios
                </TabsTrigger>
                <TabsTrigger value="staff" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Staff
                </TabsTrigger>
                <TabsTrigger value="niveles" className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Niveles
                </TabsTrigger>
              </TabsList>

              <TabsContent value="locales">
                <LocalesAdmin onUpdate={loadStats} />
              </TabsContent>

              <TabsContent value="beneficios">
                <BeneficiosAdmin onUpdate={loadStats} />
              </TabsContent>

              <TabsContent value="staff">
                <StaffAdmin onUpdate={loadStats} />
              </TabsContent>

              <TabsContent value="niveles">
                <NivelesAdmin onUpdate={loadStats} />
              </TabsContent>
            </Tabs>
          </motion.div>

        </div>
      </div>
    </>
  );
}

export default Admin;