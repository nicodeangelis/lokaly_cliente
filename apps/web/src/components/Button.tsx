import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'secondary'|'ghost' }
export function Button({ variant='primary', className='', ...props }: Props){
  const base = 'px-4 py-3 rounded-xl text-sm font-semibold disabled:opacity-60 disabled:pointer-events-none transition-all duration-200';
  const map:any = {
    primary: 'text-white border-0',
    secondary: 'bg-white text-gray-700 border hover:bg-gray-50',
    ghost: 'text-indigo-600 hover:bg-indigo-50 border-0'
  }
  
  const getStyle = () => {
    switch(variant) {
      case 'primary':
        return {
          background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
          boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.25)'
        }
      case 'secondary':
        return {
          background: 'white',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }
      case 'ghost':
        return {
          background: 'transparent',
          color: '#6366f1'
        }
      default:
        return {}
    }
  }
  
  return <button className={`${base} ${map[variant]} ${className}`} style={getStyle()} {...props} />
}
