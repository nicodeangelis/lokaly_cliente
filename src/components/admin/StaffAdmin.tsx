import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  MapPin,
  Mail,
  Save,
  Cancel
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StaffMember {
  id: string;
  user_id: string;
  activo: boolean;
  local_id: {
    id: string;
    nombre: string;
  } | null;
  profiles: {
    email: string;
    nombre: string;
  } | null;
}

interface Local {
  id: string;
  nombre: string;
}

interface StaffAdminProps {
  onUpdate: () => void;
}

export function StaffAdmin({ onUpdate }: StaffAdminProps) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [locales, setLocales] = useState<Local[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    nombre: '',
    local_id: '',
    activo: true
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    const [staffRes, localesRes] = await Promise.all([
      supabase
        .from('staff')
        .select(`
          *,
          local_id:locales(id, nombre),
          profiles:user_id(email, nombre)
        `)
        .order('created_at', { ascending: false }),
      supabase
        .from('locales')
        .select('id, nombre')
        .eq('activo', true)
        .order('nombre')
    ]);

    if (staffRes.error) {
      toast({
        title: 'Error',
        description: 'Error al cargar el staff',
        variant: 'destructive'
      });
    } else {
      setStaff(staffRes.data || []);
    }

    if (localesRes.data) setLocales(localesRes.data);
    
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      nombre: '',
      local_id: '',
      activo: true
    });
    setEditingStaff(null);
  };

  const openEditDialog = (staffMember: StaffMember) => {
    setEditingStaff(staffMember);
    setFormData({
      email: staffMember.profiles?.email || '',
      nombre: staffMember.profiles?.nombre || '',
      local_id: staffMember.local_id?.id || '',
      activo: staffMember.activo
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.nombre || !formData.local_id) {
      toast({
        title: 'Error',
        description: 'Todos los campos son requeridos',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (editingStaff) {
        // Update existing staff member
        const { error: staffError } = await supabase
          .from('staff')
          .update({
            local_id: formData.local_id,
            activo: formData.activo
          })
          .eq('id', editingStaff.id);

        if (staffError) throw staffError;

        // Update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            nombre: formData.nombre
          })
          .eq('id', editingStaff.user_id);

        if (profileError) throw profileError;

        toast({
          title: 'Éxito',
          description: 'Staff actualizado correctamente'
        });
      } else {
        // Create new user account
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: 'temporal123', // Temporary password
          options: {
            data: {
              nombre: formData.nombre
            }
          }
        });

        if (authError) throw authError;

        if (authData.user) {
          // Add staff role
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: authData.user.id,
              role: 'staff'
            });

          if (roleError) throw roleError;

          // Add to staff table
          const { error: staffError } = await supabase
            .from('staff')
            .insert({
              user_id: authData.user.id,
              local_id: formData.local_id,
              activo: formData.activo
            });

          if (staffError) throw staffError;

          toast({
            title: 'Éxito',
            description: 'Staff creado correctamente. Se envió un email de confirmación.'
          });
        }
      }

      setDialogOpen(false);
      resetForm();
      loadData();
      onUpdate();
    } catch (error) {
      console.error('Error saving staff:', error);
      toast({
        title: 'Error',
        description: 'Error al guardar el staff',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (staffMember: StaffMember) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este miembro del staff?')) return;

    try {
      // Remove staff record
      const { error: staffError } = await supabase
        .from('staff')
        .delete()
        .eq('id', staffMember.id);

      if (staffError) throw staffError;

      // Remove staff role
      const { error: roleError } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', staffMember.user_id)
        .eq('role', 'staff');

      if (roleError) throw roleError;

      toast({
        title: 'Éxito',
        description: 'Staff eliminado correctamente'
      });
      
      loadData();
      onUpdate();
    } catch (error) {
      console.error('Error deleting staff:', error);
      toast({
        title: 'Error',
        description: 'Error al eliminar el staff',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando staff...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestión de Staff</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Staff
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingStaff ? 'Editar Staff' : 'Nuevo Staff'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="staff@lokaly.com"
                  disabled={!!editingStaff}
                />
                {editingStaff && (
                  <p className="text-sm text-muted-foreground mt-1">
                    El email no se puede modificar
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="nombre">Nombre Completo *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Nombre del empleado"
                />
              </div>

              <div>
                <Label htmlFor="local_id">Local Asignado *</Label>
                <Select value={formData.local_id} onValueChange={(value) => setFormData(prev => ({ ...prev, local_id: value }))}>
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

              <div className="flex items-center space-x-2">
                <Switch
                  id="activo"
                  checked={formData.activo}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, activo: checked }))}
                />
                <Label htmlFor="activo">Staff activo</Label>
              </div>

              {!editingStaff && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    Se creará una cuenta nueva con contraseña temporal: <strong>temporal123</strong>
                    <br />
                    El usuario recibirá un email para confirmar su cuenta.
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmit} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  {editingStaff ? 'Actualizar' : 'Crear'}
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

      {/* Staff List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((staffMember, index) => (
          <motion.div
            key={staffMember.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="shadow-soft">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {staffMember.profiles?.nombre || 'Sin nombre'}
                      </CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span>{staffMember.profiles?.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(staffMember)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(staffMember)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{staffMember.local_id?.nombre || 'Sin local asignado'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Estado:</span>
                    <span className={`text-sm ${staffMember.activo ? 'text-success' : 'text-destructive'}`}>
                      {staffMember.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {staff.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No hay staff registrado</h3>
          <p className="text-muted-foreground">Crea el primer miembro del staff para comenzar.</p>
        </div>
      )}

    </div>
  );
}