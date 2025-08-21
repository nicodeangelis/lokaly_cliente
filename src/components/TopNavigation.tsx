import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';

export function TopNavigation() {
  const location = useLocation();
  
  const getPageName = () => {
    const path = location.pathname;
    switch (path) {
      case '/':
      case '/app':
      case '/app/home':
        return 'Inicio';
      case '/app/menu':
        return 'Menú';
      case '/app/scan':
        return 'Escanear';
      case '/app/benefits':
        return 'Beneficios';
      case '/app/locations':
        return 'Locales';
      case '/app/dashboard':
        return 'Dashboard';
      case '/app/staff':
        return 'Staff';
      case '/app/admin':
        return 'Admin';
      default:
        return '';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border z-50 shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Page Name - Left Aligned */}
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-secondary tracking-wider">
              TDC
            </h1>
            {getPageName() && (
              <span className="text-lg text-muted-foreground">
                {getPageName()}
              </span>
            )}
          </div>
          
          {/* Hamburger Menu */}
          <Button variant="ghost" size="sm" className="p-3 hover:bg-primary/10">
            <Menu className="w-6 h-6 text-secondary" />
          </Button>
        </div>
      </div>
    </header>
  );
}