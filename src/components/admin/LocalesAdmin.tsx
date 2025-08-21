import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  MapPin,
  Phone,
  Clock,
  Save,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Local {
  id: string;
  nombre: string;
  direccion: string;
  latitud: number | null;
  longitud: number | null;
  telefono: string | null;
  email: string | null;
  horarios: any;
  descripcion: string | null;
  imagen: string | null;
  activo: boolean;
}

interface LocalesAdminProps {
  onUpdate: () => void;
}

export function LocalesAdmin({ onUpdate }: LocalesAdminProps) {
  const [locales, setLocales] = useState<Local[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocal, setEditingLocal] = useState<Local | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    latitud: '',
    longitud: '',
    telefono: '',
    email: '',
    descripcion: '',
    imagen: '',
    activo: true,
    horarios: {
      lunes: '07:00-19:00',
      martes: '07:00-19:00',
      miercoles: '07:00-19:00',
      jueves: '07:00-19:00',
      viernes: '07:00-19:00',
      sabado: '08:00-20:00',
      domingo: '09:00-18:00'
    }
  });
  const { toast } = useToast();

  useEffect(() => {
    loadLocales();
  }, []);

  const loadLocales = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('locales')
      .select('*')
      .order('nombre');

    if (error) {
      toast({
        title: 'Error',
        description: 'Error al cargar los locales',
        variant: 'destructive'
      });
    } else {
      setLocales(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      direccion: '',
      latitud: '',
      longitud: '',
      telefono: '',
      email: '',
      descripcion: '',
      imagen: '',
      activo: true,
      horarios: {
        lunes: '07:00-19:00',
        martes: '07:00-19:00',
        miercoles: '07:00-19:00',
        jueves: '07:00-19:00',
        viernes: '07:00-19:00',
        sabado: '08:00-20:00',
        domingo: '09:00-18:00'
      }
    });
    setEditingLocal(null);
  };

  const openEditDialog = (local: Local) => {
    setEditingLocal(local);
    setFormData({
      nombre: local.nombre,
      direccion: local.direccion,
      latitud: local.latitud?.toString() || '',
      longitud: local.longitud?.toString() || '',
      telefono: local.telefono || '',
      email: local.email || '',
      descripcion: local.descripcion || '',
      imagen: local.imagen || '',
      activo: local.activo,
      horarios: local.horarios || {
        lunes: '07:00-19:00',
        martes: '07:00-19:00',
        miercoles: '07:00-19:00',
        jueves: '07:00-19:00',
        viernes: '07:00-19:00',
        sabado: '08:00-20:00',
        domingo: '09:00-18:00'
      }
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.nombre || !formData.direccion) {
      toast({
        title: 'Error',
        description: 'Nombre y dirección son requeridos',
        variant: 'destructive'
      });
      return;
    }

    const localData = {
      nombre: formData.nombre,
      direccion: formData.direccion,
      latitud: formData.latitud ? parseFloat(formData.latitud) : null,
      longitud: formData.longitud ? parseFloat(formData.longitud) : null,
      telefono: formData.telefono || null,
      email: formData.email || null,
      descripcion: formData.descripcion || null,
      imagen: formData.imagen || null,
      activo: formData.activo,
      horarios: formData.horarios
    };

    try {
      if (editingLocal) {
        const { error } = await supabase
          .from('locales')
          .update(localData)
          .eq('id', editingLocal.id);

        if (error) throw error;

        toast({
          title: 'Éxito',
          description: 'Local actualizado correctamente'
        });
      } else {
        const { error } = await supabase
          .from('locales')
          .insert(localData);

        if (error) throw error;

        toast({
          title: 'Éxito',
          description: 'Local creado correctamente'
        });
      }

      setDialogOpen(false);
      resetForm();
      loadLocales();
      onUpdate();
    } catch (error) {
      console.error('Error saving local:', error);
      toast({
        title: 'Error',
        description: 'Error al guardar el local',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este local?')) return;

    try {
      const { error } = await supabase
        .from('locales')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Local eliminado correctamente'
      });
      
      loadLocales();
      onUpdate();
    } catch (error) {
      console.error('Error deleting local:', error);
      toast({
        title: 'Error',
        description: 'Error al eliminar el local',
        variant: 'destructive'
      });
    }
  };

  const updateHorario = (day: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      horarios: {
        ...prev.horarios,
        [day]: value
      }
    }));
  };

  if (loading) {
    return <div className="text-center py-8">Cargando locales...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Locales</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Local
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingLocal ? 'Editar Local' : 'Nuevo Local'}
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
                    placeholder="Nombre del local"
                  />
                </div>
                <div>
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                    placeholder="+54 11 1234-5678"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="direccion">Dirección *</Label>
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => setFormData(prev => ({ ...prev, direccion: e.target.value }))}
                  placeholder="Dirección completa"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitud">Latitud</Label>
                  <Input
                    id="latitud"
                    type="number"
                    step="any"
                    value={formData.latitud}
                    onChange={(e) => setFormData(prev => ({ ...prev, latitud: e.target.value }))}
                    placeholder="-34.6037"
                  />
                </div>
                <div>
                  <Label htmlFor="longitud">Longitud</Label>
                  <Input
                    id="longitud"
                    type="number"
                    step="any"
                    value={formData.longitud}
                    onChange={(e) => setFormData(prev => ({ ...prev, longitud: e.target.value }))}
                    placeholder="-58.3816"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contacto@local.com"
                />
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                  placeholder="Descripción del local"
                />
              </div>

              <div>
                <Label htmlFor="imagen">URL de Imagen</Label>
                <Input
                  id="imagen"
                  value={formData.imagen}
                  onChange={(e) => setFormData(prev => ({ ...prev, imagen: e.target.value }))}
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
              </div>

              {/* Horarios */}
              <div>
                <Label>Horarios</Label>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {Object.entries(formData.horarios).map(([day, time]) => (
                    <div key={day} className="flex items-center gap-2">
                      <div className="w-20 text-sm font-medium capitalize">{day}:</div>
                      <Input
                        value={time}
                        onChange={(e) => updateHorario(day, e.target.value)}
                        placeholder="07:00-19:00"
                        className="flex-1"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="activo"
                  checked={formData.activo}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, activo: checked }))}
                />
                <Label htmlFor="activo">Local activo</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmit} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {editingLocal ? 'Actualizar' : 'Crear'}
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

      {/* Locales List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locales.map((local, index) => (
          <motion.div
            key={local.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{local.nombre}</CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>{local.direccion}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(local)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(local.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {local.imagen && (
                  <img 
                    src={local.imagen} 
                    alt={local.nombre}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                
                {local.descripcion && (
                  <p className="text-sm text-muted-foreground mb-3">{local.descripcion}</p>
                )}
                
                <div className="space-y-2 text-sm">
                  {local.telefono && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      <span>{local.telefono}</span>
                    </div>
                  )}
                  
                  {local.latitud && local.longitud && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{local.latitud}, {local.longitud}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className={local.activo ? 'text-success' : 'text-destructive'}>
                      {local.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {locales.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No hay locales registrados</h3>
          <p className="text-muted-foreground">Crea el primer local para comenzar.</p>
        </div>
      )}

    </div>
  );
}