import { useState } from 'react';
import ResourceBar from '@/components/game/ResourceBar';
import BottomNav from '@/components/game/BottomNav';
import MainMenu from '@/components/game/MainMenu';
import HeroesScreen from '@/components/game/HeroesScreen';
import BattleScreen from '@/components/game/BattleScreen';
import ShopScreen from '@/components/game/ShopScreen';
import { HEROES, INITIAL_RESOURCES } from '@/data/gameData';
import type { GameScreen } from '@/types/game';

const Index = () => {
  const [screen, setScreen] = useState<GameScreen>('main');
  const [selectedHeroes, setSelectedHeroes] = useState<string[]>([]);
  const resources = INITIAL_RESOURCES;

  const handleSelectHero = (id: string) => {
    setSelectedHeroes((prev) => {
      if (prev.includes(id)) return prev.filter((h) => h !== id);
      if (prev.length >= 4) return prev;
      return [...prev, id];
    });
  };

  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-gold/10">
        <ResourceBar resources={resources} />
      </div>

      {/* Content */}
      {screen === 'main' && <MainMenu onNavigate={setScreen} playerLevel={23} />}
      {screen === 'heroes' && (
        <HeroesScreen
          heroes={HEROES}
          selectedHeroes={selectedHeroes}
          onSelectHero={handleSelectHero}
        />
      )}
      {screen === 'battle' && (
        <BattleScreen heroes={HEROES} selectedHeroes={selectedHeroes} />
      )}
      {screen === 'shop' && <ShopScreen />}

      {/* Bottom nav */}
      <BottomNav activeScreen={screen} onNavigate={setScreen} />
    </div>
  );
};

export default Index;
