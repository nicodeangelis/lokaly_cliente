

# UI/UX brief para Cursor — Lokaly (mobile‑first)

> Copiá/pegá este bloque completo en Cursor. Es un **brief de diseño + checklist** para que eleve la UI/UX a nivel producto.

## Objetivos

- **Mobile‑first** (iOS/Android PWA), limpio, táctil, sin “look” de HTML por defecto.
- Tiempos de tarea mínimos para: *registrar visita*, *ver nivel y puntos*, *escanear QR*, *generar QR staff*.
- Accesible (WCAG AA) y performante (CLS < 0.1, LCP < 2.5s en 4G).

## Librerías permitidas

- Ya instaladas: **Tailwind**, **Framer Motion**, **React Router**, **TanStack Table**, **qrcode.react**, **html5-qrcode**.
- Agregar: **lucide-react** (íconos). *No otras UI libs pesadas.*

## Diseño visual (tokens Tailwind)

- Tipografía: `Inter, ui-sans-serif, system-ui`.
- Colores (agregar a `tailwind.config.ts > theme.extend.colors`):
  - `brand: { 50:#eef2ff,100:#e0e7ff,200:#c7d2fe,400:#818cf8,500:#6366f1,600:#4f46e5,700:#4338ca }`
  - `ink: { 700:#0f172a,600:#1f2937,500:#334155 }` (texto)
  - `muted:#f6f7fb` (fondo app), `card:#ffffff`, `success:#10b981`, `warning:#f59e0b`, `danger:#ef4444`.
- Radios: `md:12px`, `lg:16px`, `xl:24px`.
- Sombras: `card: 0 6px 20px -8px rgb(2 6 23 / 20%)`.
- Container: ancho máx. `max-w-screen-sm` + paddings `px-4`.

### Parches base (aplicar)

- `index.html`: meta viewport con **viewport-fit=cover** y color de status bar.
- `src/index.css`: reset de anchors/botones y fondos.

```html
<!-- index.html head -->
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="theme-color" content="#6366f1" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
```

```css
/* src/index.css (debajo de @tailwind utilities) */
:root { color-scheme: light; }
html,body,#root { height: 100%; }
body { @apply bg-muted text-ink-600 antialiased; font-family: Inter, ui-sans-serif, system-ui, -apple-system; }
a { @apply text-brand-600 underline-offset-2 hover:text-brand-700; }
button { @apply active:scale-[.98] transition; }
```

## AppShell + navegación

- **TopBar** compacto con título y badge de puntos.
- **Bottom Tab Bar** fija (safe-area) con 4 tabs: *Inicio*, *Beneficios*, *Escanear*, *Perfil*.
- Staff queda fuera del tab bar (`/staff`).

**Crear** `src/components/AppShell.tsx` y `src/components/BottomNav.tsx`:

```tsx
// AppShell.tsx
import { PropsWithChildren } from 'react'
export default function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-dvh bg-muted">
      <header className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b">
        <div className="max-w-screen-sm mx-auto px-4 h-14 flex items-center justify-between">
          <div className="font-semibold">Lokaly</div>
          <div className="text-sm bg-brand-50 text-brand-700 px-3 py-1 rounded-full">Puntos: 0</div>
        </div>
      </header>
      <main className="max-w-screen-sm mx-auto px-4 pb-24">{children}</main>
    </div>
  )
}
```

```tsx
// BottomNav.tsx
import { NavLink } from 'react-router-dom'
import { Home, Gift, ScanLine, User } from 'lucide-react'
export function BottomNav(){
  const link = 'flex flex-col items-center gap-1 text-xs';
  const active = 'text-brand-600';
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t safe-bottom">
      <div className="max-w-screen-sm mx-auto grid grid-cols-4 py-2">
        <NavLink to="/app/home" className={({isActive})=>`${link} ${isActive?active:''}`}>{<Home size={22}/>}Inicio</NavLink>
        <NavLink to="/app/benefits" className={({isActive})=>`${link} ${isActive?active:''}`}>{<Gift size={22}/>}Beneficios</NavLink>
        <NavLink to="/app/scan" className={({isActive})=>`${link} ${isActive?active:''}`}>{<ScanLine size={22}/>}Escanear</NavLink>
        <NavLink to="/app/profile" className={({isActive})=>`${link} ${isActive?active:''}`}>{<User size={22}/>}Perfil</NavLink>
      </div>
    </nav>
  )}
```

> **Integrar** en `main.tsx`: envolver rutas de app con `<AppShell/>` y renderizar `<BottomNav/>` en páginas protegidas.

## Componentes base (crear)

