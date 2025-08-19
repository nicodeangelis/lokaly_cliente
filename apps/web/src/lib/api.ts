export const api = {
  generarQR: async (payload: { local_slug: string; nro_pos: string; minutos?: number }) =>
    fetch(`${import.meta.env.VITE_API_URL}/api/qr/generar`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    }).then(r => r.json()),
  pushSubscribe: async (sub: PushSubscription) =>
    fetch(`${import.meta.env.VITE_API_URL}/api/push/subscribe`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub)
    }).then(r => r.json()),
}
