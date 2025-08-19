# Lokaly – README paso a paso (MVP CRM + Fidelización)

Este README te guía para levantar **Lokaly** con el stack propuesto:

- **React + TypeScript (Vite)** – webapp clientes/mesera
- **Supabase** – DB y Auth (SQL ya ejecutado)
- **Express** – API server (QR efímeros, Web Push)
- **Tailwind** – estilos
- **Framer Motion** – animaciones sutiles
- **React Router** – navegación
- **React Helmet** – SEO
- **TanStack Table** – tablas simples (listas/admin light)
- **QR** – generar/leer QR (qrcode.react + html5-qrcode)
- **Web Push** – notificaciones (VAPID)

> **Asunción**: Ya ejecutaste el SQL en tu proyecto Supabase (tablas y funciones creadas). Este README arranca desde cero con el código.

---

## 0) Requisitos

- Node.js 18+
- pnpm (recomendado) o npm
- Cuenta y proyecto en **Supabase** (con **Anon Key** y **Service Role Key**)

---

## 1) Estructura del repo (monorepo sugerido)

```
lokaly/
  apps/
    web/                   # React + Vite (cliente/mesera)
      src/
        routes/
          index.tsx        # /l/:slug (landing QR local: registro/login + visita)
          dashboard.tsx    # /app/home (nivel, puntos, beneficios)
          scan.tsx         # /app/scan (lector QR pedido)
          staff.tsx        # /staff (login PIN + generar QR)
          auth.tsx         # /auth (login/register simple)
        components/
        lib/
          supabase.ts
          api.ts           # fetchers hacia Express API
          push.ts          # suscripción Web Push
      index.html
      vite.config.ts
      tailwind.config.ts
      postcss.config.js
    api/                   # Express (QR efímero, Web Push)
      src/
        index.ts
        routes/
          qr.ts            # POST /api/qr/generar
          push.ts          # POST /api/push/subscribe, /api/push/send
        lib/
          supabase.ts      # cliente admin con service role
          webpush.ts
      .env.example
  sql/
    001_init.sql           # (solo referencia; ya ejecutado)
  .env.example
  README.md
```

---

## 2) Inicializar proyecto

```bash
# Clonar repo vacío o crear carpeta
mkdir lokaly && cd lokaly

# Monorepo simple sin herramientas extra
mkdir -p apps/web apps/api sql

# WEB
cd apps/web
pnpm create vite@latest . --template react-ts
pnpm add react-router-dom react-helmet-async @tanstack/react-table qrcode.react html5-qrcode framer-motion @supabase/supabase-js
pnpm add -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# API
cd ../api
pnpm init -y
pnpm add express cors web-push @supabase/supabase-js
pnpm add -D typescript ts-node-dev @types/express @types/node @types/cors
npx tsc --init
```

---

## 3) Tailwind (web)

**tailwind.config.ts**

```ts
import type { Config } from 'tailwindcss'
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: { extend: {} },
  plugins: [],
} satisfies Config
```

**src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 4) Variables de entorno

Crea **apps/api/.env** y **apps/web/.env**.

**apps/api/.env**

```
PORT=8080
SUPABASE_URL=<<TU_SUPABASE_URL>>
SUPABASE_SERVICE_ROLE=<<TU_SERVICE_ROLE_KEY>>
WEB_PUSH_VAPID_PUBLIC_KEY=<<GENERAR>>
WEB_PUSH_VAPID_PRIVATE_KEY=<<GENERAR>>
WEB_PUSH_SUBJECT=mailto:soporte@lokaly.app
```

**apps/web/.env**

```
VITE_SUPABASE_URL=<<TU_SUPABASE_URL>>
VITE_SUPABASE_ANON_KEY=<<TU_ANON_KEY>>
VITE_API_URL=http://localhost:8080
VITE_WEB_PUSH_PUBLIC_KEY=<<MISMO_PUBLIC_KEY_QUE_API>>
```

---

## 5) Supabase client (web)

**apps/web/src/lib/supabase.ts**

```ts
import { createClient } from '@supabase/supabase-js'
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
)
```

---

## 6) Express API

**apps/api/src/lib/supabase.ts**

```ts
import { createClient } from '@supabase/supabase-js'
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
)
```

**apps/api/src/lib/webpush.ts**

```ts
import webpush from 'web-push'
webpush.setVapidDetails(
  process.env.WEB_PUSH_SUBJECT!,
  process.env.WEB_PUSH_VAPID_PUBLIC_KEY!,
  process.env.WEB_PUSH_VAPID_PRIVATE_KEY!
)
export { webpush }
```

**apps/api/src/routes/qr.ts**