- **Button.tsx**: variantes `primary`, `secondary`, `ghost`.
- **Card.tsx**: wrapper con sombra `shadow-[var(--shadow-card)]` y `rounded-xl`.
- **Input.tsx**: label + ayuda + error.
- **Toast** simple (context) para reemplazar `alert()`.
- **Skeleton.tsx** para carga.

Ejemplo Button:

```tsx
export function Button({variant='primary', className='', ...props}){
  const base = 'px-4 py-3 rounded-xl text-sm font-semibold';
  const map:any = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700',
    secondary: 'bg-white text-ink-600 border hover:bg-muted',
    ghost:'text-brand-600 hover:bg-brand-50'
  };
  return <button className={`${base} ${map[variant]} ${className}`} {...props} />
}
```

## Páginas (reestilizar)

### `/l/:slug` (landing por QR)

- Card con nombre del local, dirección, logo placeholder.
- CTA grande “Ingresar / Registrarme” (magic link). Microcopy claro del beneficio de bienvenida.
- Si user logueado: registrar visita y mostrar **sheet de éxito** (Motion) con cupón.

### `/app/home`

- **Tarjeta de Nivel** con barra de progreso a próximo nivel.
- Bloque de puntos grandes y acción primaria “Escanear QR”.
- Últimas 3 visitas en cards pequeñas con fecha/local.

### `/app/scan`

- Cámara **full‑bleed** con overlay (marco cuadrado) + texto “Alineá el QR”.
- Estado: *buscando*, *éxito*, *error/permisos* con fallback “Ingresar token manual”.

### `/staff`

- Form con `slug` (autocompletar último usado), `nro_pos` y botón **Generar**.
- Tras generar: mostrar QR grande + **countdown** (mm\:ss) + botón “Regenerar”.
- Tipos táctiles grandes (44px touch targets), contraste alto.

## Motion (Framer Motion)

- Transiciones de página: `initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{duration:.2}}`.
- Sheets/modales: `backdrop-blur` + `spring` suave.

## Accesibilidad

- Botones reales (no `<a>` para acciones), etiquetas `aria-label` en íconos.
- Tamaño de fuente base `text-[16px]` para prevenir zoom forzado.
- Estados de foco visibles: `focus-visible:ring-2 ring-brand-400`.

## Reemplazar UI “de texto” inicial

- Eliminar links sueltos en la home.
- Introducir **Home.tsx** con AppShell + tarjetas.
- Usar `<Button/>`, `<Card/>`, `<BottomNav/>` y tipografías.

## Ejemplo de Home con AppShell

```tsx
import AppShell from '@/components/AppShell'
import { BottomNav } from '@/components/BottomNav'
import { Button } from '@/components/Button'
import { motion } from 'framer-motion'

export default function Home(){
  return (
    <AppShell>
      <motion.section initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="space-y-4 py-4">
        <div className="bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-2xl p-5 shadow-lg">
          <div className="text-sm opacity-90">Tu nivel</div>
          <div className="text-2xl font-bold">Plata</div>
          <div className="mt-3 h-2 bg-white/30 rounded-full"><div className="h-full w-1/2 bg-white rounded-full"/></div>
          <div className="mt-4"><Button variant="secondary" className="bg-white text-brand-700">Ver beneficios</Button></div>
        </div>
        <div className="bg-card rounded-2xl p-4 shadow">
          <div className="text-sm text-ink-500">Puntos</div>
          <div className="text-3xl font-bold">350</div>
          <Button className="mt-3 w-full">Escanear QR</Button>
        </div>
      </motion.section>
      <BottomNav />
    </AppShell>
  )
}
```

## Checklist de aceptación (Cursor debe cumplir)

1. Fuente **Inter** cargada, colores/espaciados según tokens, fondo `bg-muted`.
2. AppShell + BottomNav visibles en rutas `/app/*`; safe areas correctos.
3. Home, Benefits, Scan, Profile maquetadas con **cards** y **buttons**; nada de enlaces azules por defecto.
4. Estado de carga con **Skeleton**; nada de `alert()` — usar **Toast**.
5. `/staff` con formulario táctil y QR con **countdown**.
6. Animaciones suaves con Framer Motion (no exagerar; 150–250ms).
7. Lighthouse mobile: **Performance ≥ 85**, **Accesibility ≥ 95**.

## No hacer

- No usar estilos inline salvo casos puntuales.
- No usar `<table>` para layout.
- No dejar textos “Lorem ipsum”.
- No colores arbitrarios fuera de tokens.

## Tareas extra (si hay tiempo)

