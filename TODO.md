# TODO - Lokaly MVP

## ✅ Completado

- [x] Estructura del monorepo creada
- [x] Web app (React + Vite + TypeScript) configurada
- [x] API (Express + TypeScript) configurada
- [x] Tailwind CSS configurado
- [x] Rutas principales implementadas:
  - [x] `/l/:slug` - Landing del local
  - [x] `/app/home` - Dashboard del cliente
  - [x] `/app/scan` - Scanner QR
  - [x] `/staff` - Generador QR para meseras
- [x] Cliente Supabase configurado
- [x] API endpoints implementados:
  - [x] `POST /api/qr/generar`
  - [x] `POST /api/push/subscribe`
  - [x] `POST /api/push/send`
- [x] Service Worker para Web Push
- [x] Variables de entorno configuradas
- [x] Scripts de desarrollo configurados
- [x] Build de producción funcionando
- [x] Error boundary y página de inicio implementados
- [x] Problema 404 solucionado

## ✅ Completado

- [x] Configurar Supabase (URL, keys, schema)
- [x] Probar flujo completo end-to-end
- [x] Generar claves VAPID para Web Push
- [x] API funcionando con endpoints reales
- [x] Web app conectada a la API

## 📋 Próximos Pasos

### Configuración de Supabase
- [x] Crear proyecto en Supabase
- [x] Ejecutar script SQL para crear tablas y funciones
- [ ] Configurar RLS (Row Level Security)
- [x] Obtener URL y keys de Supabase
- [x] Configurar variables de entorno

### Mejoras de UX/UI
- [ ] Agregar componentes de UI más elaborados
- [ ] Implementar animaciones con Framer Motion
- [ ] Mejorar diseño responsive
- [ ] Agregar loading states
- [ ] Implementar error boundaries

### Funcionalidades Adicionales
- [ ] Tabla de visitas en dashboard (TanStack Table)
- [ ] Hook `useSession()` para manejo de sesión
- [ ] Tabla `push_subscriptions` en Supabase
- [ ] Trigger para cupón de bienvenida
- [ ] Panel de administración para dueños
- [ ] Estadísticas y reportes

### Testing y Deployment
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Configurar CI/CD
- [ ] Deploy en producción

## 🐛 Problemas Conocidos

- React Helmet Async tiene warning de peer dependency (React 19)
- Las notificaciones push están en memoria (demo)

## 📝 Notas

- El proyecto está listo para desarrollo local
- Necesita configuración de Supabase para funcionar completamente
- Las funciones RPC `generar_qr_pedido` y `usar_qr_y_sumar_puntos` deben existir en Supabase
