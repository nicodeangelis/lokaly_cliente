import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Gift, ScanLine, User } from 'lucide-react'

export function BottomNav(){
  const link = 'flex flex-col items-center gap-1 text-xs py-1';
  const active = 'text-indigo-600';
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t safe-bottom">
      <div className="max-w-screen-sm mx-auto grid grid-cols-4 py-2">
        <NavLink to="/app/home" className={({isActive})=>`${link} ${isActive?active:''}`}>{<Home size={22}/>}Inicio</NavLink>
        <NavLink to="/app/benefits" className={({isActive})=>`${link} ${isActive?active:''}`}>{<Gift size={22}/>}Beneficios</NavLink>
        <NavLink to="/app/scan" className={({isActive})=>`${link} ${isActive?active:''}`}>{<ScanLine size={22}/>}Escanear</NavLink>
        <NavLink to="/app/profile" className={({isActive})=>`${link} ${isActive?active:''}`}>{<User size={22}/>}Perfil</NavLink>
      </div>
    </nav>
  )
}
