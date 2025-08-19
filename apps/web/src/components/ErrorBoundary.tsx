export default function ErrorBoundary() {
  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold text-red-600 mb-4">¡Ups! Algo salió mal</h1>
      <p className="text-gray-600">La página que buscas no existe o hubo un error.</p>
      <a href="/" className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
        Volver al inicio
      </a>
    </div>
  )
}
