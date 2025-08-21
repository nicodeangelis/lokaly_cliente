import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ServiceRatingModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (ratings: any) => void;
  loading?: boolean;
  localName: string;
  pointsEarned: number;
}

export const ServiceRatingModal: React.FC<ServiceRatingModalProps> = ({
  open,
  onClose,
  onSave,
  loading = false,
  localName,
  pointsEarned
}) => {
  const [ratings, setRatings] = useState({
    rating_atencion: 0,
    rating_local: 0,
    rating_cafe: 0,
    comentario: ''
  });

  const handleRatingChange = (category: string, value: number) => {
    setRatings(prev => ({ ...prev, [category]: value }));
  };

  const handleSave = () => {
    const cleanedRatings = {
      rating_atencion: ratings.rating_atencion || null,
      rating_local: ratings.rating_local || null,
      rating_cafe: ratings.rating_cafe || null,
      comentario: ratings.comentario || null
    };
    onSave(cleanedRatings);
  };

  const StarRating = ({ 
    value, 
    onChange, 
    label, 
    category 
  }: { 
    value: number, 
    onChange: (category: string, value: number) => void, 
    label: string,
    category: string 
  }) => (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1 justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(category, star)}
            className={`w-8 h-8 transition-all duration-200 ${
              star <= value 
                ? 'text-yellow-500 scale-110' 
                : 'text-muted-foreground hover:text-yellow-300'
            }`}
          >
            <Star className="w-full h-full fill-current" />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <DialogTitle className="text-2xl">¡Sumaste {pointsEarned} puntos! 🎉</DialogTitle>
          <p className="text-sm text-muted-foreground">
            ¿Cómo estuvo tu experiencia en <span className="font-semibold">{localName}</span>? (opcional)
          </p>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Success indicator */}
          <div className="text-center p-4 bg-primary/5 rounded-lg">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
              <Star className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Tu visita ha sido registrada exitosamente
            </p>
          </div>

          {/* Ratings */}
          <div className="space-y-4">
            <StarRating
              value={ratings.rating_atencion}
              onChange={handleRatingChange}
              label="Atención del personal"
              category="rating_atencion"
            />
            <StarRating
              value={ratings.rating_local}
              onChange={handleRatingChange}
              label="Ambiente del local"
              category="rating_local"
            />
            <StarRating
              value={ratings.rating_cafe}
              onChange={handleRatingChange}
              label="Calidad del café"
              category="rating_cafe"
            />
          </div>

          {/* Comentario */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Comentario adicional
            </Label>
            <Textarea
              id="comment"
              placeholder="Cuéntanos más sobre tu experiencia..."
              value={ratings.comentario}
              onChange={(e) => setRatings(prev => ({ ...prev, comentario: e.target.value }))}
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
              {loading ? "Enviando..." : "Enviar"}
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};