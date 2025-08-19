import React, { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{ title?: string; points?: number }>
export default function AppShell({ children, title='Lokaly', points }: Props){
  return (
    <div className="min-h-dvh" style={{backgroundColor: '#f6f7fb'}}>
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