- PWA: manifest.json + iconos + `display: standalone`.
- Splash + color de status bar.
- Componente `LevelBadge` reutilizable.
- Empty states ilustrados (SVG simples).

> Cuando termines, entrega PR con screenshots móvil (iPhone 14/Pixel 7) de **/l/****:slug**, **/app/home**, **/app/scan**, **/staff**.



---

# UI Patch Set #1 — Mobile Shell & Screens (drop‑in)

> Copiá esto en tu repo `apps/web` para pasar de “HTML plano” a **mobile‑first**. Incluye **AppShell**, **BottomNav**, **Button**, **Card** y pantallas estilizadas para **Home**, **Scan** y **Staff**.

## 0) Instalar dependencias UI

```bash
cd apps/web
pnpm add lucide-react
```

## 1) Tailwind tokens y reset

**tailwind.config.ts** (reemplazá el `theme.extend`)

```ts
import type { Config } from 'tailwindcss'
export default {
  content: ['./index.html','./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50:'#eef2ff',100:'#e0e7ff',200:'#c7d2fe',400:'#818cf8',500:'#6366f1',600:'#4f46e5',700:'#4338ca' },
        ink: { 700:'#0f172a',600:'#1f2937',500:'#334155' },
        muted:'#f6f7fb',
        card:'#ffffff'
      },
      boxShadow: {
        card: '0 6px 20px -8px rgb(2 6 23 / 20%)'
      },
      borderRadius: { xl:'24px' }
    }
  },
  plugins: [],
} satisfies Config
```

**index.html** (agregá en `<head>`)

```html
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<meta name="theme-color" content="#6366f1" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
```

**src/index.css** (al final del archivo)

```css
:root { color-scheme: light; }
html,body,#root { height: 100%; }
body { @apply bg-muted text-ink-600 antialiased; font-family: Inter, ui-sans-serif, system-ui, -apple-system; }
a { @apply text-brand-600 underline-offset-2 hover:text-brand-700; }
button { @apply active:scale-[.98] transition; }
/* Safe area iOS para bottom nav */
.safe-bottom { padding-bottom: calc(env(safe-area-inset-bottom) + 0.5rem); }
```

## 2) Componentes base

**src/components/Button.tsx**

```tsx
import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'secondary'|'ghost' }
export function Button({ variant='primary', className='', ...props }: Props){
  const base = 'px-4 py-3 rounded-xl text-sm font-semibold disabled:opacity-60 disabled:pointer-events-none';
  const map:any = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700',
    secondary: 'bg-white text-ink-600 border hover:bg-muted',
    ghost: 'text-brand-600 hover:bg-brand-50'
  }
  return <button className={`${base} ${map[variant]} ${className}`} {...props} />
}
```

**src/components/Card.tsx**

```tsx
import React, { PropsWithChildren } from 'react'
export function Card({ children, className='' }: PropsWithChildren<{className?:string}>){
  return <div className={`bg-card rounded-2xl shadow-card ${className}`}>{children}</div>
}
```

**src/components/AppShell.tsx**

```tsx
import React, { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{ title?: string; points?: number }>
export default function AppShell({ children, title='Lokaly', points }: Props){
  return (
    <div className="min-h-dvh bg-muted">
      <header className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b">
        <div className="max-w-screen-sm mx-auto px-4 h-14 flex items-center justify-between">
          <div className="font-semibold">{title}</div>
          {typeof points === 'number' && (
            <div className="text-sm bg-brand-50 text-brand-700 px-3 py-1 rounded-full">Puntos: {points}</div>
          )}
        </div>
      </header>
      <main className="max-w-screen-sm mx-auto px-4 pb-24">{children}</main>
    </div>
  )
}
```

**src/components/BottomNav.tsx**

```tsx
import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Gift, ScanLine, User } from 'lucide-react'

export function BottomNav(){
  const link = 'flex flex-col items-center gap-1 text-xs py-1';
  const active = 'text-brand-600';
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t safe-bottom">
      <div className="max-w-screen-sm mx-auto grid grid-cols-4 py-2">
        <NavLink to="/app/home" className={({isActive})=>`${link} ${isActive?active:''}`}>{<Home size={22}/>}Inicio</NavLink>
        <NavLink to="/app/benefits" className={({isActive})=>`${link} ${isActive?active:''}`}>{<Gift size={22}/>}Beneficios</NavLink>
        <NavLink to="/app/scan" className={({isActive})=>`${link} ${isActive?active:''}`}>{<ScanLine size={22}/>}Escanear</NavLink>
        <NavLink to="/app/profile" className={({isActive})=>`${link} ${isActive?active:''}`}>{<User size={22}/>}Perfil</NavLink>
      </div>
    </nav>
  )
}
```

