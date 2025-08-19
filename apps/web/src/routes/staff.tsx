import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { QRCodeSVG } from 'qrcode.react'
import AppShell from '../components/AppShell'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { api } from '../lib/api'

export default function Staff(){
  const [local, setLocal] = useState<any>(null)
  const [nro, setNro] = useState('')
  const [token, setToken] = useState<string>('')
  const [expires, setExpires] = useState<number>(0)

  useEffect(()=>{ (async()=>{
    const slug = prompt('Slug del local (ej: cafe-centro)') || ''
    const { data } = await supabase.from('locales').select('*').eq('slug', slug).single()
    setLocal(data)
  })() },[])

  const secondsLeft = useMemo(()=> Math.max(0, Math.floor((expires - Date.now())/1000)), [expires, token])
  useEffect(()=>{
    if (!token) return; const t = setInterval(()=>{ if (Date.now()>expires) clearInterval(t); else setExpires(p=>p) }, 1000); return ()=>clearInterval(t)
  },[token, expires])

  const generar = async ()=>{
    if (!local || !nro) return
    const res = await api.generarQR({ local_slug: local.slug, nro_pos: nro, minutos: 5 })
    setToken(res.token); setExpires(Date.now() + 5*60*1000)
  }

  return (
    <AppShell title="Staff">
      <section className="py-4 space-y-3">
        <Card className="p-4 space-y-3">
          <div className="text-sm text-ink-500">Local</div>
          <div className="font-semibold">{local?.nombre ?? '—'}</div>
          <input className="border rounded-xl p-3 w-full" placeholder="Nro POS" value={nro} onChange={e=>setNro(e.target.value)} />
          <Button onClick={generar} disabled={!nro}>Generar QR</Button>
        </Card>

        {token && (
          <Card className="p-4 text-center">
            <div className="text-sm text-ink-500">QR válido por</div>
            <div className="text-3xl font-bold mb-3">{Math.floor(secondsLeft/60).toString().padStart(2,'0')}:{(secondsLeft%60).toString().padStart(2,'0')}</div>
            <div className="flex justify-center">
              <QRCodeSVG value={token} size={220} />
            </div>
            <div className="mt-3"><Button variant="secondary" onClick={generar}>Regenerar</Button></div>
          </Card>
        )}
      </section>
    </AppShell>
  )
}
