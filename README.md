# Lokaly – CRM de Fidelización para Gastronomía

Lokaly es un **CRM de fidelización** para gastronomía que permite a los clientes escanear QR de locales, registrarse, recibir beneficios y acumular puntos.

## Stack Tecnológico

- **Frontend**: React + TypeScript (Vite), React Router, Tailwind CSS, Framer Motion
- **Backend**: Express + TypeScript
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Notificaciones**: Web Push (VAPID)
- **QR**: qrcode.react + html5-qrcode

## Estructura del Proyecto

```
lokaly/
├── apps/
│   ├── web/          # React app (cliente/mesera)
│   └── api/          # Express API (QR, Web Push)
└── sql/              # Scripts SQL (ya ejecutados)
```

## Instalación

### 1. Clonar y instalar dependencias

```bash
git clone <repo-url>
cd lokaly

# Instalar dependencias de la web app
cd apps/web
pnpm install

# Instalar dependencias de la API
cd ../api
pnpm install
```

### 2. Configurar variables de entorno

**apps/api/.env**
```env
PORT=8080
SUPABASE_URL=<<TU_SUPABASE_URL>>
SUPABASE_SERVICE_ROLE=<<TU_SERVICE_ROLE_KEY>>
WEB_PUSH_VAPID_PUBLIC_KEY=<<GENERAR>>
WEB_PUSH_VAPID_PRIVATE_KEY=<<GENERAR>>
WEB_PUSH_SUBJECT=mailto:soporte@lokaly.app
```

**apps/web/.env**
```env
VITE_SUPABASE_URL=<<TU_SUPABASE_URL>>
VITE_SUPABASE_ANON_KEY=<<TU_ANON_KEY>>
VITE_API_URL=http://localhost:8080
VITE_WEB_PUSH_PUBLIC_KEY=<<MISMO_PUBLIC_KEY_QUE_API>>
```

### 3. Generar claves VAPID (una vez)

```bash
cd apps/api
node -e "const webpush = require('web-push'); console.log(webpush.generateVAPIDKeys())"
```

## Ejecutar el Proyecto

### Desarrollo

```bash
# Terminal 1: API
cd apps/api
pnpm dev

# Terminal 2: Web App
cd apps/web
pnpm dev
```

- **API**: http://localhost:8080
- **Web App**: http://localhost:5173

## Flujo de Uso

1. **Cliente escanea QR del local** (`/l/:slug`)
   - Si no está logueado → magic link por email
   - Si está logueado → registra visita y redirige a dashboard

2. **Mesera genera QR para pedido** (`/staff`)
   - Ingresa slug del local y número de POS
   - Genera QR efímero válido por 5 minutos

3. **Cliente escanea QR del pedido** (`/app/scan`)
   - Abre cámara y lee QR
   - Suma puntos automáticamente

4. **Dashboard del cliente** (`/app/home`)
   - Muestra nivel (bronce/plata/oro) y puntos
   - Suscribe a notificaciones push

## Endpoints API

- `POST /api/qr/generar` - Genera QR efímero para pedido
- `POST /api/push/subscribe` - Suscribe a notificaciones
- `POST /api/push/send` - Envía notificación push

## Próximos Pasos

- [ ] Tabla `push_subscriptions` en Supabase
- [ ] Trigger para cupón de bienvenida
- [ ] Panel de administración para dueños
- [ ] Estadísticas y reportes

## Notas

- El proyecto asume que el schema SQL y las funciones RPC ya están creadas en Supabase
- Las notificaciones push están en memoria (demo)
- RLS (Row Level Security) debe estar configurado en Supabase
