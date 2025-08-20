import { Html5QrcodeScanner } from 'html5-qrcode'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import AppShell from '../components/AppShell'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { Star } from 'lucide-react'

export default function Scan(){
  const [showRating, setShowRating] = useState(false)
  const [scannedToken, setScannedToken] = useState('')
  const [rating, setRating] = useState(0)
  const [localName, setLocalName] = useState('')

  useEffect(()=>{
    const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 260 })
    scanner.render(async (text) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert('Iniciá sesión primero'); return }
      
      const { data: me } = await supabase.from('clientes').select('id').eq('email', user.email).maybeSingle();
      if (!me) { alert('Usuario no encontrado'); return }
      
      // Usar el QR y sumar puntos
      const { error } = await supabase.rpc('usar_qr_y_sumar_puntos', { p_token: text, p_cliente: me.id })
      
      if (error) {
        alert(error.message)
        scanner.clear()
        return
      }
      
      // Obtener información del local para el rating
      try {
        const { data: pedido } = await supabase
          .from('pedidos')
          .select('locales(nombre)')
          .eq('token_qr', text)
          .single()
        
        setLocalName(pedido?.locales?.nombre || 'Local')
      } catch (e) {
        setLocalName('Local')
      }
      
      setScannedToken(text)
      setShowRating(true)
      scanner.clear()
    }, (err)=>console.debug(err))
    return ()=>{ try { (scanner as any).clear() } catch{} }
  },[])

  const submitRating = async () => {
    if (rating === 0) {
      alert('Por favor selecciona una calificación')
      return
    }

    try {
      // Guardar rating (aquí podrías crear una tabla de ratings)
      const { data: { user } } = await supabase.auth.getUser()
      const { data: me } = await supabase.from('clientes').select('id').eq('email', user.email).maybeSingle()
      
      // Simular guardado de rating
      console.log('Rating guardado:', { cliente_id: me?.id, token: scannedToken, rating, local: localName })
      
      alert(`¡Gracias por tu calificación! ${rating} estrellas para ${localName} ⭐`)
      setShowRating(false)
      setRating(0)
      setScannedToken('')
    } catch (error) {
      alert('Error al guardar la calificación')
    }
  }

  return (
    <AppShell title="Escanear">
      <AnimatePresence>
        {!showRating ? (
          <motion.div
            key="scanner"
            initial={{opacity:0,y:8}}
            animate={{opacity:1,y:0}}
            exit={{opacity:0,y:-8}}
            transition={{duration:.2}}
            className="relative rounded-xl overflow-hidden mt-4"
          >
            <div id="reader" className="aspect-[3/4] bg-black/5" />
            <div className="pointer-events-none absolute inset-0 grid place-items-center">
              <motion.div
                initial={{scale:0.8,opacity:0}}
                animate={{scale:1,opacity:1}}
                transition={{delay:0.2,duration:0.5}}
                className="w-56 h-56 rounded-2xl border-4 border-white/80 shadow-[0_0_0_200vmax_rgba(0,0,0,.15)]"
              />
              <motion.div
                initial={{opacity:0}}
                animate={{opacity:1}}
                transition={{delay:0.5,duration:0.3}}
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-center"
              >
                <div className="text-sm font-medium">Alineá el QR dentro del marco</div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="rating"
            initial={{opacity:0,y:8}}
            animate={{opacity:1,y:0}}
            exit={{opacity:0,y:-8}}
            transition={{duration:.3}}
            className="space-y-4 py-4"
          >
            <Card className="p-6 text-center">
              <div className="mb-4">
                <div className="text-2xl font-bold text-green-600 mb-2">¡Puntos sumados! 🎉</div>
                <div className="text-sm text-gray-600">¿Cómo te atendieron en {localName}?</div>
              </div>
              
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`p-2 rounded-full transition-all duration-200 touch-target ${
                      rating >= star 
                        ? 'text-yellow-500 scale-110' 
                        : 'text-gray-300 hover:text-yellow-400'
                    }`}
                  >
                    <Star size={32} className={rating >= star ? 'fill-current' : ''} />
                  </button>
                ))}
              </div>
              
              <div className="text-sm text-gray-600 mb-4">
                {rating === 0 && 'Selecciona una calificación'}
                {rating === 1 && 'Muy malo'}
                {rating === 2 && 'Malo'}
                {rating === 3 && 'Regular'}
                {rating === 4 && 'Bueno'}
                {rating === 5 && 'Excelente'}
              </div>
              
              <Button 
                onClick={submitRating}
                disabled={rating === 0}
                className="w-full"
              >
                Enviar Calificación
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </AppShell>
  )
}
