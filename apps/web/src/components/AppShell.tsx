import React, { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{ title?: string; points?: number }>
export default function AppShell({ children, title='Lokaly', points }: Props){
  return (
    <div className="min-h-dvh" style={{backgroundColor: '#f6f7fb'}}>
      <header 
        className="sticky top-0 z-40 backdrop-blur border-b"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="max-w-screen-sm mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl" style={{color: '#667eea'}}>{title}</div>
          {typeof points === 'number' && (
            <div 
              className="text-sm px-4 py-2 rounded-full font-bold"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                boxShadow: '0 4px 15px -5px rgba(102, 126, 234, 0.4)'
              }}
            >
              {points} pts
            </div>
          )}
        </div>
      </header>
      <main className="max-w-screen-sm mx-auto px-4 pb-32">{children}</main>
    </div>
  )
}