```ts
import { Router } from 'express'
import { supabaseAdmin } from '../lib/supabase'
const router = Router()

// Generar QR efímero para un nro_pos (crea pedido si no existe)
router.post('/qr/generar', async (req, res) => {
  const { local_id, nro_pos, minutos = 5 } = req.body
  if (!local_id || !nro_pos) return res.status(400).json({ error: 'local_id y nro_pos requeridos' })

  let pedido_id: string | undefined
  const { data: ped, error: e1 } = await supabaseAdmin
    .from('pedidos').select('id').eq('local_id', local_id).eq('nro_pos', nro_pos).maybeSingle()
  if (e1) return res.status(400).json({ error: e1.message })

  if (!ped) {
    const { data: ins, error: e2 } = await supabaseAdmin
      .from('pedidos').insert({ local_id, nro_pos }).select('id').single()
    if (e2) return res.status(400).json({ error: e2.message })
    pedido_id = ins.id
  } else {
    pedido_id = ped.id
  }

  const { data, error } = await supabaseAdmin.rpc('generar_qr_pedido', {
    p_local_id: local_id,
    p_nro_pos: nro_pos,
    p_minutos: minutos,
  })
  if (error) return res.status(400).json({ error: error.message })
  return res.json({ token: data, pedido_id })
})

export default router
```

**apps/api/src/routes/push.ts** (mínimo)

```ts
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
```

**apps/api/src/index.ts**

```ts
import express from 'express'
import cors from 'cors'
import qr from './routes/qr'
import push from './routes/push'

const app = express()
app.use(cors())
app.use(express.json())
app.use('/api', qr)
app.use('/api', push)

const port = process.env.PORT || 8080
app.listen(port, () => console.log(`API on :${port}`))
```

**apps/api/package.json** (scripts)

```json
{
  "name": "lokaly-api",
  "type": "module",
  "scripts": {
    "dev": "ts-node-dev --respawn src/index.ts"
  }
}
```

---

## 7) Web app – rutas básicas

**apps/web/src/main.tsx**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import Index from './routes/index'
import Dashboard from './routes/dashboard'
import Scan from './routes/scan'
import Staff from './routes/staff'

const router = createBrowserRouter([
  { path: '/l/:slug', element: <Index /> },
  { path: '/app/home', element: <Dashboard /> },
  { path: '/app/scan', element: <Scan /> },
  { path: '/staff', element: <Staff /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <HelmetProvider>
    <RouterProvider router={router} />
  </HelmetProvider>
)
```

**apps/web/src/lib/api.ts**

```ts
export const api = {
  generarQR: async (payload: { local_id: string; nro_pos: string; minutos?: number }) =>
    fetch(`${import.meta.env.VITE_API_URL}/api/qr/generar`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
    }).then(r => r.json()),
  pushSubscribe: async (sub: PushSubscription) =>
    fetch(`${import.meta.env.VITE_API_URL}/api/push/subscribe`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub)
    }).then(r => r.json()),
}
```

**apps/web/src/routes/index.tsx** (landing de local)

```tsx
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'

