import React, { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{ title?: string; points?: number }>
export default function AppShell({ children, title='Lokaly', points }: Props){
  return (
    <div className="min-h-dvh" style={{backgroundColor: '#f6f7fb'}}>
      <header 
        className="sticky top-0 z-40 backdrop-blur border-b"
        style={{
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="max-w-screen-sm mx-auto px-4 h-14 flex items-center justify-between">
          <div className="font-semibold text-lg">{title}</div>
          {typeof points === 'number' && (
            <div 
              className="text-sm px-3 py-1 rounded-full font-medium"
              style={{
                background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
                color: '#4338ca',
                border: '1px solid rgba(99, 102, 241, 0.2)'
              }}
            >
              Puntos: {points}
            </div>
          )}
        </div>
      </header>
      <main className="max-w-screen-sm mx-auto px-4 pb-24">{children}</main>
    </div>
  )
}
