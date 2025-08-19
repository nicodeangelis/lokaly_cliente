export default function HomePage() {
  return (
    <div className="p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">🚀 Lokaly</h1>
      <p className="text-gray-600 mb-6">CRM de Fidelización para Gastronomía</p>
      <div className="space-y-4">
        <a href="/l/cafe-ejemplo" className="block px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600">
          Escanear QR de Local
        </a>
        <a href="/staff" className="block px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600">
          Staff - Generar QR
        </a>
        <a href="/app/home" className="block px-6 py-3 bg-purple-500 text-white rounded hover:bg-purple-600">
          Dashboard Cliente
        </a>
        <a href="/app/scan" className="block px-6 py-3 bg-orange-500 text-white rounded hover:bg-orange-600">
          Escanear QR Pedido
        </a>
      </div>
    </div>
  )
}
