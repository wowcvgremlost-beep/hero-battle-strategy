import { motion } from 'framer-motion';
import type { GameScreen } from '@/types/game';
import { Swords, Users, Home, ShoppingBag } from 'lucide-react';

interface BottomNavProps {
  activeScreen: GameScreen;
  onNavigate: (screen: GameScreen) => void;
}

const navItems: { screen: GameScreen; icon: typeof Home; label: string }[] = [
  { screen: 'main', icon: Home, label: 'Главная' },
  { screen: 'heroes', icon: Users, label: 'Герои' },
  { screen: 'battle', icon: Swords, label: 'Битва' },
  { screen: 'shop', icon: ShoppingBag, label: 'Магазин' },
];

const BottomNav = ({ activeScreen, onNavigate }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gold/10 bg-card/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-md items-center justify-around py-2">
        {navItems.map(({ screen, icon: Icon, label }) => {
          const isActive = activeScreen === screen;
          return (
            <button
              key={screen}
              onClick={() => onNavigate(screen)}
              className="relative flex flex-col items-center gap-0.5 px-4 py-1"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -top-2 left-1/2 h-0.5 w-8 -translate-x-1/2 bg-gradient-gold rounded-full"
                />
              )}
              <Icon
                className={`h-5 w-5 transition-colors ${
                  isActive ? 'text-gold' : 'text-muted-foreground'
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? 'text-gold' : 'text-muted-foreground'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
