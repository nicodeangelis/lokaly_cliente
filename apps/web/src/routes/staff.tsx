import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { QRCodeSVG } from 'qrcode.react'
import AppShell from '../components/AppShell'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { api } from '../lib/api'

export default function Staff(){
  const [local, setLocal] = useState<{nombre: string; slug: string} | null>(null)
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
      <motion.section 
        initial={{opacity:0,y:8}} 
        animate={{opacity:1,y:0}} 
        transition={{duration:.2}}
        className="py-4 space-y-3"
      >
        <motion.div
          initial={{scale:0.95,opacity:0}}
          animate={{scale:1,opacity:1}}
          transition={{delay:0.1,duration:0.3}}
        >
          <Card className="p-4 space-y-3">
            <div className="text-sm text-gray-500">Local</div>
            <div className="font-semibold">{local?.nombre ?? '—'}</div>
            <input className="border rounded-xl p-3 w-full" placeholder="Nro POS" value={nro} onChange={e=>setNro(e.target.value)} />
            <Button onClick={generar} disabled={!nro}>Generar QR</Button>
          </Card>
        </motion.div>

        <AnimatePresence>
          {token && (
            <motion.div
              initial={{scale:0.8,opacity:0,y:20}}
              animate={{scale:1,opacity:1,y:0}}
              exit={{scale:0.8,opacity:0,y:20}}
              transition={{duration:0.4}}
            >
              <Card className="p-4 text-center">
                <div className="text-sm text-gray-500">QR válido por</div>
                <motion.div 
                  className="text-3xl font-bold mb-3"
                  key={secondsLeft}
                  initial={{scale:1.2}}
                  animate={{scale:1}}
                  transition={{duration:0.2}}
                >
                  {Math.floor(secondsLeft/60).toString().padStart(2,'0')}:{(secondsLeft%60).toString().padStart(2,'0')}
                </motion.div>
                <motion.div 
                  className="flex justify-center"
                  initial={{scale:0.9,opacity:0}}
                  animate={{scale:1,opacity:1}}
                  transition={{delay:0.2,duration:0.3}}
                >
                  <QRCodeSVG value={token} size={220} />
                </motion.div>
                <div className="mt-3">
                  <Button variant="secondary" onClick={generar}>Regenerar</Button>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.section>
    </AppShell>
  )
}
