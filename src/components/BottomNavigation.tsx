import { useLocation, useNavigate } from 'react-router-dom';
import { QrCode, Menu, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      icon: QrCode,
      label: 'QR',
      path: '/app/qr-scanner',
      active: location.pathname === '/app/qr-scanner'
    },
    {
      icon: Menu,
      label: 'Menú',
      path: '/app/menu',
      active: location.pathname === '/app/menu'
    },
    {
      icon: MapPin,
      label: 'Locales',
      path: '/app/locations',
      active: location.pathname === '/app/locations'
    },
    {
      icon: User,
      label: 'Mi Perfil',
      path: '/app/home',
      active: location.pathname === '/app/home'
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50 mt-14">
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                variant="ghost"
                size="sm"
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-1 p-2 h-auto min-w-[60px] ${
                  item.active 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:text-primary'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}