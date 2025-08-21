import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Gift,
  Tag,
  Star,
  Save,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Beneficio {
  id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  valor: string;
  puntos_requeridos: number;
  activo: boolean;
  nivel_requerido: {
    id: string;
    nombre: string;
    icono: string;
  } | null;
  local_id: {
    id: string;
    nombre: string;
  } | null;
}

interface Nivel {
  id: string;
  nombre: string;
  icono: string;
}

interface Local {
  id: string;
  nombre: string;
}

interface BeneficiosAdminProps {
  onUpdate: () => void;
}

export function BeneficiosAdmin({ onUpdate }: BeneficiosAdminProps) {
  const [beneficios, setBeneficios] = useState<Beneficio[]>([]);
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [locales, setLocales] = useState<Local[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBeneficio, setEditingBeneficio] = useState<Beneficio | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    tipo: 'descuento',
    valor: '',
    puntos_requeridos: '0',
    nivel_requerido: '',
    local_id: '',
    activo: true
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    const [beneficiosRes, nivelesRes, localesRes] = await Promise.all([
      supabase
        .from('beneficios')
        .select(`
          *,
          nivel_requerido:niveles(id, nombre, icono),
          local_id:locales(id, nombre)
        `)
        .order('titulo'),
      supabase
        .from('niveles')
        .select('id, nombre, icono')
        .order('puntos_minimos'),
      supabase
        .from('locales')
        .select('id, nombre')
        .eq('activo', true)
        .order('nombre')
    ]);

    if (beneficiosRes.error) {
      toast({
        title: 'Error',
        description: 'Error al cargar los beneficios',
        variant: 'destructive'
      });
    } else {
      setBeneficios(beneficiosRes.data || []);
    }

    if (nivelesRes.data) setNiveles(nivelesRes.data);
    if (localesRes.data) setLocales(localesRes.data);
    
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      titulo: '',
      descripcion: '',
      tipo: 'descuento',
      valor: '',
      puntos_requeridos: '0',
      nivel_requerido: '',
      local_id: '',
      activo: true
    });
    setEditingBeneficio(null);
  };

  const openEditDialog = (beneficio: Beneficio) => {
    setEditingBeneficio(beneficio);
    setFormData({
      titulo: beneficio.titulo,
      descripcion: beneficio.descripcion || '',
      tipo: beneficio.tipo,
      valor: beneficio.valor,
      puntos_requeridos: beneficio.puntos_requeridos.toString(),
      nivel_requerido: beneficio.nivel_requerido?.id || '',
      local_id: beneficio.local_id?.id || '',
      activo: beneficio.activo
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.titulo || !formData.valor) {
      toast({
        title: 'Error',
        description: 'Título y valor son requeridos',
        variant: 'destructive'
      });
      return;
    }

    const beneficioData = {
      titulo: formData.titulo,
      descripcion: formData.descripcion || null,
      tipo: formData.tipo,
      valor: formData.valor,
      puntos_requeridos: parseInt(formData.puntos_requeridos) || 0,
      nivel_requerido: formData.nivel_requerido || null,
      local_id: formData.local_id || null,
      activo: formData.activo
    };

    try {
      if (editingBeneficio) {
        const { error } = await supabase
          .from('beneficios')
          .update(beneficioData)
          .eq('id', editingBeneficio.id);

        if (error) throw error;

        toast({
          title: 'Éxito',
          description: 'Beneficio actualizado correctamente'
        });
      } else {
        const { error } = await supabase
          .from('beneficios')
          .insert(beneficioData);

        if (error) throw error;

        toast({
          title: 'Éxito',
          description: 'Beneficio creado correctamente'
        });
      }

      setDialogOpen(false);
      resetForm();
      loadData();
      onUpdate();
    } catch (error) {
      console.error('Error saving beneficio:', error);
      toast({
        title: 'Error',
        description: 'Error al guardar el beneficio',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este beneficio?')) return;

    try {
      const { error } = await supabase
        .from('beneficios')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Beneficio eliminado correctamente'
      });
      
      loadData();
      onUpdate();
    } catch (error) {
      console.error('Error deleting beneficio:', error);
      toast({
        title: 'Error',
        description: 'Error al eliminar el beneficio',
        variant: 'destructive'
      });
    }
  };

  const getBenefitIcon = (tipo: string) => {
    switch (tipo) {
      case 'descuento':
        return <Tag className="w-5 h-5" />;
      case 'regalo':
        return <Gift className="w-5 h-5" />;
      case 'puntos_extra':
        return <Star className="w-5 h-5" />;
      default:
        return <Gift className="w-5 h-5" />;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando beneficios...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Beneficios</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Beneficio
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingBeneficio ? 'Editar Beneficio' : 'Nuevo Beneficio'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  placeholder="Nombre del beneficio"
                />
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Descripción del beneficio"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="descuento">Descuento</SelectItem>
                      <SelectItem value="regalo">Regalo</SelectItem>
                      <SelectItem value="puntos_extra">Puntos Extra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="valor">Valor *</Label>
                  <Input
                    id="valor"
                    value={formData.valor}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                    placeholder="10%, Café gratis, +50 pts"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="puntos_requeridos">Puntos Requeridos</Label>
                <Input
                  id="puntos_requeridos"
                  type="number"
                  value={formData.puntos_requeridos}
                  onChange={(e) => setFormData(prev => ({ ...prev, puntos_requeridos: e.target.value }))}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="nivel_requerido">Nivel Requerido</Label>
                <Select value={formData.nivel_requerido} onValueChange={(value) => setFormData(prev => ({ ...prev, nivel_requerido: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin restricción de nivel</SelectItem>
                    {niveles.map((nivel) => (
                      <SelectItem key={nivel.id} value={nivel.id}>
                        {nivel.icono} {nivel.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="local_id">Local Específico (Opcional)</Label>
                <Select value={formData.local_id} onValueChange={(value) => setFormData(prev => ({ ...prev, local_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los locales" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos los locales</SelectItem>
                    {locales.map((local) => (
                      <SelectItem key={local.id} value={local.id}>
                        {local.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="activo"
                  checked={formData.activo}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, activo: checked }))}
                />
                <Label htmlFor="activo">Beneficio activo</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmit} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {editingBeneficio ? 'Actualizar' : 'Crear'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Beneficios List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {beneficios.map((beneficio, index) => (
          <motion.div
            key={beneficio.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {getBenefitIcon(beneficio.tipo)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{beneficio.titulo}</CardTitle>
                      <div className="text-sm text-muted-foreground">
                        {beneficio.descripcion}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(beneficio)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(beneficio.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-primary">{beneficio.valor}</div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {beneficio.nivel_requerido ? (
                        <>
                          {beneficio.nivel_requerido.icono} {beneficio.nivel_requerido.nombre}
                        </>
                      ) : (
                        'Todos los niveles'
                      )}
                    </span>
                    {beneficio.puntos_requeridos > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4" />
                        {beneficio.puntos_requeridos} pts
                      </span>
                    )}
                  </div>

                  {beneficio.local_id && (
                    <div className="text-sm text-muted-foreground">
                      📍 {beneficio.local_id.nombre}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{beneficio.tipo}</span>
                    <span className={`text-sm ${beneficio.activo ? 'text-success' : 'text-destructive'}`}>
                      {beneficio.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {beneficios.length === 0 && (
        <div className="text-center py-12">
          <Gift className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No hay beneficios registrados</h3>
          <p className="text-muted-foreground">Crea el primer beneficio para comenzar.</p>
        </div>
      )}

    </div>
  );
}