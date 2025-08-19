import { Html5QrcodeScanner } from 'html5-qrcode'
import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Scan() {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 250 })
    scanner.render(async (text) => {
      // Asumimos que el QR contiene solo el token
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return alert('Iniciá sesión primero')
      const { data: me } = await supabase.from('clientes').select('id').eq('email', user.email).single()
      const { data, error } = await supabase.rpc('usar_qr_y_sumar_puntos', { p_token: text, p_cliente: me.id })
      if (error) alert(error.message); else alert('OK: puntos sumados')
      scanner.clear();
    }, console.error)
    return () => { try { (scanner as any).clear() } catch {}
    }
  }, [])
  return <div className="p-6"><div id="reader" /></div>
}
