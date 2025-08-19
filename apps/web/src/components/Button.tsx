import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'secondary'|'ghost' }
export function Button({ variant='primary', className='', ...props }: Props){
  const base = 'px-6 py-4 rounded-2xl text-sm font-bold disabled:opacity-60 disabled:pointer-events-none transition-all duration-300 hover:scale-105 active:scale-95';
  
  const getStyle = () => {
    switch(variant) {
      case 'primary':
        return {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          boxShadow: '0 10px 30px -10px rgba(102, 126, 234, 0.5), 0 4px 15px -5px rgba(0, 0, 0, 0.1)',
          border: 'none',
          position: 'relative',
          overflow: 'hidden'
        }
      case 'secondary':
        return {
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
          color: '#667eea',
          boxShadow: '0 8px 25px -5px rgba(255,255,255,0.3), 0 4px 15px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255,255,255,0.3)',
          backdropFilter: 'blur(10px)'
        }
      case 'ghost':
        return {
          background: 'transparent',
          color: '#667eea',
          boxShadow: 'none',
          border: 'none'
        }
      default:
        return {}
    }
  }
  
  return (
    <button 
      className={`${base} ${className}`} 
      style={getStyle()} 
      {...props}
    />
  )
}
