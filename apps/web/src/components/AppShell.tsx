import React, { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{ title?: string; points?: number }>

export default function AppShell({ children, title='Lokaly', points }: Props){
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {typeof points === 'number' && (
            <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              {points} pts
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6 pb-24">
        {children}
      </main>
    </div>
  )
}
