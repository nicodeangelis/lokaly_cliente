import React, { PropsWithChildren } from 'react'
export function Card({ children, className='' }: PropsWithChildren<{className?:string}>){
  return (
    <div 
      className={`bg-white rounded-3xl card-hover ${className} relative overflow-hidden`}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.1), 0 10px 20px -5px rgba(0, 0, 0, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)'
      }}
    >
      {/* Subtle gradient overlay */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          background: 'radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.3) 0%, transparent 50%)'
        }}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