export default function Index() {
  const { slug } = useParams()
  const nav = useNavigate()
  const [local, setLocal] = useState<any>(null)

  useEffect(() => {
    (async () => {
      // 1) Buscar local por slug
      const { data: l } = await supabase.from('locales').select('*').eq('slug', slug).single()
      setLocal(l)
      // 2) Si usuario logueado → registrar visita
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: me } = await supabase.from('clientes').select('id').eq('email', user.email).single()
        if (me && l) {
          await supabase.from('visitas').insert({ cliente_id: me.id, local_id: l.id, origen: 'qr_local', beneficio_inicial_aplicado: true })
        }
        nav('/app/home')
      }
    })()
  }, [slug])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">{local?.nombre ?? 'Lokaly'}</h1>
      <p>Escaneaste el QR del local. Registrate o iniciá sesión para obtener tu beneficio.</p>
      <div className="mt-4 flex gap-3">
        <button className="px-4 py-2 bg-black text-white rounded" onClick={() => supabase.auth.signInWithOtp({ email: prompt('Email para magic link:') || '' })}>Ingresar / Registrarme</button>
      </div>
    </div>
  )
}
```

**apps/web/src/routes/dashboard.tsx** (simplificado)

```tsx
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [me, setMe] = useState<any>(null)

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('clientes').select('*').eq('email', user.email).single()
      setMe(data)
    })()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Mi Lokaly</h1>
      {me && (
        <div className="mt-4 space-y-2">
          <div>Nivel: <b className="uppercase">{me.nivel}</b></div>
          <div>Puntos: <b>{me.puntos}</b></div>
        </div>
      )}
    </div>
  )
}
```

**apps/web/src/routes/scan.tsx** (usar QR del pedido)

```tsx
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
```

**apps/web/src/routes/staff.tsx** (generar QR para nro\_pos)

```tsx
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import QRCode from 'qrcode.react'
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
    const res = await api.generarQR({ local_id: local.id, nro_pos: nro, minutos: 5 })
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
          <QRCode value={token} size={196} />
        </div>
      )}
    </div>
  )
}
```

---

## 8) Service Worker + Web Push (mínimo demo)

**Generar VAPID** (una vez):

```js
// script rápido (node)
import webpush from 'web-push'
console.log(webpush.generateVAPIDKeys())
```

Colocá las claves en **apps/api/.env** y la pública también en **apps/web/.env**.

**apps/web/public/sw\.js**

```js
self.addEventListener('push', event => {
  const data = event.data?.json() || { title: 'Lokaly', body: 'Nueva promo' }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      data: { url: data.url || '/' }
    })
  )
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  const url = e.notification.data?.url || '/'
  e.waitUntil(clients.openWindow(url))
})
```

**apps/web/src/lib/push.ts**

```ts
export async function subscribePush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
  const reg = await navigator.serviceWorker.register('/sw.js')
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY!)
  })
  await fetch(`${import.meta.env.VITE_API_URL}/api/push/subscribe`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub)
  })
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i)
  return outputArray
}
```

> Llamá `subscribePush()` desde el dashboard tras login.

---

## 9) Scripts útiles

**apps/web/package.json**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**apps/api/package.json** ya definido con `dev`.

**Ejecutar**

```bash
# API
cd apps/api && pnpm dev
# Web
cd ../web && pnpm dev
```

---

## 10) Flujo e2e para validar

1. **/l/cafe-palermo**: si estás logueado → registra visita; si no, OTP (magic link) y luego visita.
2. **/staff**: ingresar slug + nro\_pos → *Generar* → QR efímero.
3. **/app/scan** en el cliente: escanear QR → `usar_qr_y_sumar_puntos` → puntos + nivel.
4. **/app/home**: ver puntos/nivel actualizados.
5. **Web Push**: suscribirse y enviar `POST /api/push/send` con `{ "title": "Promo", "body": "2x1 hoy" }`.

---

## 11) Consideraciones RLS (resumen)

- Habilitá RLS en `clientes`, `visitas`, `cupones` y crea políticas para que cada usuario solo vea lo propio.
- La **API** usa **Service Role** para RPCs sensibles (QR, puntos).

---

## 12) Prompt para Cursor (copiar/pegar)

**Objetivo**: Crear un monorepo con **apps/web (Vite React TS)** y **apps/api (Express TS)** que implemente el MVP descrito abajo. Usa Supabase para auth/DB. Código limpio, tipado y listo para correr con `pnpm dev` en cada app.

**Contexto de negocio**: *Lokaly* es un **CRM de fidelización** para gastronomía. El cliente escanea un **QR del local** para registrarse, recibe beneficio de bienvenida, y al pagar la mesera genera un **QR efímero** (ligado a `nro_pos`) que el cliente escanea para sumar puntos. El cliente ve **nivel** (bronce/plata/oro) y **beneficios**. No es un POS ni toma pedidos.

**Stack**: React+TS (Vite), React Router, Helmet, Tailwind, Framer Motion, TanStack Table, qrcode.react + html5-qrcode, Express, Supabase, Web Push (VAPID).

**Assume**: El schema SQL y las funciones `generar_qr_pedido(p_local_id, p_nro_pos, p_minutos)` y `usar_qr_y_sumar_puntos(p_token, p_cliente)` ya existen en Supabase.

**Entrega esperada**:

- Estructura de carpetas como en el README.
- Archivos y contenido mínimos indicados (supabase.ts, api.ts, rutas, service worker, endpoints Express).
- .env.example para ambos apps.
- Scripts `dev` en cada package.json.
- Código funcional y tipeado (TS), sin errores.

**Rutas web**:

- `/l/:slug` – obtiene local por slug; si usuario logueado, inserta `visitas` y redirige a `/app/home`; si no, muestra botón de OTP por email (magic link Supabase).
- `/app/home` – muestra nivel/puntos (lee `clientes` por email del user).
- `/app/scan` – abre cámara con `html5-qrcode`, al leer token llama RPC `usar_qr_y_sumar_puntos`.
- `/staff` – pide `slug`, permite ingresar `nro_pos`, llama `/api/qr/generar` y muestra QR con `qrcode.react`.

**API**:

- `POST /api/qr/generar { local_id, nro_pos, minutos? }` → valida/crea pedido y retorna `token` desde RPC `generar_qr_pedido`.
- `POST /api/push/subscribe` y `POST /api/push/send` de ejemplo (en memoria).

**Web Push**:

- Service worker `public/sw.js`; helper `src/lib/push.ts` con `subscribePush()`.

**Aceptación**:

- `pnpm dev` en **apps/api** levanta Express en :8080.
- `pnpm dev` en **apps/web** levanta Vite en :5173.
- Flujo completo funciona: visita, QR staff, scan cliente, puntos actualizados.
- Lint básico y tipados OK.

**Extras deseables (si alcanza)**:

- Componente de UI básico con Tailwind + Motion para transiciones suaves.
- Hook `useSession()` para exponer user/email.
- Tabla simple de visitas en `/app/home` (TanStack Table).

> Usa este README como referencia exacta de nombres de archivos/rutas. Generá los archivos faltantes y dejá comentarios `// TODO:` donde corresponda.

---

## 13) Próximos pasos

- Agregar **tabla push\_subscriptions** y políticas RLS.
- Emitir cupón de bienvenida via trigger al registrarse/primera visita.
- Panel simple para dueños (estadísticas por local, TanStack Table + charts).

---

**Listo.** Con esto podés copiar el **Prompt para Cursor**, setear `.env`, levantar **API** y **WEB**, y probar el flujo de punta a punta. ✅

