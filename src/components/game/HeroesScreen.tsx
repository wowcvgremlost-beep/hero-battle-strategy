import { motion } from 'framer-motion';
import HeroCard from './HeroCard';
import type { Hero } from '@/types/game';

interface HeroesScreenProps {
  heroes: Hero[];
  onSelectHero: (id: string) => void;
  selectedHeroes: string[];
}

const HeroesScreen = ({ heroes, onSelectHero, selectedHeroes }: HeroesScreenProps) => {
  return (
    <div className="px-4 pt-4 pb-24">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-4"
      >
        <h2 className="font-display text-2xl font-bold text-gradient-gold">МОИ ГЕРОИ</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Выбрано: {selectedHeroes.length}/4 для битвы
        </p>
      </motion.div>

      <div className="grid grid-cols-2 gap-3">
        {heroes.map((hero, i) => (
          <motion.div
            key={hero.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <HeroCard
              hero={hero}
              selected={selectedHeroes.includes(hero.id)}
              onClick={() => onSelectHero(hero.id)}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HeroesScreen;
