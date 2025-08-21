import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Search,
  DollarSign,
  Leaf,
  WheatOff,
  Heart
} from 'lucide-react';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { BottomNavigation } from '@/components/BottomNavigation';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MenuItem {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  vegetariano: boolean;
  vegano: boolean;
  sin_gluten: boolean;
  ingredientes: string[];
  alergenos: string[];
}

interface MenuCategory {
  id: string;
  nombre: string;
  descripcion: string;
  items: MenuItem[];
}

interface Local {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
}

function Menu() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [local, setLocal] = useState<Local | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocal, setSelectedLocal] = useState<string>('');
  const [locales, setLocales] = useState<Local[]>([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchLocales();
    const localIdFromUrl = searchParams.get('local');
    if (localIdFromUrl) {
      setSelectedLocal(localIdFromUrl);
      fetchMenuData(localIdFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedLocal) {
      fetchMenuData(selectedLocal);
    }
  }, [selectedLocal]);

  const fetchLocales = async () => {
    try {
      const { data, error } = await supabase
        .from('locales')
        .select('id, nombre, direccion, telefono')
        .eq('activo', true)
        .order('nombre');

      if (error) throw error;

      setLocales(data || []);
    } catch (error) {
      console.error('Error fetching locales:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los locales',
        variant: 'destructive'
      });
    }
  };

  const fetchMenuData = async (localId: string) => {
    try {
      setLoading(true);

      // Fetch local info
      const { data: localData, error: localError } = await supabase
        .from('locales')
        .select('id, nombre, direccion, telefono')
        .eq('id', localId)
        .single();

      if (localError) throw localError;
      setLocal(localData);

      // Fetch categories with menu items
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('menu_categorias')
        .select('*')
        .eq('activo', true)
        .order('orden');

      if (categoriesError) throw categoriesError;

      // Fetch menu items for this local
      const { data: itemsData, error: itemsError } = await supabase
        .from('menu_items')
        .select('*')
        .eq('local_id', localId)
        .eq('disponible', true)
        .order('orden');

      if (itemsError) throw itemsError;

      // Group items by category
      const categoriesWithItems = categoriesData.map(category => ({
        ...category,
        items: itemsData.filter(item => item.categoria_id === category.id)
      }));

      setCategories(categoriesWithItems);
    } catch (error) {
      console.error('Error fetching menu data:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar el menú',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = categories.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  if (loading) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Cargando menú...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{local ? `Menú - ${local.nombre}` : 'Menú'} - Lokaly</title>
        <meta name="description" content={`Descubre el delicioso menú de ${local?.nombre || 'nuestros locales'}`} />
      </Helmet>

      <div className="min-h-screen gradient-subtle relative">
        <AnimatedBackground variant="loyalty" />
        
        {/* Header */}
        <div className="bg-background/80 backdrop-blur-sm shadow-soft border-b">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/app/home')} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-primary">
                {local ? local.nombre : 'Menú'}
              </h1>
              <p className="text-sm text-muted-foreground">
                {local ? local.direccion : 'Selecciona un local para ver el menú'}
              </p>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 relative z-10">
          {/* Local Selector */}
          <div className="mb-6">
            <Select value={selectedLocal} onValueChange={setSelectedLocal}>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Selecciona un local" />
              </SelectTrigger>
              <SelectContent>
                {locales.map((local) => (
                  <SelectItem key={local.id} value={local.id}>
                    <div>
                      <div className="font-medium">{local.nombre}</div>
                      <div className="text-sm text-muted-foreground">{local.direccion}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedLocal && local && (
            <>
              {/* Search */}
              <div className="mb-6">
                <div className="relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar en el menú..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Menu Categories */}
              <Tabs defaultValue={categories[0]?.id} className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
                  {categories.map((category) => (
                    <TabsTrigger key={category.id} value={category.id} className="text-sm">
                      {category.nombre}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {filteredCategories.map((category) => (
                  <TabsContent key={category.id} value={category.id}>
                    <div className="space-y-4">
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-primary">{category.nombre}</h2>
                        {category.descripcion && (
                          <p className="text-muted-foreground">{category.descripcion}</p>
                        )}
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {category.items.map((item) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Card className="h-full hover:shadow-medium transition-shadow">
                              <CardContent className="p-4">
                                {item.imagen && (
                                  <div className="aspect-video mb-3 rounded-lg overflow-hidden bg-muted">
                                    <img
                                      src={item.imagen}
                                      alt={item.nombre}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                )}
                                
                                <div className="space-y-2">
                                  <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-lg">{item.nombre}</h3>
                                    <div className="flex items-center text-primary font-bold">
                                      <DollarSign className="w-4 h-4" />
                                      {item.precio.toFixed(2)}
                                    </div>
                                  </div>

                                  {item.descripcion && (
                                    <p className="text-sm text-muted-foreground">{item.descripcion}</p>
                                  )}

                                  {/* Dietary badges */}
                                  <div className="flex gap-1 flex-wrap">
                                    {item.vegetariano && (
                                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                        <Leaf className="w-3 h-3 mr-1" />
                                        Vegetariano
                                      </Badge>
                                    )}
                                    {item.vegano && (
                                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                        <Heart className="w-3 h-3 mr-1" />
                                        Vegano
                                      </Badge>
                                    )}
                                    {item.sin_gluten && (
                                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                        <WheatOff className="w-3 h-3 mr-1" />
                                        Sin Gluten
                                      </Badge>
                                    )}
                                  </div>

                                  {/* Ingredients */}
                                  {item.ingredientes && item.ingredientes.length > 0 && (
                                    <div className="text-xs text-muted-foreground">
                                      <strong>Ingredientes:</strong> {item.ingredientes.join(', ')}
                                    </div>
                                  )}

                                  {/* Allergens */}
                                  {item.alergenos && item.alergenos.length > 0 && (
                                    <div className="text-xs text-muted-foreground">
                                      <strong>Alérgenos:</strong> {item.alergenos.join(', ')}
                                    </div>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>

                      {category.items.length === 0 && (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">No hay items disponibles en esta categoría</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              {filteredCategories.length === 0 && searchTerm && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No se encontraron items que coincidan con tu búsqueda</p>
                </div>
              )}
            </>
          )}

          {!selectedLocal && (
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">Selecciona un Local</h2>
              <p className="text-muted-foreground">Elige un local para ver su menú completo</p>
            </div>
          )}
        </div>
        
        {/* Bottom Navigation */}
        <BottomNavigation />
        
        {/* Bottom padding to avoid overlap with navigation */}
        <div className="h-20"></div>
      </div>
    </>
  );
}

export default Menu;