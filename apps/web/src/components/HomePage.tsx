import { Button } from './Button'
import { Card } from './Card'

export default function HomePage() {
  return (
    <div className="min-h-dvh" style={{backgroundColor: '#f6f7fb'}}>
      <header className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b">
        <div className="max-w-screen-sm mx-auto px-4 h-14 flex items-center justify-center">
          <div className="font-semibold text-xl">🚀 Lokaly</div>
        </div>
      </header>
      <main className="max-w-screen-sm mx-auto px-4 py-8">
        <section className="text-center space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">CRM de Fidelización</h1>
            <p className="text-ink-500">Para gastronomía</p>
          </div>
          
          <div className="space-y-4">
            <Card className="p-6">
              <div className="text-sm text-ink-500 mb-2">Cliente</div>
              <Button className="w-full mb-3" onClick={() => window.location.href = '/l/cafe-palermo'}>
                Escanear QR de Local
              </Button>
              <Button variant="secondary" className="w-full" onClick={() => window.location.href = '/app/scan'}>
                Escanear QR Pedido
              </Button>
            </Card>

            <Card className="p-6">
              <div className="text-sm text-ink-500 mb-2">Staff</div>
              <Button variant="secondary" className="w-full" onClick={() => window.location.href = '/staff'}>
                Generar QR para Pedido
              </Button>
            </Card>
          </div>
        </section>
      </main>
    </div>
  )
}
