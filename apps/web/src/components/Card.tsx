import React, { PropsWithChildren } from 'react'

export function Card({ children, className='' }: PropsWithChildren<{className?:string}>){
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}>
      {children}
    </div>
  )
}
