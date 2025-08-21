import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Coffee, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface PreferencesModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (preferences: any) => void;
  loading?: boolean;
}

const COFFEE_TYPES = [
  { value: 'espresso', label: 'Espresso' },
  { value: 'americano', label: 'Americano' },
  { value: 'latte', label: 'Latte' },
  { value: 'capuccino', label: 'Cappuccino' },
  { value: 'cortado', label: 'Cortado' },
  { value: 'flat_white', label: 'Flat White' },
  { value: 'cold_brew', label: 'Cold Brew' },
  { value: 'frappuccino', label: 'Frappuccino' },
  { value: 'negro', label: 'Café Negro' }
];

const MILK_TYPES = [
  { value: 'entera', label: 'Leche Entera' },
  { value: 'descremada', label: 'Leche Descremada' },
  { value: 'sin_lactosa', label: 'Sin Lactosa' },
  { value: 'avena', label: 'Leche de Avena' },
  { value: 'almendra', label: 'Leche de Almendra' },
  { value: 'soja', label: 'Leche de Soja' },
  { value: 'coco', label: 'Leche de Coco' },
  { value: 'ninguna', label: 'Sin Leche' }
];

const EXTRAS = [
  { value: 'canela', label: 'Canela' },
  { value: 'chocolate', label: 'Chocolate' },
  { value: 'vainilla', label: 'Vainilla' },
  { value: 'caramelo', label: 'Caramelo' },
  { value: 'miel', label: 'Miel' },
  { value: 'stevia', label: 'Stevia' },
  { value: 'azucar_morena', label: 'Azúcar Morena' },
  { value: 'crema_batida', label: 'Crema Batida' }
];

const TIME_PREFERENCES = [
  { value: 'maniana', label: 'Mañana' },
  { value: 'tarde', label: 'Tarde' },
  { value: 'noche', label: 'Noche' }
];

export const PreferencesModal: React.FC<PreferencesModalProps> = ({
  open,
  onClose,
  onSave,
  loading = false
}) => {
  const [preferences, setPreferences] = useState({
    gusto_cafe: '',
    intensidad: 3,
    dulzor: 3,
    tipo_leche: '',
    extras: [] as string[],
    horario_pref: [] as string[],
    comentario: ''
  });

  const handleIntensityChange = (value: number) => {
    setPreferences(prev => ({ ...prev, intensidad: value }));
  };

  const handleSweetnessChange = (value: number) => {
    setPreferences(prev => ({ ...prev, dulzor: value }));
  };

  const toggleExtra = (extra: string) => {
    setPreferences(prev => ({
      ...prev,
      extras: prev.extras.includes(extra)
        ? prev.extras.filter(e => e !== extra)
        : [...prev.extras, extra]
    }));
  };

  const toggleTimePreference = (time: string) => {
    setPreferences(prev => ({
      ...prev,
      horario_pref: prev.horario_pref.includes(time)
        ? prev.horario_pref.filter(t => t !== time)
        : [...prev.horario_pref, time]
    }));
  };

  const handleSave = () => {
    const cleanedPreferences = {
      ...preferences,
      gusto_cafe: preferences.gusto_cafe || null,
      tipo_leche: preferences.tipo_leche || null,
      extras: preferences.extras.length > 0 ? preferences.extras : null,
      horario_pref: preferences.horario_pref.length > 0 ? preferences.horario_pref : null,
      comentario: preferences.comentario || null
    };
    onSave(cleanedPreferences);
  };

  const StarRating = ({ value, onChange, label }: { value: number, onChange: (value: number) => void, label: string }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`w-6 h-6 transition-colors ${
              star <= value ? 'text-yellow-500' : 'text-muted-foreground'
            }`}
          >
            ★
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {value === 1 && 'Muy suave'}
        {value === 2 && 'Suave'}
        {value === 3 && 'Medio'}
        {value === 4 && 'Fuerte'}
        {value === 5 && 'Muy fuerte'}
      </p>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coffee className="w-5 h-5 text-primary" />
            Tus gustos ☕️ (opcional)
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Usamos esto para personalizar los beneficios que vas a recibir.
          </p>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Tipo de café */}
          <div className="space-y-2">
            <Label htmlFor="coffee-type">Tipo de café favorito</Label>
            <Select
              value={preferences.gusto_cafe}
              onValueChange={(value) => setPreferences(prev => ({ ...prev, gusto_cafe: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu café favorito" />
              </SelectTrigger>
              <SelectContent>
                {COFFEE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Intensidad y Dulzor */}
          <div className="grid grid-cols-2 gap-4">
            <StarRating
              value={preferences.intensidad}
              onChange={handleIntensityChange}
              label="Intensidad"
            />
            <StarRating
              value={preferences.dulzor}
              onChange={handleSweetnessChange}
              label="Dulzor"
            />
          </div>

          {/* Tipo de leche */}
          <div className="space-y-2">
            <Label htmlFor="milk-type">Tipo de leche</Label>
            <Select
              value={preferences.tipo_leche}
              onValueChange={(value) => setPreferences(prev => ({ ...prev, tipo_leche: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu tipo de leche" />
              </SelectTrigger>
              <SelectContent>
                {MILK_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Extras */}
          <div className="space-y-2">
            <Label>Extras favoritos</Label>
            <div className="flex flex-wrap gap-2">
              {EXTRAS.map((extra) => (
                <Badge
                  key={extra.value}
                  variant={preferences.extras.includes(extra.value) ? "default" : "outline"}
                  className="cursor-pointer transition-colors"
                  onClick={() => toggleExtra(extra.value)}
                >
                  {extra.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Horarios */}
          <div className="space-y-2">
            <Label>¿Cuándo tomás café?</Label>
            <div className="flex gap-2">
              {TIME_PREFERENCES.map((time) => (
                <Badge
                  key={time.value}
                  variant={preferences.horario_pref.includes(time.value) ? "default" : "outline"}
                  className="cursor-pointer transition-colors"
                  onClick={() => toggleTimePreference(time.value)}
                >
                  {time.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Comentario */}
          <div className="space-y-2">
            <Label htmlFor="comment">Comentario adicional</Label>
            <Textarea
              id="comment"
              placeholder="Cuéntanos más sobre tus preferencias..."
              value={preferences.comentario}
              onChange={(e) => setPreferences(prev => ({ ...prev, comentario: e.target.value }))}
              className="resize-none"
              rows={3}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={loading}
            >
              Omitir
            </Button>
            <Button
              onClick={handleSave}
              className="flex-1"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};