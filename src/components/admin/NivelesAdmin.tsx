import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Trophy,
  Save,
  Cancel
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Nivel {
  id: string;
  nombre: string;
  descripcion: string;
  puntos_minimos: number;
  puntos_maximos: number | null;
  color: string;
  icono: string;
}

interface NivelesAdminProps {
  onUpdate: () => void;
}

export function NivelesAdmin({ onUpdate }: NivelesAdminProps) {
  const [niveles, setNiveles] = useState<Nivel[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNivel, setEditingNivel] = useState<Nivel | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    puntos_minimos: '0',
    puntos_maximos: '',
    color: '#666666',
    icono: '🥉'
  });
  const { toast } = useToast();

  useEffect(() => {
    loadNiveles();
  }, []);

  const loadNiveles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('niveles')
      .select('*')
      .order('puntos_minimos');

    if (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar los niveles',
        variant: 'destructive'
      });
    } else {
      setNiveles(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      puntos_minimos: '0',
      puntos_maximos: '',
      color: '#666666',
      icono: '🥉'
    });
    setEditingNivel(null);
  };

  const openEditDialog = (nivel: Nivel) => {
    setEditingNivel(nivel);
    setFormData({
      nombre: nivel.nombre,
      descripcion: nivel.descripcion || '',
      puntos_minimos: nivel.puntos_minimos.toString(),
      puntos_maximos: nivel.puntos_maximos?.toString() || '',
      color: nivel.color,
      icono: nivel.icono
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.puntos_minimos) {
      toast({
        title: 'Error',
        description: 'Nombre y puntos mínimos son requeridos',
        variant: 'destructive'
      });
      return;
    }

    const nivelData = {
      nombre: formData.nombre,
      descripcion: formData.descripcion || null,
      puntos_minimos: parseInt(formData.puntos_minimos),
      puntos_maximos: formData.puntos_maximos ? parseInt(formData.puntos_maximos) : null,
      color: formData.color,
      icono: formData.icono
    };

    // Validate ranges don't overlap
    const puntosMin = parseInt(formData.puntos_minimos);
    const puntosMax = formData.puntos_maximos ? parseInt(formData.puntos_maximos) : null;

    if (puntosMax && puntosMax <= puntosMin) {
      toast({
        title: 'Error',
        description: 'Los puntos máximos deben ser mayores a los mínimos',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (editingNivel) {
        const { error } = await supabase
          .from('niveles')
          .update(nivelData)
          .eq('id', editingNivel.id);

        if (error) throw error;

        toast({
          title: 'Éxito',
          description: 'Nivel actualizado correctamente'
        });
      } else {
        const { error } = await supabase
          .from('niveles')
          .insert(nivelData);

        if (error) throw error;

        toast({
          title: 'Éxito',
          description: 'Nivel creado correctamente'
        });
      }

      setDialogOpen(false);
      resetForm();
      loadNiveles();
      onUpdate();
    } catch (error) {
      console.error('Error saving nivel:', error);
      toast({
        title: 'Error',
        description: 'Error al guardar el nivel',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este nivel?')) return;

    try {
      const { error } = await supabase
        .from('niveles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Nivel eliminado correctamente'
      });
      
      loadNiveles();
      onUpdate();
    } catch (error) {
      console.error('Error deleting nivel:', error);
      toast({
        title: 'Error',
        description: 'Error al eliminar el nivel',
        variant: 'destructive'
      });
    }
  };

  const getPointsRange = (nivel: Nivel) => {
    if (nivel.puntos_maximos) {
      return `${nivel.puntos_minimos} - ${nivel.puntos_maximos} pts`;
    } else {
      return `${nivel.puntos_minimos}+ pts`;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando niveles...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Niveles</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Nivel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingNivel ? 'Editar Nivel' : 'Nuevo Nivel'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Bronce, Plata, Oro..."
                  />
                </div>
                <div>
                  <Label htmlFor="icono">Icono</Label>
                  <Input
                    id="icono"
                    value={formData.icono}
                    onChange={(e) => setFormData(prev => ({ ...prev, icono: e.target.value }))}
                    placeholder="🥉"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Descripción del nivel"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="puntos_minimos">Puntos Mínimos *</Label>
                  <Input
                    id="puntos_minimos"
                    type="number"
                    value={formData.puntos_minimos}
                    onChange={(e) => setFormData(prev => ({ ...prev, puntos_minimos: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="puntos_maximos">Puntos Máximos</Label>
                  <Input
                    id="puntos_maximos"
                    type="number"
                    value={formData.puntos_maximos}
                    onChange={(e) => setFormData(prev => ({ ...prev, puntos_maximos: e.target.value }))}
                    placeholder="100 (vacío = sin límite)"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="color">Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-20"
                  />
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="#666666"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmit} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {editingNivel ? 'Actualizar' : 'Crear'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                  className="flex-1"
                >
                  <Cancel className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Niveles List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {niveles.map((nivel, index) => (
          <motion.div
            key={nivel.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl"
                      style={{ backgroundColor: nivel.color }}
                    >
                      {nivel.icono}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{nivel.nombre}</CardTitle>
                      <div className="text-sm text-muted-foreground">
                        {getPointsRange(nivel)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(nivel)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(nivel.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {nivel.descripcion && (
                    <p className="text-sm text-muted-foreground">{nivel.descripcion}</p>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Desde:</span>
                      <div className="text-primary font-bold">{nivel.puntos_minimos} pts</div>
                    </div>
                    <div>
                      <span className="font-medium">Hasta:</span>
                      <div className="text-primary font-bold">
                        {nivel.puntos_maximos ? `${nivel.puntos_maximos} pts` : 'Sin límite'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <div 
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: nivel.color }}
                    ></div>
                    <span className="text-sm text-muted-foreground">{nivel.color}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {niveles.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No hay niveles registrados</h3>
          <p className="text-muted-foreground">Crea el primer nivel para comenzar.</p>
        </div>
      )}

    </div>
  );
}