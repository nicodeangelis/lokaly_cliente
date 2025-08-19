import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, MapPin, ScanLine, User } from 'lucide-react'

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
        >
          {({isActive}) => (
            <>
              <div style={{
                color: isActive ? '#667eea' : '#9ca3af',
                transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                filter: isActive ? 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3))' : 'none'
              }}>
                {<Home size={24}/>}
              </div>
              <span style={{
                color: isActive ? '#667eea' : '#9ca3af',
                transform: isActive ? 'translateY(-2px)' : 'translateY(0)'
              }}>
                Inicio
              </span>
            </>
          )}
        </NavLink>
        <NavLink 
          to="/app/locales" 
          className={({isActive})=>`${link} ${isActive?'font-bold':''} transition-all duration-300`}
        >
          {({isActive}) => (
            <>
              <div style={{
                color: isActive ? '#667eea' : '#9ca3af',
                transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                filter: isActive ? 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3))' : 'none'
              }}>
                {<MapPin size={24}/>}
              </div>
              <span style={{
                color: isActive ? '#667eea' : '#9ca3af',
                transform: isActive ? 'translateY(-2px)' : 'translateY(0)'
              }}>
                Locales
              </span>
            </>
          )}
        </NavLink>
        <NavLink 
          to="/app/scan" 
          className={({isActive})=>`${link} ${isActive?'font-bold':''} transition-all duration-300`}
        >
          {({isActive}) => (
            <>
              <div style={{
                color: isActive ? '#667eea' : '#9ca3af',
                transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                filter: isActive ? 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3))' : 'none'
              }}>
                {<ScanLine size={24}/>}
              </div>
              <span style={{
                color: isActive ? '#667eea' : '#9ca3af',
                transform: isActive ? 'translateY(-2px)' : 'translateY(0)'
              }}>
                Escanear
              </span>
            </>
          )}
        </NavLink>
        <NavLink 
          to="/app/profile" 
          className={({isActive})=>`${link} ${isActive?'font-bold':''} transition-all duration-300`}
        >
          {({isActive}) => (
            <>
              <div style={{
                color: isActive ? '#667eea' : '#9ca3af',
                transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
                filter: isActive ? 'drop-shadow(0 4px 8px rgba(102, 126, 234, 0.3))' : 'none'
              }}>
                {<User size={24}/>}
              </div>
              <span style={{
                color: isActive ? '#667eea' : '#9ca3af',
                transform: isActive ? 'translateY(-2px)' : 'translateY(0)'
              }}>
                Perfil
              </span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  )
}
