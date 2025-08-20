import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, MapPin, ScanLine, User } from 'lucide-react'

export function BottomNav(){
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area">
      <div className="container mx-auto px-4">
        <div className="flex justify-around py-2">
          <NavLink
            to="/app/home"
            className={({isActive}) => 
              `flex flex-col items-center gap-1 text-xs transition-colors touch-target py-2 ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`
            }
          >
            <Home size={20} />
            <span className="font-medium">Inicio</span>
          </NavLink>
          
          <NavLink
            to="/app/locales"
            className={({isActive}) => 
              `flex flex-col items-center gap-1 text-xs transition-colors touch-target py-2 ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`
            }
          >
            <MapPin size={20} />
            <span className="font-medium">Locales</span>
          </NavLink>
          
          <NavLink
            to="/app/scan"
            className={({isActive}) => 
              `flex flex-col items-center gap-1 text-xs transition-colors touch-target py-2 ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`
            }
          >
            <ScanLine size={20} />
            <span className="font-medium">Escanear</span>
          </NavLink>
          
          <NavLink
            to="/app/profile"
            className={({isActive}) => 
              `flex flex-col items-center gap-1 text-xs transition-colors touch-target py-2 ${
                isActive ? 'text-blue-600' : 'text-gray-500'
              }`
            }
          >
            <User size={20} />
            <span className="font-medium">Perfil</span>
          </NavLink>
        </div>
      </div>
    </nav>
  )
}
