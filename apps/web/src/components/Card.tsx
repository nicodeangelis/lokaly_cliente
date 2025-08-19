import React, { PropsWithChildren } from 'react'
export function Card({ children, className='' }: PropsWithChildren<{className?:string}>){
  return (
    <div 
      className={`bg-white rounded-2xl card-hover ${className}`}
      style={{
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.8)'
      }}
    >
      {children}
    </div>
  )
}
