import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TopNavigation() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-background border-b border-border z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Empty space for balance */}
          <div className="w-10"></div>
          
          {/* Centered Logo */}
          <div className="flex-1 flex justify-center">
            <h1 className="text-xl font-bold text-foreground tracking-wider">
              TDC
            </h1>
          </div>
          
          {/* Hamburger Menu */}
          <Button variant="ghost" size="sm" className="p-2">
            <Menu className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </header>
  );
}