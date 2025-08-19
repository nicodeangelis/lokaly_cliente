import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { QRCodeSVG } from 'qrcode.react'
import { api } from '../lib/api'

export default function Staff() {
  const [local, setLocal] = useState<any>(null)
  const [nro, setNro] = useState('')
  const [token, setToken] = useState<string>('')

  useEffect(() => {
    (async () => {
      const slug = prompt('Slug del local (ej: cafe-centro)') || ''
      const { data } = await supabase.from('locales').select('*').eq('slug', slug).single()
      setLocal(data)
    })()
  }, [])

  const generar = async () => {
    if (!local) return
    const res = await api.generarQR({ local_slug: local.slug, nro_pos: nro, minutos: 5 })
    setToken(res.token)
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-bold">Staff – Generar QR</h1>
      <input className="border p-2" placeholder="Nro POS" value={nro} onChange={e => setNro(e.target.value)} />
      <button className="px-4 py-2 bg-black text-white rounded" onClick={generar}>Generar</button>
      {token && (
        <div className="mt-4">
          <p>QR válido por 5 min. Pedí al cliente escanear en /app/scan</p>
          <QRCodeSVG value={token} size={196} />
        </div>
      )}
    </div>
  )
}
