import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'secondary'|'ghost' }
export function Button({ variant='primary', className='', ...props }: Props){
  const base = 'px-4 py-3 rounded-xl text-sm font-semibold disabled:opacity-60 disabled:pointer-events-none';
  const map:any = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-white text-gray-700 border hover:bg-gray-50',
    ghost: 'text-indigo-600 hover:bg-indigo-50'
  }
  return <button className={`${base} ${map[variant]} ${className}`} {...props} />
}