## 3) Páginas estilizadas

**src/routes/dashboard.tsx** (reemplazá el contenido)

```tsx
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import AppShell from '../components/AppShell'
import { BottomNav } from '../components/BottomNav'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { useNavigate } from 'react-router-dom'

export default function Dashboard(){
  const [me, setMe] = useState<any>(null)
  const nav = useNavigate()

  useEffect(()=>{
    (async()=>{
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { nav('/l/cafe-palermo'); return; }
      const { data } = await supabase.from('clientes').select('*').eq('email', user.email).single();
      setMe(data)
    })()
  },[])

  return (
    <AppShell title="Lokaly" points={me?.puntos}>
      <section className="space-y-4 py-4">
        <div className="bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-2xl p-5 shadow-lg">
          <div className="text-sm opacity-90">Tu nivel</div>
          <div className="text-2xl font-bold capitalize">{me?.nivel ?? 'bronce'}</div>
          <div className="mt-3 h-2 bg-white/30 rounded-full">
            <div className="h-full bg-white rounded-full" style={{width: `${Math.min(100, Math.round(((me?.puntos||0)%300)/3))}%`}}/>
          </div>
          <div className="mt-4"><Button variant="secondary" className="bg-white text-brand-700" onClick={()=>nav('/app/benefits')}>Ver beneficios</Button></div>
        </div>

        <Card className="p-4">
          <div className="text-sm text-ink-500">Puntos</div>
          <div className="text-3xl font-bold">{me?.puntos ?? 0}</div>
          <Button className="mt-3 w-full" onClick={()=>nav('/app/scan')}>Escanear QR</Button>
        </Card>
      </section>
      <BottomNav/>
    </AppShell>
  )
}
```

**src/routes/index.tsx** (landing de local con CTA)

```tsx
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'
import AppShell from '../components/AppShell'
import { Card } from '../components/Card'
import { Button } from '../components/Button'

export default function Index(){
  const { slug } = useParams()
  const nav = useNavigate()
  const [local, setLocal] = useState<any>(null)

  useEffect(()=>{ (async()=>{
    const { data: l } = await supabase.from('locales').select('*').eq('slug', slug).single();
    setLocal(l)
    const { data: { user } } = await supabase.auth.getUser()
    if (user && l) {
      const { data: me } = await supabase.from('clientes').select('id').eq('email', user.email).single()
      if (me) await supabase.from('visitas').insert({ cliente_id: me.id, local_id: l.id, origen: 'qr_local', beneficio_inicial_aplicado: true })
      nav('/app/home')
    }
  })() },[slug])

  const login = async()=>{
    const email = prompt('Email para magic link:') || ''
    if (!email) return
    await supabase.auth.signInWithOtp({ email })
    alert('Te enviamos un mail para ingresar ✅')
  }

  return (
    <AppShell title={local?.nombre || 'Lokaly'}>
      <section className="py-6">
        <Card className="p-5">
          <div className="text-sm text-ink-500">Bienvenido</div>
          <h1 className="text-2xl font-bold">{local?.nombre ?? 'Local'}</h1>
          <p className="mt-1 text-sm">Registrá tu visita y obtené tu beneficio de bienvenida.</p>
          <Button className="mt-4 w-full" onClick={login}>Ingresar / Registrarme</Button>
        </Card>
      </section>
    </AppShell>
  )
}
```

**src/routes/scan.tsx** (cámara full‑bleed + overlay)

```tsx
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
```

**src/routes/staff.tsx** (form táctil + QR + countdown)

```tsx
import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import QRCode from 'qrcode.react'
import AppShell from '../components/AppShell'
import { Button } from '../components/Button'
import { Card } from '../components/Card'

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
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/qr/generar`,{
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ local_id: local.id, nro_pos: nro, minutos: 5 })
    }).then(r=>r.json())
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
              <QRCode value={token} size={220} />
            </div>
            <div className="mt-3"><Button variant="secondary" onClick={generar}>Regenerar</Button></div>
          </Card>
        )}
      </section>
    </AppShell>
  )
}
```

## 4) Navegación — usar AppShell y BottomNav

En `src/main.tsx` mantené tus rutas, pero en páginas bajo `/app/*` usá `<AppShell/>` y renderizá `<BottomNav/>` (ya lo hace `dashboard.tsx`).

---

**Resultado esperado**: interfaz **mobile‑first** con header fijo, cards, botones redondeados, bottom nav, cámara con overlay y pantallas de staff con timer. Sin links azules ni HTML crudo.

