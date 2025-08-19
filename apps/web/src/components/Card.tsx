import React, { PropsWithChildren } from 'react'
export function Card({ children, className='' }: PropsWithChildren<{className?:string}>){
  return <div className={`bg-white rounded-2xl shadow-lg ${className}`}>{children}</div>
}
