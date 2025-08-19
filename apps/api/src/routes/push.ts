import { Router } from 'express'
import { webpush } from '../lib/webpush'
const router = Router()

// (Demo) En memoria; en prod guardá en DB (tabla push_subscriptions)
const subs: any[] = []

router.post('/push/subscribe', (req, res) => {
  subs.push(req.body)
  res.json({ ok: true })
})

router.post('/push/send', async (req, res) => {
  const payload = JSON.stringify(req.body || { title: 'Lokaly', body: 'Hola 👋' })
  await Promise.allSettled(subs.map(s => webpush.sendNotification(s, payload)))
  res.json({ sent: true, count: subs.length })
})

export default router
