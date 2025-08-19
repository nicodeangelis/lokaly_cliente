import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'secondary'|'ghost' }
export function Button({ variant='primary', className='', ...props }: Props){
  const base = 'px-4 py-3 rounded-xl text-sm font-semibold disabled:opacity-60 disabled:pointer-events-none';
  const map:any = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700',
    secondary: 'bg-white text-ink-600 border hover:bg-muted',
    ghost: 'text-brand-600 hover:bg-brand-50'
  }
  return <button className={`${base} ${map[variant]} ${className}`} {...props} />
}
