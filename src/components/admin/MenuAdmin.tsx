import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Coffee, DollarSign, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MenuItem {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagen: string;
  disponible: boolean;
  orden: number;
  vegetariano: boolean;
  vegano: boolean;
  sin_gluten: boolean;
  ingredientes: string[];
  alergenos: string[];
  local_id: string;
  categoria_id: string;
  categoria: { nombre: string };
  local: { nombre: string };
}

interface MenuCategory {
  id: string;
  nombre: string;
  descripcion: string;
  orden: number;
  activo: boolean;
}

interface Local {
  id: string;
  nombre: string;
}

export function MenuAdmin() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [locales, setLocales] = useState<Local[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    imagen: '',
    disponible: true,
    vegetariano: false,
    vegano: false,
    sin_gluten: false,
    ingredientes: '',
    alergenos: '',
    local_id: '',
    categoria_id: '',
    orden: '0'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsResponse, categoriesResponse, localesResponse] = await Promise.all([
        supabase
          .from('menu_items')
          .select(`
            *,
            categoria:menu_categorias(nombre),
            local:locales(nombre)
          `)
          .order('orden'),
        supabase
          .from('menu_categorias')
          .select('*')
          .order('orden'),
        supabase
          .from('locales')
          .select('id, nombre')
          .eq('activo', true)
      ]);

      if (itemsResponse.error) throw itemsResponse.error;
      if (categoriesResponse.error) throw categoriesResponse.error;
      if (localesResponse.error) throw localesResponse.error;

      setMenuItems(itemsResponse.data || []);
      setCategories(categoriesResponse.data || []);
      setLocales(localesResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos del menú',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      imagen: '',
      disponible: true,
      vegetariano: false,
      vegano: false,
      sin_gluten: false,
      ingredientes: '',
      alergenos: '',
      local_id: '',
      categoria_id: '',
      orden: '0'
    });
    setEditingItem(null);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      nombre: item.nombre,
      descripcion: item.descripcion || '',
      precio: item.precio.toString(),
      imagen: item.imagen || '',
      disponible: item.disponible,
      vegetariano: item.vegetariano,
      vegano: item.vegano,
      sin_gluten: item.sin_gluten,
      ingredientes: item.ingredientes?.join(', ') || '',
      alergenos: item.alergenos?.join(', ') || '',
      local_id: item.local_id,
      categoria_id: item.categoria_id,
      orden: item.orden.toString()
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const itemData = {
      nombre: formData.nombre,
      descripcion: formData.descripcion || null,
      precio: parseFloat(formData.precio),
      imagen: formData.imagen || null,
      disponible: formData.disponible,
      vegetariano: formData.vegetariano,
      vegano: formData.vegano,
      sin_gluten: formData.sin_gluten,
      ingredientes: formData.ingredientes ? formData.ingredientes.split(',').map(i => i.trim()) : [],
      alergenos: formData.alergenos ? formData.alergenos.split(',').map(a => a.trim()) : [],
      local_id: formData.local_id,
      categoria_id: formData.categoria_id,
      orden: parseInt(formData.orden)
    };

    try {
      if (editingItem) {
        const { error } = await supabase
          .from('menu_items')
          .update(itemData)
          .eq('id', editingItem.id);
        
        if (error) throw error;
        
        toast({
          title: 'Éxito',
          description: 'Item del menú actualizado correctamente'
        });
      } else {
        const { error } = await supabase
          .from('menu_items')
          .insert(itemData);
        
        if (error) throw error;
        
        toast({
          title: 'Éxito',
          description: 'Item del menú creado correctamente'
        });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving menu item:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar el item del menú',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este item?')) return;

    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Item eliminado correctamente'
      });

      fetchData();
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el item',
        variant: 'destructive'
      });
    }
  };

  const toggleAvailability = async (id: string, disponible: boolean) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({ disponible: !disponible })
        .eq('id', id);

      if (error) throw error;

      fetchData();
    } catch (error) {
      console.error('Error updating availability:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la disponibilidad',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Cargando menú...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Menú</h2>
          <p className="text-muted-foreground">Administra los items del menú por local</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Editar Item' : 'Nuevo Item'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nombre">Nombre</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="precio">Precio</Label>
                  <Input
                    id="precio"
                    type="number"
                    step="0.01"
                    value={formData.precio}
                    onChange={(e) => setFormData({...formData, precio: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="local">Local</Label>
                  <Select
                    value={formData.local_id}
                    onValueChange={(value) => setFormData({...formData, local_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar local" />
                    </SelectTrigger>
                    <SelectContent>
                      {locales.map((local) => (
                        <SelectItem key={local.id} value={local.id}>
                          {local.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="categoria">Categoría</Label>
                  <Select
                    value={formData.categoria_id}
                    onValueChange={(value) => setFormData({...formData, categoria_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="imagen">URL de Imagen</Label>
                  <Input
                    id="imagen"
                    value={formData.imagen}
                    onChange={(e) => setFormData({...formData, imagen: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="orden">Orden</Label>
                  <Input
                    id="orden"
                    type="number"
                    value={formData.orden}
                    onChange={(e) => setFormData({...formData, orden: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="ingredientes">Ingredientes (separados por coma)</Label>
                <Input
                  id="ingredientes"
                  value={formData.ingredientes}
                  onChange={(e) => setFormData({...formData, ingredientes: e.target.value})}
                  placeholder="café, leche, azúcar"
                />
              </div>

              <div>
                <Label htmlFor="alergenos">Alérgenos (separados por coma)</Label>
                <Input
                  id="alergenos"
                  value={formData.alergenos}
                  onChange={(e) => setFormData({...formData, alergenos: e.target.value})}
                  placeholder="lácteos, gluten"
                />
              </div>

              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="disponible"
                    checked={formData.disponible}
                    onCheckedChange={(checked) => setFormData({...formData, disponible: checked})}
                  />
                  <Label htmlFor="disponible">Disponible</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="vegetariano"
                    checked={formData.vegetariano}
                    onCheckedChange={(checked) => setFormData({...formData, vegetariano: checked})}
                  />
                  <Label htmlFor="vegetariano">Vegetariano</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="vegano"
                    checked={formData.vegano}
                    onCheckedChange={(checked) => setFormData({...formData, vegano: checked})}
                  />
                  <Label htmlFor="vegano">Vegano</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="sin_gluten"
                    checked={formData.sin_gluten}
                    onCheckedChange={(checked) => setFormData({...formData, sin_gluten: checked})}
                  />
                  <Label htmlFor="sin_gluten">Sin Gluten</Label>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingItem ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coffee className="w-5 h-5" />
            Items del Menú
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Opciones</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {menuItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.nombre}</div>
                      {item.descripcion && (
                        <div className="text-sm text-muted-foreground">{item.descripcion}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{item.local?.nombre}</TableCell>
                  <TableCell>{item.categoria?.nombre}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {item.precio.toFixed(2)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={item.disponible}
                        onCheckedChange={() => toggleAvailability(item.id, item.disponible)}
                      />
                      {item.disponible ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {item.vegetariano && <Badge variant="outline" className="text-xs">Vegetariano</Badge>}
                      {item.vegano && <Badge variant="outline" className="text-xs">Vegano</Badge>}
                      {item.sin_gluten && <Badge variant="outline" className="text-xs">Sin Gluten</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}