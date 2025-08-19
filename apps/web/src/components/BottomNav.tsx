import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Gift, ScanLine, User } from 'lucide-react'

export function BottomNav(){
  const link = 'flex flex-col items-center gap-1 text-xs py-1 transition-all duration-200';
  
  return (
    <nav 
      className="fixed bottom-0 inset-x-0 z-40 border-t safe-bottom"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.3)',
        boxShadow: '0 -4px 20px -5px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="max-w-screen-sm mx-auto grid grid-cols-4 py-3">
        <NavLink 
          to="/app/home" 
          className={({isActive})=>`${link} ${isActive?'font-bold':''} transition-all duration-300`}
          style={({isActive}) => ({
            color: isActive ? '#667eea' : '#9ca3af',
            transform: isActive ? 'translateY(-2px)' : 'translateY(0)'
          })}
        >
          <div style={{filter: isActive ? 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3))' : 'none'}}>
            {<Home size={24}/>}
          </div>
          Inicio
        </NavLink>
        <NavLink 
          to="/app/benefits" 
          className={({isActive})=>`${link} ${isActive?'font-bold':''} transition-all duration-300`}
          style={({isActive}) => ({
            color: isActive ? '#667eea' : '#9ca3af',
            transform: isActive ? 'translateY(-2px)' : 'translateY(0)'
          })}
        >
          <div style={{filter: isActive ? 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3))' : 'none'}}>
            {<Gift size={24}/>}
          </div>
          Beneficios
        </NavLink>
        <NavLink 
          to="/app/scan" 
          className={({isActive})=>`${link} ${isActive?'font-bold':''} transition-all duration-300`}
          style={({isActive}) => ({
            color: isActive ? '#667eea' : '#9ca3af',
            transform: isActive ? 'translateY(-2px)' : 'translateY(0)'
          })}
        >
          <div style={{filter: isActive ? 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3))' : 'none'}}>
            {<ScanLine size={24}/>}
          </div>
          Escanear
        </NavLink>
        <NavLink 
          to="/app/profile" 
          className={({isActive})=>`${link} ${isActive?'font-bold':''} transition-all duration-300`}
          style={({isActive}) => ({
            color: isActive ? '#667eea' : '#9ca3af',
            transform: isActive ? 'translateY(-2px)' : 'translateY(0)'
          })}
        >
          <div style={{filter: isActive ? 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3))' : 'none'}}>
            {<User size={24}/>}
          </div>
          Perfil
        </NavLink>
      </div>
    </nav>
  )
}
