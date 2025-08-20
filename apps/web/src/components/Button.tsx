import React from 'react'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { 
  variant?: 'primary'|'secondary'|'ghost' 
}

export function Button({ variant='primary', className='', ...props }: Props){
  const baseClasses = 'px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 touch-target'
  
  const variantClasses = {
    primary: 'gradient-primary text-white hover:shadow-lg focus:ring-blue-500 transform hover:scale-105',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
    ghost: 'bg-transparent text-blue-600 hover:bg-blue-50 focus:ring-blue-500'
  }
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}
