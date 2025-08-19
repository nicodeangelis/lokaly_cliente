import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Gift, ScanLine, User } from 'lucide-react'

export function BottomNav(){
  const link = 'flex flex-col items-center gap-1 text-xs py-1 transition-all duration-200';
  
  return (
    <nav 
      className="fixed bottom-0 inset-x-0 z-40 border-t safe-bottom"
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="max-w-screen-sm mx-auto grid grid-cols-4 py-2">
        <NavLink 
          to="/app/home" 
          className={({isActive})=>`${link} ${isActive?'font-semibold':''}`}
          style={({isActive}) => ({
            color: isActive ? '#4338ca' : '#6b7280'
          })}
        >
          {<Home size={22}/>}Inicio
        </NavLink>
        <NavLink 
          to="/app/benefits" 
          className={({isActive})=>`${link} ${isActive?'font-semibold':''}`}
          style={({isActive}) => ({
            color: isActive ? '#4338ca' : '#6b7280'
          })}
        >
          {<Gift size={22}/>}Beneficios
        </NavLink>
        <NavLink 
          to="/app/scan" 
          className={({isActive})=>`${link} ${isActive?'font-semibold':''}`}
          style={({isActive}) => ({
            color: isActive ? '#4338ca' : '#6b7280'
          })}
        >
          {<ScanLine size={22}/>}Escanear
        </NavLink>
        <NavLink 
          to="/app/profile" 
          className={({isActive})=>`${link} ${isActive?'font-semibold':''}`}
          style={({isActive}) => ({
            color: isActive ? '#4338ca' : '#6b7280'
          })}
        >
          {<User size={22}/>}Perfil
        </NavLink>
      </div>
    </nav>
  )
}
