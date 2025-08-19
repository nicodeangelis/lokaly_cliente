import React, { PropsWithChildren } from 'react'

export function Card({ children, className='' }: PropsWithChildren<{className?:string}>){
  return (
    <div className={`card p-6 ${className}`}>
      {children}
    </div>
  )
}
