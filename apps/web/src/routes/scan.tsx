import { Html5QrcodeScanner } from 'html5-qrcode'
import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import AppShell from '../components/AppShell'

export default function Scan(){
  useEffect(()=>{
    const scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 260 })
    scanner.render(async (text) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { alert('Iniciá sesión primero'); return }
      const { data: me } = await supabase.from('clientes').select('id').eq('email', user.email).single();
      const { error } = await supabase.rpc('usar_qr_y_sumar_puntos', { p_token: text, p_cliente: me.id })
      if (error) alert(error.message); else alert('¡Puntos sumados! 🎉')
      scanner.clear()
    }, (err)=>console.debug(err))
    return ()=>{ try { (scanner as any).clear() } catch{} }
  },[])

  return (
    <AppShell title="Escanear">
      <div className="relative rounded-xl overflow-hidden mt-4">
        <div id="reader" className="aspect-[3/4] bg-black/5" />
        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className="w-56 h-56 rounded-2xl border-4 border-white/80 shadow-[0_0_0_200vmax_rgba(0,0,0,.15)]"></div>
        </div>
      </div>
    </AppShell>
  )
}
